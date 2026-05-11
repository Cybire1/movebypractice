/**
 * Move Language Parser and Validator
 * This provides proper syntax checking until full WASM compiler is integrated
 */

export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  success: boolean;
  errors: ParseError[];
  warnings: ParseError[];
  ast?: MoveAST;
}

export interface MoveAST {
  modules: MoveModule[];
}

export interface MoveModule {
  address: string;
  name: string;
  structs: MoveStruct[];
  functions: MoveFunction[];
}

export interface MoveStruct {
  name: string;
  abilities: string[];
  fields: StructField[];
  line: number;
}

export interface StructField {
  name: string;
  type: string;
}

export interface MoveFunction {
  name: string;
  visibility: 'public' | 'public(friend)' | 'private';
  isEntry: boolean;
  parameters: FunctionParameter[];
  returnType?: string;
  line: number;
}

export interface FunctionParameter {
  name: string;
  type: string;
  isMutable: boolean;
  isReference: boolean;
}

export class MoveParser {
  private code: string;
  private lines: string[];
  private errors: ParseError[] = [];
  private warnings: ParseError[] = [];

  constructor(code: string) {
    this.code = code;
    this.lines = code.split('\n');
  }

  parse(): ParseResult {
    this.errors = [];
    this.warnings = [];

    try {
      // Basic syntax validation
      this.validateModuleDeclaration();
      this.validateImports();
      const structs = this.parseStructs();
      const functions = this.parseFunctions();

      // Semantic validation
      this.validateStructAbilities(structs);
      this.validateFunctionSignatures(functions);
      this.validateEntryFunctions(functions);

      const ast: MoveAST = {
        modules: [{
          address: this.extractAddress(),
          name: this.extractModuleName(),
          structs,
          functions,
        }],
      };

      return {
        success: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        ast,
      };
    } catch (error) {
      this.errors.push({
        line: 0,
        column: 0,
        message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });

      return {
        success: false,
        errors: this.errors,
        warnings: this.warnings,
      };
    }
  }

  private validateModuleDeclaration(): void {
    const moduleRegex = /module\s+(\w+)::(\w+)\s*\{/;
    const hasModule = this.code.match(moduleRegex);

    if (!hasModule) {
      this.errors.push({
        line: 1,
        column: 0,
        message: 'Missing module declaration. Expected: module address::name { ... }',
        severity: 'error',
      });
    }
  }

  private validateImports(): void {
    const lines = this.code.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('use')) {
        // Check for proper use statement syntax
        if (!trimmed.endsWith(';')) {
          this.errors.push({
            line: index + 1,
            column: trimmed.length,
            message: 'Use statement must end with semicolon',
            severity: 'error',
          });
        }
      }
    });
  }

  private parseStructs(): MoveStruct[] {
    const structs: MoveStruct[] = [];
    const structRegex = /(?:public\s+)?struct\s+(\w+)(?:\s+has\s+([\w,\s]+))?\s*\{([^}]*)\}/g;
    let match;

    while ((match = structRegex.exec(this.code)) !== null) {
      const name = match[1];
      const abilities = match[2] ? match[2].split(',').map(a => a.trim()) : [];
      const fieldsText = match[3];
      const line = this.code.substring(0, match.index).split('\n').length;

      // Parse fields
      const fields: StructField[] = [];
      const fieldLines = fieldsText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));

      for (const fieldLine of fieldLines) {
        const fieldMatch = fieldLine.match(/(\w+)\s*:\s*([^,]+)/);
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2].trim().replace(/,$/, ''),
          });
        }
      }

      structs.push({
        name,
        abilities,
        fields,
        line,
      });
    }

    return structs;
  }

  private parseFunctions(): MoveFunction[] {
    const functions: MoveFunction[] = [];
    const functionRegex = /(?:(public)\s+)?(?:(entry)\s+)?fun\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{/g;
    let match;

    while ((match = functionRegex.exec(this.code)) !== null) {
      const visibility = match[1] ? 'public' : 'private';
      const isEntry = !!match[2];
      const name = match[3];
      const paramsText = match[4];
      const returnType = match[5]?.trim();
      const line = this.code.substring(0, match.index).split('\n').length;

      // Parse parameters
      const parameters: FunctionParameter[] = [];
      if (paramsText.trim()) {
        const params = paramsText.split(',').map(p => p.trim());
        for (const param of params) {
          const paramMatch = param.match(/(mut\s+)?(&\s*)?(\w+)\s*:\s*(.+)/);
          if (paramMatch) {
            parameters.push({
              name: paramMatch[3],
              type: paramMatch[4].trim(),
              isMutable: !!paramMatch[1],
              isReference: !!paramMatch[2],
            });
          }
        }
      }

      functions.push({
        name,
        visibility: visibility as 'public' | 'private',
        isEntry,
        parameters,
        returnType,
        line,
      });
    }

    return functions;
  }

  private validateStructAbilities(structs: MoveStruct[]): void {
    const validAbilities = ['copy', 'drop', 'store', 'key'];

    for (const struct of structs) {
      // Check for invalid abilities
      for (const ability of struct.abilities) {
        if (!validAbilities.includes(ability)) {
          this.errors.push({
            line: struct.line,
            column: 0,
            message: `Invalid ability '${ability}'. Valid abilities are: ${validAbilities.join(', ')}`,
            severity: 'error',
          });
        }
      }

      // Check for required abilities for objects
      if (struct.fields.some(f => f.type === 'UID')) {
        if (!struct.abilities.includes('key')) {
          this.warnings.push({
            line: struct.line,
            column: 0,
            message: `Struct '${struct.name}' has a UID field but is missing 'key' ability`,
            severity: 'warning',
          });
        }
      }

      // Check field types
      for (const field of struct.fields) {
        if (!field.type) {
          this.errors.push({
            line: struct.line,
            column: 0,
            message: `Field '${field.name}' in struct '${struct.name}' is missing type annotation`,
            severity: 'error',
          });
        }
      }
    }
  }

  private validateFunctionSignatures(functions: MoveFunction[]): void {
    for (const func of functions) {
      // Entry functions must be public
      if (func.isEntry && func.visibility !== 'public') {
        this.errors.push({
          line: func.line,
          column: 0,
          message: `Entry function '${func.name}' must be public`,
          severity: 'error',
        });
      }

      // Check for TxContext in entry functions
      if (func.isEntry) {
        const hasTxContext = func.parameters.some(p =>
          p.type.includes('TxContext') || p.type.includes('&mut TxContext')
        );

        if (!hasTxContext) {
          this.warnings.push({
            line: func.line,
            column: 0,
            message: `Entry function '${func.name}' should typically have a TxContext parameter`,
            severity: 'warning',
          });
        }
      }
    }
  }

  private validateEntryFunctions(functions: MoveFunction[]): void {
    const entryFunctions = functions.filter(f => f.isEntry);

    if (entryFunctions.length === 0) {
      this.warnings.push({
        line: 0,
        column: 0,
        message: 'Module has no entry functions. Add at least one entry function to make it callable.',
        severity: 'warning',
      });
    }
  }

  private extractAddress(): string {
    const match = this.code.match(/module\s+(\w+)::/);
    return match ? match[1] : '0x0';
  }

  private extractModuleName(): string {
    const match = this.code.match(/module\s+\w+::(\w+)/);
    return match ? match[1] : 'unknown';
  }
}

/**
 * Parse and validate Move code
 */
export function parseMove(code: string): ParseResult {
  const parser = new MoveParser(code);
  return parser.parse();
}
