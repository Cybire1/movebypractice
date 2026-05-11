// Daily Challenge Type Definitions

export type ChallengeType =
  | 'code_completion'    // Fill in the blanks
  | 'bug_fix'           // Find and fix the error
  | 'output_prediction' // What will this code output?
  | 'write_function';   // Write a complete function

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ChallengeTopic =
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
  | 'transfer';

export interface ChallengeTestCase {
  input?: string;        // Input description or parameters
  expectedOutput: string; // Expected result
  description: string;    // What this test checks
}

export interface Challenge {
  id: string;
  date: string;                    // ISO date string for when this challenge is active
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  topic: ChallengeTopic;
  title: string;
  description: string;             // What the user needs to do

  // Code-related fields
  starterCode?: string;            // Initial code for code_completion or write_function
  buggyCode?: string;              // Code with bugs for bug_fix type
  predictionCode?: string;         // Code to analyze for output_prediction
  solution: string;                // Correct solution

  // For output_prediction challenges
  multipleChoiceOptions?: string[]; // Possible outputs to choose from
  correctOptionIndex?: number;      // Index of correct answer in multipleChoiceOptions

  // Testing & Validation
  testCases?: ChallengeTestCase[]; // For validating code solutions
  hint1: string;                   // First hint (gentle nudge)
  hint2: string;                   // Second hint (more direct)
  hint3: string;                   // Third hint (almost gives it away)

  // Rewards
  baseXP: number;                  // XP for completing
  timeBonus: number;               // Bonus XP if completed quickly (within 3 minutes)
  noHintBonus: number;             // Bonus XP for not using hints

  // Metadata
  estimatedTime: number;           // Estimated minutes to complete
  relatedLesson?: string;          // Link to related lesson ID
}

export interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  hintsUsed: number;               // 0-3
  attempts: number;
  earnedXP: number;
  timeSpent: number;               // Seconds
}

export interface ChallengeStreak {
  userId: string;
  currentStreak: number;           // Consecutive days
  longestStreak: number;
  lastCompletedDate: string;       // ISO date string
  totalChallengesCompleted: number;
}

// Sample challenges data structure
export const sampleChallenges: Challenge[] = [
  {
    id: 'day-1-struct-basics',
    date: '2025-01-20',
    type: 'code_completion',
    difficulty: 'easy',
    topic: 'structs',
    title: 'Define a User Struct',
    description: 'Complete the User struct by filling in the missing field types.',
    starterCode: `module challenges::user {
    public struct User has copy, drop {
        name: ___,
        age: ___,
        is_active: ___,
    }
}`,
    solution: `module challenges::user {
    public struct User has copy, drop {
        name: String,
        age: u64,
        is_active: bool,
    }
}`,
    hint1: 'Think about what data types match the field names.',
    hint2: 'name should be text, age should be a number, is_active should be true/false.',
    hint3: 'Use String for text, u64 for numbers, and bool for true/false.',
    baseXP: 50,
    timeBonus: 25,
    noHintBonus: 25,
    estimatedTime: 3,
    relatedLesson: 'structs-intro'
  },
  {
    id: 'day-2-bug-fix',
    date: '2025-01-21',
    type: 'bug_fix',
    difficulty: 'medium',
    topic: 'functions',
    title: 'Fix the Addition Function',
    description: 'This function should add two numbers but has a bug. Find and fix it!',
    buggyCode: `module challenges::math {
    public fun add(a: u64, b: u64): u64 {
        a - b
    }

    #[test]
    fun test_add() {
        assert!(add(5, 3) == 8, 0);
    }
}`,
    solution: `module challenges::math {
    public fun add(a: u64, b: u64): u64 {
        a + b
    }

    #[test]
    fun test_add() {
        assert!(add(5, 3) == 8, 0);
    }
}`,
    testCases: [
      {
        expectedOutput: '8',
        description: 'add(5, 3) should return 8'
      }
    ],
    hint1: 'Look carefully at the operation being performed.',
    hint2: 'The function is called "add" but what operation is it actually doing?',
    hint3: 'Change the - (minus) to + (plus).',
    baseXP: 75,
    timeBonus: 35,
    noHintBonus: 40,
    estimatedTime: 5,
    relatedLesson: 'functions-basics'
  },
  {
    id: 'day-3-output-prediction',
    date: '2025-01-22',
    type: 'output_prediction',
    difficulty: 'easy',
    topic: 'primitives',
    title: 'Predict the Result',
    description: 'What will be the value of result?',
    predictionCode: `let x: u64 = 10;
let y: u64 = 5;
let result = x * y + 3;`,
    multipleChoiceOptions: ['15', '53', '50', '53', '8'],
    correctOptionIndex: 1,
    solution: '53',
    hint1: 'Remember order of operations: multiplication before addition.',
    hint2: 'First calculate 10 * 5, then add 3.',
    hint3: '10 * 5 = 50, then 50 + 3 = 53.',
    baseXP: 40,
    timeBonus: 20,
    noHintBonus: 20,
    estimatedTime: 2,
    relatedLesson: 'primitive-types'
  }
];
