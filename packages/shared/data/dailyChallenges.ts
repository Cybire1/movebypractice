import { Challenge } from '../types/challenges';

/**
 * Daily Challenge Database
 *
 * Each challenge is designed to be completed in 2-5 minutes
 * Challenges cycle through different topics and difficulty levels
 * Based on content from the Move Book at /move-book
 */

export const dailyChallenges: Challenge[] = [
  // Week 1: Move Basics - Functions & Structs
  {
    id: 'challenge-001',
    date: '2025-01-01',
    type: 'code_completion',
    difficulty: 'easy',
    topic: 'functions',
    title: 'Complete the Multiply Function',
    description: 'Fill in the missing return type and operation to multiply two numbers.',
    starterCode: `module challenges::math {
    public fun multiply(a: u64, b: u64): ___ {
        a ___ b
    }
}`,
    solution: `module challenges::math {
    public fun multiply(a: u64, b: u64): u64 {
        a * b
    }
}`,
    hint1: 'The function returns a number, so think about number types.',
    hint2: 'The parameters are u64, so the return type should match.',
    hint3: 'Return type is u64, and use * for multiplication.',
    baseXP: 50,
    timeBonus: 25,
    noHintBonus: 25,
    estimatedTime: 2,
    relatedLesson: 'functions'
  },

  {
    id: 'challenge-002',
    date: '2025-01-02',
    type: 'bug_fix',
    difficulty: 'easy',
    topic: 'structs',
    title: 'Fix the Struct Definition',
    description: 'This struct has a syntax error. Find and fix it!',
    buggyCode: `module challenges::user {
    public struct User has copy drop {
        name: String,
        age: u64
    }
}`,
    solution: `module challenges::user {
    public struct User has copy, drop {
        name: String,
        age: u64,
    }
}`,
    hint1: 'Look at the abilities declaration.',
    hint2: 'Multiple abilities need to be separated properly.',
    hint3: 'Add a comma between "copy" and "drop", and after "age: u64".',
    baseXP: 60,
    timeBonus: 30,
    noHintBonus: 30,
    estimatedTime: 3
  },

  {
    id: 'challenge-003',
    date: '2025-01-03',
    type: 'output_prediction',
    difficulty: 'easy',
    topic: 'primitives',
    title: 'Predict the Boolean',
    description: 'What will be the value of "result"?',
    predictionCode: `let x: u64 = 10;
let y: u64 = 20;
let result = x > y;`,
    multipleChoiceOptions: ['true', 'false', '10', '20'],
    correctOptionIndex: 1,
    solution: 'false',
    hint1: 'The > operator compares two values.',
    hint2: 'Is 10 greater than 20?',
    hint3: '10 is NOT greater than 20, so result is false.',
    baseXP: 40,
    timeBonus: 20,
    noHintBonus: 20,
    estimatedTime: 2
  },

  {
    id: 'challenge-004',
    date: '2025-01-04',
    type: 'write_function',
    difficulty: 'medium',
    topic: 'functions',
    title: 'Write a Max Function',
    description: 'Write a function that returns the larger of two u64 numbers.',
    starterCode: `module challenges::math {
    public fun max(a: u64, b: u64): u64 {
        // Your code here
    }

    #[test]
    fun test_max() {
        assert!(max(5, 10) == 10, 0);
        assert!(max(20, 15) == 20, 0);
    }
}`,
    solution: `module challenges::math {
    public fun max(a: u64, b: u64): u64 {
        if (a > b) {
            a
        } else {
            b
        }
    }

    #[test]
    fun test_max() {
        assert!(max(5, 10) == 10, 0);
        assert!(max(20, 15) == 20, 0);
    }
}`,
    testCases: [
      { expectedOutput: '10', description: 'max(5, 10) should return 10' },
      { expectedOutput: '20', description: 'max(20, 15) should return 20' }
    ],
    hint1: 'Use an if-else statement to compare the values.',
    hint2: 'If a is greater than b, return a, otherwise return b.',
    hint3: 'The condition should be: if (a > b) { a } else { b }',
    baseXP: 100,
    timeBonus: 50,
    noHintBonus: 50,
    estimatedTime: 5
  },

  {
    id: 'challenge-005',
    date: '2025-01-05',
    type: 'code_completion',
    difficulty: 'medium',
    topic: 'structs',
    title: 'Complete the Coin Struct',
    description: 'Fill in the struct definition for a simple Coin type.',
    starterCode: `module challenges::coin {
    public struct Coin has ___ {
        value: ___,
    }

    public fun create_coin(amount: u64): Coin {
        Coin { value: ___ }
    }
}`,
    solution: `module challenges::coin {
    public struct Coin has copy, drop {
        value: u64,
    }

    public fun create_coin(amount: u64): Coin {
        Coin { value: amount }
    }
}`,
    hint1: 'A Coin needs to be copyable and droppable for this simple example.',
    hint2: 'The value should be a number type that matches the parameter.',
    hint3: 'Abilities: "copy, drop", value type: "u64", initialize with "amount".',
    baseXP: 75,
    timeBonus: 35,
    noHintBonus: 40,
    estimatedTime: 4
  },

  // Week 2: Control Flow & Vectors
  {
    id: 'challenge-006',
    date: '2025-01-06',
    type: 'bug_fix',
    difficulty: 'medium',
    topic: 'control_flow',
    title: 'Fix the While Loop',
    description: 'This loop should count from 0 to 4, but it has a bug.',
    buggyCode: `module challenges::loops {
    public fun count_to_five(): u64 {
        let mut counter = 0;
        while (counter <= 5) {
            counter = counter + 1;
        };
        counter
    }
}`,
    solution: `module challenges::loops {
    public fun count_to_five(): u64 {
        let mut counter = 0;
        while (counter < 5) {
            counter = counter + 1;
        };
        counter
    }
}`,
    hint1: 'The function name says "count_to_five" but check the condition.',
    hint2: 'The loop should stop when counter reaches 5, not continue.',
    hint3: 'Change <= to < in the while condition.',
    baseXP: 70,
    timeBonus: 35,
    noHintBonus: 35,
    estimatedTime: 3
  },

  {
    id: 'challenge-007',
    date: '2025-01-07',
    type: 'code_completion',
    difficulty: 'medium',
    topic: 'vectors',
    title: 'Work with Vectors',
    description: 'Complete the vector operations.',
    starterCode: `module challenges::vectors {
    use std::vector;

    public fun create_and_add(): vector<u64> {
        let mut numbers = vector::___();
        vector::___(& mut numbers, 10);
        vector::___(& mut numbers, 20);
        numbers
    }
}`,
    solution: `module challenges::vectors {
    use std::vector;

    public fun create_and_add(): vector<u64> {
        let mut numbers = vector::empty();
        vector::push_back(&mut numbers, 10);
        vector::push_back(&mut numbers, 20);
        numbers
    }
}`,
    hint1: 'You need to create an empty vector and add items to it.',
    hint2: 'Use vector::empty() to create and vector::push_back() to add.',
    hint3: 'Fill in: empty(), push_back, push_back',
    baseXP: 80,
    timeBonus: 40,
    noHintBonus: 40,
    estimatedTime: 4
  },

  {
    id: 'challenge-008',
    date: '2025-01-08',
    type: 'output_prediction',
    difficulty: 'medium',
    topic: 'control_flow',
    title: 'Predict the Condition',
    description: 'What will be assigned to result?',
    predictionCode: `let x = 15;
let result = if (x > 10) {
    x * 2
} else {
    x + 5
};`,
    multipleChoiceOptions: ['15', '20', '30', '10'],
    correctOptionIndex: 2,
    solution: '30',
    hint1: 'First check if the condition is true or false.',
    hint2: '15 is greater than 10, so the first branch executes.',
    hint3: 'x * 2 = 15 * 2 = 30',
    baseXP: 50,
    timeBonus: 25,
    noHintBonus: 25,
    estimatedTime: 2
  },

  {
    id: 'challenge-009',
    date: '2025-01-09',
    type: 'write_function',
    difficulty: 'medium',
    topic: 'vectors',
    title: 'Sum a Vector',
    description: 'Write a function that sums all numbers in a vector.',
    starterCode: `module challenges::math {
    use std::vector;

    public fun sum_vector(numbers: &vector<u64>): u64 {
        // Your code here
    }

    #[test]
    fun test_sum() {
        let v = vector[1, 2, 3, 4, 5];
        assert!(sum_vector(&v) == 15, 0);
    }
}`,
    solution: `module challenges::math {
    use std::vector;

    public fun sum_vector(numbers: &vector<u64>): u64 {
        let mut sum = 0;
        let mut i = 0;
        let len = vector::length(numbers);

        while (i < len) {
            sum = sum + *vector::borrow(numbers, i);
            i = i + 1;
        };

        sum
    }

    #[test]
    fun test_sum() {
        let v = vector[1, 2, 3, 4, 5];
        assert!(sum_vector(&v) == 15, 0);
    }
}`,
    hint1: 'Use a loop to iterate through the vector.',
    hint2: 'Keep a running sum and add each element using vector::borrow().',
    hint3: 'Initialize sum=0, loop while i < length, add each element, increment i.',
    baseXP: 120,
    timeBonus: 60,
    noHintBonus: 60,
    estimatedTime: 5
  },

  {
    id: 'challenge-010',
    date: '2025-01-10',
    type: 'bug_fix',
    difficulty: 'easy',
    topic: 'references',
    title: 'Fix the Reference',
    description: 'This function tries to modify a value but has a reference error.',
    buggyCode: `module challenges::refs {
    public fun double_value(x: &u64) {
        *x = *x * 2;
    }
}`,
    solution: `module challenges::refs {
    public fun double_value(x: &mut u64) {
        *x = *x * 2;
    }
}`,
    hint1: 'Can you modify a value through an immutable reference?',
    hint2: 'To modify a value, you need a mutable reference.',
    hint3: 'Change &u64 to &mut u64',
    baseXP: 65,
    timeBonus: 30,
    noHintBonus: 35,
    estimatedTime: 3
  },

  // Week 3: Options & Abilities
  {
    id: 'challenge-011',
    date: '2025-01-11',
    type: 'code_completion',
    difficulty: 'medium',
    topic: 'options',
    title: 'Work with Option',
    description: 'Complete the Option handling code.',
    starterCode: `module challenges::options {
    use std::option::{Self, Option};

    public fun get_value_or_default(opt: Option<u64>): u64 {
        if (option::___(& opt)) {
            *option::___(& opt)
        } else {
            0
        }
    }
}`,
    solution: `module challenges::options {
    use std::option::{Self, Option};

    public fun get_value_or_default(opt: Option<u64>): u64 {
        if (option::is_some(&opt)) {
            *option::borrow(&opt)
        } else {
            0
        }
    }
}`,
    hint1: 'You need to check if Option has a value and extract it.',
    hint2: 'Use is_some() to check and borrow() to get the value.',
    hint3: 'Fill in: is_some, borrow',
    baseXP: 85,
    timeBonus: 40,
    noHintBonus: 45,
    estimatedTime: 4
  },

  {
    id: 'challenge-012',
    date: '2025-01-12',
    type: 'bug_fix',
    difficulty: 'hard',
    topic: 'abilities',
    title: 'Fix the Ability Error',
    description: 'This struct is missing an ability it needs.',
    buggyCode: `module challenges::storage {
    use sui::object::UID;

    public struct Item {
        id: UID,
        name: String,
    }
}`,
    solution: `module challenges::storage {
    use sui::object::UID;

    public struct Item has key {
        id: UID,
        name: String,
    }
}`,
    hint1: 'Structs with UID need a specific ability to be stored.',
    hint2: 'The "key" ability makes a struct storable as an object.',
    hint3: 'Add "has key" after the struct name.',
    baseXP: 90,
    timeBonus: 45,
    noHintBonus: 45,
    estimatedTime: 4
  },

  {
    id: 'challenge-013',
    date: '2025-01-13',
    type: 'output_prediction',
    difficulty: 'medium',
    topic: 'options',
    title: 'Option Value',
    description: 'What happens when we try to get this Option value?',
    predictionCode: `use std::option;

let opt = option::none<u64>();
let has_value = option::is_some(&opt);`,
    multipleChoiceOptions: ['true', 'false', 'Error', 'null'],
    correctOptionIndex: 1,
    solution: 'false',
    hint1: 'option::none() creates an empty Option.',
    hint2: 'is_some() returns true only if Option contains a value.',
    hint3: 'none() means no value, so is_some() returns false.',
    baseXP: 55,
    timeBonus: 25,
    noHintBonus: 30,
    estimatedTime: 2
  },

  {
    id: 'challenge-014',
    date: '2025-01-14',
    type: 'write_function',
    difficulty: 'hard',
    topic: 'options',
    title: 'Find in Vector',
    description: 'Write a function that returns Some(index) if value is found, None otherwise.',
    starterCode: `module challenges::search {
    use std::vector;
    use std::option::{Self, Option};

    public fun find_index(vec: &vector<u64>, target: u64): Option<u64> {
        // Your code here
    }

    #[test]
    fun test_find() {
        let v = vector[10, 20, 30];
        assert!(option::is_some(&find_index(&v, 20)), 0);
        assert!(!option::is_some(&find_index(&v, 40)), 1);
    }
}`,
    solution: `module challenges::search {
    use std::vector;
    use std::option::{Self, Option};

    public fun find_index(vec: &vector<u64>, target: u64): Option<u64> {
        let mut i = 0;
        let len = vector::length(vec);

        while (i < len) {
            if (*vector::borrow(vec, i) == target) {
                return option::some(i)
            };
            i = i + 1;
        };

        option::none()
    }

    #[test]
    fun test_find() {
        let v = vector[10, 20, 30];
        assert!(option::is_some(&find_index(&v, 20)), 0);
        assert!(!option::is_some(&find_index(&v, 40)), 1);
    }
}`,
    hint1: 'Loop through the vector comparing each element.',
    hint2: 'Return some(index) when found, none() if not found after loop.',
    hint3: 'Use while loop, compare with ==, return option::some(i) or option::none().',
    baseXP: 140,
    timeBonus: 70,
    noHintBonus: 70,
    estimatedTime: 5
  },

  {
    id: 'challenge-015',
    date: '2025-01-15',
    type: 'code_completion',
    difficulty: 'easy',
    topic: 'abilities',
    title: 'Copyable Struct',
    description: 'Make this struct copyable and droppable.',
    starterCode: `module challenges::point {
    public struct Point ___ {
        x: u64,
        y: u64,
    }
}`,
    solution: `module challenges::point {
    public struct Point has copy, drop {
        x: u64,
        y: u64,
    }
}`,
    hint1: 'You need to add abilities after the struct name.',
    hint2: 'Use "has" keyword followed by the ability names.',
    hint3: 'Add: has copy, drop',
    baseXP: 50,
    timeBonus: 25,
    noHintBonus: 25,
    estimatedTime: 2
  }
];

// Helper function to get today's challenge
export function getTodaysChallenge(): Challenge | null {
  const today = new Date().toISOString().split('T')[0];
  return dailyChallenges.find(c => c.date === today) || null;
}

// Helper function to get challenge by ID
export function getChallengeById(id: string): Challenge | undefined {
  return dailyChallenges.find(c => c.id === id);
}

// Helper function to get challenges by topic
export function getChallengesByTopic(topic: string): Challenge[] {
  return dailyChallenges.filter(c => c.topic === topic);
}

// Helper function to get challenges by difficulty
export function getChallengesByDifficulty(difficulty: string): Challenge[] {
  return dailyChallenges.filter(c => c.difficulty === difficulty);
}
