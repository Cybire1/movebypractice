/**
 * Move Compiler Interface
 * Main entry point for Move code compilation and validation
 */

import { parseMove, ParseError } from './moveParser';
import { checkTypes } from './moveTypeChecker';

export interface CompilationResult {
  success: boolean;
  errors: ParseError[];
  warnings: ParseError[];
  output: string;
  bytecode?: Uint8Array; // For future WASM compiler integration
}

export class MoveCompiler {
  /**
   * Compile Move code
   * Currently performs parsing and type checking
   * TODO: Integrate full WASM-based compilation
   */
  async compile(code: string): Promise<CompilationResult> {
    const result: CompilationResult = {
      success: false,
      errors: [],
      warnings: [],
      output: '',
    };

    try {
      // Step 1: Parse the code
      result.output += '🔍 Parsing Move code...\n';
      const parseResult = parseMove(code);

      result.errors.push(...parseResult.errors);
      result.warnings.push(...parseResult.warnings);

      if (!parseResult.success) {
        result.output += '❌ Parsing failed\n\n';
        result.output += this.formatErrors(parseResult.errors);
        return result;
      }

      result.output += '✅ Parsing successful\n';

      // Step 2: Type checking
      if (parseResult.ast) {
        result.output += '🔍 Type checking...\n';
        const typeErrors = checkTypes(parseResult.ast);

        result.errors.push(...typeErrors.filter(e => e.severity === 'error'));
        result.warnings.push(...typeErrors.filter(e => e.severity === 'warning'));

        if (typeErrors.some(e => e.severity === 'error')) {
          result.output += '❌ Type checking failed\n\n';
          result.output += this.formatErrors(typeErrors.filter(e => e.severity === 'error'));
          return result;
        }

        result.output += '✅ Type checking passed\n';
      }

      // Step 3: Generate summary
      if (parseResult.ast) {
        const moveModule = parseResult.ast.modules[0];
        result.output += '\n📦 Module Summary:\n';
        result.output += `   Address: ${moveModule.address}\n`;
        result.output += `   Name: ${moveModule.name}\n`;
        result.output += `   Structs: ${moveModule.structs.length}\n`;
        result.output += `   Functions: ${moveModule.functions.length}\n`;

        // List structs
        if (moveModule.structs.length > 0) {
          result.output += '\n📋 Structs:\n';
          for (const struct of moveModule.structs) {
            result.output += `   - ${struct.name}`;
            if (struct.abilities.length > 0) {
              result.output += ` (${struct.abilities.join(', ')})`;
            }
            result.output += `\n`;
          }
        }

        // List functions
        if (moveModule.functions.length > 0) {
          result.output += '\n⚡ Functions:\n';
          for (const func of moveModule.functions) {
            let funcStr = `   - ${func.visibility}`;
            if (func.isEntry) funcStr += ' entry';
            funcStr += ` fun ${func.name}(`;
            funcStr += func.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
            funcStr += ')';
            if (func.returnType) funcStr += `: ${func.returnType}`;
            result.output += funcStr + '\n';
          }
        }
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        result.output += '\n⚠️  Warnings:\n';
        result.output += this.formatErrors(result.warnings);
      }

      // Success!
      result.success = result.errors.length === 0;
      if (result.success) {
        result.output += '\n✅ Compilation successful!\n';
        result.output += '\n💡 Next step: Deploy to Sui testnet (coming soon)\n';
      }

      return result;
    } catch (error) {
      result.errors.push({
        line: 0,
        column: 0,
        message: `Compiler error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });

      result.output += '❌ Compilation failed\n\n';
      result.output += this.formatErrors(result.errors);
      return result;
    }
  }

  private formatErrors(errors: ParseError[]): string {
    if (errors.length === 0) return '';

    let output = '';
    for (const error of errors) {
      const icon = error.severity === 'error' ? '❌' : '⚠️ ';
      output += `${icon} Line ${error.line}: ${error.message}\n`;
    }
    return output;
  }

  /**
   * Quick syntax validation (lighter than full compilation)
   */
  async validate(code: string): Promise<{ valid: boolean; errors: ParseError[] }> {
    const parseResult = parseMove(code);
    return {
      valid: parseResult.success,
      errors: parseResult.errors,
    };
  }
}

// Singleton instance
let compilerInstance: MoveCompiler | null = null;

export function getMoveCompiler(): MoveCompiler {
  if (!compilerInstance) {
    compilerInstance = new MoveCompiler();
  }
  return compilerInstance;
}

/**
 * Convenience function to compile Move code
 */
export async function compileMove(code: string): Promise<CompilationResult> {
  const compiler = getMoveCompiler();
  return compiler.compile(code);
}
