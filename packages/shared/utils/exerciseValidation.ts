import {
  ValidationResult,
  ExerciseFeedback,
  ValidationError,
} from '../types/exercises';

// ============================================================================
// CODE NORMALIZATION UTILITIES
// ============================================================================

/**
 * Normalize code for comparison by removing extra whitespace
 * and standardizing formatting.
 */
export function normalizeCode(code: string, strict: boolean = false): string {
  if (strict) {
    // Strict mode: exact match including whitespace
    return code;
  }

  // Remove leading/trailing whitespace, collapse multiple spaces
  return code
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,()=<>+\-*/])\s*/g, '$1'); // Remove spaces around operators
}

/**
 * Normalize text answers for comparison.
 */
export function normalizeAnswer(
  answer: string,
  caseSensitive: boolean = false,
  strict: boolean = false
): string {
  let normalized = answer;

  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }

  if (!strict) {
    normalized = normalized.trim().replace(/\s+/g, ' ');
  }

  return normalized;
}

/**
 * Check if two code strings are functionally equivalent.
 */
export function isCodeEquivalent(
  userCode: string,
  correctCode: string,
  strict: boolean = false
): boolean {
  return normalizeCode(userCode, strict) === normalizeCode(correctCode, strict);
}

/**
 * Calculate similarity score between two strings (0-100)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);

  const matching = words1.filter(word => words2.includes(word));
  const total = Math.max(words1.length, words2.length);

  return total > 0 ? Math.round((matching.length / total) * 100) : 0;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate a single answer against correct answer and acceptable alternatives.
 */
export function validateSingleAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptableAnswers: string[] = [],
  caseSensitive: boolean = false,
  strict: boolean = false
): boolean {
  const normalized = normalizeAnswer(userAnswer, caseSensitive, strict);
  const normalizedCorrect = normalizeAnswer(correctAnswer, caseSensitive, strict);

  if (normalized === normalizedCorrect) {
    return true;
  }

  return acceptableAnswers.some(
    acceptable =>
      normalizeAnswer(acceptable, caseSensitive, strict) === normalized
  );
}

/**
 * Calculate partial credit score based on multiple answers.
 */
export function calculatePartialScore(
  totalQuestions: number,
  correctAnswers: number,
  incorrectAnswers: number = 0,
  penalty: boolean = true
): number {
  if (totalQuestions === 0) return 0;

  let score = (correctAnswers / totalQuestions) * 100;

  if (penalty && incorrectAnswers > 0) {
    const penaltyAmount = (incorrectAnswers / totalQuestions) * 100;
    score = Math.max(0, score - penaltyAmount);
  }

  return Math.round(score);
}

/**
 * Find differences between two code strings (line by line).
 */
export function findCodeDifferences(
  originalCode: string,
  modifiedCode: string
): { lineNumber: number; original: string; modified: string }[] {
  const originalLines = originalCode.split('\n');
  const modifiedLines = modifiedCode.split('\n');
  const differences: { lineNumber: number; original: string; modified: string }[] = [];

  const maxLength = Math.max(originalLines.length, modifiedLines.length);

  for (let i = 0; i < maxLength; i++) {
    const origLine = originalLines[i]?.trim() || '';
    const modLine = modifiedLines[i]?.trim() || '';

    if (origLine !== modLine) {
      differences.push({
        lineNumber: i + 1,
        original: origLine,
        modified: modLine
      });
    }
  }

  return differences;
}

// ============================================================================
// FEEDBACK GENERATION
// ============================================================================

/**
 * Generate standard feedback based on validation result.
 */
export function generateStandardFeedback(
  isCorrect: boolean,
  score: number,
  baseXP: number,
  perfectScoreXP: number = 0,
  hintsUsed: number = 0,
  explanation?: string
): ExerciseFeedback {
  const earnedXP = Math.round((score / 100) * baseXP);

  if (isCorrect) {
    return {
      type: 'success',
      message: 'Excellent work! Perfect answer.',
      details: explanation,
      earnedXP: hintsUsed === 0 ? earnedXP + perfectScoreXP : earnedXP
    };
  } else if (score >= 70) {
    return {
      type: 'partial',
      message: 'Good job! Almost there.',
      details: 'Review the feedback and try again.',
      earnedXP,
      showHint: true
    };
  } else if (score >= 40) {
    return {
      type: 'partial',
      message: 'You\'re making progress!',
      details: 'Keep working on it. Use a hint if needed.',
      earnedXP: Math.round(earnedXP * 0.5),
      showHint: true
    };
  } else {
    return {
      type: 'incorrect',
      message: 'Not quite right. Try again!',
      details: 'Review the concepts and use hints to help.',
      earnedXP: 0,
      showHint: true
    };
  }
}

