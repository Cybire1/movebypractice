import { NextResponse } from 'next/server'
import vm from 'node:vm'
import ts from 'typescript'

const TIMEOUT_MS = 10_000
const MAX_OUTPUT_LENGTH = 10_000

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code is required' }, { status: 400 })
    }

    if (code.length > 50_000) {
      return NextResponse.json({ error: 'Code too long (max 50KB)' }, { status: 400 })
    }

    // Transpile TypeScript to JavaScript
    let jsCode: string
    try {
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.CommonJS,
          esModuleInterop: true,
          strict: false,
          skipLibCheck: true,
        },
      })
      jsCode = result.outputText
    } catch (transpileErr) {
      return NextResponse.json({
        success: false,
        output: `TypeScript compilation error:\n${transpileErr instanceof Error ? transpileErr.message : String(transpileErr)}`,
      })
    }

    // Capture console output
    const outputLines: string[] = []
    const pushOutput = (prefix: string, ...args: unknown[]) => {
      const line = args.map(a => {
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2) } catch { return String(a) }
        }
        return String(a)
      }).join(' ')
      outputLines.push(`${prefix}${line}`)
    }

    // Create a mock Sui SDK for educational purposes
    const mockSuiClient = {
      getFullnodeUrl: (network: string) => `https://fullnode.${network || 'devnet'}.sui.io:443`,
    }

    const mockModules: Record<string, unknown> = {
      '@mysten/sui/client': {
        SuiClient: class MockSuiClient {
          url: string
          constructor(opts: { url: string }) { this.url = opts.url }
          async getBalance() { return { totalBalance: '1000000000' } }
          async getObject() { return { data: { objectId: '0x...' } } }
          async getCoins() { return { data: [] } }
        },
        getFullnodeUrl: mockSuiClient.getFullnodeUrl,
      },
    }

    // Build sandbox context
    const sandbox = {
      console: {
        log: (...args: unknown[]) => pushOutput('', ...args),
        error: (...args: unknown[]) => pushOutput('[error] ', ...args),
        warn: (...args: unknown[]) => pushOutput('[warn] ', ...args),
        info: (...args: unknown[]) => pushOutput('[info] ', ...args),
      },
      require: (mod: string) => {
        if (mockModules[mod]) return mockModules[mod]
        throw new Error(`Module '${mod}' is not available in sandbox`)
      },
      setTimeout: (fn: () => void, ms: number) => {
        if (ms > 5000) ms = 5000
        return setTimeout(fn, ms)
      },
      clearTimeout,
      Promise,
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Error,
      TypeError,
      RangeError,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      exports: {} as Record<string, unknown>,
      module: { exports: {} as Record<string, unknown> },
    }

    // Execute in VM sandbox
    try {
      const context = vm.createContext(sandbox)
      const script = new vm.Script(jsCode, { filename: 'user-code.js' })

      const result = script.runInContext(context, { timeout: TIMEOUT_MS })

      // If the result is a Promise, await it
      if (result && typeof result === 'object' && typeof result.then === 'function') {
        await Promise.race([
          result,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Async execution timed out')), TIMEOUT_MS)
          ),
        ])
      }
    } catch (execErr) {
      const errorMsg = execErr instanceof Error ? execErr.message : String(execErr)
      outputLines.push(`\nRuntime Error: ${errorMsg}`)

      // Educational hints
      if (errorMsg.includes('is not defined')) {
        const varName = errorMsg.split(' ')[0]
        outputLines.push(`\nHint: '${varName}' is not defined. Did you forget to import or declare it?`)
      } else if (errorMsg.includes('is not a function')) {
        outputLines.push('\nHint: Check that you\'re calling the correct method name.')
      } else if (errorMsg.includes('timed out')) {
        outputLines.push('\nHint: Your code took too long. Check for infinite loops.')
      }
    }

    let output = outputLines.join('\n')
    if (output.length > MAX_OUTPUT_LENGTH) {
      output = output.slice(0, MAX_OUTPUT_LENGTH) + '\n\n... (output truncated)'
    }

    if (!output.trim()) {
      output = '(no console output)'
    }

    return NextResponse.json({
      success: !output.includes('Runtime Error'),
      output,
    })
  } catch (err) {
    console.error('Error executing code:', err)
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
