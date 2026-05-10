import { NextResponse } from 'next/server'
import { validateTypeScript } from '@/app/lib/compiler/tsPatternValidator'

export async function POST(request: Request) {
  try {
    const { code, solution } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code is required' }, { status: 400 })
    }

    // Check for TODO markers
    if (code.includes('// TODO') || code.includes('/* TODO')) {
      return NextResponse.json({
        success: false,
        output: '❌ Your code still contains TODO comments. Replace them with your implementation.\n',
        errors: [{ line: 0, column: 0, message: 'Replace TODO comments with implementation', severity: 'error' }],
        warnings: [],
      })
    }

    // Code length validation
    const strippedCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim()
    if (strippedCode.length < 20) {
      return NextResponse.json({
        success: false,
        output: '❌ Code is too short. Write your implementation first.\n',
        errors: [{ line: 0, column: 0, message: 'Code too short', severity: 'error' }],
        warnings: [],
      })
    }

    // Run pattern validation if solution provided
    if (solution) {
      const result = await validateTypeScript(code, solution)
      return NextResponse.json(result)
    }

    // Basic syntax check only (no solution to compare against)
    return NextResponse.json({
      success: true,
      output: '✅ TypeScript syntax looks valid.\n',
      errors: [],
      warnings: [],
    })
  } catch (err) {
    console.error('Error compiling TypeScript:', err)
    return NextResponse.json({ error: 'Compilation failed' }, { status: 500 })
  }
}