/**
 * Create a validation error object.
 */
export function createValidationError(
  message: string,
  severity: 'error' | 'warning' | 'info' = 'error',
  location?: string,
  hint?: string
): ValidationError {
  return {
    message,
    severity,
    location,
    hint
  };
}

/**
 * Create a successful validation result.
 */
export function createSuccessResult(
  feedback: string = 'Correct!',
  score: number = 100
): ValidationResult {
  return {
    isCorrect: true,
    score,
    feedback
  };
}

/**
 * Create a failed validation result.
 */
export function createFailureResult(
  feedback: string,
  score: number = 0,
  errors: ValidationError[] = []
): ValidationResult {
  return {
    isCorrect: false,
    score,
    feedback,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ============================================================================
// XP CALCULATION
// ============================================================================

/**
 * Calculate XP earned based on performance.
 */
export function calculateEarnedXP(
  baseXP: number,
  score: number,
  perfectScoreXP: number = 0,
  hintsUsed: number = 0,
  maxHints: number = 3,
  timeBonus: number = 0
): number {
  // Base XP scaled by score
  let earnedXP = Math.round((score / 100) * baseXP);

  // Perfect score bonus (only if no hints used)
  if (score === 100 && hintsUsed === 0) {
    earnedXP += perfectScoreXP;
  }

  // Hint penalty (reduce by percentage)
  if (hintsUsed > 0) {
    const hintPenalty = (hintsUsed / maxHints) * 0.3; // Up to 30% penalty
    earnedXP = Math.round(earnedXP * (1 - hintPenalty));
  }

  // Time bonus
  earnedXP += timeBonus;

  return Math.max(0, earnedXP);
}

/**
 * Calculate time bonus based on completion time.
 */
export function calculateTimeBonus(
  completionTimeSeconds: number,
  estimatedTimeMinutes: number,
  maxBonus: number = 50
): number {
  const estimatedSeconds = estimatedTimeMinutes * 60;
  const halfTime = estimatedSeconds / 2;

  if (completionTimeSeconds <= halfTime) {
    return maxBonus;
  } else if (completionTimeSeconds <= estimatedSeconds) {
    // Linear decrease from max to 0
    const ratio = (estimatedSeconds - completionTimeSeconds) / halfTime;
    return Math.round(maxBonus * ratio);
  }

  return 0;
}

// ============================================================================
// PROGRESS TRACKING HELPERS
// ============================================================================

/**
 * Calculate overall progress percentage.
 */
export function calculateProgress(
  completedExercises: number,
  totalExercises: number
): number {
  if (totalExercises === 0) return 0;
  return Math.round((completedExercises / totalExercises) * 100);
}

/**
 * Determine mastery level based on attempts and scores.
 */
export function determineMasteryLevel(
  bestScore: number,
  averageScore: number,
  attempts: number
): 'beginner' | 'intermediate' | 'advanced' | 'master' {
  if (bestScore === 100 && averageScore >= 90 && attempts <= 2) {
    return 'master';
  } else if (bestScore >= 90 && averageScore >= 75) {
    return 'advanced';
  } else if (bestScore >= 70 && averageScore >= 60) {
    return 'intermediate';
  } else {
    return 'beginner';
  }
}

/**
 * Get recommended next exercise based on performance.
 */
export function getRecommendedDifficulty(
  recentScores: number[]
): 'beginner' | 'intermediate' | 'advanced' {
  if (recentScores.length === 0) return 'beginner';

  const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (averageScore >= 85) {
    return 'advanced';
  } else if (averageScore >= 65) {
    return 'intermediate';
  } else {
    return 'beginner';
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ValidationUtils = {
  normalizeCode,
  normalizeAnswer,
  isCodeEquivalent,
  calculateSimilarity,
  validateSingleAnswer,
  calculatePartialScore,
  findCodeDifferences,
  generateStandardFeedback,
  createValidationError,
  createSuccessResult,
  createFailureResult,
  calculateEarnedXP,
  calculateTimeBonus,
  calculateProgress,
  determineMasteryLevel,
  getRecommendedDifficulty
};

export default ValidationUtils;
