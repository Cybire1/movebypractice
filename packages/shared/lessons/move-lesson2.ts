import { LessonContent } from '../types/lesson';

export const moveLesson2: LessonContent = {
  id: 'move-2',
  title: 'Mastering Move Types',
  description: 'Deep dive into Move\'s type system: integer types, booleans, addresses, vectors, options, strings, type casting, and constants.',
  difficulty: 'beginner',
  xpReward: 150,
  order: 2,
  language: 'move',
  prerequisiteLessons: ['move-1'],

  narrative: {
    welcomeMessage: "Now that you can write basic Move modules, it's time to master the type system. Move's types are your building blocks for safe, expressive smart contracts. From tiny u8 bytes to massive u256 numbers, from raw byte vectors to proper strings, you'll learn when and how to use each type.",
    quizTransition: "You've explored the full range of Move types. Let's put your knowledge to the test...",
    practiceTransition: "Time to build a module that exercises multiple Move types. Fill in the blanks to create a type-rich contract!",
    celebrationMessage: "Brilliant! You've mastered Move's type system. You can now confidently choose the right type for any situation.",
    nextLessonTease: "Next lesson: control flow! You'll learn if/else, loops, abort, assert, and more to make your contracts truly dynamic.",
  },

  teachingSections: [
    {
      sectionTitle: 'Integer Types & Casting',
      slides: [
        {
          title: 'The Integer Family',
          emoji: '\u{1F522}',
          content: "Move provides six unsigned integer types: u8 (1 byte, 0-255), u16 (2 bytes, 0-65535), u32 (4 bytes, 0-4.29 billion), u64 (8 bytes, up to ~18.4 quintillion), u128 (16 bytes), and u256 (32 bytes). All integers in Move are unsigned, meaning they can never be negative. This is a deliberate safety choice that eliminates entire classes of bugs related to negative number handling. The most commonly used type in Sui contracts is u64, which is the default for amounts, balances, and timestamps.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'u8', label: 'u8', emoji: '\u{1F4A7}' },
                { id: 'u64', label: 'u64', emoji: '\u{1F4B0}' },
                { id: 'u128', label: 'u128', emoji: '\u{1F4CA}' },
                { id: 'u256', label: 'u256', emoji: '\u{1F512}' },
              ],
              targets: [
                { id: 'flags', label: 'Small values, flags, percentages (0-255)' },
                { id: 'balances', label: 'Token balances, timestamps, counters' },
                { id: 'defi', label: 'DeFi precision, large intermediate calculations' },
                { id: 'crypto', label: 'Cryptographic operations, hash values' },
              ],
              correctPairs: [
                { itemId: 'u8', targetId: 'flags' },
                { itemId: 'u64', targetId: 'balances' },
                { itemId: 'u128', targetId: 'defi' },
                { itemId: 'u256', targetId: 'crypto' },
              ],
            },
          },
        },
        {
          title: 'Type Casting with as',
          emoji: '\u{1F504}',
          content: "Move does not implicitly convert between integer types. If you have a u8 and need a u64, you must explicitly cast it using the `as` keyword. Casting to a larger type (widening) is always safe: `(my_u8 as u64)`. Casting to a smaller type (narrowing) can fail at runtime if the value doesn't fit: casting `300u64` to u8 would abort because 300 exceeds u8's max of 255. Always cast to larger types when doing arithmetic to avoid overflow, then cast back to the target type if needed.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun casting_examples() {\n    let small: u8 = 42;\n    let medium: u64 = (small as u64);  // Safe: widening\n\n    let big: u64 = 1000;\n    // let bad: u8 = (big as u8);  // ABORT! 1000 > 255\n\n    // Safe pattern: arithmetic in larger type, then narrow\n    let a: u8 = 200;\n    let b: u8 = 100;\n    let sum_wide: u64 = (a as u64) + (b as u64);  // 300 as u64\n    // sum_wide fits in u64 but NOT in u8!\n\n    // Integer literals with type suffix\n    let x = 42u8;\n    let y = 1_000_000u64;  // Underscores for readability\n    let z = 0xFF;  // Hex literal (255 as u8)\n}`,
              highlights: [
                { line: 3, explanation: "Widening cast from u8 to u64 is always safe. The value 42 fits easily in u64." },
                { line: 6, explanation: "Narrowing cast: 1000 does not fit in u8 (max 255), so this would abort at runtime." },
                { line: 11, explanation: "Best practice: cast to a wider type before arithmetic to prevent overflow during computation." },
                { line: 15, explanation: "Type suffixes like `42u8` explicitly specify the literal type. Without a suffix, Move infers from context." },
                { line: 16, explanation: "Underscores in numeric literals improve readability. `1_000_000u64` equals `1000000u64`." },
              ],
            },
          },
        },
        {
          title: 'Arithmetic & Overflow Safety',
          emoji: '\u{1F6E1}\u{FE0F}',
          content: "Move automatically checks for arithmetic overflow and underflow at runtime. If you add two u64 values and the result exceeds the u64 maximum, the transaction aborts. If you subtract and the result would be negative, it also aborts because unsigned integers cannot be negative. This is a safety feature: in other languages like Solidity (pre-0.8), overflow would silently wrap around, leading to devastating bugs. In Move, you get an automatic abort, which is safe but means you should think carefully about arithmetic ranges.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Addition Overflow', content: 'If `a + b` exceeds the max value of the type (e.g., u64 max is 18,446,744,073,709,551,615), the transaction aborts with an arithmetic error.' },
                { label: 'Subtraction Underflow', content: 'If `a - b` where `b > a`, the result would be negative. Since Move only has unsigned integers, this aborts.' },
                { label: 'Multiplication Overflow', content: '`a * b` can overflow if the product exceeds the type max. Cast to a wider type first: `(a as u128) * (b as u128)`.' },
                { label: 'Division by Zero', content: '`a / 0` and `a % 0` abort at runtime. Always check the divisor before dividing.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-004',
    },
    {
      sectionTitle: 'Vectors, Options & Strings',
      slides: [
        {
          title: 'vector<T>: Dynamic Arrays',
          emoji: '\u{1F4DA}',
          content: "The `vector<T>` type is Move's dynamic array. It can hold zero or more elements of any single type T. Vectors are the most versatile collection type in Move and are used everywhere: `vector<u8>` for raw bytes, `vector<address>` for participant lists, `vector<u64>` for numeric sequences. You create vectors with `vector::empty()` or the literal syntax `vector[1, 2, 3]`. Common operations include `push_back`, `pop_back`, `length`, `borrow` (read element), and `borrow_mut` (modify element).",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `use std::vector;\n\nfun vector_operations() {\n    // Create vectors\n    let mut v: vector<u64> = vector::empty();\n    let v2 = vector[10, 20, 30];  // Literal syntax\n\n    // Add elements\n    vector::push_back(&mut v, 100);\n    vector::push_back(&mut v, 200);\n    // v is now [100, 200]\n\n    // Read elements (0-indexed)\n    let first = *vector::borrow(&v, 0);  // 100\n    let len = vector::length(&v);  // 2\n\n    // Remove last element\n    let last = vector::pop_back(&mut v);  // 200\n\n    // Byte strings are vector<u8>\n    let name: vector<u8> = b"Alice";\n}`,
              highlights: [
                { line: 5, explanation: "`vector::empty()` creates a new empty vector. The `mut` keyword is required because we'll modify it." },
                { line: 6, explanation: "Literal syntax `vector[10, 20, 30]` creates a vector with initial elements. All elements must be the same type." },
                { line: 9, explanation: "`push_back` adds an element to the end. Takes a mutable reference `&mut v` since it modifies the vector." },
                { line: 14, explanation: "`borrow` returns a reference to an element by index. The `*` dereferences it to get the value." },
                { line: 21, explanation: "Byte string literals `b\"...\"` create `vector<u8>` values. This is the low-level way to handle text." },
              ],
            },
          },
        },
        {
          title: 'Option<T>: Maybe a Value',
          emoji: '\u{2753}',
          content: "The `Option<T>` type from the standard library represents a value that may or may not exist. It's similar to `Optional` in Java or `Option` in Rust. An option is either `option::some(value)` containing a value, or `option::none()` representing absence. Options are critical in Sui Move for nullable fields in structs, optional function parameters, and safe lookups that might fail. You can check if an option contains a value with `option::is_some()` and extract the value with `option::extract()` or `option::destroy_some()`.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `use std::option::{Self, Option};\n\npublic struct UserProfile has key, store {\n    id: UID,\n    name: vector<u8>,\n    bio: Option<vector<u8>>,   // Bio is optional\n    age: Option<u8>,           // Age is optional\n}\n\nfun work_with_options() {\n    let some_val: Option<u64> = option::some(42);\n    let no_val: Option<u64> = option::none();\n\n    // Check and extract\n    if (option::is_some(&some_val)) {\n        let value = option::extract(&mut some_val);  // 42\n    };\n\n    // Provide a default if empty\n    let result = option::get_with_default(&no_val, 0);  // 0\n\n    // Destroy to get the inner value (aborts if none)\n    let extracted = option::destroy_some(some_val);\n}`,
              highlights: [
                { line: 1, explanation: "Import both the module `Self` (for functions like `option::some`) and the type `Option` (for type annotations)." },
                { line: 6, explanation: "`Option<vector<u8>>` means this field might or might not have a bio string." },
                { line: 11, explanation: "`option::some(42)` wraps the value 42 in an Option. The type is `Option<u64>`." },
                { line: 12, explanation: "`option::none()` creates an empty Option. The type must be inferred or annotated." },
                { line: 20, explanation: "`get_with_default` safely returns the contained value or a fallback. Never aborts." },
              ],
            },
          },
        },
        {
          title: 'Strings: ascii and utf8',
          emoji: '\u{1F4DD}',
          content: "While `vector<u8>` holds raw bytes, Move also provides proper string types through the standard library. `std::ascii::String` holds ASCII-only text (each byte 0-127) and is useful for identifiers and simple labels. `std::string::String` holds UTF-8 encoded text and supports the full Unicode character set. Both are wrappers around `vector<u8>` with validation. Use `ascii::string(bytes)` or `string::utf8(bytes)` to create them. If the bytes are invalid for the chosen encoding, the creation will abort at runtime.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'vector<u8> (raw bytes)', content: 'No encoding validation. Created with `b"text"`. Use for binary data, hashes, or when you control the input and don\'t need encoding safety.' },
                { label: 'ascii::String', content: 'Validated ASCII text (bytes 0-127 only). Created with `ascii::string(b"hello")`. Aborts if any byte > 127. Good for identifiers and metadata keys.' },
                { label: 'string::String (UTF-8)', content: 'Validated UTF-8 text supporting all Unicode. Created with `string::utf8(b"hello")`. Aborts on invalid UTF-8 sequences. Best for user-facing text content.' },
                { label: 'Conversion', content: 'Convert between types: `string::from_ascii(ascii_str)` to go from ASCII to UTF-8. Use `string::bytes(&str)` to get the underlying `&vector<u8>`.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-005',
    },
    {
      sectionTitle: 'Constants & Best Practices',
      slides: [
        {
          title: 'Declaring Constants',
          emoji: '\u{1F4CC}',
          content: "Constants in Move are declared with the `const` keyword at the module level (not inside functions). They must have a type annotation and a compile-time value. Constants can be integers, booleans, addresses, or byte vectors. By convention, constants use UPPER_SNAKE_CASE names. A particularly important pattern in Sui Move is using constants for error codes. Error code constants conventionally start with `E` (like `ENotAuthorized`) and are used with `abort` and `assert!` to provide meaningful error messages.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::config {\n    // Numeric constants\n    const MAX_SUPPLY: u64 = 1_000_000;\n    const FEE_BASIS_POINTS: u64 = 250;  // 2.5%\n    const VERSION: u8 = 1;\n\n    // Boolean constant\n    const IS_TESTNET: bool = true;\n\n    // Address constant\n    const ADMIN: address = @0xABCD;\n\n    // Byte vector constant\n    const DEFAULT_NAME: vector<u8> = b"Unnamed";\n\n    // Error code constants (convention: start with E)\n    const ENotAuthorized: u64 = 0;\n    const EExceedsMaxSupply: u64 = 1;\n    const EInvalidAmount: u64 = 2;\n\n    public entry fun mint(amount: u64, ctx: &mut TxContext) {\n        assert!(tx_context::sender(ctx) == ADMIN, ENotAuthorized);\n        assert!(amount <= MAX_SUPPLY, EExceedsMaxSupply);\n        assert!(amount > 0, EInvalidAmount);\n        // ... minting logic\n    }\n}`,
              highlights: [
                { line: 3, explanation: "Numeric constants use UPPER_SNAKE_CASE. Underscores in numbers improve readability." },
                { line: 11, explanation: "Address constants use the `@0x...` literal syntax. Useful for hardcoded admin addresses." },
                { line: 17, explanation: "Error constants start with `E` by convention. They are u64 values used with `abort` and `assert!`." },
                { line: 22, explanation: "`assert!(condition, error_code)` aborts with the error code if the condition is false." },
              ],
            },
          },
        },
        {
          title: 'Type Inference & let Bindings',
          emoji: '\u{1F9E0}',
          content: "Move has strong type inference for local variables. When you write `let x = 42`, the compiler infers the type from context. If no context determines the type, integer literals default to u64. You can always add an explicit annotation: `let x: u8 = 42`. The `let mut` binding creates a mutable variable that can be reassigned. Without `mut`, variables are immutable by default. This immutability-by-default catches many accidental mutation bugs at compile time.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'let', label: 'let x = 5', emoji: '\u{1F512}' },
                { id: 'letmut', label: 'let mut x = 5', emoji: '\u{1F513}' },
                { id: 'typed', label: 'let x: u8 = 5', emoji: '\u{1F3AF}' },
                { id: 'suffix', label: 'let x = 5u128', emoji: '\u{1F522}' },
              ],
              targets: [
                { id: 'immutable', label: 'Immutable binding, type inferred as u64' },
                { id: 'mutable', label: 'Mutable binding, can be reassigned' },
                { id: 'explicit', label: 'Explicitly typed as u8' },
                { id: 'literal', label: 'Type set by integer suffix (u128)' },
              ],
              correctPairs: [
                { itemId: 'let', targetId: 'immutable' },
                { itemId: 'letmut', targetId: 'mutable' },
                { itemId: 'typed', targetId: 'explicit' },
                { itemId: 'suffix', targetId: 'literal' },
              ],
            },
          },
        },
        {
          title: 'Choosing the Right Type',
          emoji: '\u{1F3AF}',
          content: "Choosing the right type is crucial for gas efficiency, safety, and code clarity. Use u64 for most numeric values (balances, amounts, timestamps). Use u8 for small bounded values like percentages or version numbers. Use u128 or u256 for DeFi math that might overflow u64. Use `vector<u8>` or `string::String` for text data. Use `Option<T>` for nullable fields. Use `bool` for flags and conditions. Use `address` for wallet addresses and object IDs. When in doubt, prefer larger integer types to avoid overflow.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Token Balances', content: 'Use u64. Sui\'s native token uses u64 for MIST amounts. Most DeFi protocols follow this convention.' },
                { label: 'Percentages', content: 'Use u64 with basis points (1% = 100, 0.01% = 1). This avoids floating point entirely. Max 10000 = 100%.' },
                { label: 'Timestamps', content: 'Use u64. Sui\'s clock module returns milliseconds since epoch as u64, which won\'t overflow for billions of years.' },
                { label: 'User-Facing Text', content: 'Use `string::String` (UTF-8) for display names, descriptions, and metadata that users see.' },
                { label: 'Internal Identifiers', content: 'Use `ascii::String` or `vector<u8>` for keys, tags, and identifiers that don\'t need Unicode support.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-006',
    },
  ],

  quiz: [
    {
      question: 'What happens when you cast a u64 value of 500 to u8 using `(500u64 as u8)`?',
      options: [
        'It wraps around to 244 (500 - 256)',
        'It compiles but returns 0',
        'The transaction aborts at runtime because 500 exceeds u8 max (255)',
        'It silently truncates to 255',
      ],
      correctAnswer: 2,
      explanation: 'Move performs checked casts. When narrowing from u64 to u8, if the value exceeds the target type\'s maximum (255 for u8), the transaction aborts at runtime. Move never silently truncates or wraps around values.',
      weaknessTopic: 'move-types',
      practiceHint: 'Move prioritizes safety: what happens when a value cannot fit in the target type?',
    },
    {
      question: 'How do you create an empty optional value of type Option<u64> in Move?',
      options: [
        'let x: Option<u64> = null;',
        'let x: Option<u64> = option::none();',
        'let x: Option<u64> = 0;',
        'let x: Option<u64> = Option::empty();',
      ],
      correctAnswer: 1,
      explanation: 'In Move, `option::none()` creates an empty Option. There is no `null` keyword in Move. The Option type from the standard library uses `option::none()` for absence and `option::some(value)` for presence.',
      weaknessTopic: 'move-types',
      practiceHint: 'Move uses Option from std::option, not null. What function creates an empty Option?',
    },
    {
      question: 'What is the difference between `vector<u8>` and `string::String` in Move?',
      options: [
        'They are identical types with different names',
        '`vector<u8>` holds raw bytes with no validation, while `string::String` validates UTF-8 encoding',
        '`string::String` is mutable but `vector<u8>` is not',
        '`vector<u8>` can only hold ASCII, while `string::String` holds any bytes',
      ],
      correctAnswer: 1,
      explanation: '`vector<u8>` holds raw bytes without any encoding validation. `string::String` wraps `vector<u8>` but validates that the bytes form valid UTF-8 when created. If you pass invalid UTF-8 bytes to `string::utf8()`, it aborts.',
      weaknessTopic: 'move-types',
      practiceHint: 'Think about what additional guarantee string::String provides over raw bytes.',
    },
    {
      question: 'Which of the following is the correct way to declare a constant error code in Sui Move?',
      options: [
        'error ENotFound = 404;',
        'const ENotFound: u64 = 1;',
        'let ENotFound = 1;',
        'static ERROR_NOT_FOUND: u64 = 1;',
      ],
      correctAnswer: 1,
      explanation: 'Constants in Move are declared with `const NAME: Type = value;` at the module level. Error codes by convention start with `E` and are of type u64. There is no `error`, `static`, or `let` at module level in Move.',
      weaknessTopic: 'move-types',
      practiceHint: 'Constants use the `const` keyword. What is the naming convention for error codes?',
    },
    {
      question: 'What does `let mut v = vector::empty<u64>();` do?',
      options: [
        'Creates an immutable empty vector of u64 values',
        'Creates a mutable empty vector of u64 values that can have elements added to it',
        'Creates a vector with one element: 0',
        'Compilation error because vectors must have initial elements',
      ],
      correctAnswer: 1,
      explanation: '`let mut` creates a mutable binding, allowing the vector to be modified (push, pop, etc.). `vector::empty<u64>()` creates a new empty vector parameterized with the u64 type. Without `mut`, you could not call `push_back` on the vector.',
      weaknessTopic: 'move-types',
      practiceHint: 'Focus on the `mut` keyword. What does it enable that an immutable binding does not?',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module type_master::registry {
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // TODO 1: Declare an error constant EInvalidAge of type u64 with value 0


    // TODO 2: Declare a constant MAX_NAME_LENGTH of type u64 with value 64


    // TODO 3: Declare a constant DEFAULT_SCORE of type u8 with value 100


    // TODO 4: Define a public struct called Player with abilities: key, store
    // Fields:
    //   id: UID
    //   name: String (UTF-8)
    //   age: u8
    //   score: u64
    //   bio: Option<String>
    //   tags: vector<u8>


    // TODO 5: Write a public entry function called \`create_player\`
    // Parameters: name_bytes: vector<u8>, age: u8, ctx: &mut TxContext
    // It should:
    //   - Assert age > 0 and age < 150 using EInvalidAge
    //   - Create a Player with:
    //     - name: string::utf8(name_bytes)
    //     - age: age
    //     - score: (DEFAULT_SCORE as u64)  (cast u8 to u64)
    //     - bio: option::none()
    //     - tags: an empty vector<u8>
    //   - Transfer the Player to the sender


    // TODO 6: Write a public entry function called \`set_bio\`
    // Parameters: player: &mut Player, bio_bytes: vector<u8>
    // It should set player.bio to option::some(string::utf8(bio_bytes))


    // TODO 7: Write a public fun called \`get_score_as_u128\`
    // Parameters: player: &Player
    // Returns: u128
    // It should return the player's score cast to u128

}`,

  solution: `module type_master::registry {
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // TODO 1: Declare an error constant EInvalidAge of type u64 with value 0
    const EInvalidAge: u64 = 0;

    // TODO 2: Declare a constant MAX_NAME_LENGTH of type u64 with value 64
    const MAX_NAME_LENGTH: u64 = 64;

    // TODO 3: Declare a constant DEFAULT_SCORE of type u8 with value 100
    const DEFAULT_SCORE: u8 = 100;

    // TODO 4: Define a public struct called Player with abilities: key, store
    // Fields:
    //   id: UID
    //   name: String (UTF-8)
    //   age: u8
    //   score: u64
    //   bio: Option<String>
    //   tags: vector<u8>
    public struct Player has key, store {
        id: UID,
        name: String,
        age: u8,
        score: u64,
        bio: Option<String>,
        tags: vector<u8>,
    }

    // TODO 5: Write a public entry function called \`create_player\`
    // Parameters: name_bytes: vector<u8>, age: u8, ctx: &mut TxContext
    // It should:
    //   - Assert age > 0 and age < 150 using EInvalidAge
    //   - Create a Player with:
    //     - name: string::utf8(name_bytes)
    //     - age: age
    //     - score: (DEFAULT_SCORE as u64)  (cast u8 to u64)
    //     - bio: option::none()
    //     - tags: an empty vector<u8>
    //   - Transfer the Player to the sender
    public entry fun create_player(
        name_bytes: vector<u8>,
        age: u8,
        ctx: &mut TxContext,
    ) {
        assert!(age > 0 && age < 150, EInvalidAge);
        let player = Player {
            id: object::new(ctx),
            name: string::utf8(name_bytes),
            age,
            score: (DEFAULT_SCORE as u64),
            bio: option::none(),
            tags: vector::empty(),
        };
        transfer::transfer(player, tx_context::sender(ctx));
    }

    // TODO 6: Write a public entry function called \`set_bio\`
    // Parameters: player: &mut Player, bio_bytes: vector<u8>
    // It should set player.bio to option::some(string::utf8(bio_bytes))
    public entry fun set_bio(player: &mut Player, bio_bytes: vector<u8>) {
        player.bio = option::some(string::utf8(bio_bytes));
    }

    // TODO 7: Write a public fun called \`get_score_as_u128\`
    // Parameters: player: &Player
    // Returns: u128
    // It should return the player's score cast to u128
    public fun get_score_as_u128(player: &Player): u128 {
        (player.score as u128)
    }
}`,

  hints: [
    'Constants are declared at module level with `const NAME: Type = value;`. Error codes start with `E` and are u64.',
    'Structs use `public struct Name has ability1, ability2 { field: Type, ... }`. Option fields use `Option<T>` and String uses `String` from std::string.',
    'Use `assert!(condition, error_code)` for validation. The `as` keyword casts between integer types: `(val as u64)`.',
    'For the bio setter, wrap the UTF-8 string in `option::some(...)`. For get_score_as_u128, cast with `(player.score as u128)`.',
  ],
};
