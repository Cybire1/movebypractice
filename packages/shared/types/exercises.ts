/**
 * Exercise Type System
 *
 * Comprehensive type definitions for all exercise formats in the learning platform
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ExerciseType =
  | 'code_completion'     // Fill in the blanks in code
  | 'bug_fix'            // Find and fix errors
  | 'multiple_choice'    // Quiz-style questions
  | 'output_prediction'; // Predict what code will output

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseTopic =
  | 'functions'
  | 'structs'
  | 'abilities'
  | 'primitives'
  | 'control_flow'
  | 'vectors'
  | 'options'
  | 'references'
  | 'generics'
  | 'modules'
  | 'events'
  | 'collections'
  | 'ownership'
  | 'storage'
  | 'transfer'
  | 'testing'
  | 'messaging'
  | 'encryption'
  | 'sdk_integration'
  | 'react_patterns'
  | 'deepbook_predict';

// ============================================================================
// BASE EXERCISE INTERFACE
// ============================================================================

export interface BaseExercise {
  id: string;
  lessonId?: string;              // Optional: Link to lesson
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  topic: ExerciseTopic;
  title: string;
  description: string;            // What the user needs to do

  // Learning metadata
  learningObjective: string;      // What skill this teaches
  estimatedTime: number;          // Minutes to complete

  // Rewards
  baseXP: number;                 // XP for completing
  perfectScoreXP?: number;        // Bonus XP for perfect answer

  // Help system
  hints: string[];                // Progressive hints (1-3)
  explanation?: string;           // Detailed explanation after completion
  relatedConcepts?: string[];     // Links to related topics
}

// ============================================================================
// CODE COMPLETION EXERCISE
// ============================================================================

export interface CodeCompletionBlank {
  id: string;
  placeholder: string;            // What user sees: "___" or "???"
  correctAnswer: string;          // Exact correct answer
  acceptableAnswers?: string[];   // Alternative correct answers
  hint?: string;                  // Hint specific to this blank
}

export interface CodeCompletionExercise extends BaseExercise {
  type: 'code_completion';

  // Code with blanks marked
  codeTemplate: string;           // Code with {blank:id} markers
  blanks: CodeCompletionBlank[];  // All blanks to fill

  // Validation
  strictMode?: boolean;           // Exact match vs fuzzy match
  caseSensitive?: boolean;        // Case-sensitive validation

  // Display
  language: 'move' | 'rust' | 'typescript';
  readOnlyRanges?: {              // Parts user can't edit
    start: number;
    end: number;
  }[];
}

// ============================================================================
// BUG FIX EXERCISE
// ============================================================================

export interface BugInfo {
  lineNumber: number;             // Line with the bug
  bugType: 'syntax' | 'logic' | 'type' | 'runtime';
  description: string;            // What's wrong
  hint?: string;                  // How to fix it
}

export interface BugFixExercise extends BaseExercise {
  type: 'bug_fix';

  // Code with bugs
  buggyCode: string;              // Code containing bugs
  correctCode: string;            // Fixed version
  bugs: BugInfo[];                // Information about bugs

  // Validation
  allowPartialCredit?: boolean;   // Credit for fixing some bugs
  mustFixAll?: boolean;           // All bugs must be fixed

  // Testing
  testCases?: {
    input?: string;
    expectedOutput: string;
    description: string;
  }[];

  // Display
  language: 'move' | 'rust' | 'typescript';
  highlightBugLines?: boolean;    // Show which lines have bugs
}

// ============================================================================
// MULTIPLE CHOICE EXERCISE
// ============================================================================

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;           // Why this is/isn't correct
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';

  // Question
  question: string;
  codeSnippet?: string;           // Optional code to reference

  // Options
  options: MultipleChoiceOption[];
  allowMultipleAnswers?: boolean; // Select all that apply

  // Display
  shuffleOptions?: boolean;       // Randomize option order
  showExplanationOnWrong?: boolean; // Show explanation immediately
}

// ============================================================================
// OUTPUT PREDICTION EXERCISE
// ============================================================================

export interface OutputPredictionExercise extends BaseExercise {
  type: 'output_prediction';

  // Code to analyze
  code: string;                   // Code to predict output for
  language: 'move' | 'rust' | 'typescript';

  // Expected output
  correctOutput: string;
  outputType: 'value' | 'type' | 'error' | 'boolean';

  // Answer format
  answerFormat: 'text' | 'multiple_choice';
  multipleChoiceOptions?: string[]; // If using multiple choice

  // Help
  showLineNumbers?: boolean;
  allowableAnswers?: string[];    // Variations of correct answer

  // Execution trace
  executionSteps?: {
    step: number;
    description: string;
    variables?: Record<string, number | string | boolean>;
  }[];
}

// ============================================================================
// UNION TYPE FOR ALL EXERCISES
// ============================================================================

export type Exercise =
  | CodeCompletionExercise
  | BugFixExercise
  | MultipleChoiceExercise
  | OutputPredictionExercise;

// ============================================================================
// VALIDATION & FEEDBACK
// ============================================================================

export interface ValidationResult {
  isCorrect: boolean;
  score: number;                  // 0-100
  feedback: string;               // Message for user
  errors?: ValidationError[];
  partialCredit?: {
    earned: number;
    possible: number;
    breakdown: string[];
  };
}

export interface ValidationError {
  location?: string;              // Where the error is
  message: string;                // What's wrong
  severity: 'error' | 'warning' | 'info';
  hint?: string;                  // How to fix
}

export type FeedbackType = 'success' | 'partial' | 'incorrect' | 'error';

export interface ExerciseFeedback {
  type: FeedbackType;
  message: string;
  details?: string;
  correctAnswer?: string;         // Show after attempts
  earnedXP: number;
  showHint?: boolean;             // Suggest using hint
}

// ============================================================================
// USER PROGRESS & ATTEMPTS
// ============================================================================

export interface ExerciseAttempt {
  attemptId: string;
  exerciseId: string;
  userId: string;
  timestamp: Date;

  // Answer data
  userAnswer: ExerciseAnswer;                // Depends on exercise type
  isCorrect: boolean;
  score: number;

  // Context
  hintsUsed: number;
  timeSpent: number;              // Seconds
  earnedXP: number;
}

export interface ExerciseProgress {
  userId: string;
  exerciseId: string;

  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  completedAt?: Date;
  lastAttemptAt?: Date;

  // Stats
  totalAttempts: number;
  successfulAttempts: number;
  bestScore: number;
  averageScore: number;
  totalXPEarned: number;

  // Attempts history
  attempts: ExerciseAttempt[];
}

// ============================================================================
// EXERCISE SET (Group of exercises)
// ============================================================================

export interface ExerciseSet {
  id: string;
  lessonId?: string;
  title: string;
  description: string;
  exercises: Exercise[];

  // Requirements
  requiredScore?: number;         // Min score to pass
  mustCompleteAll?: boolean;

  // Rewards
  completionXP: number;
  perfectScoreBonus?: number;
}

// ============================================================================
// ANSWER TYPES (for submission)
// ============================================================================

export type CodeCompletionAnswer = Record<string, string>; // blankId -> answer

export interface BugFixAnswer {
  fixedCode: string;
  fixedLines?: number[];          // Lines that were changed
}

export type MultipleChoiceAnswer = string[]; // Selected option IDs

export interface OutputPredictionAnswer {
  predictedOutput: string;
  reasoning?: string;             // Optional explanation
}

export type ExerciseAnswer =
  | CodeCompletionAnswer
  | BugFixAnswer
  | MultipleChoiceAnswer
  | OutputPredictionAnswer;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface ExerciseSubmission {
  exerciseId: string;
  userId: string;
  answer: ExerciseAnswer;
  timeSpent: number;
  hintsUsed: number;
}

export interface ExerciseResult {
  validation: ValidationResult;
  feedback: ExerciseFeedback;
  progress: ExerciseProgress;
  nextExercise?: string;          // Suggestion for next
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export interface ExerciseStats {
  exerciseId: string;

  // Difficulty metrics
  averageAttempts: number;
  averageScore: number;
  completionRate: number;         // % who complete
  averageTime: number;

  // Common issues
  commonErrors: {
    error: string;
    frequency: number;
  }[];

  // Hints
  averageHintsUsed: number;
  mostRequestedHint: number;      // Which hint # is used most
}
