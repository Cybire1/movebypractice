/**
 * TypeScript Pattern Validator
 * Validates student TypeScript code by pattern matching against solution patterns.
 * Used for messaging SDK lessons where we can't compile/run TS in browser.
 */

import { ParseError } from './moveParser';

export interface TSValidationResult {
  success: boolean;
  errors: ParseError[];
  warnings: ParseError[];
  output: string;
}

interface PatternRule {
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Extract required patterns from solution code
 */
function extractPatterns(solution: string): PatternRule[] {
  const rules: PatternRule[] = [];

  // Check for required imports
  const importMatches = solution.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const moduleName = match[2];
    const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);

    rules.push({
      pattern: new RegExp(`import\\s+.*from\\s+['"]${escapeRegex(moduleName)}['"]`),
      message: `Missing import from '${moduleName}'`,
      severity: 'error',
    });

    for (const imp of imports) {
      rules.push({
        pattern: new RegExp(`\\b${escapeRegex(imp)}\\b`),
        message: `Missing required import or usage: ${imp}`,
        severity: 'error',
      });
    }
  }

  // Check for required class instantiations
  const newMatches = solution.matchAll(/new\s+(\w+)\s*\(/g);
  for (const match of newMatches) {
    rules.push({
      pattern: new RegExp(`new\\s+${escapeRegex(match[1])}\\s*\\(`),
      message: `Missing instantiation of ${match[1]}`,
      severity: 'error',
    });
  }

  // Check for required method calls
  const methodMatches = solution.matchAll(/\.\s*(createChannel|sendMessage|getMessages|addMembers|removeMembers|archiveChannel|rotateKeys|upload|download|createSessionKey|encrypt|decrypt)\s*\(/g);
  const seenMethods = new Set<string>();
  for (const match of methodMatches) {
    if (!seenMethods.has(match[1])) {
      seenMethods.add(match[1]);
      rules.push({
        pattern: new RegExp(`\\.\\s*${escapeRegex(match[1])}\\s*\\(`),
        message: `Missing required method call: .${match[1]}()`,
        severity: 'error',
      });
    }
  }

  // Check for required async/await patterns
  if (solution.includes('async ')) {
    rules.push({
      pattern: /async\s+/,
      message: 'Function should be async',
      severity: 'error',
    });
  }
  if (solution.includes('await ')) {
    rules.push({
      pattern: /await\s+/,
      message: 'Missing await for async operations',
      severity: 'error',
    });
  }

  // Check for required type annotations
  const typeMatches = solution.matchAll(/:\s*(MessagingClient|SuiClient|SealClient|WalrusClient|Channel|Message)\b/g);
  const seenTypes = new Set<string>();
  for (const match of typeMatches) {
    if (!seenTypes.has(match[1])) {
      seenTypes.add(match[1]);
      rules.push({
        pattern: new RegExp(`\\b${escapeRegex(match[1])}\\b`),
        message: `Missing type usage: ${match[1]}`,
        severity: 'warning',
      });
    }
  }

  return rules;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate TypeScript code against solution patterns
 */
export async function validateTypeScript(
  code: string,
  solution: string
): Promise<TSValidationResult> {
  const result: TSValidationResult = {
    success: false,
    errors: [],
    warnings: [],
    output: '',
  };

  // Basic syntax checks
  result.output += '🔍 Analyzing TypeScript code...\n';

  // Check for empty/minimal code
  const strippedCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (strippedCode.length < 20) {
    result.errors.push({
      line: 1,
      column: 0,
      message: 'Code appears to be incomplete. Please write your implementation.',
      severity: 'error',
    });
    result.output += '❌ Code is too short or empty\n';
    return result;
  }

  // Check balanced braces/parens/brackets
  const braceCheck = checkBalanced(code);
  if (braceCheck) {
    result.errors.push({
      line: 0,
      column: 0,
      message: braceCheck,
      severity: 'error',
    });
    result.output += `❌ Syntax error: ${braceCheck}\n`;
    return result;
  }

  result.output += '✅ Syntax check passed\n';

  // Pattern matching against solution
  result.output += '🔍 Checking required patterns...\n';

  const patterns = extractPatterns(solution);
  let matchedCount = 0;
  const totalRequired = patterns.filter(p => p.severity === 'error').length;

  for (const rule of patterns) {
    if (rule.pattern.test(code)) {
      matchedCount += rule.severity === 'error' ? 1 : 0;
    } else {
      if (rule.severity === 'error') {
        result.errors.push({
          line: 0,
          column: 0,
          message: rule.message,
          severity: rule.severity,
        });
      } else {
        result.warnings.push({
          line: 0,
          column: 0,
          message: rule.message,
          severity: rule.severity,
        });
      }
    }
  }

  // Report results
  if (result.errors.length > 0) {
    result.output += `\n❌ Found ${result.errors.length} issue(s):\n`;
    for (const error of result.errors) {
      result.output += `   • ${error.message}\n`;
    }
  }

  if (result.warnings.length > 0) {
    result.output += `\n⚠️  ${result.warnings.length} suggestion(s):\n`;
    for (const warning of result.warnings) {
      result.output += `   • ${warning.message}\n`;
    }
  }

  // Calculate similarity score
  const score = totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : 0;
  result.output += `\n📊 Pattern match: ${score}%\n`;

  if (result.errors.length === 0) {
    result.success = true;
    result.output += '\n✅ Code validation passed!\n';
    result.output += '🎉 Great job! Your implementation matches the expected patterns.\n';
  } else {
    result.output += '\n💡 Review the issues above and try again.\n';
  }

  return result;
}

function checkBalanced(code: string): string | null {
  const stack: string[] = [];
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const closers = new Set([')', ']', '}']);

  // Strip strings and comments to avoid false positives
  const stripped = code
    .replace(/`[^`]*`/g, '""')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  for (const char of stripped) {
    if (pairs[char]) {
      stack.push(pairs[char]);
    } else if (closers.has(char)) {
      if (stack.length === 0 || stack.pop() !== char) {
        return `Unmatched '${char}'`;
      }
    }
  }

  if (stack.length > 0) {
    return `Unclosed '${stack[stack.length - 1] === ')' ? '(' : stack[stack.length - 1] === ']' ? '[' : '{'}'`;
  }

  return null;
}
