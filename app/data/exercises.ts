import {
  Exercise,
  CodeCompletionExercise,
  BugFixExercise,
  MultipleChoiceExercise,
  OutputPredictionExercise
} from '../types/exercises';

// ============================================================================
// CODE COMPLETION EXERCISES
// ============================================================================

const codeCompletionExercises: CodeCompletionExercise[] = [
  {
    id: 'cc-new-019',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'generics',
    title: 'Generic Function with Type Parameters',
    description: 'Fill in the blanks to create a generic function that works with any type.',
    learningObjective: 'Learn how to define and use generic type parameters in functions.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'Type parameters are declared in angle brackets <T>.',
      'Use the type parameter name in the function signature.',
      'Return type uses the same type parameter.'
    ],
    explanation: 'Generic functions use type parameters (like <T>) to work with any type. The type parameter is declared after the function name and can be used throughout the function signature and body.',
    codeTemplate: `public struct Box<T> has store, drop {
    value: T
}

public fun create_box{blank:type_param}(val: {blank:param_type}): Box<{blank:return_type}> {
    Box { value: val }
}

public fun unwrap{blank:type_param2}(box: Box<T>): T {
    let Box { value } = box;
    value
}`,
    blanks: [
      {
        id: 'type_param',
        placeholder: '___',
        correctAnswer: '<T>',
        hint: 'Declare a type parameter using angle brackets.'
      },
      {
        id: 'param_type',
        placeholder: '___',
        correctAnswer: 'T',
        hint: 'Use the type parameter name you declared.'
      },
      {
        id: 'return_type',
        placeholder: '___',
        correctAnswer: 'T',
        hint: 'Box is generic over T.'
      },
      {
        id: 'type_param2',
        placeholder: '___',
        correctAnswer: '<T>',
        hint: 'Generic functions need type parameters declared after the function name.'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },
  {
    id: 'cc-new-017',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'references',
    title: 'Using Mutable References Correctly',
    description: 'Fill in the blanks to use mutable references to modify values in place.',
    learningObjective: 'Learn when to use &mut for modifying values.',
    estimatedTime: 4,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Modifying a value requires &mut (mutable reference).',
      'Reading a value only requires & (immutable reference).',
      'Use * to dereference when assigning to primitives.'
    ],
    explanation: 'In Move, &mut T allows you to modify the value while & T only allows reading. When modifying primitives through references, you need to dereference with * on the left side of assignment.',
    codeTemplate: `struct Account has store {
    balance: u64,
    owner: address
}

fun deposit(account: {blank:ref_type1} Account, amount: u64) {
    account.balance = account.balance + amount;
}

fun check_balance(account: {blank:ref_type2} Account): u64 {
    account.balance
}

fun double_value(num: &mut u64) {
    {blank:deref_op}num = *num * 2;
}`,
    blanks: [
      {
        id: 'ref_type1',
        placeholder: '___',
        correctAnswer: '&mut',
        hint: 'We are modifying the balance - need mutable reference'
      },
      {
        id: 'ref_type2',
        placeholder: '___',
        correctAnswer: '&',
        hint: 'We are only reading the balance - immutable reference is enough'
      },
      {
        id: 'deref_op',
        placeholder: '___',
        correctAnswer: '*',
        hint: 'Need to dereference the mutable reference to assign a new value'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },
  {
    id: 'cc-new-013',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'vectors',
    title: 'Creating and Adding to Vectors',
    description: 'Fill in the blanks to create a vector and add elements to it.',
    learningObjective: 'Learn how to create vectors and use push_back to add elements.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'Use vector::empty<T>() to create an empty vector.',
      'Type parameter goes in angle brackets <T>.',
      'Use vector::push_back() to add elements to the end.'
    ],
    explanation: 'Vectors are dynamic arrays in Move. Create them with vector::empty<Type>(), and add elements with vector::push_back(vector_ref, value). The vector grows automatically as you add elements.',
    codeTemplate: `use std::vector;

fun create_score_list(): vector<u64> {
    let mut scores = vector::{blank:create_function}<{blank:type}>();
    vector::{blank:add_function}(&mut scores, 100);
    vector::push_back(&mut scores, 200);
    scores
}`,
    blanks: [
      {
        id: 'create_function',
        placeholder: '___',
        correctAnswer: 'empty',
        hint: 'Which function creates an empty vector?'
      },
      {
        id: 'type',
        placeholder: '___',
        correctAnswer: 'u64',
        hint: 'What type are we storing in the vector? (look at return type)'
      },
      {
        id: 'add_function',
        placeholder: '___',
        correctAnswer: 'push_back',
        hint: 'Which function adds an element to the end of a vector?'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },
  {
    id: 'cc-new-010',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'structs',
    title: 'Define and Create a Struct',
    description: 'Fill in the blanks to define a struct and create an instance of it.',
    learningObjective: 'Learn how to define structs and instantiate them with values.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'Structs are defined with the "struct" keyword.',
      'Abilities come after "has".',
      'Create instances with struct_name { field: value }.'
    ],
    explanation: 'Structs in Move define custom types by grouping related data. After defining the struct, you create instances by providing values for all fields.',
    codeTemplate: `module lesson4::player {
    public {blank:keyword1} Player {blank:abilities_keyword} key, store {
        id: u64,
        level: u8,
        score: u64
    }

    fun create_player(id: u64): Player {
        {blank:struct_name} {
            {blank:field1}: id,
            level: 1,
            score: 0
        }
    }
}`,
    blanks: [
      {
        id: 'keyword1',
        placeholder: '___',
        correctAnswer: 'struct',
        hint: 'What keyword defines a custom type?'
      },
      {
        id: 'abilities_keyword',
        placeholder: '___',
        correctAnswer: 'has',
        hint: 'Which keyword comes before listing abilities?'
      },
      {
        id: 'struct_name',
        placeholder: '___',
        correctAnswer: 'Player',
        hint: 'What is the name of the struct we are creating?'
      },
      {
        id: 'field1',
        placeholder: '___',
        correctAnswer: 'id',
        hint: 'What is the name of the first field in Player?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },
  {
    id: 'cc-new-008',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'Loop with Break and Continue',
    description: 'Fill in the blanks to create a loop that skips odd numbers and stops at a target.',
    learningObjective: 'Learn how to use break and continue statements in loops.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'Use "continue" to skip the rest of the current iteration.',
      'Use "break" to exit the loop completely.',
      'The modulo operator % can check if a number is even or odd.'
    ],
    explanation: 'In Move, "continue" skips to the next iteration of a loop, while "break" exits the loop entirely. These control flow statements are essential for implementing complex iteration logic.',
    codeTemplate: `module lesson3::loop_demo {
    fun count_even_numbers(target: u64): u64 {
        let mut count = 0;
        let mut i = 0;
        loop {
            if (i >= target) {
                {blank:exit_keyword};  // Exit when we reach the target
            };
            if (i % 2 != 0) {
                i = i + 1;
                {blank:skip_keyword};  // Skip odd numbers
            };
            count = count + 1;
            i = i + 1;
        };
        count
    }
}`,
    blanks: [
      {
        id: 'exit_keyword',
        placeholder: '___',
        correctAnswer: 'break',
        hint: 'Which keyword exits the loop completely?'
      },
      {
        id: 'skip_keyword',
        placeholder: '___',
        correctAnswer: 'continue',
        hint: 'Which keyword skips to the next iteration?'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },
  {
    id: 'cc-new-005',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Working with Addresses',
    description: 'Fill in the blanks to correctly declare and use address types.',
    learningObjective: 'Learn how to declare and work with address types in Move.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Addresses in Move start with 0x followed by hex digits.',
      'The address type is called "address".',
      'Use == to compare addresses.'
    ],
    explanation: 'In Move, addresses represent account identifiers on the blockchain. They are written with 0x prefix followed by hexadecimal digits. The address type is used to identify accounts and modules.',
    codeTemplate: `module lesson2::address_demo {
    fun check_sender(user: {blank:type1}): bool {
        let admin: address = {blank:address_value};
        user {blank:operator} admin
    }
}`,
    blanks: [
      {
        id: 'type1',
        placeholder: '___',
        correctAnswer: 'address',
        hint: 'What type is used for blockchain account identifiers?'
      },
      {
        id: 'address_value',
        placeholder: '___',
        correctAnswer: '0x1',
        acceptableAnswers: ['0x01', '0x0001'],
        hint: 'Addresses start with 0x. The simplest address is 0x1.'
      },
      {
        id: 'operator',
        placeholder: '___',
        correctAnswer: '==',
        hint: 'Which operator compares if two values are equal?'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },
  {
    id: 'cc-new-002',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Declare Variables',
    description: 'Fill in the blanks to correctly declare variables with different types.',
    learningObjective: 'Learn how to declare variables with proper types in Move.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Use "let" to declare a variable.',
      'Type for whole numbers: u8, u64, u128.',
      'Use "mut" after "let" to make a variable changeable.'
    ],
    explanation: 'In Move, variables are declared with "let name: type = value;". Variables are immutable by default. Use "let mut" to make them mutable (changeable).',
    codeTemplate: `module lesson1::variables {
    fun example() {
        // Declare an immutable variable
        {blank:keyword1} score: {blank:type1} = 100;

        // Declare a mutable variable
        let {blank:keyword2} level: u8 = 1;
    }
}`,
    blanks: [
      {
        id: 'keyword1',
        placeholder: '___',
        correctAnswer: 'let',
        hint: 'Use this keyword to declare variables.'
      },
      {
        id: 'type1',
        placeholder: '___',
        correctAnswer: 'u64',
        acceptableAnswers: ['u8', 'u128', 'u16', 'u32'],
        hint: 'What type can store the number 100?'
      },
      {
        id: 'keyword2',
        placeholder: '___',
        correctAnswer: 'mut',
        hint: 'This keyword makes the variable changeable.'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },
  {
    id: 'cc-001',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'functions',
    title: 'Complete the Add Function',
    description: 'Fill in the blanks to create a function that adds two numbers.',
    learningObjective: 'Understand basic function syntax and return types in Move.',
    estimatedTime: 3,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Functions in Move use the "fun" keyword.',
      'The return type comes after a colon.',
      'Use the + operator for addition.'
    ],
    explanation: 'In Move, functions are defined with the "fun" keyword, followed by the function name, parameters in parentheses, and an optional return type after a colon. The function body contains the logic.',
    codeTemplate: `module math::calculator {
    {blank:keyword} fun add(a: u64, b: u64): {blank:returnType} {
        a {blank:operator} b
    }
}`,
    blanks: [
      {
        id: 'keyword',
        placeholder: '___',
        correctAnswer: 'public',
        acceptableAnswers: ['pub'],
        hint: 'This keyword makes the function accessible from outside the module.'
      },
      {
        id: 'returnType',
        placeholder: '___',
        correctAnswer: 'u64',
        hint: 'The return type should match the input parameter types.'
      },
      {
        id: 'operator',
        placeholder: '___',
        correctAnswer: '+',
        hint: 'Use the addition operator.'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },

  {
    id: 'cc-002',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'structs',
    title: 'Define a Coin Struct',
    description: 'Complete the struct definition by filling in: (1) the visibility keyword, (2) the keyword before abilities, and (3) the field name for storing the coin amount.',
    learningObjective: 'Learn how to define structs with abilities in Move.',
    estimatedTime: 5,
    baseXP: 75,
    perfectScoreXP: 25,
    hints: [
      'Blank 1: Use "public" to make the struct accessible from other modules.',
      'Blank 2: Use "has" before listing abilities like store and drop.',
      'Blank 3: Name the field that stores the coin amount (like "value", "amount", or "balance").'
    ],
    explanation: 'Structs in Move define custom types. They can have abilities like "key" (can be used as storage), "store" (can be stored), "copy" (can be copied), and "drop" (can be dropped).',
    codeTemplate: `module currency::coin {
    {blank:keyword} struct Coin {blank:hasKeyword} store, drop {
        {blank:field}: u64
    }
}`,
    blanks: [
      {
        id: 'keyword',
        placeholder: '___',
        correctAnswer: 'public',
        acceptableAnswers: ['pub']
      },
      {
        id: 'hasKeyword',
        placeholder: '___',
        correctAnswer: 'has',
        hint: 'This keyword precedes the list of abilities.'
      },
      {
        id: 'field',
        placeholder: '___',
        correctAnswer: 'value',
        acceptableAnswers: ['amount', 'balance'],
        hint: 'Name the field that stores the coin amount.'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },

  {
    id: 'cc-003',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'vectors',
    title: 'Vector Operations',
    description: 'Complete the vector manipulation functions.',
    learningObjective: 'Master basic vector operations in Move.',
    estimatedTime: 4,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'Use vector::push_back to add elements.',
      'vector::length returns the size.',
      'vector::borrow gets a reference to an element.'
    ],
    explanation: 'Vectors in Move are dynamic arrays. Common operations include push_back, pop_back, length, and borrow for element access.',
    codeTemplate: `use std::vector;

public fun add_element(v: &mut vector<u64>, item: u64) {
    vector::{blank:addFunc}(v, item);
}

public fun get_size(v: &vector<u64>): u64 {
    vector::{blank:sizeFunc}(v)
}`,
    blanks: [
      {
        id: 'addFunc',
        placeholder: '___',
        correctAnswer: 'push_back',
        hint: 'This function adds an element to the end of a vector.'
      },
      {
        id: 'sizeFunc',
        placeholder: '___',
        correctAnswer: 'length',
        acceptableAnswers: ['len'],
        hint: 'This function returns the number of elements in a vector.'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  },

  {
    id: 'cc-004',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'generics',
    title: 'Generic Container',
    description: 'Create a generic container struct that can hold any type.',
    learningObjective: 'Understand generics and type parameters in Move.',
    estimatedTime: 6,
    baseXP: 100,
    perfectScoreXP: 40,
    hints: [
      'Generic types are declared with angle brackets.',
      'Use the type parameter name in the struct fields.',
      'Generic functions use the same syntax.'
    ],
    explanation: 'Generics allow you to write code that works with any type. The type parameter is declared in angle brackets and can be used throughout the struct or function definition.',
    codeTemplate: `module container::box {
    public struct Box{blank:typeParam} has store, drop {
        value: {blank:typeUse}
    }

    public fun create{blank:funcTypeParam}(val: T): Box<T> {
        Box { value: val }
    }
}`,
    blanks: [
      {
        id: 'typeParam',
        placeholder: '___',
        correctAnswer: '<T>',
        hint: 'Declare a type parameter using angle brackets.'
      },
      {
        id: 'typeUse',
        placeholder: '___',
        correctAnswer: 'T',
        hint: 'Use the type parameter name you declared.'
      },
      {
        id: 'funcTypeParam',
        placeholder: '___',
        correctAnswer: '<T>',
        hint: 'Generic functions also need type parameters.'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  {
    id: 'cc-005',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'options',
    title: 'Working with Option Types',
    description: 'Complete the code to work with optional values.',
    learningObjective: 'Learn how to use Option types for nullable values.',
    estimatedTime: 4,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'Use option::some to create a Some value.',
      'Use option::is_some to check if a value exists.',
      'Use option::borrow to access the value.'
    ],
    explanation: 'Option<T> represents a value that may or may not exist. It can be Some(value) or None. This is Move\'s way of handling nullable values safely.',
    codeTemplate: `use std::option::{Self, Option};

public fun create_some(value: u64): Option<u64> {
    option::{blank:someFunc}(value)
}

public fun has_value(opt: &Option<u64>): bool {
    option::{blank:checkFunc}(opt)
}`,
    blanks: [
      {
        id: 'someFunc',
        placeholder: '___',
        correctAnswer: 'some',
        hint: 'This function creates an Option with a value.'
      },
      {
        id: 'checkFunc',
        placeholder: '___',
        correctAnswer: 'is_some',
        hint: 'This function checks if an Option contains a value.'
      }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'move'
  }
];

// ============================================================================
// BUG FIX EXERCISES
// ============================================================================

const bugFixExercises: BugFixExercise[] = [
  {
    id: 'bf-001',
    type: 'bug_fix',
    difficulty: 'beginner',
    topic: 'functions',
    title: 'Fix the Function Visibility',
    description: 'This function should be callable from other modules but has a visibility bug.',
    learningObjective: 'Understand function visibility modifiers in Move.',
    estimatedTime: 3,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Check the visibility modifier.',
      'Functions need "public" to be called from outside.',
      'The syntax is "public fun".'
    ],
    explanation: 'Functions in Move default to private (module-only) visibility. Add "public" before "fun" to make them accessible from other modules.',
    buggyCode: `module math::ops {
    fun multiply(a: u64, b: u64): u64 {
        a * b
    }
}`,
    correctCode: `module math::ops {
    public fun multiply(a: u64, b: u64): u64 {
        a * b
    }
}`,
    bugs: [
      {
        lineNumber: 2,
        bugType: 'logic',
        description: 'Function is missing the "public" visibility modifier.',
        hint: 'Add "public" before "fun".'
      }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'move'
  },

  {
    id: 'bf-002',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'structs',
    title: 'Fix the Struct Abilities',
    description: 'This struct needs proper abilities to work with storage.',
    learningObjective: 'Learn about Move abilities and when to use them.',
    estimatedTime: 5,
    baseXP: 75,
    perfectScoreXP: 30,
    hints: [
      'Structs that will be stored need the "store" ability.',
      'If you want to use it as a top-level object, add "key".',
      'Abilities go after "has".'
    ],
    explanation: 'Abilities define what operations can be performed on a type. "key" allows storage as a top-level object, "store" allows storage inside other structs, "copy" allows copying, and "drop" allows dropping.',
    buggyCode: `module game::player {
    public struct Player {
        health: u64,
        score: u64
    }
}`,
    correctCode: `module game::player {
    public struct Player has key, store {
        health: u64,
        score: u64
    }
}`,
    bugs: [
      {
        lineNumber: 2,
        bugType: 'type',
        description: 'Struct is missing required abilities for storage.',
        hint: 'Add "has key, store" after the struct name.'
      }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'move'
  },

  {
    id: 'bf-003',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'references',
    title: 'Fix the Reference Types',
    description: 'The function parameters have incorrect reference types.',
    learningObjective: 'Understand mutable vs immutable references.',
    estimatedTime: 4,
    baseXP: 70,
    perfectScoreXP: 25,
    hints: [
      'Modifying a value requires a mutable reference (&mut).',
      'Reading only requires an immutable reference (&).',
      'Check which parameters are being modified.'
    ],
    explanation: 'In Move, &T is an immutable reference (read-only) and &mut T is a mutable reference (read-write). Use mutable references only when you need to modify the value.',
    buggyCode: `public fun increment_value(x: &u64) {
    *x = *x + 1;
}

public fun read_value(x: &mut u64): u64 {
    *x
}`,
    correctCode: `public fun increment_value(x: &mut u64) {
    *x = *x + 1;
}

public fun read_value(x: &u64): u64 {
    *x
}`,
    bugs: [
      {
        lineNumber: 1,
        bugType: 'type',
        description: 'Parameter needs mutable reference to be modified.',
        hint: 'Change &u64 to &mut u64 in the first function.'
      },
      {
        lineNumber: 5,
        bugType: 'logic',
        description: 'Parameter should be immutable since it\'s only being read.',
        hint: 'Change &mut u64 to &u64 in the second function.'
      }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'move'
  },

  {
    id: 'bf-004',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'vectors',
    title: 'Fix Vector Out of Bounds',
    description: 'This code has a potential out-of-bounds error.',
    learningObjective: 'Learn safe vector access patterns.',
    estimatedTime: 6,
    baseXP: 90,
    perfectScoreXP: 35,
    hints: [
      'Always check vector length before accessing.',
      'Use vector::length to get the size.',
      'Index should be less than length.'
    ],
    explanation: 'Accessing a vector index that doesn\'t exist causes an abort. Always check the length first or use safe access methods.',
    buggyCode: `use std::vector;

public fun get_first(v: &vector<u64>): u64 {
    *vector::borrow(v, 0)
}`,
    correctCode: `use std::vector;

public fun get_first(v: &vector<u64>): u64 {
    assert!(vector::length(v) > 0, 1);
    *vector::borrow(v, 0)
}`,
    bugs: [
      {
        lineNumber: 3,
        bugType: 'runtime',
        description: 'No check for empty vector before accessing index 0.',
        hint: 'Add an assertion to check if the vector is not empty.'
      }
    ],
    testCases: [
      {
        expectedOutput: 'assertion failure',
        description: 'Empty vector should abort'
      }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'move'
  },

  {
    id: 'bf-005',
    type: 'bug_fix',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Fix Type Mismatch',
    description: 'The function has a type mismatch error.',
    learningObjective: 'Understand Move\'s type system and integer types.',
    estimatedTime: 3,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Check the return type.',
      'The function returns u64 but declares u8.',
      'Return type should match the actual value.'
    ],
    explanation: 'Move is strongly typed. The return type in the function signature must match the actual return value\'s type.',
    buggyCode: `public fun get_max_value(): u8 {
    1000
}`,
    correctCode: `public fun get_max_value(): u64 {
    1000
}`,
    bugs: [
      {
        lineNumber: 1,
        bugType: 'type',
        description: 'Return type u8 cannot hold value 1000 (max 255).',
        hint: 'Change return type to u64 or u128.'
      }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'move'
  }
];

// ============================================================================
// MULTIPLE CHOICE EXERCISES
// ============================================================================

const multipleChoiceExercises: MultipleChoiceExercise[] = [
  {
    id: 'mc-new-020',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'generics',
    title: 'Type Constraints and Abilities',
    description: 'Understanding which type constraints are required for generic operations.',
    learningObjective: 'Master when and how to use ability constraints on generic type parameters.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Think about what operations you need to perform on the type.',
      'The "drop" ability allows a value to be discarded.',
      'Without "drop", you must explicitly unpack or transfer ownership.',
      'Type constraints come after the type parameter with a colon.'
    ],
    explanation: 'Type constraints specify which abilities a generic type must have. The "drop" ability is needed when you want to discard a value without explicitly handling it. Without drop, the compiler requires you to manually unpack or transfer the value.',
    question: 'You have a function that creates a Box<T> but doesn\'t return it. Which constraint is REQUIRED on T?',
    codeSnippet: `public fun drop_box<T>(box: Box<T>) {
    // Box is created but not returned - it goes out of scope
    let Box { value: _ } = box;
}`,
    options: [
      {
        id: 'opt1',
        text: 'T: drop',
        isCorrect: true,
        explanation: 'Correct! Since the Box (and its inner value) is discarded without being used, T must have the "drop" ability. The underscore (_) pattern discards the value.'
      },
      {
        id: 'opt2',
        text: 'T: copy',
        isCorrect: false,
        explanation: 'Incorrect. "copy" allows duplicating values, but that\'s not needed here - we\'re discarding, not copying.'
      },
      {
        id: 'opt3',
        text: 'T: store',
        isCorrect: false,
        explanation: 'Incorrect. "store" allows storing in other structs, but we\'re not storing anything here - just unpacking and discarding.'
      },
      {
        id: 'opt4',
        text: 'No constraint needed',
        isCorrect: false,
        explanation: 'Incorrect! Without the "drop" ability, Move requires you to explicitly handle the value. You can\'t just discard it.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-016',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'references',
    title: 'Valid Borrow Scenarios',
    description: 'Understanding which borrowing patterns are allowed in Move.',
    learningObjective: 'Master the borrow checker rules for references.',
    estimatedTime: 4,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'You can have multiple immutable references (&) at once.',
      'You can have ONE mutable reference (&mut) at a time.',
      'You cannot mix & and &mut - it\'s one or the other.'
    ],
    explanation: 'Move\'s borrow checker enforces safety rules: (1) Multiple immutable references are OK - many readers, no writers. (2) ONE mutable reference at a time - exclusive write access. (3) Cannot have both & and &mut active simultaneously - prevents reading while someone is writing.',
    question: 'Which of these borrowing scenarios is VALID in Move?',
    options: [
      {
        id: 'opt1',
        text: 'let ref1 = &x; let ref2 = &x; let ref3 = &x;',
        isCorrect: true,
        explanation: 'Correct! Multiple immutable references are allowed. All readers, no writers - perfectly safe.'
      },
      {
        id: 'opt2',
        text: 'let ref1 = &mut x; let ref2 = &mut x;',
        isCorrect: false,
        explanation: 'Invalid! You can only have ONE mutable reference at a time. Two would allow conflicting modifications.'
      },
      {
        id: 'opt3',
        text: 'let ref1 = &x; let ref2 = &mut x;',
        isCorrect: false,
        explanation: 'Invalid! Cannot mix immutable and mutable references. Someone is reading while someone else is writing - data race!'
      },
      {
        id: 'opt4',
        text: 'let ref1 = &mut x; let ref2 = &x;',
        isCorrect: false,
        explanation: 'Invalid! Cannot have a mutable reference alongside an immutable one. Value is being modified while being read.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-014',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'vectors',
    title: 'Vector Safety and Bounds Checking',
    description: 'Understanding what happens when accessing vector elements.',
    learningObjective: 'Learn about vector bounds checking and safe access patterns.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Vectors have a length - number of elements.',
      'Valid indices are 0 to length-1.',
      'What happens if you try to access index 5 in a vector with length 3?'
    ],
    explanation: 'In Move, accessing a vector index that doesn\'t exist causes an ABORT (runtime error). This prevents silent bugs. Always check the vector length before accessing an index, or use vector::contains() to check if an element exists.',
    question: 'What happens if you try to access index 10 in a vector with length 5?',
    options: [
      {
        id: 'opt1',
        text: 'The program aborts with an error',
        isCorrect: true,
        explanation: 'Correct! Out-of-bounds access causes an abort. Valid indices for length 5 are 0-4. Always check vector::length() first!'
      },
      {
        id: 'opt2',
        text: 'It returns a default value (like 0)',
        isCorrect: false,
        explanation: 'Incorrect. Move never returns default values silently - that would hide bugs! It aborts instead.'
      },
      {
        id: 'opt3',
        text: 'The vector automatically grows to size 11',
        isCorrect: false,
        explanation: 'Incorrect. Vectors only grow when you explicitly push_back(). Reading doesn\'t auto-grow.'
      },
      {
        id: 'opt4',
        text: 'It wraps around and returns index 0',
        isCorrect: false,
        explanation: 'Incorrect. Move doesn\'t do wraparound - that would be unpredictable and dangerous!'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-011',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'structs',
    title: 'Choosing Abilities for Digital Assets',
    description: 'Understanding which abilities should be used for different types of structs.',
    learningObjective: 'Learn which abilities are appropriate for digital assets vs regular data.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Digital assets like money or NFTs should not be copyable.',
      'Being able to drop something means it can be discarded.',
      'What happens if you can duplicate money?'
    ],
    explanation: 'Digital assets representing value (coins, NFTs, game items) should NEVER have the "copy" or "drop" abilities. This prevents bugs where assets could be duplicated or accidentally destroyed. Use "key" and "store" for assets that need to be owned and transferred.',
    question: 'Which abilities should a Coin struct (representing money) have?',
    options: [
      {
        id: 'opt1',
        text: 'key, store',
        isCorrect: true,
        explanation: 'Correct! Assets need "key" (can be owned) and "store" (can be stored), but NOT copy/drop (would allow duplication/destruction of money).'
      },
      {
        id: 'opt2',
        text: 'key, store, copy, drop',
        isCorrect: false,
        explanation: 'Dangerous! With "copy", you could duplicate money. With "drop", coins could be accidentally destroyed. Never give assets these abilities.'
      },
      {
        id: 'opt3',
        text: 'copy, drop',
        isCorrect: false,
        explanation: 'Very wrong! This would let you duplicate money (copy) and destroy it accidentally (drop). Assets must never have these.'
      },
      {
        id: 'opt4',
        text: 'Only key',
        isCorrect: false,
        explanation: 'Incomplete. While "key" is needed, you also need "store" to allow the asset to be stored in other structures or transferred.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-007',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'If Expression Rules',
    description: 'Understanding how if expressions return values in Move.',
    learningObjective: 'Learn the rules for using if as an expression that returns a value.',
    estimatedTime: 3,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'If expressions can return values in Move.',
      'Both branches must be consistent.',
      'What happens if the types differ?'
    ],
    explanation: 'In Move, if is an expression that can return values. When used this way, both the if and else branches must return the same type. This ensures type safety and predictable behavior.',
    question: 'What must be true when using an if-else expression to assign a value?',
    options: [
      {
        id: 'opt1',
        text: 'Both branches must return the same type',
        isCorrect: true,
        explanation: 'Correct! For type safety, both the if and else branches must return the same type when the result is used.'
      },
      {
        id: 'opt2',
        text: 'The else branch is optional',
        isCorrect: false,
        explanation: 'Incorrect. When returning a value, the else branch is required - otherwise what value would be returned if the condition is false?'
      },
      {
        id: 'opt3',
        text: 'Only the if branch needs to return a value',
        isCorrect: false,
        explanation: 'Incorrect. Both branches must return a value of the same type.'
      },
      {
        id: 'opt4',
        text: 'If expressions cannot return values',
        isCorrect: false,
        explanation: 'Incorrect. If expressions absolutely can return values - this is a key feature of Move!'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-004',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Integer Overflow',
    description: 'Understanding what happens when integers exceed their maximum values.',
    learningObjective: 'Learn about integer overflow behavior in Move.',
    estimatedTime: 3,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'u8 can only hold values 0-255.',
      'What happens when you add 1 to the maximum value?',
      'Move protects you from silent errors.'
    ],
    explanation: 'In Move, integer overflow causes an abort (runtime error) rather than wrapping around. This prevents silent bugs that could lead to security vulnerabilities in smart contracts. For example, adding 1 to a u8 value of 255 will abort the program.',
    question: 'What happens when you try to store 256 in a u8 variable?',
    options: [
      {
        id: 'opt1',
        text: 'The program aborts with an error',
        isCorrect: true,
        explanation: 'Correct! Move prevents overflow by aborting the program. u8 max is 255, so 256 causes an abort.'
      },
      {
        id: 'opt2',
        text: 'The value wraps around to 0',
        isCorrect: false,
        explanation: 'Incorrect. Unlike some languages, Move does not wrap around. It aborts to prevent bugs.'
      },
      {
        id: 'opt3',
        text: 'It automatically converts to u16',
        isCorrect: false,
        explanation: 'Incorrect. Move is strongly typed and does not automatically convert types.'
      },
      {
        id: 'opt4',
        text: 'The value is silently truncated',
        isCorrect: false,
        explanation: 'Incorrect. Move never silently truncates values, as this could cause security bugs.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-new-001',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'modules',
    title: 'Module Basics',
    description: 'Test your understanding of Move modules.',
    learningObjective: 'Understand what keyword starts a module definition.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 10,
    hints: [
      'Modules are containers for code.',
      'The keyword comes before the package and module name.',
      'It\'s the first word in a module declaration.'
    ],
    explanation: 'In Move, modules are defined using the "module" keyword, followed by the package name, double colons (::), and the module name. For example: module lesson1::calculator { ... }',
    question: 'What keyword is used to define a module in Move?',
    options: [
      {
        id: 'opt1',
        text: 'module',
        isCorrect: true,
        explanation: 'Correct! The "module" keyword is used to define a module in Move.'
      },
      {
        id: 'opt2',
        text: 'package',
        isCorrect: false,
        explanation: 'Incorrect. "package" is part of the module path, not the defining keyword.'
      },
      {
        id: 'opt3',
        text: 'function',
        isCorrect: false,
        explanation: 'Incorrect. "function" or "fun" is used to define functions, not modules.'
      },
      {
        id: 'opt4',
        text: 'struct',
        isCorrect: false,
        explanation: 'Incorrect. "struct" is used to define custom types, not modules.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-001',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Integer Types Range',
    description: 'Test your knowledge of integer type ranges in Move.',
    learningObjective: 'Understand the different integer types and their ranges.',
    estimatedTime: 2,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'u8 can hold values from 0 to 255.',
      'Each increase in bit size doubles the range.',
      'The "u" means unsigned (no negative numbers).'
    ],
    explanation: 'Move has several unsigned integer types: u8 (0-255), u16 (0-65535), u32 (0-4.3B), u64 (0-18.4 quintillion), u128 (0-340 undecillion), and u256.',
    question: 'What is the maximum value that can be stored in a u8 type?',
    options: [
      {
        id: 'opt1',
        text: '127',
        isCorrect: false,
        explanation: 'This is the max for a signed 8-bit integer (i8), not u8.'
      },
      {
        id: 'opt2',
        text: '255',
        isCorrect: true,
        explanation: 'Correct! u8 is an 8-bit unsigned integer, so it ranges from 0 to 2^8 - 1 = 255.'
      },
      {
        id: 'opt3',
        text: '256',
        isCorrect: false,
        explanation: 'This is one more than the maximum. Remember, counting starts at 0.'
      },
      {
        id: 'opt4',
        text: '65535',
        isCorrect: false,
        explanation: 'This is the maximum value for u16, not u8.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  {
    id: 'mc-002',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'abilities',
    title: 'Understanding Abilities',
    description: 'Which abilities does a struct need for different operations?',
    learningObjective: 'Master the Move ability system.',
    estimatedTime: 4,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      '"key" is needed for global storage.',
      '"store" allows storage in other structs.',
      '"copy" enables value copying.',
      '"drop" allows automatic cleanup.'
    ],
    explanation: 'Move abilities control what operations are allowed on types. Key abilities are: key (global storage), store (nested storage), copy (duplication), and drop (automatic cleanup).',
    question: 'Which abilities must a struct have to be stored as a top-level global resource? (Select all that apply)',
    options: [
      {
        id: 'opt1',
        text: 'key',
        isCorrect: true,
        explanation: 'Correct! The "key" ability is required for global storage.'
      },
      {
        id: 'opt2',
        text: 'store',
        isCorrect: false,
        explanation: 'Store is needed for nested storage, not required for top-level.'
      },
      {
        id: 'opt3',
        text: 'copy',
        isCorrect: false,
        explanation: 'Copy is optional and allows duplicating the value.'
      },
      {
        id: 'opt4',
        text: 'drop',
        isCorrect: false,
        explanation: 'Drop is optional and allows automatic cleanup.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  {
    id: 'mc-003',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'references',
    title: 'Reference Types',
    description: 'Understanding when to use mutable vs immutable references.',
    learningObjective: 'Master reference types in Move.',
    estimatedTime: 3,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Immutable references are read-only.',
      'Mutable references allow modification.',
      'You can have multiple immutable or one mutable reference.'
    ],
    explanation: 'In Move, &T is an immutable reference (read-only) and &mut T is a mutable reference (can modify). You can have many &T references but only one &mut T at a time.',
    question: 'Which statement about references in Move is TRUE?',
    options: [
      {
        id: 'opt1',
        text: 'You can have multiple mutable references to the same value at once',
        isCorrect: false,
        explanation: 'False. You can only have ONE mutable reference at a time to prevent data races.'
      },
      {
        id: 'opt2',
        text: 'Immutable references (&T) allow modifying the value',
        isCorrect: false,
        explanation: 'False. Immutable references are read-only. You need &mut T to modify.'
      },
      {
        id: 'opt3',
        text: 'You can have multiple immutable references at the same time',
        isCorrect: true,
        explanation: 'Correct! Multiple immutable references are safe because none can modify the value.'
      },
      {
        id: 'opt4',
        text: 'References in Move can outlive the value they point to',
        isCorrect: false,
        explanation: 'False. Move ensures references never outlive the values they point to (no dangling references).'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  {
    id: 'mc-004',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'If Expressions',
    description: 'How do if expressions work in Move?',
    learningObjective: 'Understand if expressions and their return values.',
    estimatedTime: 3,
    baseXP: 45,
    perfectScoreXP: 18,
    hints: [
      'If expressions can return values.',
      'Both branches must return the same type.',
      'The last expression in a block is returned.'
    ],
    explanation: 'In Move, if is an expression that can return values. Both branches must return the same type if the result is used.',
    question: 'What must be true about if-else expressions in Move when used as a value?',
    options: [
      {
        id: 'opt1',
        text: 'Only the if branch needs to return a value',
        isCorrect: false,
        explanation: 'False. Both branches must return a value of the same type.'
      },
      {
        id: 'opt2',
        text: 'Both branches must return the same type',
        isCorrect: true,
        explanation: 'Correct! For type safety, both branches must return the same type.'
      },
      {
        id: 'opt3',
        text: 'If expressions cannot return values',
        isCorrect: false,
        explanation: 'False. If expressions can and often do return values in Move.'
      },
      {
        id: 'opt4',
        text: 'The else branch is optional when returning a value',
        isCorrect: false,
        explanation: 'False. When returning a value, the else branch is required.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  {
    id: 'mc-005',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'generics',
    title: 'Generic Type Constraints',
    description: 'Understanding constraints on generic types.',
    learningObjective: 'Learn about type parameter constraints in generics.',
    estimatedTime: 5,
    baseXP: 80,
    perfectScoreXP: 30,
    hints: [
      'Constraints specify required abilities.',
      'They come after the type parameter.',
      'Multiple constraints are separated by +'
    ],
    explanation: 'Generic type parameters can have constraints that specify which abilities the type must have. This ensures the generic code can perform required operations.',
    question: 'How do you constrain a generic type parameter T to have both copy and drop abilities?',
    codeSnippet: `public fun example<T>(item: T) {
    // function body
}`,
    options: [
      {
        id: 'opt1',
        text: 'public fun example<T: copy, drop>(item: T)',
        isCorrect: false,
        explanation: 'Incorrect syntax. Abilities are separated by +, not commas.'
      },
      {
        id: 'opt2',
        text: 'public fun example<T: copy + drop>(item: T)',
        isCorrect: true,
        explanation: 'Correct! Use + to separate multiple ability constraints.'
      },
      {
        id: 'opt3',
        text: 'public fun example<T has copy, drop>(item: T)',
        isCorrect: false,
        explanation: 'Incorrect. Use : not "has" for constraints.'
      },
      {
        id: 'opt4',
        text: 'public fun example<T>(item: T: copy + drop)',
        isCorrect: false,
        explanation: 'Incorrect. Constraints go on the type parameter, not the parameter itself.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  }
];

// ============================================================================
// OUTPUT PREDICTION EXERCISES
// ============================================================================

const outputPredictionExercises: OutputPredictionExercise[] = [
  {
    id: 'op-new-021',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'generics',
    title: 'Generic Type Inference',
    description: 'Predict how Move infers types for generic functions.',
    learningObjective: 'Understand how the compiler infers generic type parameters from usage.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Look at what type is passed to create_box.',
      'The type parameter T is inferred from the argument.',
      'unwrap returns the same type that was stored.',
      'Follow the value through the generic functions.'
    ],
    explanation: 'Move can infer generic type parameters from how you use the function. When you pass a u64 to create_box<T>, the compiler knows T = u64. The Box<u64> then requires unwrap to return u64. Type inference makes generics convenient without explicit type annotations.',
    code: `public struct Box<T> has store, drop {
    value: T
}

public fun create_box<T>(val: T): Box<T> {
    Box { value: val }
}

public fun unwrap<T>(box: Box<T>): T {
    let Box { value } = box;
    value
}

fun test(): u64 {
    let box = create_box(42);  // T inferred as u64
    unwrap(box)
}`,
    language: 'move',
    correctOutput: '42',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['0', '42', 'Box(42)', 'Type error'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Call create_box(42) - compiler infers T = u64',
        variables: { 'T': 'u64', val: 42 }
      },
      {
        step: 2,
        description: 'Create Box<u64> with value 42',
        variables: { 'box.value': 42 }
      },
      {
        step: 3,
        description: 'Call unwrap(box) - T is u64, returns u64',
        variables: { 'return type': 'u64' }
      },
      {
        step: 4,
        description: 'Destructure box, extract value: 42',
        variables: { value: 42 }
      },
      {
        step: 5,
        description: 'Return value: 42',
        variables: { result: 42 }
      }
    ]
  },
  {
    id: 'op-new-018',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'references',
    title: 'Complex Borrow and Modify',
    description: 'Predict the final value after multiple borrow and modify operations.',
    learningObjective: 'Understand how references work with sequential modifications.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Follow each step carefully.',
      'Immutable borrows return the current value.',
      'Mutable borrows allow changing the value.',
      'All operations affect the same underlying variable.'
    ],
    explanation: 'References in Move allow you to access and modify values without transferring ownership. Immutable references (&) let you read, mutable references (&mut) let you modify. Multiple operations through different references all affect the same underlying value.',
    code: `fun test_references(): u64 {
    let mut balance = 100;

    let read_ref = &balance;
    let initial = *read_ref;  // Read: 100

    let mut_ref = &mut balance;
    *mut_ref = *mut_ref + 50;  // Modify: 100 + 50 = 150

    let read_ref2 = &balance;
    let current = *read_ref2;  // Read: 150

    current
}`,
    language: 'move',
    correctOutput: '150',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['100', '150', '200', '250'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Initialize balance = 100',
        variables: { balance: 100 }
      },
      {
        step: 2,
        description: 'Create immutable reference, read value: 100',
        variables: { initial: 100 }
      },
      {
        step: 3,
        description: 'Create mutable reference, modify: 100 + 50 = 150',
        variables: { balance: 150 }
      },
      {
        step: 4,
        description: 'Create new immutable reference, read new value: 150',
        variables: { current: 150 }
      },
      {
        step: 5,
        description: 'Return current value',
        variables: { result: 150 }
      }
    ]
  },
  {
    id: 'op-new-015',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'vectors',
    title: 'Vector Length After Operations',
    description: 'Predict the vector length after push and pop operations.',
    learningObjective: 'Understand how push_back and pop_back affect vector length.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'push_back adds one element (length increases by 1)',
      'pop_back removes one element (length decreases by 1)',
      'Count the operations carefully'
    ],
    explanation: 'vector::push_back() adds an element to the end and increases length by 1. vector::pop_back() removes the last element and decreases length by 1. vector::length() returns the current number of elements.',
    code: `use std::vector;

fun test_vector(): u64 {
    let mut v = vector::empty<u64>();
    vector::push_back(&mut v, 10);
    vector::push_back(&mut v, 20);
    vector::push_back(&mut v, 30);
    vector::pop_back(&mut v);
    vector::length(&v)
}`,
    language: 'move',
    correctOutput: '2',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['0', '1', '2', '3'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Create empty vector',
        variables: { 'length': 0 }
      },
      {
        step: 2,
        description: 'push_back(10) - length is now 1',
        variables: { 'length': 1 }
      },
      {
        step: 3,
        description: 'push_back(20) - length is now 2',
        variables: { 'length': 2 }
      },
      {
        step: 4,
        description: 'push_back(30) - length is now 3',
        variables: { 'length': 3 }
      },
      {
        step: 5,
        description: 'pop_back() - length is now 2',
        variables: { 'length': 2 }
      }
    ]
  },
  {
    id: 'op-new-012',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'structs',
    title: 'Struct Field Access',
    description: 'Predict the output after accessing and modifying struct fields.',
    learningObjective: 'Understand how to access struct fields and destructure structs.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Use dot notation to access fields: player.score',
      'Mutable references (&mut) allow modifying fields.',
      'After incrementing level by 1, what is the new level?'
    ],
    explanation: 'Struct fields are accessed with dot notation (struct.field). You can read fields from immutable references (&), and modify them with mutable references (&mut). Destructuring unpacks all fields at once.',
    code: `struct Player has drop {
    id: u64,
    level: u8,
    score: u64
}

fun level_up(player: &mut Player) {
    player.level = player.level + 1;
}

fun test(): u8 {
    let mut p = Player { id: 1, level: 5, score: 100 };
    level_up(&mut p);
    p.level
}`,
    language: 'move',
    correctOutput: '6',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['5', '6', '7', '100'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Create Player with id=1, level=5, score=100',
        variables: { 'p.level': 5 }
      },
      {
        step: 2,
        description: 'Call level_up with mutable reference to p',
        variables: { 'p.level': 5 }
      },
      {
        step: 3,
        description: 'Increment level: 5 + 1 = 6',
        variables: { 'p.level': 6 }
      },
      {
        step: 4,
        description: 'Return p.level which is now 6',
        variables: { result: 6 }
      }
    ]
  },
  {
    id: 'op-new-009',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'Assert Behavior',
    description: 'Predict what happens when an assert condition fails.',
    learningObjective: 'Understand how assert! checks preconditions and aborts on failure.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'assert! checks if a condition is true.',
      'If the condition is false, it aborts with an error code.',
      'What is 5 compared to 10?'
    ],
    explanation: 'The assert! macro checks a condition. If true, execution continues. If false, the program aborts with the specified error code. This is essential for validating preconditions in smart contracts.',
    code: `fun withdraw(balance: u64, amount: u64): u64 {
    assert!(balance >= amount, 1);  // Error code 1
    balance - amount
}

fun test(): u64 {
    withdraw(5, 10)  // Try to withdraw 10 from balance of 5
}`,
    language: 'move',
    correctOutput: 'abort',
    outputType: 'error',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['0', '5', '10', 'abort with error code 1'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Call withdraw with balance=5, amount=10',
        variables: { balance: 5, amount: 10 }
      },
      {
        step: 2,
        description: 'Check: balance >= amount? (5 >= 10? false)',
        variables: { 'balance >= amount': false }
      },
      {
        step: 3,
        description: 'Condition false → abort with error code 1',
        variables: { error: 'abort(1)' }
      }
    ]
  },
  {
    id: 'op-new-006',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Type Casting Result',
    description: 'Predict the output after type casting operations.',
    learningObjective: 'Understand how type casting works with the "as" keyword.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Start with a u8 value of 100.',
      'Cast it to u64 using "as".',
      'Then add 1000 to the result.'
    ],
    explanation: 'In Move, the "as" keyword is used for type casting between compatible types. When casting from a smaller type (u8) to a larger type (u64), the value is preserved. You can then perform operations with the new type.',
    code: `fun convert_and_add(): u64 {
    let small: u8 = 100;
    let big = (small as u64) + 1000;
    big
}`,
    language: 'move',
    correctOutput: '1100',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['100', '1000', '1100', '10000'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Initialize small with u8 value 100',
        variables: { small: 100 }
      },
      {
        step: 2,
        description: 'Cast small from u8 to u64',
        variables: { 'small as u64': 100 }
      },
      {
        step: 3,
        description: 'Add 1000: 100 + 1000 = 1100',
        variables: { big: 1100 }
      }
    ]
  },
  {
    id: 'op-new-003',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'functions',
    title: 'Function Call Result',
    description: 'Predict what value this function returns.',
    learningObjective: 'Understand how functions return values in Move.',
    estimatedTime: 2,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'The function multiplies two numbers.',
      '6 * 7 = ?',
      'The last expression is returned automatically.'
    ],
    explanation: 'In Move, the last expression in a function (without a semicolon) is automatically returned. No "return" keyword is needed.',
    code: `fun multiply(a: u64, b: u64): u64 {
    a * b
}

fun test(): u64 {
    multiply(6, 7)
}`,
    language: 'move',
    correctOutput: '42',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['13', '42', '67', '76'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Call multiply with 6 and 7',
        variables: { a: 6, b: 7 }
      },
      {
        step: 2,
        description: 'Multiply: 6 * 7 = 42',
        variables: { result: 42 }
      }
    ]
  },
  {
    id: 'op-001',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Simple Arithmetic',
    description: 'Predict the output of this arithmetic operation.',
    learningObjective: 'Understand basic arithmetic operations in Move.',
    estimatedTime: 2,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Follow the order of operations.',
      'Multiplication happens before addition.',
      'Calculate step by step.'
    ],
    explanation: 'Move follows standard mathematical order of operations: parentheses, multiplication/division, then addition/subtraction.',
    code: `public fun calculate(): u64 {
    let x = 5 + 3 * 2;
    x
}`,
    language: 'move',
    correctOutput: '11',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['8', '11', '16', '13'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Multiply 3 * 2 = 6',
        variables: { '3 * 2': 6 }
      },
      {
        step: 2,
        description: 'Add 5 + 6 = 11',
        variables: { x: 11 }
      }
    ]
  },

  {
    id: 'op-002',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'control_flow',
    title: 'If Expression Result',
    description: 'What will this if expression return?',
    learningObjective: 'Understand how if expressions return values.',
    estimatedTime: 3,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Check the condition (10 > 5).',
      'The true branch returns 100.',
      'If expressions return the last expression in the chosen branch.'
    ],
    explanation: 'If expressions in Move can return values. The result is the last expression in the executed branch.',
    code: `public fun check_value(): u64 {
    let result = if (10 > 5) {
        100
    } else {
        50
    };
    result
}`,
    language: 'move',
    correctOutput: '100',
    outputType: 'value',
    answerFormat: 'text',
    showLineNumbers: true,
    allowableAnswers: ['100'],
    executionSteps: [
      {
        step: 1,
        description: 'Evaluate condition: 10 > 5 is true',
        variables: { '10 > 5': true }
      },
      {
        step: 2,
        description: 'Execute true branch, return 100',
        variables: { result: 100 }
      }
    ]
  },

  {
    id: 'op-003',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'vectors',
    title: 'Vector Length',
    description: 'Predict the length of this vector after operations.',
    learningObjective: 'Understand vector operations and their effects.',
    estimatedTime: 4,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'Start with an empty vector (length 0).',
      'push_back adds one element.',
      'Count how many push_back calls there are.'
    ],
    explanation: 'Vectors start empty and grow with each push_back operation. The length equals the number of elements added.',
    code: `use std::vector;

public fun vector_ops(): u64 {
    let v = vector::empty<u64>();
    vector::push_back(&mut v, 10);
    vector::push_back(&mut v, 20);
    vector::push_back(&mut v, 30);
    vector::length(&v)
}`,
    language: 'move',
    correctOutput: '3',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['0', '1', '3', '60'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Create empty vector',
        variables: { 'v.length': 0 }
      },
      {
        step: 2,
        description: 'Push 10 to vector',
        variables: { 'v.length': 1 }
      },
      {
        step: 3,
        description: 'Push 20 to vector',
        variables: { 'v.length': 2 }
      },
      {
        step: 4,
        description: 'Push 30 to vector',
        variables: { 'v.length': 3 }
      }
    ]
  },

  {
    id: 'op-004',
    type: 'output_prediction',
    difficulty: 'advanced',
    topic: 'references',
    title: 'Reference Modification',
    description: 'Predict the final value after reference operations.',
    learningObjective: 'Master how references work with modifications.',
    estimatedTime: 5,
    baseXP: 75,
    perfectScoreXP: 30,
    hints: [
      'Follow each modification step.',
      'Mutable references allow changing the value.',
      'Both operations affect the same underlying value.'
    ],
    explanation: 'Mutable references allow modifying the original value. Multiple operations on the same reference compound.',
    code: `public fun modify_value(): u64 {
    let mut x = 10;
    let ref = &mut x;
    *ref = *ref + 5;
    *ref = *ref * 2;
    x
}`,
    language: 'move',
    correctOutput: '30',
    outputType: 'value',
    answerFormat: 'text',
    showLineNumbers: true,
    allowableAnswers: ['30'],
    executionSteps: [
      {
        step: 1,
        description: 'Initialize x = 10',
        variables: { x: 10 }
      },
      {
        step: 2,
        description: 'Create mutable reference to x',
        variables: { x: 10, ref: '&mut x' }
      },
      {
        step: 3,
        description: 'Add 5: x = 10 + 5 = 15',
        variables: { x: 15 }
      },
      {
        step: 4,
        description: 'Multiply by 2: x = 15 * 2 = 30',
        variables: { x: 30 }
      }
    ]
  },

  {
    id: 'op-005',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'functions',
    title: 'Function Return Value',
    description: 'What does this function return?',
    learningObjective: 'Understand implicit returns in Move.',
    estimatedTime: 2,
    baseXP: 45,
    perfectScoreXP: 18,
    hints: [
      'The last expression without semicolon is returned.',
      'Calculate a + b where a=7 and b=3.',
      'No explicit return keyword needed.'
    ],
    explanation: 'In Move, the last expression in a function (without a semicolon) is implicitly returned.',
    code: `public fun add_numbers(): u64 {
    let a = 7;
    let b = 3;
    a + b
}`,
    language: 'move',
    correctOutput: '10',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['7', '3', '10', '73'],
    showLineNumbers: true
  },
];

// ===== MESSAGING SDK EXERCISES =====

// --- Lesson 1: On-Chain Messaging on Sui ---
const msgMultipleChoiceExercises: MultipleChoiceExercise[] = [
  {
    id: 'mc-msg-001',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'messaging',
    title: 'Why On-Chain Messaging?',
    description: 'Understanding the benefits of decentralized messaging.',
    learningObjective: 'Learn why on-chain messaging is valuable compared to centralized alternatives.',
    estimatedTime: 3,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'Think about who controls your messages in traditional apps.',
      'On-chain means the blockchain stores the data.',
      'No single company can censor or shut down the service.'
    ],
    explanation: 'On-chain messaging stores messages on the blockchain, giving users ownership of their data. No single entity can censor messages, and the system has no single point of failure.',
    question: 'What is the PRIMARY advantage of on-chain messaging over centralized messaging apps?',
    options: [
      { id: 'opt1', text: 'Users own their data and no single entity can censor messages', isCorrect: true, explanation: 'Correct! On-chain messaging is censorship-resistant and user-owned.' },
      { id: 'opt2', text: 'Messages are always faster', isCorrect: false, explanation: 'Incorrect. Blockchain transactions can be slower than centralized servers.' },
      { id: 'opt3', text: 'Messages are always free', isCorrect: false, explanation: 'Incorrect. On-chain messages require gas fees for transactions.' },
      { id: 'opt4', text: 'Messages automatically translate to other languages', isCorrect: false, explanation: 'Incorrect. Translation is unrelated to where messages are stored.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },
  {
    id: 'mc-msg-003',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'messaging',
    title: 'SDK Architecture Overview',
    description: 'Understanding the @mysten/messaging SDK components.',
    learningObjective: 'Learn the three main client dependencies in the messaging SDK.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'The SDK needs to talk to the Sui blockchain.',
      'Encryption requires a separate client.',
      'File storage uses a decentralized storage network.'
    ],
    explanation: 'The @mysten/messaging SDK depends on three clients: SuiClient (blockchain interaction), SealClient (encryption), and WalrusClient (file storage). Each handles a different aspect of messaging.',
    question: 'Which three clients does the @mysten/messaging SDK depend on?',
    options: [
      { id: 'opt1', text: 'SuiClient, SealClient, and WalrusClient', isCorrect: true, explanation: 'Correct! SuiClient for blockchain, SealClient for encryption, WalrusClient for file storage.' },
      { id: 'opt2', text: 'HttpClient, WebSocket, and Database', isCorrect: false, explanation: 'Incorrect. These are generic web technologies, not Sui-specific clients.' },
      { id: 'opt3', text: 'SuiClient, FirebaseClient, and S3Client', isCorrect: false, explanation: 'Incorrect. The SDK uses decentralized alternatives, not Firebase or AWS.' },
      { id: 'opt4', text: 'Only SuiClient is needed', isCorrect: false, explanation: 'Incorrect. While SuiClient is required, Seal and Walrus add encryption and storage.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 2: Setting Up the Messaging Client ---
  {
    id: 'mc-msg-006',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'sdk_integration',
    title: 'Required vs Optional Configuration',
    description: 'Understanding which client configurations are required.',
    learningObjective: 'Know which parameters are mandatory when creating a MessagingClient.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'You always need to talk to the blockchain.',
      'Encryption and storage are optional features.',
      'A signer is needed to send transactions.'
    ],
    explanation: 'SuiClient is always required since all operations go through the Sui blockchain. SealClient (encryption) and WalrusClient (storage) are optional but needed for their respective features.',
    question: 'Which configuration is REQUIRED to create a MessagingClient?',
    options: [
      { id: 'opt1', text: 'suiClient is always required', isCorrect: true, explanation: 'Correct! The SuiClient is mandatory since all messaging operations use the Sui blockchain.' },
      { id: 'opt2', text: 'All three clients (Sui, Seal, Walrus) are required', isCorrect: false, explanation: 'Incorrect. SealClient and WalrusClient are optional add-ons.' },
      { id: 'opt3', text: 'Only a signer wallet is required', isCorrect: false, explanation: 'Incorrect. A signer is needed for transactions, but SuiClient is the core requirement.' },
      { id: 'opt4', text: 'No configuration is required', isCorrect: false, explanation: 'Incorrect. At minimum, you need a SuiClient to interact with Sui.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 3: Channels ---
  {
    id: 'mc-msg-009',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Channel Lifecycle States',
    description: 'Understanding channel states and transitions.',
    learningObjective: 'Learn about channel lifecycle and what archiving means.',
    estimatedTime: 3,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Channels can be active or archived.',
      'Archiving is not the same as deleting.',
      'On-chain data is permanent.'
    ],
    explanation: 'Channels have two states: active (can send/receive messages) and archived (read-only). Archiving preserves message history but prevents new messages. On-chain data cannot be truly deleted.',
    question: 'What happens when you archive a channel?',
    options: [
      { id: 'opt1', text: 'The channel becomes read-only - existing messages are preserved but no new messages can be sent', isCorrect: true, explanation: 'Correct! Archiving makes the channel read-only while preserving history.' },
      { id: 'opt2', text: 'All messages are permanently deleted', isCorrect: false, explanation: 'Incorrect. On-chain data is permanent - archiving preserves everything.' },
      { id: 'opt3', text: 'The channel is hidden but still active', isCorrect: false, explanation: 'Incorrect. Archiving changes the state, not just visibility.' },
      { id: 'opt4', text: 'Members are automatically removed', isCorrect: false, explanation: 'Incorrect. Members remain; they just cannot send new messages.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 5: Encryption ---
  {
    id: 'mc-msg-013',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'encryption',
    title: 'Threshold Encryption Basics',
    description: 'Understanding how Seal threshold encryption works.',
    learningObjective: 'Learn the fundamentals of threshold encryption in the Sui ecosystem.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Threshold means a minimum number of participants needed.',
      't-of-n means t out of n parties must cooperate.',
      'No single party can decrypt alone.'
    ],
    explanation: 'Seal uses threshold encryption where messages are encrypted so that a minimum number (t) of designated servers (n) must cooperate to decrypt. This prevents any single point of failure in decryption.',
    question: 'What does "threshold encryption" mean in the context of Sui Seal?',
    options: [
      { id: 'opt1', text: 'A minimum number of servers must cooperate to decrypt a message', isCorrect: true, explanation: 'Correct! Threshold (t-of-n) means at least t out of n servers must participate in decryption.' },
      { id: 'opt2', text: 'Messages are encrypted only above a certain size threshold', isCorrect: false, explanation: 'Incorrect. Threshold refers to the number of decryption participants, not message size.' },
      { id: 'opt3', text: 'Encryption strength increases with message length', isCorrect: false, explanation: 'Incorrect. Encryption strength is independent of message length.' },
      { id: 'opt4', text: 'Only one key is needed to decrypt all messages', isCorrect: false, explanation: 'Incorrect. The whole point is that multiple parties must cooperate - no single key works alone.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 6: Walrus ---
  {
    id: 'mc-msg-016',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Walrus Decentralized Storage',
    description: 'Understanding how Walrus stores file attachments.',
    learningObjective: 'Learn how Walrus blob storage works and how it integrates with messaging.',
    estimatedTime: 4,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'Walrus uses content-addressable storage.',
      'Files are referenced by their blob ID.',
      'The blob ID is stored on-chain, the file data is stored off-chain.'
    ],
    explanation: 'Walrus stores files as blobs, each identified by a unique blobId derived from the content. The blobId is stored on-chain with the message, while the actual file data is stored on the Walrus network. This keeps on-chain costs low while enabling large file attachments.',
    question: 'How does Walrus handle file attachments in messaging?',
    options: [
      { id: 'opt1', text: 'File data is stored on Walrus, and only the blobId reference is stored on-chain', isCorrect: true, explanation: 'Correct! This hybrid approach keeps blockchain costs low while enabling large attachments.' },
      { id: 'opt2', text: 'Entire files are stored directly on the Sui blockchain', isCorrect: false, explanation: 'Incorrect. Storing large files on-chain would be prohibitively expensive.' },
      { id: 'opt3', text: 'Files are compressed and stored in the message content field', isCorrect: false, explanation: 'Incorrect. Message content fields are for text; files go through Walrus.' },
      { id: 'opt4', text: 'Files are converted to text and embedded in transactions', isCorrect: false, explanation: 'Incorrect. Binary files cannot be efficiently stored as text in transactions.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 7: React ---
  {
    id: 'mc-msg-021',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'react_patterns',
    title: 'React State Management for Chat',
    description: 'Understanding state management patterns for real-time chat.',
    learningObjective: 'Learn best practices for managing chat state in React.',
    estimatedTime: 4,
    baseXP: 65,
    perfectScoreXP: 25,
    hints: [
      'Polling needs cleanup to avoid memory leaks.',
      'useEffect cleanup runs when component unmounts.',
      'Optimistic updates show messages before confirmation.'
    ],
    explanation: 'Chat state management requires: (1) useEffect with setInterval for polling, with proper cleanup via clearInterval. (2) Optimistic updates to show sent messages immediately before blockchain confirmation. (3) Context provider to share the client across components.',
    question: 'Why is useEffect cleanup important when polling for messages?',
    options: [
      { id: 'opt1', text: 'To clear the polling interval and prevent memory leaks when the component unmounts', isCorrect: true, explanation: 'Correct! Without cleanup, intervals continue running after unmount, causing memory leaks and errors.' },
      { id: 'opt2', text: 'To save the messages to local storage', isCorrect: false, explanation: 'Incorrect. Cleanup is about stopping intervals, not persisting data.' },
      { id: 'opt3', text: 'To encrypt messages before sending', isCorrect: false, explanation: 'Incorrect. Encryption is handled by the SDK, not useEffect cleanup.' },
      { id: 'opt4', text: 'Cleanup is optional and only for performance', isCorrect: false, explanation: 'Incorrect. Cleanup is essential - without it you get memory leaks and updates to unmounted components.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // --- Lesson 8: Production ---
  {
    id: 'mc-msg-023',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Multi-RPC Failover Pattern',
    description: 'Understanding production RPC configuration.',
    learningObjective: 'Learn why and how to implement multi-RPC failover.',
    estimatedTime: 4,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'Single RPC means single point of failure.',
      'Multiple RPC endpoints provide redundancy.',
      'Failover means automatically switching on failure.'
    ],
    explanation: 'In production, relying on a single RPC endpoint creates a single point of failure. Multi-RPC failover maintains a list of endpoints and automatically switches to the next one if the primary fails. This ensures high availability.',
    question: 'Why should production apps use multiple RPC endpoints?',
    options: [
      { id: 'opt1', text: 'To provide redundancy - if one endpoint fails, the app automatically switches to another', isCorrect: true, explanation: 'Correct! Multi-RPC failover ensures your app stays online even if an RPC provider has issues.' },
      { id: 'opt2', text: 'To make transactions faster by sending to all endpoints simultaneously', isCorrect: false, explanation: 'Incorrect. Failover is about reliability, not parallel sending.' },
      { id: 'opt3', text: 'To reduce gas costs by choosing the cheapest endpoint', isCorrect: false, explanation: 'Incorrect. Gas costs are determined by the network, not the RPC endpoint.' },
      { id: 'opt4', text: 'Multiple endpoints are required by the Sui protocol', isCorrect: false, explanation: 'Incorrect. The protocol works with one endpoint; multiple is a reliability best practice.' }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  }
];

const msgCodeCompletionExercises: CodeCompletionExercise[] = [
  // --- Lesson 1 ---
  {
    id: 'cc-msg-002',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'messaging',
    title: 'Import the Messaging SDK',
    description: 'Fill in the blanks to correctly import the messaging SDK components.',
    learningObjective: 'Learn the correct import statements for the @mysten/messaging SDK.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'The main class is MessagingClient.',
      'SuiClient comes from @mysten/sui/client.',
      'Import statements use curly braces for named exports.'
    ],
    explanation: 'The @mysten/messaging SDK exports MessagingClient as its main class. You also need SuiClient from @mysten/sui/client to interact with the Sui blockchain.',
    codeTemplate: `import { {blank:client1} } from '@mysten/messaging';
import { {blank:client2}, getFullnodeUrl } from '{blank:module}';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
const messagingClient = new MessagingClient({ suiClient });`,
    blanks: [
      { id: 'client1', placeholder: '___', correctAnswer: 'MessagingClient', hint: 'The main messaging class name.' },
      { id: 'client2', placeholder: '___', correctAnswer: 'SuiClient', hint: 'The Sui blockchain client class.' },
      { id: 'module', placeholder: '___', correctAnswer: '@mysten/sui/client', hint: 'The npm package for Sui client.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 2 ---
  {
    id: 'cc-msg-004',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'sdk_integration',
    title: 'Configure SuiClient',
    description: 'Fill in the blanks to properly configure a SuiClient for testnet.',
    learningObjective: 'Learn how to create and configure a SuiClient instance.',
    estimatedTime: 3,
    baseXP: 45,
    perfectScoreXP: 18,
    hints: [
      'getFullnodeUrl converts a network name to a URL.',
      'Common networks: testnet, mainnet, devnet.',
      'SuiClient takes an object with a url property.'
    ],
    explanation: 'SuiClient is configured with a URL pointing to a Sui fullnode. The getFullnodeUrl helper converts network names like "testnet" to the correct URL.',
    codeTemplate: `import { SuiClient, {blank:helper} } from '@mysten/sui/client';

const suiClient = new {blank:class}({
  url: getFullnodeUrl('{blank:network}')
});`,
    blanks: [
      { id: 'helper', placeholder: '___', correctAnswer: 'getFullnodeUrl', hint: 'Helper function that returns the URL for a network.' },
      { id: 'class', placeholder: '___', correctAnswer: 'SuiClient', hint: 'The class to instantiate.' },
      { id: 'network', placeholder: '___', correctAnswer: 'testnet', acceptableAnswers: ['mainnet', 'devnet'], hint: 'Which Sui network to connect to.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 3 ---
  {
    id: 'cc-msg-007',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Create a Messaging Channel',
    description: 'Fill in the blanks to create a new messaging channel.',
    learningObjective: 'Learn how to use createChannel with proper options.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'createChannel is an async method.',
      'Channel options include name, description, members, encrypted.',
      'Use await for async operations.'
    ],
    explanation: 'createChannel creates a new messaging channel on Sui. It accepts a channel name and options object. The encrypted option enables Seal encryption for the channel.',
    codeTemplate: `const channel = {blank:await_kw} client.{blank:method}('team-chat', {
  description: 'Team discussion channel',
  members: [member1Address, member2Address],
  {blank:option}: true
});

console.log('Channel created:', channel.id);`,
    blanks: [
      { id: 'await_kw', placeholder: '___', correctAnswer: 'await', hint: 'Keyword for async operations.' },
      { id: 'method', placeholder: '___', correctAnswer: 'createChannel', hint: 'Method to create a new channel.' },
      { id: 'option', placeholder: '___', correctAnswer: 'encrypted', hint: 'Option to enable encryption.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 4 ---
  {
    id: 'cc-msg-010',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Send a Message',
    description: 'Fill in the blanks to send a message to a channel.',
    learningObjective: 'Learn the sendMessage API and its parameters.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'sendMessage takes a channel ID and content.',
      'It returns a Message object.',
      'The method is async.'
    ],
    explanation: 'sendMessage sends a text message to a specified channel. It takes the channel ID and message content string, with optional SendOptions for attachments.',
    codeTemplate: `async function sendChatMessage(
  client: MessagingClient,
  channelId: string,
  text: string
) {
  const message = {blank:await_kw} client.{blank:method}(channelId, {blank:content});
  console.log('Sent message:', message.id);
  return message;
}`,
    blanks: [
      { id: 'await_kw', placeholder: '___', correctAnswer: 'await', hint: 'Keyword for async operations.' },
      { id: 'method', placeholder: '___', correctAnswer: 'sendMessage', hint: 'Method to send a message.' },
      { id: 'content', placeholder: '___', correctAnswer: 'text', hint: 'The message content parameter.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 5 ---
  {
    id: 'cc-msg-014',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'encryption',
    title: 'Configure Seal Encryption',
    description: 'Fill in the blanks to set up SealClient for encrypted messaging.',
    learningObjective: 'Learn how to configure SealClient with the messaging SDK.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'SealClient is imported from @mysten/seal.',
      'It requires a suiClient instance.',
      'Server object IDs define the threshold encryption servers.'
    ],
    explanation: 'SealClient handles threshold encryption for the messaging SDK. It needs a SuiClient for blockchain interaction and server object IDs that define which Seal servers participate in encryption/decryption.',
    codeTemplate: `import { {blank:class} } from '@mysten/seal';

const sealClient = new SealClient({
  {blank:prop}: suiClient,
  serverObjectIds: [SERVER_ID_1, SERVER_ID_2, SERVER_ID_3]
});

const client = new MessagingClient({
  suiClient,
  {blank:config}: sealClient
});`,
    blanks: [
      { id: 'class', placeholder: '___', correctAnswer: 'SealClient', hint: 'The encryption client class.' },
      { id: 'prop', placeholder: '___', correctAnswer: 'suiClient', hint: 'SealClient needs blockchain access.' },
      { id: 'config', placeholder: '___', correctAnswer: 'sealClient', hint: 'Property name in MessagingClient config.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 6 ---
  {
    id: 'cc-msg-017',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Upload an Attachment',
    description: 'Fill in the blanks to upload a file to Walrus.',
    learningObjective: 'Learn how to upload files using WalrusClient.',
    estimatedTime: 5,
    baseXP: 65,
    perfectScoreXP: 25,
    hints: [
      'WalrusClient has an upload method.',
      'Upload returns an object with a blobId.',
      'You can specify content type in options.'
    ],
    explanation: 'WalrusClient.upload() takes binary data (Uint8Array or Blob) and returns a response with a blobId. This blobId is then attached to messages as a reference to the stored file.',
    codeTemplate: `async function uploadAttachment(walrus: WalrusClient, file: File) {
  const data = new Uint8Array(await file.arrayBuffer());

  const result = await walrus.{blank:method}(data, {
    {blank:option}: file.type
  });

  return {
    {blank:id_field}: result.blobId,
    filename: file.name,
    mimeType: file.type,
    size: file.size
  };
}`,
    blanks: [
      { id: 'method', placeholder: '___', correctAnswer: 'upload', hint: 'Method to store data on Walrus.' },
      { id: 'option', placeholder: '___', correctAnswer: 'contentType', hint: 'Option for the MIME type.' },
      { id: 'id_field', placeholder: '___', correctAnswer: 'blobId', hint: 'The unique identifier for the stored blob.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 7 ---
  {
    id: 'cc-msg-019',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'react_patterns',
    title: 'Create a Chat Context Provider',
    description: 'Fill in the blanks to create a React context for messaging.',
    learningObjective: 'Learn the React context provider pattern for the messaging SDK.',
    estimatedTime: 5,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'createContext creates a React context.',
      'useContext consumes the context value.',
      'The provider wraps child components.'
    ],
    explanation: 'The React Context pattern allows you to share the MessagingClient instance across all components without prop drilling. Create a context, wrap your app in a Provider, and consume with useContext.',
    codeTemplate: `import { {blank:hook1}, useContext, ReactNode } from 'react';
import { MessagingClient } from '@mysten/messaging';

const ChatContext = {blank:create}<MessagingClient | null>(null);

export function ChatProvider({ client, children }: { client: MessagingClient; children: ReactNode }) {
  return (
    <ChatContext.Provider value={client}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const client = {blank:consume}(ChatContext);
  if (!client) throw new Error('useChat must be used within ChatProvider');
  return client;
}`,
    blanks: [
      { id: 'hook1', placeholder: '___', correctAnswer: 'createContext', hint: 'Function to create a React context.' },
      { id: 'create', placeholder: '___', correctAnswer: 'createContext', hint: 'Call this to create the context object.' },
      { id: 'consume', placeholder: '___', correctAnswer: 'useContext', hint: 'Hook to read the context value.' }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript'
  },

  // --- Lesson 8 ---
  {
    id: 'cc-msg-022',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Production Multi-RPC Config',
    description: 'Fill in the blanks to configure multi-RPC failover.',
    learningObjective: 'Learn how to set up production-grade RPC configuration.',
    estimatedTime: 5,
    baseXP: 75,
    perfectScoreXP: 30,
    hints: [
      'Try the primary endpoint first.',
      'If it fails, move to the next endpoint.',
      'Use try/catch for error handling.'
    ],
    explanation: 'Multi-RPC failover tries endpoints in order. If the primary fails (network error, timeout), it automatically switches to the next. This ensures high availability in production.',
    codeTemplate: `const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_PRIMARY_RPC!,
  process.env.NEXT_PUBLIC_BACKUP_RPC!,
  'https://fullnode.{blank:network}.sui.io:443'
];

async function createResilientClient(): Promise<SuiClient> {
  for (const url of RPC_ENDPOINTS) {
    {blank:try_kw} {
      const client = new SuiClient({ url });
      await client.getLatestCheckpointSequenceNumber();
      return client;
    } {blank:catch_kw} {
      console.warn('RPC endpoint failed:', url);
    }
  }
  throw new Error('All RPC endpoints failed');
}`,
    blanks: [
      { id: 'network', placeholder: '___', correctAnswer: 'mainnet', hint: 'Production network name.' },
      { id: 'try_kw', placeholder: '___', correctAnswer: 'try', hint: 'Start of error handling block.' },
      { id: 'catch_kw', placeholder: '___', correctAnswer: 'catch', acceptableAnswers: ['catch (e)', 'catch (err)', 'catch (error)'], hint: 'Handle the error if the endpoint fails.' }
    ],
    strictMode: false,
    caseSensitive: false,
    language: 'typescript'
  }
];

const msgBugFixExercises: BugFixExercise[] = [
  // --- Lesson 3 ---
  {
    id: 'bf-msg-008',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Fix Member Management',
    description: 'This channel member management code has bugs. Find and fix them.',
    learningObjective: 'Understand correct usage of addMembers and removeMembers APIs.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'addMembers expects an array, not a single string.',
      'Check if the method names match the SDK API.',
      'Async operations need await.'
    ],
    explanation: 'addMembers and removeMembers both accept arrays of addresses, not single strings. All SDK operations are async and require await.',
    buggyCode: `async function manageMembers(client: MessagingClient, channelId: string) {
  // Bug 1: addMembers expects an array
  await client.addMembers(channelId, newMemberAddress);

  // Bug 2: missing await
  client.removeMembers(channelId, [oldMemberAddress]);
}`,
    correctCode: `async function manageMembers(client: MessagingClient, channelId: string) {
  // Fixed: wrap address in array
  await client.addMembers(channelId, [newMemberAddress]);

  // Fixed: added await
  await client.removeMembers(channelId, [oldMemberAddress]);
}`,
    bugs: [
      { lineNumber: 3, bugType: 'type', description: 'addMembers expects an array of addresses, not a single string.', hint: 'Wrap the address in square brackets: [newMemberAddress]' },
      { lineNumber: 6, bugType: 'logic', description: 'Missing await on async operation.', hint: 'Add "await" before client.removeMembers()' }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'typescript'
  },

  // --- Lesson 4 ---
  {
    id: 'bf-msg-011',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Fix Message Polling',
    description: 'This message polling implementation has bugs that cause missed messages.',
    learningObjective: 'Implement correct cursor-based polling for messages.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'The cursor should be updated after each poll.',
      'getMessages returns newest messages; use cursor for pagination.',
      'Check the order of operations.'
    ],
    explanation: 'When polling for messages, you must update the cursor after each successful poll to avoid fetching the same messages repeatedly. The cursor should be set to the last message ID received.',
    buggyCode: `let cursor: string | undefined;

async function pollMessages(client: MessagingClient, channelId: string) {
  const messages = await client.getMessages(channelId, {
    limit: 50,
    cursor: cursor
  });

  // Bug: cursor never updated - will fetch same messages every time
  for (const msg of messages) {
    displayMessage(msg);
  }
}`,
    correctCode: `let cursor: string | undefined;

async function pollMessages(client: MessagingClient, channelId: string) {
  const messages = await client.getMessages(channelId, {
    limit: 50,
    cursor: cursor
  });

  for (const msg of messages) {
    displayMessage(msg);
  }

  // Update cursor to last message ID for next poll
  if (messages.length > 0) {
    cursor = messages[messages.length - 1].id;
  }
}`,
    bugs: [
      { lineNumber: 10, bugType: 'logic', description: 'Cursor is never updated after fetching messages.', hint: 'After the loop, set cursor to the last message ID: cursor = messages[messages.length - 1].id' }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'typescript'
  },

  // --- Lesson 5 ---
  {
    id: 'bf-msg-015',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'encryption',
    title: 'Fix Key Rotation',
    description: 'This key rotation implementation has errors.',
    learningObjective: 'Understand correct key rotation patterns.',
    estimatedTime: 5,
    baseXP: 65,
    perfectScoreXP: 25,
    hints: [
      'rotateKeys is a method on the messaging client.',
      'Key rotation should happen on a schedule or trigger.',
      'The method is async.'
    ],
    explanation: 'Key rotation requires calling rotateKeys on the MessagingClient (not SealClient directly). It should be wrapped in error handling since it involves multiple blockchain transactions.',
    buggyCode: `async function rotateChannelKeys(sealClient: SealClient, channelId: string) {
  // Bug: rotateKeys is on MessagingClient, not SealClient
  await sealClient.rotateKeys(channelId);
  console.log('Keys rotated');
}`,
    correctCode: `async function rotateChannelKeys(client: MessagingClient, channelId: string) {
  // Fixed: use MessagingClient for key rotation
  await client.rotateKeys(channelId);
  console.log('Keys rotated');
}`,
    bugs: [
      { lineNumber: 1, bugType: 'logic', description: 'rotateKeys is a method on MessagingClient, not SealClient.', hint: 'Change the parameter type and variable to use MessagingClient instead of SealClient.' }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'typescript'
  },

  // --- Lesson 6 ---
  {
    id: 'bf-msg-018',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Fix Attachment Download',
    description: 'This attachment download function has type and logic errors.',
    learningObjective: 'Correctly download and reconstruct files from Walrus.',
    estimatedTime: 5,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'download returns Uint8Array, not a string.',
      'Blob constructor takes an array of data chunks.',
      'Check the MIME type usage.'
    ],
    explanation: 'WalrusClient.download() returns Uint8Array data. To create a downloadable file, wrap it in a Blob with the correct MIME type, then create an object URL.',
    buggyCode: `async function downloadAttachment(walrus: WalrusClient, attachment: Attachment) {
  // Bug 1: download returns Uint8Array, treating as string
  const data: string = await walrus.download(attachment.blobId);

  // Bug 2: Blob needs array wrapper
  const blob = new Blob(data, { type: attachment.mimeType });
  return URL.createObjectURL(blob);
}`,
    correctCode: `async function downloadAttachment(walrus: WalrusClient, attachment: Attachment) {
  // Fixed: correct type for download result
  const data: Uint8Array = await walrus.download(attachment.blobId);

  // Fixed: wrap data in array for Blob constructor
  const blob = new Blob([data], { type: attachment.mimeType });
  return URL.createObjectURL(blob);
}`,
    bugs: [
      { lineNumber: 3, bugType: 'type', description: 'download() returns Uint8Array, not string.', hint: 'Change the type annotation from string to Uint8Array.' },
      { lineNumber: 6, bugType: 'syntax', description: 'Blob constructor requires data wrapped in an array.', hint: 'Change `new Blob(data, ...)` to `new Blob([data], ...)`.' }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'typescript'
  },

  // --- Lesson 7 ---
  {
    id: 'bf-msg-020',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'react_patterns',
    title: 'Fix Chat Component Cleanup',
    description: 'This React chat component has a memory leak due to missing cleanup.',
    learningObjective: 'Learn proper useEffect cleanup for polling intervals.',
    estimatedTime: 5,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'setInterval returns an ID that should be cleared.',
      'useEffect cleanup function runs on unmount.',
      'Return a cleanup function from useEffect.'
    ],
    explanation: 'When using setInterval inside useEffect, you must return a cleanup function that calls clearInterval. Without this, the interval continues running after the component unmounts, causing memory leaks and errors.',
    buggyCode: `function ChatWindow({ channelId }: { channelId: string }) {
  const client = useChat();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newMessages = await client.getMessages(channelId);
      setMessages(newMessages);
    }, 3000);
    // Bug: no cleanup - interval runs forever after unmount
  }, [channelId, client]);

  return <div>{messages.map(m => <p key={m.id}>{m.content}</p>)}</div>;
}`,
    correctCode: `function ChatWindow({ channelId }: { channelId: string }) {
  const client = useChat();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newMessages = await client.getMessages(channelId);
      setMessages(newMessages);
    }, 3000);

    return () => clearInterval(interval);
  }, [channelId, client]);

  return <div>{messages.map(m => <p key={m.id}>{m.content}</p>)}</div>;
}`,
    bugs: [
      { lineNumber: 10, bugType: 'logic', description: 'Missing useEffect cleanup - interval is never cleared.', hint: 'Return a cleanup function: return () => clearInterval(interval);' }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'typescript'
  },

  // --- Lesson 8 ---
  {
    id: 'bf-msg-024',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'sdk_integration',
    title: 'Fix Error Recovery Pattern',
    description: 'This error recovery implementation has issues.',
    learningObjective: 'Implement robust error recovery for production messaging.',
    estimatedTime: 5,
    baseXP: 75,
    perfectScoreXP: 30,
    hints: [
      'Retries should have a maximum limit.',
      'Exponential backoff prevents hammering the server.',
      'Check the delay calculation.'
    ],
    explanation: 'Production error recovery needs: (1) A maximum retry count to prevent infinite loops. (2) Exponential backoff (delay doubles each retry) to avoid overwhelming servers. (3) Proper error propagation after retries are exhausted.',
    buggyCode: `async function sendWithRetry(client: MessagingClient, channelId: string, content: string) {
  let retries = 0;

  while (true) {
    try {
      return await client.sendMessage(channelId, content);
    } catch (error) {
      retries++;
      // Bug: no max retries - infinite loop on persistent errors
      // Bug: constant delay instead of exponential backoff
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}`,
    correctCode: `async function sendWithRetry(client: MessagingClient, channelId: string, content: string) {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      return await client.sendMessage(channelId, content);
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
    }
  }
  throw new Error('Max retries exceeded');
}`,
    bugs: [
      { lineNumber: 4, bugType: 'logic', description: 'No maximum retry limit - could loop infinitely.', hint: 'Change while(true) to while(retries < MAX_RETRIES) and define MAX_RETRIES.' },
      { lineNumber: 11, bugType: 'logic', description: 'Constant 1s delay instead of exponential backoff.', hint: 'Use exponential backoff: 1000 * Math.pow(2, retries - 1)' }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'typescript'
  }
];

const msgOutputPredictionExercises: OutputPredictionExercise[] = [
  // --- Lesson 2 ---
  {
    id: 'op-msg-005',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'sdk_integration',
    title: 'Client Configuration Result',
    description: 'Predict the output of this client configuration check.',
    learningObjective: 'Understand how MessagingClient reports its configuration.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Check which clients are provided in the config.',
      'SealClient is not provided, so encryption is unavailable.',
      'Boolean checks: !!value converts to true/false.'
    ],
    explanation: 'When creating a MessagingClient, only SuiClient is required. The !! operator converts a value to boolean - undefined becomes false, an object becomes true.',
    code: `const client = new MessagingClient({
  suiClient: new SuiClient({ url: 'https://...' }),
  // sealClient not provided
  // walrusClient not provided
});

console.log('Has encryption:', !!client.sealClient);
console.log('Has storage:', !!client.walrusClient);`,
    language: 'typescript',
    correctOutput: 'false, false',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['true, true', 'false, false', 'true, false', 'Error: missing required config'],
    showLineNumbers: true,
    executionSteps: [
      { step: 1, description: 'Create MessagingClient with only suiClient', variables: {} },
      { step: 2, description: 'Check sealClient: undefined → !!undefined = false', variables: { 'Has encryption': false } },
      { step: 3, description: 'Check walrusClient: undefined → !!undefined = false', variables: { 'Has storage': false } }
    ]
  },

  // --- Lesson 4 ---
  {
    id: 'op-msg-012',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'messaging',
    title: 'Message Polling Output',
    description: 'Predict the console output of this polling pattern.',
    learningObjective: 'Understand how cursor-based pagination works.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'First poll has no cursor, gets all messages.',
      'Second poll uses cursor from last message.',
      'Only new messages after cursor are returned.'
    ],
    explanation: 'Cursor-based polling fetches messages after the given cursor position. The first call (no cursor) returns all messages. Subsequent calls with the last message ID as cursor return only newer messages.',
    code: `// First poll: no cursor, gets 3 messages
const batch1 = await client.getMessages(channelId, { cursor: undefined });
console.log('Batch 1:', batch1.length);

// Second poll: cursor = last message, gets 1 new message
const batch2 = await client.getMessages(channelId, { cursor: batch1[2].id });
console.log('Batch 2:', batch2.length);`,
    language: 'typescript',
    correctOutput: '3, 1',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['3, 3', '3, 1', '3, 0', '0, 3'],
    showLineNumbers: true,
    executionSteps: [
      { step: 1, description: 'First poll without cursor: returns all 3 existing messages', variables: { 'Batch 1': 3 } },
      { step: 2, description: 'Second poll with cursor at msg 3: returns only 1 new message', variables: { 'Batch 2': 1 } }
    ]
  }
];

// Add messaging exercises to main arrays
codeCompletionExercises.push(...msgCodeCompletionExercises);
bugFixExercises.push(...msgBugFixExercises);
multipleChoiceExercises.push(...msgMultipleChoiceExercises);
outputPredictionExercises.push(...msgOutputPredictionExercises);

// ============================================================================
// MOVE LANGUAGE EXERCISES (21 exercises across 7 lessons)
// ============================================================================

// --- Lesson 1: Hello Move (modules) ---
// --- Lesson 2: Mastering Move Types (primitives) ---
// --- Lesson 3: Control Flow & Logic (control_flow) ---
// --- Lesson 4: Structs & Objects (structs) ---
// --- Lesson 5: Collections & Dynamic Fields (vectors) ---
// --- Lesson 6: Ownership & Transfer (transfer) ---
// --- Lesson 7: Advanced Generics & Patterns (generics) ---

const moveCodeCompletionExercises: CodeCompletionExercise[] = [
  // Lesson 1: Hello Move - Complete a basic Move module declaration
  {
    id: 'cc-move-001',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'modules',
    title: 'Your First Move Module',
    description: 'Fill in the blanks to declare a basic Move module with a public function.',
    learningObjective: 'Learn the fundamental syntax for declaring a Move module and defining a public function inside it.',
    estimatedTime: 3,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'Modules are declared with the "module" keyword followed by package::name.',
      'Functions use the "fun" keyword.',
      'Use "public" to make a function accessible outside the module.'
    ],
    explanation: 'A Move module is the basic unit of code organization. It is declared with "module package_name::module_name { ... }". Functions inside modules use the "fun" keyword, and adding "public" makes them callable from other modules.',
    codeTemplate: `{blank:module_keyword} hello::greeting {
    {blank:visibility} fun say_hello(): vector<u8> {
        b"Hello, Move!"
    }
}`,
    blanks: [
      {
        id: 'module_keyword',
        placeholder: '___',
        correctAnswer: 'module',
        hint: 'What keyword starts a module declaration?'
      },
      {
        id: 'visibility',
        placeholder: '___',
        correctAnswer: 'public',
        hint: 'What keyword makes a function accessible from outside the module?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 2: Mastering Move Types - Fill in correct types for variables
  {
    id: 'cc-move-004',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Declaring Typed Variables',
    description: 'Fill in the blanks to correctly declare variables with appropriate Move types.',
    learningObjective: 'Learn to choose correct integer types, booleans, and addresses in Move.',
    estimatedTime: 4,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Booleans in Move are declared with the "bool" type.',
      'For large numbers, use u64 or u128.',
      'Addresses represent on-chain account identifiers.'
    ],
    explanation: 'Move is a strongly-typed language. Every variable must have a type declared at compile time. Common types include u8, u64, u128 for unsigned integers, bool for booleans, and address for on-chain identifiers.',
    codeTemplate: `module lesson2::types_demo {
    fun declare_variables() {
        let is_active: {blank:bool_type} = true;
        let balance: {blank:int_type} = 1_000_000;
        let owner: {blank:addr_type} = @0x1;
    }
}`,
    blanks: [
      {
        id: 'bool_type',
        placeholder: '___',
        correctAnswer: 'bool',
        hint: 'What type represents true or false?'
      },
      {
        id: 'int_type',
        placeholder: '___',
        correctAnswer: 'u64',
        acceptableAnswers: ['u128', 'u256'],
        hint: 'What unsigned integer type can hold 1,000,000?'
      },
      {
        id: 'addr_type',
        placeholder: '___',
        correctAnswer: 'address',
        hint: 'What type represents a blockchain account?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 3: Control Flow & Logic - Complete a while loop
  {
    id: 'cc-move-007',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'Complete the While Loop',
    description: 'Fill in the blanks to write a while loop that sums numbers from 1 to n.',
    learningObjective: 'Learn how to write while loops with proper conditions and mutations in Move.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'While loops run as long as their condition is true.',
      'You need "let mut" to declare a variable you will change.',
      'Increment the counter inside the loop body.'
    ],
    explanation: 'While loops in Move repeat a block of code as long as the condition evaluates to true. Use "let mut" to declare mutable variables that change during iteration, and make sure to update the loop counter to avoid infinite loops.',
    codeTemplate: `module lesson3::loops {
    fun sum_to_n(n: u64): u64 {
        let mut total = 0;
        let mut i = 1;
        {blank:loop_keyword} (i <= n) {
            total = total + i;
            i = i + {blank:increment};
        };
        {blank:return_val}
    }
}`,
    blanks: [
      {
        id: 'loop_keyword',
        placeholder: '___',
        correctAnswer: 'while',
        hint: 'Which keyword creates a loop that runs while a condition is true?'
      },
      {
        id: 'increment',
        placeholder: '___',
        correctAnswer: '1',
        hint: 'How much should i increase by each iteration?'
      },
      {
        id: 'return_val',
        placeholder: '___',
        correctAnswer: 'total',
        hint: 'What value should the function return? (no semicolon needed)'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 4: Structs & Objects - Define a Sui object struct with abilities
  {
    id: 'cc-move-010',
    type: 'code_completion',
    difficulty: 'beginner',
    topic: 'structs',
    title: 'Define a Sui Object Struct',
    description: 'Fill in the blanks to define a Sui object struct with the correct abilities and UID field.',
    learningObjective: 'Learn how to define a Sui object with the key ability and UID field.',
    estimatedTime: 5,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Sui objects must have the "key" ability.',
      'The first field of a Sui object must be "id" of type UID.',
      'Use "has" before listing abilities.'
    ],
    explanation: 'In Sui Move, objects are structs with the "key" ability and a mandatory first field "id: UID". The UID uniquely identifies each object on the blockchain. Adding "store" allows the object to be transferred and stored inside other objects.',
    codeTemplate: `module lesson4::nft {
    use sui::object::UID;

    public struct GameItem has {blank:ability1}, {blank:ability2} {
        {blank:id_field}: UID,
        name: vector<u8>,
        power: u64
    }
}`,
    blanks: [
      {
        id: 'ability1',
        placeholder: '___',
        correctAnswer: 'key',
        hint: 'What ability makes a struct a Sui object?'
      },
      {
        id: 'ability2',
        placeholder: '___',
        correctAnswer: 'store',
        hint: 'What ability allows a struct to be stored inside other objects?'
      },
      {
        id: 'id_field',
        placeholder: '___',
        correctAnswer: 'id',
        hint: 'What is the mandatory first field name for Sui objects?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 5: Collections & Dynamic Fields - Vector operations
  {
    id: 'cc-move-013',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'vectors',
    title: 'Vector Filtering with While Loop',
    description: 'Fill in the blanks to filter even numbers from a vector into a new vector.',
    learningObjective: 'Learn to combine vector operations with control flow to filter elements.',
    estimatedTime: 5,
    baseXP: 55,
    perfectScoreXP: 25,
    hints: [
      'Use vector::length to get the size of the input vector.',
      'Use vector::borrow to read an element without removing it.',
      'The modulo operator % checks divisibility: x % 2 == 0 means x is even.'
    ],
    explanation: 'Filtering a vector in Move requires iterating with an index, checking each element with vector::borrow, and conditionally adding it to a result vector with vector::push_back. The dereference operator * converts a reference to a value.',
    codeTemplate: `use std::vector;

fun filter_even(input: &vector<u64>): vector<u64> {
    let mut result = vector::empty<u64>();
    let mut i = 0;
    let len = vector::{blank:len_func}(input);
    while (i < len) {
        let val = *vector::{blank:access_func}(input, i);
        if (val % 2 == {blank:even_check}) {
            vector::push_back(&mut result, val);
        };
        i = i + 1;
    };
    result
}`,
    blanks: [
      {
        id: 'len_func',
        placeholder: '___',
        correctAnswer: 'length',
        hint: 'Which function returns the number of elements in a vector?'
      },
      {
        id: 'access_func',
        placeholder: '___',
        correctAnswer: 'borrow',
        hint: 'Which function returns a reference to an element at an index?'
      },
      {
        id: 'even_check',
        placeholder: '___',
        correctAnswer: '0',
        hint: 'What remainder means a number is evenly divisible by 2?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 6: Ownership & Transfer - Complete transfer patterns
  {
    id: 'cc-move-016',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'transfer',
    title: 'Object Transfer Patterns',
    description: 'Fill in the blanks to correctly transfer and share Sui objects.',
    learningObjective: 'Learn the difference between transfer::transfer (owned), transfer::share_object (shared), and transfer::freeze_object (immutable).',
    estimatedTime: 5,
    baseXP: 55,
    perfectScoreXP: 25,
    hints: [
      'transfer::transfer sends an object to a specific owner address.',
      'transfer::share_object makes an object accessible to everyone.',
      'transfer::freeze_object makes an object permanently immutable.'
    ],
    explanation: 'Sui has three transfer patterns: (1) transfer::transfer moves ownership to a specific address, (2) transfer::share_object makes the object shared so anyone can use it in transactions, and (3) transfer::freeze_object makes it immutable and publicly readable.',
    codeTemplate: `module lesson6::transfers {
    use sui::transfer;
    use sui::tx_context::TxContext;

    public struct Ticket has key, store {
        id: UID,
        event_name: vector<u8>
    }

    public struct Config has key {
        id: UID,
        max_tickets: u64
    }

    // Send ticket to a specific user
    public fun give_ticket(ticket: Ticket, recipient: address) {
        transfer::{blank:owned_transfer}(ticket, recipient);
    }

    // Make config available to everyone
    public fun publish_config(config: Config) {
        transfer::{blank:shared_transfer}(config);
    }
}`,
    blanks: [
      {
        id: 'owned_transfer',
        placeholder: '___',
        correctAnswer: 'transfer',
        acceptableAnswers: ['public_transfer'],
        hint: 'Which function transfers an object to a specific address?'
      },
      {
        id: 'shared_transfer',
        placeholder: '___',
        correctAnswer: 'share_object',
        acceptableAnswers: ['public_share_object'],
        hint: 'Which function makes an object shared and accessible by all?'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  },

  // Lesson 7: Advanced Generics & Patterns - Generic struct with ability constraints
  {
    id: 'cc-move-019',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'generics',
    title: 'Generic Wrapper with Ability Constraints',
    description: 'Fill in the blanks to create a generic wrapper struct that enforces ability constraints on its type parameter.',
    learningObjective: 'Learn how to declare generic structs with ability constraints using the colon syntax.',
    estimatedTime: 6,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'Ability constraints on type parameters use colon syntax: T: store + drop.',
      'The wrapper needs abilities too - they depend on what T provides.',
      'A generic struct can only have "copy" if T also has "copy".'
    ],
    explanation: 'Generic type parameters can be constrained with abilities using the colon syntax (T: store + drop). This ensures any concrete type used must satisfy those abilities. The wrapper struct\'s own abilities are limited by what its type parameter supports.',
    codeTemplate: `module lesson7::wrapper {
    public struct Vault<T: {blank:constraint1} + {blank:constraint2}> has key, store {
        id: UID,
        contents: T,
        locked: bool
    }

    public fun wrap<T: store + drop>(id: UID, item: {blank:type_param}): Vault<T> {
        Vault {
            id,
            contents: item,
            locked: false
        }
    }

    public fun unwrap<T: store + drop>(vault: Vault<{blank:type_param2}>): T {
        let Vault { id: _, contents, locked: _ } = vault;
        contents
    }
}`,
    blanks: [
      {
        id: 'constraint1',
        placeholder: '___',
        correctAnswer: 'store',
        hint: 'The contents must be storable inside the Vault struct.'
      },
      {
        id: 'constraint2',
        placeholder: '___',
        correctAnswer: 'drop',
        hint: 'Unwrapping discards the vault shell - the inner type must be droppable for cleanup.'
      },
      {
        id: 'type_param',
        placeholder: '___',
        correctAnswer: 'T',
        hint: 'Use the generic type parameter as the function parameter type.'
      },
      {
        id: 'type_param2',
        placeholder: '___',
        correctAnswer: 'T',
        hint: 'The Vault is generic over the same type parameter T.'
      }
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'move'
  }
];

const moveBugFixExercises: BugFixExercise[] = [
  // Lesson 1: Hello Move - Fix syntax errors in a Move module
  {
    id: 'bf-move-003',
    type: 'bug_fix',
    difficulty: 'beginner',
    topic: 'modules',
    title: 'Fix the Broken Module',
    description: 'This Move module has syntax errors preventing it from compiling. Find and fix them.',
    learningObjective: 'Recognize and fix common syntax mistakes in Move module declarations.',
    estimatedTime: 4,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Module names use double colons (::) to separate package and module name.',
      'Functions must use the "fun" keyword, not "function".',
      'Strings in Move use b"..." syntax for byte vectors.'
    ],
    explanation: 'Move has specific syntax rules: modules use "::" as separator (not "."), functions are declared with "fun" (not "function"), and byte string literals use the b"..." prefix.',
    buggyCode: `module hello.world {
    public function greet(): vector<u8> {
        b"Hello, Sui!"
    }
}`,
    correctCode: `module hello::world {
    public fun greet(): vector<u8> {
        b"Hello, Sui!"
    }
}`,
    bugs: [
      {
        lineNumber: 1,
        bugType: 'syntax',
        description: 'Module path uses "." instead of "::" to separate package and module name.',
        hint: 'Replace the dot with double colons (::).'
      },
      {
        lineNumber: 2,
        bugType: 'syntax',
        description: 'The keyword "function" is not valid in Move. Use "fun" instead.',
        hint: 'Replace "function" with "fun".'
      }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'move'
  },

  // Lesson 3: Control Flow & Logic - Fix off-by-one loop error
  {
    id: 'bf-move-008',
    type: 'bug_fix',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'Fix the Off-By-One Loop',
    description: 'This function should calculate the factorial of n, but it has a loop boundary bug and an initialization error.',
    learningObjective: 'Identify and fix off-by-one errors in loop boundaries.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'Factorial of n is 1 * 2 * 3 * ... * n.',
      'What happens if the result starts at 0 and you multiply?',
      'Check the loop condition: should it include n or stop before n?'
    ],
    explanation: 'Off-by-one errors are extremely common in loops. For factorial, the accumulator must start at 1 (not 0, since 0 * anything = 0), and the loop condition "i < n" misses the last multiplication by n. Use "i <= n" to include it.',
    buggyCode: `module lesson3::math {
    fun factorial(n: u64): u64 {
        let mut result = 0;
        let mut i = 1;
        while (i < n) {
            result = result * i;
            i = i + 1;
        };
        result
    }
}`,
    correctCode: `module lesson3::math {
    fun factorial(n: u64): u64 {
        let mut result = 1;
        let mut i = 1;
        while (i <= n) {
            result = result * i;
            i = i + 1;
        };
        result
    }
}`,
    bugs: [
      {
        lineNumber: 3,
        bugType: 'logic',
        description: 'Result initialized to 0 instead of 1. Multiplying anything by 0 gives 0.',
        hint: 'Change the initial value of result from 0 to 1.'
      },
      {
        lineNumber: 5,
        bugType: 'logic',
        description: 'Loop condition "i < n" stops before n, missing the final multiplication.',
        hint: 'Change "i < n" to "i <= n" to include n in the multiplication.'
      }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'move'
  },

  // Lesson 4: Structs & Objects - Fix missing ability annotations
  {
    id: 'bf-move-012',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'structs',
    title: 'Fix Missing Ability Annotations',
    description: 'This code tries to use structs in ways that require specific abilities, but the abilities are missing or wrong.',
    learningObjective: 'Understand which abilities are required for different operations on structs.',
    estimatedTime: 5,
    baseXP: 55,
    perfectScoreXP: 25,
    hints: [
      'Storing a struct inside another struct requires the "store" ability.',
      'If a struct is used as a Sui object (top-level), it needs "key".',
      'Inner structs stored in a "key" object must have "store".'
    ],
    explanation: 'Move\'s ability system ensures safety: "key" is required for top-level Sui objects, "store" for types nested inside other structs, "copy" for duplication, and "drop" for automatic cleanup. A struct with "key" that contains another struct requires that inner struct to have "store".',
    buggyCode: `module game::inventory {
    use sui::object::UID;

    public struct Weapon has drop {
        damage: u64,
        durability: u8
    }

    public struct Hero has key {
        id: UID,
        name: vector<u8>,
        weapon: Weapon
    }
}`,
    correctCode: `module game::inventory {
    use sui::object::UID;

    public struct Weapon has store, drop {
        damage: u64,
        durability: u8
    }

    public struct Hero has key, store {
        id: UID,
        name: vector<u8>,
        weapon: Weapon
    }
}`,
    bugs: [
      {
        lineNumber: 4,
        bugType: 'type',
        description: 'Weapon is stored inside Hero but is missing the "store" ability.',
        hint: 'Add "store" to Weapon\'s abilities: has store, drop.'
      },
      {
        lineNumber: 8,
        bugType: 'type',
        description: 'Hero has "key" but should also have "store" to be transferable.',
        hint: 'Add "store" to Hero\'s abilities: has key, store.'
      }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'move'
  },

  // Lesson 6: Ownership & Transfer - Fix ownership/transfer errors
  {
    id: 'bf-move-017',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'transfer',
    title: 'Fix Transfer and Ownership Errors',
    description: 'This module has errors related to transferring and using objects after transfer.',
    learningObjective: 'Understand Move\'s ownership model: once an object is transferred or moved, it cannot be used again.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: [
      'After transfer::transfer, the object is moved and cannot be used again.',
      'If you need to read data before transferring, do it before the transfer call.',
      'Move\'s linear type system prevents use-after-move.'
    ],
    explanation: 'Move enforces linear types: each value must be used exactly once. After calling transfer::transfer, ownership moves to the recipient and the original variable is consumed. Any code that tries to access the object after transfer will fail to compile.',
    buggyCode: `module lesson6::marketplace {
    use sui::transfer;

    public struct Item has key, store {
        id: UID,
        price: u64
    }

    public fun sell_item(item: Item, buyer: address): u64 {
        transfer::transfer(item, buyer);
        let price = item.price;
        price
    }
}`,
    correctCode: `module lesson6::marketplace {
    use sui::transfer;

    public struct Item has key, store {
        id: UID,
        price: u64
    }

    public fun sell_item(item: Item, buyer: address): u64 {
        let price = item.price;
        transfer::transfer(item, buyer);
        price
    }
}`,
    bugs: [
      {
        lineNumber: 10,
        bugType: 'logic',
        description: 'Object is accessed after being transferred. item.price is used after item has been moved.',
        hint: 'Read the price BEFORE calling transfer::transfer, then return it.'
      }
    ],
    allowPartialCredit: false,
    mustFixAll: true,
    language: 'move'
  },

  // Lesson 7: Advanced Generics & Patterns - Fix witness pattern implementation
  {
    id: 'bf-move-020',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'generics',
    title: 'Fix the Witness Pattern',
    description: 'This one-time witness (OTW) pattern has errors in the struct definition and usage.',
    learningObjective: 'Understand the witness pattern: a type used once to prove authorization, then discarded.',
    estimatedTime: 6,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: [
      'A witness struct must have the "drop" ability so it can be consumed.',
      'The witness type name must match the module name in UPPERCASE for OTW.',
      'The witness struct should have no fields (empty struct).'
    ],
    explanation: 'The One-Time Witness (OTW) pattern in Sui uses an empty struct named after the module in UPPERCASE with only the "drop" ability. It is created exactly once by the system in the module init function, proving that code is running during module publication.',
    buggyCode: `module lesson7::my_coin {
    use sui::coin;
    use sui::transfer;

    public struct MyCoin has key {
        value: u64
    }

    fun init(witness: MyCoin, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 9, b"MC", b"My Coin", b"", option::none(), ctx
        );
        transfer::public_share_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }
}`,
    correctCode: `module lesson7::my_coin {
    use sui::coin;
    use sui::transfer;

    public struct MY_COIN has drop {}

    fun init(witness: MY_COIN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 9, b"MC", b"My Coin", b"", option::none(), ctx
        );
        transfer::public_share_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }
}`,
    bugs: [
      {
        lineNumber: 5,
        bugType: 'logic',
        description: 'OTW struct must be named in UPPERCASE matching the module name, have only "drop" ability, and be empty.',
        hint: 'Change "MyCoin has key { value: u64 }" to "MY_COIN has drop {}".'
      },
      {
        lineNumber: 9,
        bugType: 'type',
        description: 'The init function parameter type must match the corrected OTW struct name.',
        hint: 'Change the witness parameter type from "MyCoin" to "MY_COIN".'
      }
    ],
    allowPartialCredit: true,
    mustFixAll: false,
    language: 'move'
  }
];

const moveMultipleChoiceExercises: MultipleChoiceExercise[] = [
  // Lesson 1: Hello Move - Question about Move module structure
  {
    id: 'mc-move-002',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'modules',
    title: 'Move Module Structure',
    description: 'Test your understanding of how Move modules are structured and named.',
    learningObjective: 'Understand the anatomy of a Move module declaration including naming conventions.',
    estimatedTime: 3,
    baseXP: 35,
    perfectScoreXP: 15,
    hints: [
      'A module declaration starts with the "module" keyword.',
      'The path has two parts separated by "::".',
      'The first part is the package name, the second is the module name.'
    ],
    explanation: 'In Move, a module is declared as "module package_name::module_name { ... }". The package name corresponds to the project/package defined in Move.toml, and the module name identifies the specific module within that package. All code (functions, structs, constants) lives inside modules.',
    question: 'Which of the following is a VALID Move module declaration?',
    codeSnippet: `// Which one is correct?
// A) module my_package::my_module { }
// B) module my_package.my_module { }
// C) package my_package { module my_module { } }
// D) mod my_package::my_module { }`,
    options: [
      {
        id: 'opt1',
        text: 'module my_package::my_module { }',
        isCorrect: true,
        explanation: 'Correct! Move modules use "module" keyword with "::" separating package and module names.'
      },
      {
        id: 'opt2',
        text: 'module my_package.my_module { }',
        isCorrect: false,
        explanation: 'Incorrect. Move uses "::" (double colon) not "." (dot) to separate package and module names.'
      },
      {
        id: 'opt3',
        text: 'package my_package { module my_module { } }',
        isCorrect: false,
        explanation: 'Incorrect. Move does not use a "package" keyword for nesting. Modules are declared with a flat path syntax.'
      },
      {
        id: 'opt4',
        text: 'mod my_package::my_module { }',
        isCorrect: false,
        explanation: 'Incorrect. The keyword is "module", not "mod". "mod" is used in Rust, not Move.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // Lesson 2: Mastering Move Types - Questions about Move type system
  {
    id: 'mc-move-006',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Move Type System Fundamentals',
    description: 'Test your knowledge of Move\'s primitive types and type safety rules.',
    learningObjective: 'Understand Move\'s type system including which types exist and how type safety is enforced.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Move only has unsigned integer types (no negatives).',
      'There is no string type in Move - use vector<u8> for byte strings.',
      'Move does not have implicit type conversions.'
    ],
    explanation: 'Move has a strict type system with no implicit conversions. It supports unsigned integers (u8, u16, u32, u64, u128, u256), bool, address, and vector<T>. There is no native string type - byte vectors (vector<u8>) are used instead. You must use explicit casting with "as" to convert between integer types.',
    question: 'Which statement about Move\'s type system is TRUE?',
    options: [
      {
        id: 'opt1',
        text: 'Move has no signed integer types - all integers are unsigned (u8, u64, etc.)',
        isCorrect: true,
        explanation: 'Correct! Move only has unsigned integer types. There are no i8, i32, i64, etc. This simplifies reasoning about numeric operations in smart contracts.'
      },
      {
        id: 'opt2',
        text: 'Move automatically converts u8 to u64 when needed',
        isCorrect: false,
        explanation: 'Incorrect. Move never does implicit type conversion. You must explicitly cast with "(value as u64)".'
      },
      {
        id: 'opt3',
        text: 'Move has a built-in String type for text',
        isCorrect: false,
        explanation: 'Incorrect. Move has no native string type. Use vector<u8> for byte strings or the std::string module.'
      },
      {
        id: 'opt4',
        text: 'Variables in Move can change their type after declaration',
        isCorrect: false,
        explanation: 'Incorrect. Move is statically typed - once a variable has a type, it cannot change.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // Lesson 4: Structs & Objects - Questions about abilities
  {
    id: 'mc-move-011',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'structs',
    title: 'Understanding the Four Abilities',
    description: 'Test your understanding of Move\'s four abilities: copy, drop, store, and key.',
    learningObjective: 'Know the purpose of each ability and when to use or avoid them.',
    estimatedTime: 4,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'Think about what each ability allows you to DO with a value.',
      '"copy" lets you duplicate, "drop" lets you discard.',
      '"key" is for top-level storage, "store" is for nested storage.'
    ],
    explanation: 'The four abilities in Move are: (1) "copy" - the value can be duplicated, (2) "drop" - the value can be silently discarded, (3) "store" - the value can be stored inside other structs in global storage, (4) "key" - the value can exist as a top-level object in global storage. Without "drop", you MUST explicitly unpack or transfer every value.',
    question: 'What happens if you try to let a struct WITHOUT the "drop" ability go out of scope?',
    codeSnippet: `public struct Token has key, store {
    id: UID,
    value: u64
}

fun example(token: Token) {
    // Token goes out of scope without being used
    // What happens?
}`,
    options: [
      {
        id: 'opt1',
        text: 'Compilation error - the value must be explicitly consumed (transferred, unpacked, or stored)',
        isCorrect: true,
        explanation: 'Correct! Without "drop", Move\'s type system requires every value to be explicitly handled. This prevents accidental loss of valuable assets.'
      },
      {
        id: 'opt2',
        text: 'The token is automatically destroyed and freed from memory',
        isCorrect: false,
        explanation: 'Incorrect. Only types with the "drop" ability can be automatically destroyed. Without it, the compiler forces explicit handling.'
      },
      {
        id: 'opt3',
        text: 'A runtime error occurs when the function returns',
        isCorrect: false,
        explanation: 'Incorrect. This is caught at compile time, not runtime. Move\'s type system prevents this from ever executing.'
      },
      {
        id: 'opt4',
        text: 'The token is automatically transferred to the transaction sender',
        isCorrect: false,
        explanation: 'Incorrect. There is no automatic transfer. The developer must explicitly decide what happens to the value.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // Lesson 5: Collections & Dynamic Fields - Dynamic fields vs Table
  {
    id: 'mc-move-015',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'vectors',
    title: 'Dynamic Fields vs Table vs Vector',
    description: 'Compare the three main collection types in Sui Move.',
    learningObjective: 'Understand when to use vectors, Tables, and dynamic fields for different use cases.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Vectors store all data in one object - good for small collections.',
      'Dynamic fields and Tables store each entry as separate objects.',
      'Large collections should avoid vectors to prevent gas issues.'
    ],
    explanation: 'In Sui Move: (1) vector<T> stores all elements in one object - fast but limited by object size, best for small fixed-size collections. (2) Table<K, V> is a hash map where each entry is a separate object - efficient for key-value lookups. (3) Dynamic fields attach arbitrary key-value data to objects - most flexible, each field is a separate object. For large collections, always prefer Table or dynamic fields.',
    question: 'Which collection type is BEST for storing 10,000 user profiles indexed by address?',
    options: [
      {
        id: 'opt1',
        text: 'Table<address, UserProfile> - efficient key-value lookups with data split across objects',
        isCorrect: true,
        explanation: 'Correct! Table is ideal for large key-value collections. Each entry is a separate object, avoiding size limits and keeping gas costs per-operation low.'
      },
      {
        id: 'opt2',
        text: 'vector<UserProfile> - simple and fast for any size collection',
        isCorrect: false,
        explanation: 'Incorrect. A vector with 10,000 entries in a single object would be extremely expensive to read/write and could exceed object size limits.'
      },
      {
        id: 'opt3',
        text: 'vector<address> with a separate vector<UserProfile> - parallel arrays',
        isCorrect: false,
        explanation: 'Incorrect. Parallel vectors are error-prone and still suffer from the same size limits. Table provides proper key-value semantics.'
      },
      {
        id: 'opt4',
        text: 'Create 10,000 separate modules, one per user',
        isCorrect: false,
        explanation: 'Incorrect. Modules are code containers, not data storage. This would be impossible and nonsensical.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // Lesson 6: Ownership & Transfer - Owned vs shared vs immutable
  {
    id: 'mc-move-018',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'transfer',
    title: 'Owned vs Shared vs Immutable Objects',
    description: 'Understand the three object ownership models in Sui.',
    learningObjective: 'Know the differences between owned, shared, and immutable objects and their trade-offs.',
    estimatedTime: 4,
    baseXP: 55,
    perfectScoreXP: 20,
    hints: [
      'Owned objects can only be used by their owner - fast but exclusive.',
      'Shared objects can be used by anyone but require consensus.',
      'Immutable objects are frozen forever - anyone can read but nobody can modify.'
    ],
    explanation: 'Sui has three ownership models: (1) Owned objects belong to one address, enabling fast execution without consensus but only that address can use them. (2) Shared objects are accessible to all, requiring consensus ordering but enabling multi-party interactions. (3) Immutable objects are frozen permanently, readable by all with no consensus needed.',
    question: 'For a DEX (decentralized exchange) liquidity pool that anyone can trade with, which ownership model should the pool object use?',
    options: [
      {
        id: 'opt1',
        text: 'Shared object - multiple users need to interact with it concurrently',
        isCorrect: true,
        explanation: 'Correct! A DEX pool must be accessible to all traders. Shared objects allow multiple users to interact in the same epoch, though they require consensus.'
      },
      {
        id: 'opt2',
        text: 'Owned object - the pool creator should control all trades',
        isCorrect: false,
        explanation: 'Incorrect. An owned pool would mean only the creator can trade, defeating the purpose of a decentralized exchange.'
      },
      {
        id: 'opt3',
        text: 'Immutable object - the pool should never change',
        isCorrect: false,
        explanation: 'Incorrect. An immutable pool cannot be modified, so no trades or liquidity changes could ever happen.'
      },
      {
        id: 'opt4',
        text: 'Create a new owned object for each trade',
        isCorrect: false,
        explanation: 'Incorrect. The pool needs persistent state (balances, fees) that persists across trades. Creating new objects per trade would not maintain shared liquidity.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  },

  // Lesson 7: Advanced Generics & Patterns - Questions about phantom types and patterns
  {
    id: 'mc-move-021',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'generics',
    title: 'Phantom Type Parameters',
    description: 'Understand phantom type parameters and when to use them in Move.',
    learningObjective: 'Learn what phantom type parameters are and why they enable type-safe token patterns.',
    estimatedTime: 5,
    baseXP: 65,
    perfectScoreXP: 30,
    hints: [
      'A phantom type parameter is declared with "phantom" keyword.',
      'Phantom types are used only as type markers, not stored in fields.',
      'The Coin<T> pattern uses phantom T to distinguish different currencies.'
    ],
    explanation: 'Phantom type parameters (declared with "phantom") exist only at the type level and are not stored in the struct\'s fields. They act as compile-time markers that distinguish types without runtime cost. For example, Coin<phantom T> means Coin<SUI> and Coin<USDC> are different types even though both just store a u64 balance. This prevents mixing different currencies at compile time.',
    question: 'What is the purpose of the "phantom" keyword on a type parameter?',
    codeSnippet: `public struct Coin<phantom T> has key, store {
    id: UID,
    balance: u64
}
// Coin<SUI> and Coin<USDC> are different types!`,
    options: [
      {
        id: 'opt1',
        text: 'It marks a type parameter that is only used for type-level distinction, not stored in fields',
        isCorrect: true,
        explanation: 'Correct! Phantom types exist only at compile time for type safety. Coin<SUI> and Coin<USDC> have the same fields but are distinct types that cannot be accidentally mixed.'
      },
      {
        id: 'opt2',
        text: 'It makes the type parameter optional - you can omit it when creating the struct',
        isCorrect: false,
        explanation: 'Incorrect. Phantom types are still required when creating instances. "phantom" refers to how the type parameter is used internally, not whether it can be omitted.'
      },
      {
        id: 'opt3',
        text: 'It means the type parameter is automatically inferred and never needs to be specified',
        isCorrect: false,
        explanation: 'Incorrect. Phantom types must still be specified explicitly in most cases. The keyword affects ability requirements, not type inference.'
      },
      {
        id: 'opt4',
        text: 'It makes the struct invisible to other modules',
        isCorrect: false,
        explanation: 'Incorrect. Visibility is controlled by "public" keyword, not "phantom". Phantom only affects type parameter usage.'
      }
    ],
    allowMultipleAnswers: false,
    shuffleOptions: true,
    showExplanationOnWrong: true
  }
];

const moveOutputPredictionExercises: OutputPredictionExercise[] = [
  // Lesson 2: Mastering Move Types - Predict result of type casting
  {
    id: 'op-move-005',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'primitives',
    title: 'Type Casting Chain',
    description: 'Predict the result of chained type casting operations.',
    learningObjective: 'Understand how explicit type casting works between different integer sizes in Move.',
    estimatedTime: 3,
    baseXP: 40,
    perfectScoreXP: 15,
    hints: [
      'Casting from smaller to larger type preserves the value.',
      'Casting from larger to smaller type truncates if the value fits.',
      'u8 can hold 0-255, u64 can hold much larger values.'
    ],
    explanation: 'When casting from a smaller type to a larger type (u8 -> u64), the value is preserved exactly. The "as" keyword performs explicit type conversion. In this case, 200 (u8) becomes 200 (u64), and adding 800 gives 1000. Then the separate u8 cast of 10 also preserves the value since 10 fits in both types.',
    code: `fun type_cast_demo(): u64 {
    let small: u8 = 200;
    let big: u64 = (small as u64) + 800;
    let tiny: u8 = 10;
    big + (tiny as u64)
}`,
    language: 'move',
    correctOutput: '1010',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['200', '1000', '1010', 'abort - overflow'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Initialize small: u8 = 200',
        variables: { small: 200 }
      },
      {
        step: 2,
        description: 'Cast small to u64: 200, then add 800 = 1000',
        variables: { big: 1000 }
      },
      {
        step: 3,
        description: 'Initialize tiny: u8 = 10',
        variables: { tiny: 10 }
      },
      {
        step: 4,
        description: 'Cast tiny to u64: 10, add to big: 1000 + 10 = 1010',
        variables: { result: 1010 }
      }
    ]
  },

  // Lesson 3: Control Flow & Logic - Predict loop output
  {
    id: 'op-move-009',
    type: 'output_prediction',
    difficulty: 'beginner',
    topic: 'control_flow',
    title: 'Loop with Early Break',
    description: 'Predict the value of a counter after a loop with break and continue statements.',
    learningObjective: 'Trace through loop execution with break and continue to predict the final result.',
    estimatedTime: 4,
    baseXP: 45,
    perfectScoreXP: 20,
    hints: [
      'Trace through each iteration carefully.',
      '"continue" skips the rest of the loop body for that iteration.',
      '"break" exits the loop entirely, stopping all further iterations.'
    ],
    explanation: 'The loop runs with i going from 0 upward. When i reaches 10, the break triggers. For each iteration, if i is odd (i % 2 != 0), continue skips the count increment. So only even values of i (0, 2, 4, 6, 8) increment count, giving a final result of 5.',
    code: `fun count_evens(): u64 {
    let mut count = 0;
    let mut i = 0;
    loop {
        if (i >= 10) {
            break
        };
        if (i % 2 != 0) {
            i = i + 1;
            continue
        };
        count = count + 1;
        i = i + 1;
    };
    count
}`,
    language: 'move',
    correctOutput: '5',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['4', '5', '6', '10'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Initialize count=0, i=0',
        variables: { count: 0, i: 0 }
      },
      {
        step: 2,
        description: 'i=0: even, count becomes 1, i becomes 1',
        variables: { count: 1, i: 1 }
      },
      {
        step: 3,
        description: 'i=1: odd, continue (skip count), i becomes 2',
        variables: { count: 1, i: 2 }
      },
      {
        step: 4,
        description: 'i=2: even, count becomes 2, i becomes 3. Pattern continues...',
        variables: { count: 2, i: 3 }
      },
      {
        step: 5,
        description: 'Even values 0,2,4,6,8 are counted = 5 total. i=10 triggers break.',
        variables: { count: 5, i: 10 }
      }
    ]
  },

  // Lesson 5: Collections & Dynamic Fields - Predict vector operation result
  {
    id: 'op-move-014',
    type: 'output_prediction',
    difficulty: 'intermediate',
    topic: 'vectors',
    title: 'Vector Swap and Access',
    description: 'Predict the value at a specific index after vector swap operations.',
    learningObjective: 'Understand how vector::swap rearranges elements and how to trace element positions.',
    estimatedTime: 4,
    baseXP: 50,
    perfectScoreXP: 20,
    hints: [
      'vector::swap exchanges elements at two indices.',
      'After swap(v, 0, 2), the element at index 0 moves to index 2 and vice versa.',
      'Track each element through the swap operations.'
    ],
    explanation: 'vector::swap(v, i, j) exchanges the elements at positions i and j. Starting with [10, 20, 30, 40], swap(0,2) gives [30, 20, 10, 40], then swap(1,3) gives [30, 40, 10, 20]. The element at index 1 is now 40.',
    code: `use std::vector;

fun swap_demo(): u64 {
    let mut v = vector::empty<u64>();
    vector::push_back(&mut v, 10);
    vector::push_back(&mut v, 20);
    vector::push_back(&mut v, 30);
    vector::push_back(&mut v, 40);

    vector::swap(&mut v, 0, 2);
    vector::swap(&mut v, 1, 3);

    *vector::borrow(&v, 1)
}`,
    language: 'move',
    correctOutput: '40',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['10', '20', '30', '40'],
    showLineNumbers: true,
    executionSteps: [
      {
        step: 1,
        description: 'Build vector: [10, 20, 30, 40]',
        variables: { 'v': '[10, 20, 30, 40]' }
      },
      {
        step: 2,
        description: 'swap(0, 2): exchange index 0 and 2 → [30, 20, 10, 40]',
        variables: { 'v': '[30, 20, 10, 40]' }
      },
      {
        step: 3,
        description: 'swap(1, 3): exchange index 1 and 3 → [30, 40, 10, 20]',
        variables: { 'v': '[30, 40, 10, 20]' }
      },
      {
        step: 4,
        description: 'borrow index 1: returns 40',
        variables: { result: 40 }
      }
    ]
  }
];

// Add Move language exercises to main arrays
codeCompletionExercises.push(...moveCodeCompletionExercises);
bugFixExercises.push(...moveBugFixExercises);
multipleChoiceExercises.push(...moveMultipleChoiceExercises);
outputPredictionExercises.push(...moveOutputPredictionExercises);

// ============================================================================
// DEEPBOOK PREDICT EXERCISES
// ============================================================================

const predictCodeCompletionExercises: CodeCompletionExercise[] = [
  {
    id: 'cc-predict-001',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'SVI Pricing Formula',
    description: 'Fill in the blanks to complete the SVI pricing formula that computes binary option fair value.',
    learningObjective: 'Understand the SVI variance function and how it maps to a binary option price via normalCDF(d2).',
    estimatedTime: 8,
    baseXP: 80,
    perfectScoreXP: 40,
    hints: ['Moneyness k = ln(strike / forward). Use Math.log().', 'The SVI variance function is w = a + b * (rho * km + sqrt(km^2 + sigma^2)).', 'd2 = -(k + w/2) / sqrt(w). The final price is normalCDF(d2).'],
    explanation: 'The SVI model parameterizes the implied variance smile with 5 parameters. First we compute log-moneyness k, then the total variance w(k), then d2 from Black-Scholes, and finally the binary price as N(d2).',
    codeTemplate: `function computeSviPrice(svi: SviParams, strike: number, forward: number): number {
  const a = svi.a / FLOAT_SCALING, b = svi.b / FLOAT_SCALING;
  const rho = svi.rho / FLOAT_SCALING, m = svi.m / FLOAT_SCALING, sigma = svi.sigma / FLOAT_SCALING;
  const k = {blank:moneyness};
  const km = k - m;
  const w = a + b * ({blank:svi_variance});
  const d2 = {blank:d2_formula};
  return {blank:final_price};
}`,
    blanks: [
      { id: 'moneyness', placeholder: '___', correctAnswer: 'Math.log(strike / forward)', acceptableAnswers: ['Math.log(strike/forward)'], hint: 'k = natural log of strike/forward.' },
      { id: 'svi_variance', placeholder: '___', correctAnswer: 'rho * km + Math.sqrt(km * km + sigma * sigma)', hint: 'Linear skew + quadratic wing.' },
      { id: 'd2_formula', placeholder: '___', correctAnswer: '-(k + w / 2) / Math.sqrt(w)', hint: 'd2 = -(k + w/2) / sqrt(w).' },
      { id: 'final_price', placeholder: '___', correctAnswer: 'normalCDF(d2)', hint: 'Binary price = cumulative normal at d2.' },
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript',
  },
  {
    id: 'cc-predict-002',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'Range Price Calculation',
    description: 'Fill in the blanks to compute the price of a RANGE binary position.',
    learningObjective: 'Understand that a range price is the difference of two SVI prices.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: ['A range pays out if settlement is in (lower, higher].', 'P(in range) = P(above lower) - P(above higher).'],
    explanation: 'A range position pays 1 if the settlement is between lower and higher. This probability equals P(above lower) - P(above higher), since P(above lower) includes everything above lower, and subtracting P(above higher) leaves only the range.',
    codeTemplate: `function computeRangePrice(svi: SviParams, lower: number, higher: number, forward: number): number {
  const pAboveLower = {blank:p_lower};
  const pAboveHigher = {blank:p_higher};
  return {blank:result};
}`,
    blanks: [
      { id: 'p_lower', placeholder: '___', correctAnswer: 'computeSviPrice(svi, lower, forward)', hint: 'Call computeSviPrice with the lower strike.' },
      { id: 'p_higher', placeholder: '___', correctAnswer: 'computeSviPrice(svi, higher, forward)', hint: 'Call computeSviPrice with the higher strike.' },
      { id: 'result', placeholder: '___', correctAnswer: 'Math.max(0, pAboveLower - pAboveHigher)', acceptableAnswers: ['pAboveLower - pAboveHigher'], hint: 'Range = P(above lower) - P(above higher), clamped to 0.' },
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript',
  },
  {
    id: 'cc-predict-003',
    type: 'code_completion',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'Fee Breakdown Computation',
    description: 'Fill in the blanks to compute the Bernoulli and utilization fees.',
    learningObjective: 'Implement the two-component fee model used by DeepBook Predict.',
    estimatedTime: 6,
    baseXP: 65,
    perfectScoreXP: 30,
    hints: ['Bernoulli fee = baseFee * sqrt(p * (1-p)).', 'Utilization fee = baseFee * utilMult * (liability/balance)^2.', 'Total = max(bernoulli, minFee) + utilization.'],
    explanation: 'The Bernoulli fee peaks at p=0.5 (max uncertainty). The utilization fee grows quadratically with vault leverage. The total fee has a floor of minFee to ensure the vault always earns a spread.',
    codeTemplate: `function computeFees(p: number, baseFee: number, minFee: number, utilMult: number, liability: number, balance: number) {
  const bernoulliFee = {blank:bernoulli};
  const utilRatio = balance > 0 ? liability / balance : 0;
  const utilizationFee = {blank:util_fee};
  const totalFee = {blank:total};
  return { bernoulliFee, utilizationFee, totalFee };
}`,
    blanks: [
      { id: 'bernoulli', placeholder: '___', correctAnswer: 'baseFee * Math.sqrt(p * (1 - p))', hint: 'baseFee * sqrt(p * (1-p)).' },
      { id: 'util_fee', placeholder: '___', correctAnswer: 'baseFee * utilMult * utilRatio * utilRatio', hint: 'baseFee * utilMult * utilRatio^2.' },
      { id: 'total', placeholder: '___', correctAnswer: 'Math.max(bernoulliFee, minFee) + utilizationFee', hint: 'max(bernoulli, minFee) + utilization.' },
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript',
  },
  {
    id: 'cc-predict-004',
    type: 'code_completion',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Unrealized P&L Calculation',
    description: 'Fill in the blanks to compute unrealized P&L for an open position.',
    learningObjective: 'Calculate mark-to-market P&L using current SVI price vs entry price.',
    estimatedTime: 6,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: ['For DOWN positions, the fair price is 1 - computeSviPrice().', 'Unrealized P&L = (currentPrice - entryPrice) * quantity.'],
    explanation: 'computeSviPrice returns the probability of settling ABOVE the strike. For UP positions, this is the fair price directly. For DOWN, invert it (1 - price). The unrealized P&L is the difference between current and entry price, multiplied by quantity.',
    codeTemplate: `function computePnL(direction: 'UP' | 'DOWN', entryPrice: number, sviPrice: number, quantity: number) {
  const currentPrice = direction === 'DOWN' ? {blank:down_price} : {blank:up_price};
  const unrealizedPnL = {blank:pnl};
  return { currentPrice, unrealizedPnL };
}`,
    blanks: [
      { id: 'down_price', placeholder: '___', correctAnswer: '1 - sviPrice', hint: 'DOWN = 1 - P(above strike).' },
      { id: 'up_price', placeholder: '___', correctAnswer: 'sviPrice', hint: 'UP price is the SVI price directly.' },
      { id: 'pnl', placeholder: '___', correctAnswer: '(currentPrice - entryPrice) * quantity', hint: 'P&L = (current - entry) * quantity.' },
    ],
    strictMode: false,
    caseSensitive: true,
    language: 'typescript',
  },
];

const predictMultipleChoiceExercises: MultipleChoiceExercise[] = [
  {
    id: 'mc-predict-001',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'deepbook_predict',
    title: 'UP/DOWN Position Encoding',
    description: 'How are binary positions encoded with sentinel strike values?',
    learningObjective: 'Understand UP and DOWN position sentinel encoding.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 15,
    hints: ['NEG_INF = 0 and POS_INF = 2^64 - 1.', 'UP covers [strike, +infinity).'],
    explanation: 'UP: lower=strike, higher=POS_INF. DOWN: lower=NEG_INF, higher=strike.',
    question: 'How is an UP position (settlement >= strike) encoded?',
    options: [
      { id: 'a', text: 'lower_strike = NEG_INF, higher_strike = strike', isCorrect: false, explanation: 'This is a DOWN position.' },
      { id: 'b', text: 'lower_strike = strike, higher_strike = POS_INF', isCorrect: true, explanation: 'Correct! UP uses strike as lower bound and POS_INF as upper.' },
      { id: 'c', text: 'lower_strike = POS_INF, higher_strike = strike', isCorrect: false, explanation: 'Inverted — lower must be less than higher.' },
      { id: 'd', text: 'lower_strike = 0, higher_strike = 0', isCorrect: false, explanation: 'Both zero is invalid — this encodes nothing meaningful.' },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-002',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'deepbook_predict',
    title: 'Module Responsibilities',
    description: 'Which module handles which operation in DeepBook Predict?',
    learningObjective: 'Know which Move module to target for each operation.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 15,
    hints: ['predict handles mint/redeem.', 'registry handles manager creation.'],
    explanation: 'predict::mint creates positions, registry::create_and_share_manager creates accounts, predict_manager::deposit funds accounts, range_key::new builds position identifiers.',
    question: 'Which module contains the mint() function for creating binary positions?',
    options: [
      { id: 'a', text: 'registry', isCorrect: false, explanation: 'Registry handles manager creation, not trading.' },
      { id: 'b', text: 'predict_manager', isCorrect: false, explanation: 'predict_manager handles deposit/withdraw, not mint.' },
      { id: 'c', text: 'predict', isCorrect: true, explanation: 'Correct! The predict module contains mint() and redeem().' },
      { id: 'd', text: 'range_key', isCorrect: false, explanation: 'range_key only constructs position identifiers.' },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-003',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'deepbook_predict',
    title: 'Oracle State Transitions',
    description: 'What is the correct lifecycle of an oracle?',
    learningObjective: 'Understand the four oracle states and their order.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 15,
    hints: ['Oracles start inactive and end settled.'],
    explanation: 'Oracles progress: Inactive → Active → Pending Settlement → Settled. Only active oracles accept mints.',
    question: 'In what order does an oracle progress through states?',
    options: [
      { id: 'a', text: 'Active → Inactive → Settled → Pending', isCorrect: false },
      { id: 'b', text: 'Inactive → Active → Pending Settlement → Settled', isCorrect: true, explanation: 'Correct! This is the canonical lifecycle.' },
      { id: 'c', text: 'Settled → Pending → Active → Inactive', isCorrect: false },
      { id: 'd', text: 'Active → Settled → Inactive → Pending', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-004',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'deepbook_predict',
    title: 'Oracle Data Fields',
    description: 'What does the min_strike field represent on an oracle?',
    learningObjective: 'Understand how the strike grid is defined.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 15,
    hints: ['Valid strikes = min_strike + N * tick_size.'],
    explanation: 'min_strike is the lowest valid strike on the grid. All valid strikes are computed as min_strike + N * tick_size for integer N >= 0.',
    question: 'How are valid trading strikes determined from min_strike and tick_size?',
    options: [
      { id: 'a', text: 'Any price can be used as a strike', isCorrect: false },
      { id: 'b', text: 'strike = min_strike + N × tick_size for integer N', isCorrect: true, explanation: 'Correct! Strikes form a uniform grid.' },
      { id: 'c', text: 'Only the forward price is valid', isCorrect: false },
      { id: 'd', text: 'Strikes are randomly generated', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-005',
    type: 'multiple_choice',
    difficulty: 'beginner',
    topic: 'deepbook_predict',
    title: 'Spot vs Forward Price',
    description: 'What is the relationship between spot and forward prices?',
    learningObjective: 'Understand spot, forward, and basis.',
    estimatedTime: 2,
    baseXP: 30,
    perfectScoreXP: 15,
    hints: ['Forward accounts for expected drift to expiry.'],
    explanation: 'Forward = spot × basis. The basis captures carry and expected drift. SVI pricing uses forward, not spot.',
    question: 'Why does SVI pricing use the forward price instead of spot?',
    options: [
      { id: 'a', text: 'Forward is always higher than spot', isCorrect: false },
      { id: 'b', text: 'Forward represents the expected price at expiry', isCorrect: true, explanation: 'Correct! We care about price at expiry, not current price.' },
      { id: 'c', text: 'Spot data is unavailable on-chain', isCorrect: false },
      { id: 'd', text: 'There is no difference between spot and forward', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-006',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'SVI Parameter Effects',
    description: 'Which SVI parameter controls the skew of the volatility smile?',
    learningObjective: 'Map SVI parameters to their effects on the smile.',
    estimatedTime: 2,
    baseXP: 40,
    perfectScoreXP: 20,
    hints: ['rho tilts the smile left or right.'],
    explanation: 'rho controls skew — negative rho means downside protection is more expensive (put skew). a is base variance, b is wing slope, sigma is ATM smoothing.',
    question: 'Which parameter makes puts more expensive than calls at equal distance from ATM?',
    options: [
      { id: 'a', text: 'a (base variance)', isCorrect: false },
      { id: 'b', text: 'b (wing slope)', isCorrect: false },
      { id: 'c', text: 'rho (skew) when negative', isCorrect: true, explanation: 'Correct! Negative rho tilts the smile to make low strikes (puts) more expensive.' },
      { id: 'd', text: 'sigma (smoothing)', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-007',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'Bernoulli Fee Peak',
    description: 'When is the Bernoulli fee highest?',
    learningObjective: 'Understand the relationship between probability and fee.',
    estimatedTime: 2,
    baseXP: 40,
    perfectScoreXP: 20,
    hints: ['sqrt(p*(1-p)) is maximized when p = 0.5.'],
    explanation: 'The Bernoulli fee = baseFee * sqrt(p*(1-p)). This peaks at p=0.5 where uncertainty is maximal, and approaches 0 as p approaches 0 or 1.',
    question: 'At what fair price (p) is the Bernoulli fee highest?',
    options: [
      { id: 'a', text: 'p = 0 (deep out-of-the-money)', isCorrect: false },
      { id: 'b', text: 'p = 1 (deep in-the-money)', isCorrect: false },
      { id: 'c', text: 'p = 0.5 (at-the-money)', isCorrect: true, explanation: 'Correct! sqrt(0.5 * 0.5) = 0.5, the maximum.' },
      { id: 'd', text: 'p = 0.25', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-008',
    type: 'multiple_choice',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'PredictManager Creation',
    description: 'Which module and function creates a PredictManager?',
    learningObjective: 'Know the correct transaction target for manager creation.',
    estimatedTime: 2,
    baseXP: 40,
    perfectScoreXP: 20,
    hints: ['The registry module handles creation.'],
    explanation: 'PredictManagers are created via registry::create_and_share_manager. The registry tracks all managers. The only argument needed is the REGISTRY_ID shared object.',
    question: 'What is the Move target for creating a PredictManager?',
    options: [
      { id: 'a', text: 'predict::create_manager', isCorrect: false },
      { id: 'b', text: 'predict_manager::new', isCorrect: false },
      { id: 'c', text: 'registry::create_and_share_manager', isCorrect: true, explanation: 'Correct! The registry module manages manager creation.' },
      { id: 'd', text: 'range_key::create_manager', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-015',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Hook Polling Patterns',
    description: 'Why do Predict hooks use visibility-aware polling?',
    learningObjective: 'Understand the benefits of visibility-aware interval hooks.',
    estimatedTime: 2,
    baseXP: 50,
    perfectScoreXP: 25,
    hints: ['Hidden tabs waste API calls and battery.'],
    explanation: 'Visibility-aware polling pauses API calls when the tab is hidden and resumes immediately when visible. This saves bandwidth, reduces server load, and preserves battery on mobile devices.',
    question: 'What happens when useVisibilityAwareInterval detects the tab becomes hidden?',
    options: [
      { id: 'a', text: 'It increases the polling frequency', isCorrect: false },
      { id: 'b', text: 'It pauses the interval and resumes on visibility', isCorrect: true, explanation: 'Correct! Polling stops when hidden and restarts when visible.' },
      { id: 'c', text: 'It throws an error', isCorrect: false },
      { id: 'd', text: 'Nothing — it continues polling normally', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-016',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Transaction Signing',
    description: 'How are Predict transactions signed and executed?',
    learningObjective: 'Understand the wallet signing flow for Sui transactions.',
    estimatedTime: 2,
    baseXP: 50,
    perfectScoreXP: 25,
    hints: ['The dApp Kit provides useSignAndExecuteTransaction.'],
    explanation: 'Build a Transaction with PTB calls, then pass it to signAndExecuteTransaction from @mysten/dapp-kit. The wallet prompts the user to approve, signs, and submits to the Sui network.',
    question: 'What does the dApp do after building a mint Transaction?',
    options: [
      { id: 'a', text: 'Sends it directly to the blockchain', isCorrect: false, explanation: 'The wallet must sign it first.' },
      { id: 'b', text: 'Passes it to signAndExecuteTransaction for wallet signing', isCorrect: true, explanation: 'Correct! The wallet signs and submits the transaction.' },
      { id: 'c', text: 'Stores it in localStorage for later', isCorrect: false },
      { id: 'd', text: 'Converts it to JSON and POSTs to the predict server', isCorrect: false },
    ],
    shuffleOptions: false,
  },
  {
    id: 'mc-predict-017',
    type: 'multiple_choice',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'useMemo for Pricing',
    description: 'Why use useMemo for SVI price computation in React?',
    learningObjective: 'Understand performance optimization for expensive computations.',
    estimatedTime: 2,
    baseXP: 50,
    perfectScoreXP: 25,
    hints: ['SVI computation involves Math.log, Math.sqrt, and normalCDF.'],
    explanation: 'computeSviPrice involves log, sqrt, and normalCDF calculations. useMemo caches the result and only recomputes when dependencies (SVI params, strike, forward) change, avoiding unnecessary recalculation on every render.',
    question: 'Why wrap computeSviPrice in useMemo?',
    options: [
      { id: 'a', text: 'It makes the computation asynchronous', isCorrect: false },
      { id: 'b', text: 'It caches the result and only recomputes when inputs change', isCorrect: true, explanation: 'Correct! useMemo prevents redundant calculations on re-renders.' },
      { id: 'c', text: 'It converts the result to a string', isCorrect: false },
      { id: 'd', text: 'It is required by React for all math operations', isCorrect: false },
    ],
    shuffleOptions: false,
  },
];

const predictBugFixExercises: BugFixExercise[] = [
  {
    id: 'bf-predict-001',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Fix the Mint Position Transaction',
    description: 'This mint transaction has two bugs: swapped sentinel values and wrong module name. Find and fix both.',
    learningObjective: 'Correctly apply sentinel encoding and module paths in PTBs.',
    estimatedTime: 6,
    baseXP: 70,
    perfectScoreXP: 30,
    hints: ['UP: lower=strike, higher=POS_INF.', 'Mint is in the predict module, not predict_manager.'],
    explanation: 'Bug 1: Sentinels swapped — UP should use lower=strike, higher=POS_INF. Bug 2: mint is predict::mint, not predict_manager::mint.',
    buggyCode: `const lowerStrike = direction === 'UP' ? NEG_INF : strike.toString();
const higherStrike = direction === 'DOWN' ? POS_INF : strike.toString();
tx.moveCall({ target: \`\${PACKAGE_ID}::predict_manager::mint\` });`,
    correctCode: `const lowerStrike = direction === 'DOWN' ? NEG_INF : strike.toString();
const higherStrike = direction === 'UP' ? POS_INF : strike.toString();
tx.moveCall({ target: \`\${PACKAGE_ID}::predict::mint\` });`,
    bugs: [
      { lineNumber: 1, bugType: 'logic', description: 'Sentinel values swapped for UP/DOWN.', hint: 'UP: lower=strike, higher=POS_INF.' },
      { lineNumber: 3, bugType: 'logic', description: 'Wrong module: predict_manager vs predict.', hint: 'predict::mint, not predict_manager::mint.' },
    ],
    allowPartialCredit: true,
    mustFixAll: true,
    language: 'typescript',
    highlightBugLines: true,
  },
  {
    id: 'bf-predict-002',
    type: 'bug_fix',
    difficulty: 'intermediate',
    topic: 'deepbook_predict',
    title: 'Fix the Deposit Transaction',
    description: 'The deposit transaction is missing the typeArguments and uses the wrong target module. Fix both issues.',
    learningObjective: 'Build correct Move call targets with type arguments for generic functions.',
    estimatedTime: 5,
    baseXP: 60,
    perfectScoreXP: 25,
    hints: ['deposit is in predict_manager, not predict.', 'Generic functions need typeArguments: [DUSDC_TYPE].'],
    explanation: 'Bug 1: deposit lives in predict_manager, not predict. Bug 2: deposit is generic over the coin type and requires typeArguments: [DUSDC_TYPE].',
    buggyCode: `// BUG 1: Wrong module
tx.moveCall({
  target: \`\${PACKAGE_ID}::predict::deposit\`,
  // BUG 2: Missing typeArguments
  arguments: [tx.object(managerId), coin],
});`,
    correctCode: `tx.moveCall({
  target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [tx.object(managerId), coin],
});`,
    bugs: [
      { lineNumber: 3, bugType: 'logic', description: 'Wrong module: deposit is in predict_manager, not predict.' },
      { lineNumber: 4, bugType: 'syntax', description: 'Missing typeArguments: [DUSDC_TYPE] for generic deposit function.' },
    ],
    allowPartialCredit: true,
    mustFixAll: true,
    language: 'typescript',
    highlightBugLines: true,
  },
  {
    id: 'bf-predict-003',
    type: 'bug_fix',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Fix the Atomic Deposit+Mint',
    description: 'This deposit-and-mint transaction has a coin handling bug and a missing argument. Fix both.',
    learningObjective: 'Build correct atomic PTBs with proper coin management.',
    estimatedTime: 7,
    baseXP: 75,
    perfectScoreXP: 35,
    hints: ['splitCoins returns an array — destructure with [coin].', 'The mint call needs CLOCK_ID as the last argument.'],
    explanation: 'Bug 1: splitCoins returns a tuple — you need const [coin] = tx.splitCoins(...), not const coin = tx.splitCoins(...). Bug 2: predict::mint requires the Sui Clock (0x6) as the last argument for expiry validation.',
    buggyCode: `// BUG 1: splitCoins returns array, not single value
const coin = tx.splitCoins(tx.object(coinId), [amount]);
tx.moveCall({
  target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [tx.object(managerId), coin],
});
// BUG 2: Missing CLOCK_ID argument
tx.moveCall({
  target: \`\${PACKAGE_ID}::predict::mint\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [tx.object(PREDICT_ID), tx.object(managerId), tx.object(oracleId), rangeKey, tx.pure.u64(quantity)],
});`,
    correctCode: `const [coin] = tx.splitCoins(tx.object(coinId), [amount]);
tx.moveCall({
  target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [tx.object(managerId), coin],
});
tx.moveCall({
  target: \`\${PACKAGE_ID}::predict::mint\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [tx.object(PREDICT_ID), tx.object(managerId), tx.object(oracleId), rangeKey, tx.pure.u64(quantity), tx.object(CLOCK_ID)],
});`,
    bugs: [
      { lineNumber: 2, bugType: 'syntax', description: 'splitCoins returns an array — must destructure with [coin].' },
      { lineNumber: 12, bugType: 'logic', description: 'Missing tx.object(CLOCK_ID) as the last argument to predict::mint.' },
    ],
    allowPartialCredit: true,
    mustFixAll: true,
    language: 'typescript',
    highlightBugLines: true,
  },
];

const predictOutputPredictionExercises: OutputPredictionExercise[] = [
  {
    id: 'op-predict-001',
    type: 'output_prediction',
    difficulty: 'advanced',
    topic: 'deepbook_predict',
    title: 'Position Direction Detection',
    description: 'Predict the output of getPositionDirection for given strike values.',
    learningObjective: 'Trace through sentinel value comparisons to determine position direction.',
    estimatedTime: 3,
    baseXP: 50,
    perfectScoreXP: 25,
    hints: ['NEG_INF is "0", POS_INF is "18446744073709551615".', 'Check lowerStrike first, then higherStrike.'],
    explanation: 'lowerStrike === "0" matches NEG_INF, so the function returns "DOWN". The check order matters: NEG_INF is checked first.',
    code: `const NEG_INF = '0';
const POS_INF = '18446744073709551615';

function getPositionDirection(lower: string, higher: string): string {
  if (lower === NEG_INF) return 'DOWN';
  if (higher === POS_INF) return 'UP';
  return 'RANGE';
}

console.log(getPositionDirection('0', '45000000000000'));`,
    language: 'typescript',
    correctOutput: 'DOWN',
    outputType: 'value',
    answerFormat: 'multiple_choice',
    multipleChoiceOptions: ['UP', 'DOWN', 'RANGE', 'Error'],
  },
];

// Add Predict exercises to main arrays
codeCompletionExercises.push(...predictCodeCompletionExercises);
bugFixExercises.push(...predictBugFixExercises);
multipleChoiceExercises.push(...predictMultipleChoiceExercises);
outputPredictionExercises.push(...predictOutputPredictionExercises);

// ============================================================================
// EXPORT ALL EXERCISES
// ============================================================================

export const allExercises: Exercise[] = [
  ...codeCompletionExercises,
  ...bugFixExercises,
  ...multipleChoiceExercises,
  ...outputPredictionExercises
];

// Helper functions
export function getExerciseById(id: string): Exercise | undefined {
  return allExercises.find(ex => ex.id === id);
}

export function getExercisesByType(type: string): Exercise[] {
  return allExercises.filter(ex => ex.type === type);
}

export function getExercisesByTopic(topic: string): Exercise[] {
  return allExercises.filter(ex => ex.topic === topic);
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return allExercises.filter(ex => ex.difficulty === difficulty);
}

export function getRandomExercise(): Exercise {
  return allExercises[Math.floor(Math.random() * allExercises.length)];
}

export function getRandomExerciseByType(type: string): Exercise | undefined {
  const filtered = getExercisesByType(type);
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : undefined;
}
