/**
 * Move Language Type Checker
 * Validates types and semantic rules
 */

import { MoveAST, MoveModule, MoveStruct, MoveFunction, ParseError } from './moveParser';

export class MoveTypeChecker {
  private ast: MoveAST;
  private errors: ParseError[] = [];

  // Built-in Move types
  private builtInTypes = new Set([
    'u8', 'u16', 'u32', 'u64', 'u128', 'u256',
    'bool', 'address', 'signer', 'vector',
    'String', 'UID', 'ID', 'TxContext',
  ]);

  constructor(ast: MoveAST) {
    this.ast = ast;
  }

  check(): ParseError[] {
    this.errors = [];

    for (const moveModule of this.ast.modules) {
      this.checkModule(moveModule);
    }

    return this.errors;
  }

  private checkModule(module: MoveModule): void {
    // Build type environment
    const typeEnv = new Map<string, string>();

    // Register struct types
    for (const struct of module.structs) {
      typeEnv.set(struct.name, 'struct');
      this.checkStruct(struct, typeEnv);
    }

    // Check functions
    for (const func of module.functions) {
      this.checkFunction(func, typeEnv);
    }
  }

  private checkStruct(struct: MoveStruct, typeEnv: Map<string, string>): void {
    // Check field types exist
    for (const field of struct.fields) {
      if (!this.isValidType(field.type, typeEnv)) {
        this.errors.push({
          line: struct.line,
          column: 0,
          message: `Unknown type '${field.type}' in struct '${struct.name}'`,
          severity: 'error',
        });
      }
    }

    // Check ability constraints
    if (struct.abilities.includes('copy')) {
      // Can't have 'key' and 'copy' together
      if (struct.abilities.includes('key')) {
        this.errors.push({
          line: struct.line,
          column: 0,
          message: `Struct '${struct.name}' cannot have both 'copy' and 'key' abilities`,
          severity: 'error',
        });
      }

      // All fields must be copyable
      for (const field of struct.fields) {
        if (field.type === 'UID' || field.type === 'ID') {
          this.errors.push({
            line: struct.line,
            column: 0,
            message: `Field '${field.name}' has type '${field.type}' which is not copyable, but struct has 'copy' ability`,
            severity: 'error',
          });
        }
      }
    }

    // If has key, should have store too (common pattern)
    if (struct.abilities.includes('key') && !struct.abilities.includes('store')) {
      // This is just a warning, as it's valid but uncommon
      this.errors.push({
        line: struct.line,
        column: 0,
        message: `Struct '${struct.name}' has 'key' but not 'store' ability. This prevents it from being stored in other objects.`,
        severity: 'warning',
      });
    }
  }

  private checkFunction(func: MoveFunction, typeEnv: Map<string, string>): void {
    // Check parameter types
    for (const param of func.parameters) {
      const baseType = this.extractBaseType(param.type);
      if (!this.isValidType(baseType, typeEnv)) {
        this.errors.push({
          line: func.line,
          column: 0,
          message: `Unknown type '${param.type}' in function '${func.name}'`,
          severity: 'error',
        });
      }

      // Check mutable references
      if (param.isMutable && !param.isReference) {
        this.errors.push({
          line: func.line,
          column: 0,
          message: `Parameter '${param.name}' is marked as mutable but is not a reference`,
          severity: 'error',
        });
      }
    }

    // Check return type
    if (func.returnType) {
      const baseType = this.extractBaseType(func.returnType);
      if (!this.isValidType(baseType, typeEnv)) {
        this.errors.push({
          line: func.line,
          column: 0,
          message: `Unknown return type '${func.returnType}' in function '${func.name}'`,
          severity: 'error',
        });
      }
    }

    // Entry function specific checks
    if (func.isEntry) {
      // Entry functions cannot return values
      if (func.returnType && func.returnType.trim() !== '') {
        this.errors.push({
          line: func.line,
          column: 0,
          message: `Entry function '${func.name}' cannot have a return type`,
          severity: 'error',
        });
      }

      // Should have &mut TxContext as last parameter
      if (func.parameters.length > 0) {
        const lastParam = func.parameters[func.parameters.length - 1];
        if (!lastParam.type.includes('TxContext')) {
          this.errors.push({
            line: func.line,
            column: 0,
            message: `Entry function '${func.name}' should have '&mut TxContext' as the last parameter`,
            severity: 'warning',
          });
        }
      }
    }
  }

  private isValidType(type: string, typeEnv: Map<string, string>): boolean {
    const baseType = this.extractBaseType(type);

    // Check built-in types
    if (this.builtInTypes.has(baseType)) {
      return true;
    }

    // Check user-defined types
    if (typeEnv.has(baseType)) {
      return true;
    }

    // Check generic types (e.g., vector<u64>)
    if (type.includes('<')) {
      const genericBase = type.split('<')[0].trim();
      return this.builtInTypes.has(genericBase) || typeEnv.has(genericBase);
    }

    return false;
  }

  private extractBaseType(type: string): string {
    // Remove references and mut
    let cleaned = type.replace(/&/g, '').replace(/mut\s+/g, '').trim();

    // Extract base type from generics
    if (cleaned.includes('<')) {
      cleaned = cleaned.split('<')[0].trim();
    }

    return cleaned;
  }
}

export function checkTypes(ast: MoveAST): ParseError[] {
  const checker = new MoveTypeChecker(ast);
  return checker.check();
}
