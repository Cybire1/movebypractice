import { LessonContent } from '@/app/types/lesson';

export const moveLesson2: LessonContent = {
  id: 'move-2',
  title: 'Types & Data: Your Building Blocks',
  description: 'Everything in your smart contract is built from types — numbers, text, lists, and more. This lesson shows you what types Move gives you, how to pick the right one, and how to avoid common traps. No prior type-system knowledge needed.',
  difficulty: 'beginner',
  xpReward: 150,
  order: 2,
  language: 'move',
  prerequisiteLessons: ['move-1'],

  narrative: {
    welcomeMessage: "Hey! In the last lesson you wrote your first Move module — nice work. Now let's talk about the stuff that goes *inside* your modules: the data. Every number, every name, every list of items in your smart contract is a \"type.\" Picking the right type is like picking the right container for your leftovers — use something too small and it overflows, use something too big and you're wasting space. Don't worry, by the end of this lesson you'll know exactly which type to reach for.",
    quizTransition: "Nice, you've seen all the major types Move has to offer. Let's do a quick check to see what clicked...",
    practiceTransition: "Alright, time to build something real! You're going to create a player registry that uses integers, strings, options, vectors, constants, and type casting — all in one module. The hints will walk you through it step by step.",
    celebrationMessage: "You did it! You can now confidently pick the right type for any situation. That's a skill that separates beginners from builders.",
    nextLessonTease: "Next up: control flow! You'll learn if/else, loops, abort, assert, and more — the logic that makes your contracts actually *do* things.",
  },

  teachingSections: [
    {
      sectionTitle: 'Integer Types & Casting',
      slides: [
        {
          title: 'The Integer Family',
          emoji: '\u{1F522}',
          content: "Let's start with numbers — the most common type in any smart contract. Move gives you six sizes of unsigned integers (\"unsigned\" just means they can't be negative — no minus signs allowed). Think of it like shoe sizes vs. distances: you don't need the same measuring tool for both.\n\n- **u8** (1 byte): Holds 0-255. Perfect for tiny values like someone's age or a percentage.\n- **u16** (2 bytes): Holds 0-65,535. Good for slightly bigger bounded values.\n- **u32** (4 bytes): Holds 0 to about 4.3 billion.\n- **u64** (8 bytes): Holds 0 to about 18.4 quintillion. This is the workhorse — use it for balances, timestamps, and counters.\n- **u128** (16 bytes): Really big numbers for DeFi math where u64 might overflow.\n- **u256** (32 bytes): Enormous numbers for cryptographic operations.\n\nWhy so many sizes? Efficiency and safety. If you know a value will never exceed 255, using u8 communicates that intent clearly. But when in doubt, u64 is your safe default.",
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
          content: "Here's something that trips up beginners: Move will NOT automatically convert between number types for you. If you have a u8 and need a u64, you have to say so explicitly using the `as` keyword. It's like converting inches to centimeters — you have to be intentional about it.\n\nThis comes in two flavors:\n- **Widening** (small to big, like u8 to u64): Always safe. The value fits easily in the bigger container.\n- **Narrowing** (big to small, like u64 to u8): Dangerous! If the value is too big to fit, your transaction crashes immediately. Trying to squeeze 500 into a u8 (max 255) is like trying to pour a gallon into a cup.\n\nThe safe pattern: do your math in a bigger type first, then narrow down only when you're sure the result fits.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun casting_examples() {\n    let small: u8 = 42;\n    let medium: u64 = (small as u64);  // Safe: widening\n\n    let big: u64 = 1000;\n    // let bad: u8 = (big as u8);  // ABORT! 1000 > 255\n\n    // Safe pattern: arithmetic in larger type, then narrow\n    let a: u8 = 200;\n    let b: u8 = 100;\n    let sum_wide: u64 = (a as u64) + (b as u64);  // 300 as u64\n    // sum_wide fits in u64 but NOT in u8!\n\n    // Integer literals with type suffix\n    let x = 42u8;\n    let y = 1_000_000u64;  // Underscores for readability\n    let z = 0xFF;  // Hex literal (255 as u8)\n}`,
              highlights: [
                { line: 3, explanation: "Widening cast: going from u8 to u64 is always safe. 42 is tiny compared to what u64 can hold. Think of it like moving from a small box to a bigger one — nothing gets lost." },
                { line: 6, explanation: "Narrowing cast: 1000 doesn't fit in u8 (max 255), so this would crash your transaction. Move refuses to silently lose data — it'd rather stop than give you a wrong answer." },
                { line: 11, explanation: "This is the safe pattern! Cast both values UP to u64 before adding. 200 + 100 = 300 would overflow u8, but fits fine in u64. Always do math in the bigger type." },
                { line: 15, explanation: "You can tag a number with its type directly: `42u8` means \"42 as a u8.\" Without the suffix, Move figures out the type from context (and defaults to u64 if nothing tells it otherwise)." },
                { line: 16, explanation: "Underscores in numbers are just for your eyes — `1_000_000u64` is the same as `1000000u64`. Use them to keep big numbers readable!" },
              ],
            },
          },
        },
        {
          title: 'Arithmetic & Overflow Safety',
          emoji: '\u{1F6E1}\u{FE0F}',
          content: "Here's one of Move's best safety features: it automatically checks your math at runtime. If you add two numbers and the result is too big for the type, the transaction aborts. If you subtract and would get a negative number, it aborts (remember, no negative numbers in Move!). In older smart contract languages like Solidity (before version 0.8), overflow would silently \"wrap around\" — meaning `255 + 1` would become `0`. That caused millions of dollars in bugs. Move says \"nope\" and just stops the transaction, which is much safer. The tradeoff: you need to think about whether your math might overflow, and use a bigger type if it could.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Addition Overflow', content: 'If `a + b` exceeds the max value of the type (e.g., u64 max is 18,446,744,073,709,551,615), the transaction aborts with an arithmetic error. Fix: cast to a wider type before adding.' },
                { label: 'Subtraction Underflow', content: 'If `a - b` where `b > a`, the result would be negative. Since Move only has unsigned integers, this aborts. Fix: always check that `a >= b` before subtracting.' },
                { label: 'Multiplication Overflow', content: '`a * b` can overflow if the product exceeds the type max. This sneaks up on you — two medium-sized numbers can multiply into something huge. Fix: cast to a wider type first: `(a as u128) * (b as u128)`.' },
                { label: 'Division by Zero', content: '`a / 0` and `a % 0` abort at runtime. Always check the divisor before dividing. This one is the same as every other language — dividing by zero is never allowed.' },
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
          content: "Think of a `vector` as a shopping list you can add to and remove from. It's Move's dynamic array — a growable, ordered collection of items that are all the same type. The `<T>` part just means \"of what\" — `vector<u64>` is a list of numbers, `vector<address>` is a list of wallet addresses, `vector<u8>` is a list of bytes (which is also how Move stores raw text!).\n\nYou can create one empty and fill it up, or start it pre-loaded with items. The key operations are: `push_back` (add to the end), `pop_back` (remove from the end), `borrow` (peek at an element), and `length` (how many items). Vectors are zero-indexed, meaning the first item is at position 0, the second at position 1, and so on.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `use std::vector;\n\nfun vector_operations() {\n    // Create vectors\n    let mut v: vector<u64> = vector::empty();\n    let v2 = vector[10, 20, 30];  // Literal syntax\n\n    // Add elements\n    vector::push_back(&mut v, 100);\n    vector::push_back(&mut v, 200);\n    // v is now [100, 200]\n\n    // Read elements (0-indexed)\n    let first = *vector::borrow(&v, 0);  // 100\n    let len = vector::length(&v);  // 2\n\n    // Remove last element\n    let last = vector::pop_back(&mut v);  // 200\n\n    // Byte strings are vector<u8>\n    let name: vector<u8> = b"Alice";\n}`,
              highlights: [
                { line: 5, explanation: "`vector::empty()` creates a new, empty shopping list. We need `mut` because we plan to add items to it later. Without `mut`, Move won't let you change it — that's the immutability-by-default safety we learned about." },
                { line: 6, explanation: "Shortcut! `vector[10, 20, 30]` creates a vector that already has items in it. Every item must be the same type — you can't mix numbers and text in one vector." },
                { line: 9, explanation: "`push_back` adds an item to the end of the list. The `&mut v` part means \"I'm going to modify this vector\" — Move always makes you be explicit about changes." },
                { line: 14, explanation: "`borrow` lets you peek at an element by its index (position). The `*` at the front \"unwraps\" the reference to get the actual value. Index 0 = first item." },
                { line: 21, explanation: "Here's a neat trick: `b\"Alice\"` creates a `vector<u8>` from text. Each character becomes a byte. This is the low-level way Move handles text — we'll see proper string types next." },
              ],
            },
          },
        },
        {
          title: 'Option<T>: Maybe a Value',
          emoji: '\u{2753}',
          content: "Imagine a box that might be empty. You can't just reach in blindly — you have to check first. That's exactly what `Option<T>` is. It represents a value that might or might not exist.\n\nWhy do we need this? Because in smart contracts, lots of things are optional. A user profile might not have a bio yet. A search might not find a match. Instead of using some magic value like `0` or `\"\"` to mean \"nothing\" (which is confusing and error-prone), Move gives you `Option`: it's either `option::some(value)` (the box has something in it) or `option::none()` (the box is empty).\n\nImportant: there is NO `null` in Move. If you're coming from JavaScript, Python, or Java, forget about null. Option is the Move way to say \"this might not have a value.\"",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `use std::option::{Self, Option};\n\npublic struct UserProfile has key, store {\n    id: UID,\n    name: vector<u8>,\n    bio: Option<vector<u8>>,   // Bio is optional\n    age: Option<u8>,           // Age is optional\n}\n\nfun work_with_options() {\n    let some_val: Option<u64> = option::some(42);\n    let no_val: Option<u64> = option::none();\n\n    // Check and extract\n    if (option::is_some(&some_val)) {\n        let value = option::extract(&mut some_val);  // 42\n    };\n\n    // Provide a default if empty\n    let result = option::get_with_default(&no_val, 0);  // 0\n\n    // Destroy to get the inner value (aborts if none)\n    let extracted = option::destroy_some(some_val);\n}`,
              highlights: [
                { line: 1, explanation: "We import two things: `Self` gives us the functions (like `option::some`), and `Option` gives us the type name for annotations. You'll see this import pattern a lot in Move." },
                { line: 6, explanation: "`Option<vector<u8>>` means \"this field might have a bio, or it might not.\" When creating a profile without a bio, you'd set this to `option::none()`. Much clearer than an empty string!" },
                { line: 11, explanation: "`option::some(42)` puts the value 42 inside the box. Now the Option contains something. Think of it as wrapping a gift — the value is inside." },
                { line: 12, explanation: "`option::none()` creates an empty box. No value inside. The type annotation `Option<u64>` tells Move what *kind* of value could be inside (even though it's empty right now)." },
                { line: 20, explanation: "This is the safest way to use an Option: \"give me the value inside, but if it's empty, give me 0 instead.\" No crashes, no surprises. Use this when you have a sensible default." },
              ],
            },
          },
        },
        {
          title: 'Strings: ascii and utf8',
          emoji: '\u{1F4DD}',
          content: "Before we dive in, let's talk about what \"encoding\" means. Computers store everything as numbers (bytes). Encoding is the rule book for turning text into numbers and back. ASCII is the simple rule book: each letter gets a number from 0 to 127 (A=65, B=66, etc.). It only covers English letters, digits, and basic symbols. UTF-8 is the big rule book: it covers every writing system on Earth — Chinese, Arabic, emoji, you name it.\n\nMove gives you three ways to handle text:\n1. **`vector<u8>`** — Raw bytes. No validation. Created with `b\"text\"`. Like a plain envelope — you can put anything in it.\n2. **`ascii::String`** — Validated ASCII only. Will crash if you try to put non-ASCII characters in it. Good for simple identifiers.\n3. **`string::String`** — Validated UTF-8. Supports all languages and symbols. Best for user-facing text like display names.\n\nBoth string types are just `vector<u8>` under the hood, but with a safety check when you create them.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'vector<u8> (raw bytes)', content: 'No encoding validation. Created with `b"text"`. Use for binary data, hashes, or when you control the input and don\'t need encoding safety. Think of it as the "I know what I\'m doing" option.' },
                { label: 'ascii::String', content: 'Validated ASCII text (bytes 0-127 only). Created with `ascii::string(b"hello")`. Aborts if any byte > 127. Good for identifiers and metadata keys — things that will always be plain English text.' },
                { label: 'string::String (UTF-8)', content: 'Validated UTF-8 text supporting all Unicode. Created with `string::utf8(b"hello")`. Aborts on invalid UTF-8 sequences. Best for user-facing text — names, descriptions, anything people will read.' },
                { label: 'Conversion', content: 'Convert between types: `string::from_ascii(ascii_str)` upgrades ASCII to UTF-8 (always safe since ASCII is a subset of UTF-8). Use `string::bytes(&str)` to peek at the underlying `&vector<u8>`.' },
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
          content: "Constants are values you set in stone at the start and never change — like the speed limit on a highway. In Move, you declare them with the `const` keyword at the module level (outside of any function). They must have a type and a value that's known at compile time.\n\nBy convention, regular constants use UPPER_SNAKE_CASE (like `MAX_SUPPLY`). But there's one really important pattern in Sui Move: error code constants. These start with a capital `E` (like `ENotAuthorized`). You'll use them with `assert!` to give meaningful names to the reasons your contract might reject a transaction. Instead of just seeing \"error code 3,\" someone debugging can look up `EInvalidAmount` and immediately know what went wrong.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::config {\n    // Numeric constants\n    const MAX_SUPPLY: u64 = 1_000_000;\n    const FEE_BASIS_POINTS: u64 = 250;  // 2.5%\n    const VERSION: u8 = 1;\n\n    // Boolean constant\n    const IS_TESTNET: bool = true;\n\n    // Address constant\n    const ADMIN: address = @0xABCD;\n\n    // Byte vector constant\n    const DEFAULT_NAME: vector<u8> = b"Unnamed";\n\n    // Error code constants (convention: start with E)\n    const ENotAuthorized: u64 = 0;\n    const EExceedsMaxSupply: u64 = 1;\n    const EInvalidAmount: u64 = 2;\n\n    public entry fun mint(amount: u64, ctx: &mut TxContext) {\n        assert!(tx_context::sender(ctx) == ADMIN, ENotAuthorized);\n        assert!(amount <= MAX_SUPPLY, EExceedsMaxSupply);\n        assert!(amount > 0, EInvalidAmount);\n        // ... minting logic\n    }\n}`,
              highlights: [
                { line: 3, explanation: "A numeric constant. `UPPER_SNAKE_CASE` is the convention so you can spot constants at a glance. The underscores in `1_000_000` are just for readability — Move ignores them." },
                { line: 11, explanation: "An address constant using `@0x...` syntax. Hardcoding an admin address like this is common for simple contracts. In production, you'd usually use a more flexible approach." },
                { line: 17, explanation: "Error constants start with `E` by convention. They're u64 values you pass to `abort` or `assert!`. Naming them descriptively makes debugging SO much easier." },
                { line: 22, explanation: "`assert!(condition, error_code)` is your guard clause: if the condition is false, the transaction stops and reports the error code. Read it as: \"make sure this is true, otherwise fail with this error.\"" },
              ],
            },
          },
        },
        {
          title: 'Type Inference & let Bindings',
          emoji: '\u{1F9E0}',
          content: "Good news: you don't always have to write out the type! Move is smart enough to figure it out from context. When you write `let x = 42`, the compiler looks at how you use `x` and determines the type. If nothing gives it a hint, number literals default to u64.\n\nYou can always add an explicit type if you want to be clear: `let x: u8 = 42`. And there's one more thing — the `mut` keyword. By default, every variable in Move is immutable (can't be changed after creation). If you want to update a variable later, you need to say `let mut x = 5`. This immutability-by-default is another safety feature: it prevents you from accidentally changing something you didn't mean to.",
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
          content: "Let's see — with all these types, how do you actually pick the right one? Here's a simple cheat sheet:\n\n- **Most numbers** (balances, amounts, counters, timestamps): Use **u64**. It's the standard in Sui.\n- **Small bounded values** (age, percentage, version number): Use **u8**. It signals \"this value is small on purpose.\"\n- **Really big math** (DeFi calculations that might overflow u64): Use **u128** or **u256**.\n- **Text that users see** (names, descriptions): Use **string::String** (UTF-8).\n- **Internal identifiers** (tags, keys): Use **ascii::String** or **vector<u8>**.\n- **Something that might not exist** (optional bio, search result): Use **Option<T>**.\n- **Yes/no flags**: Use **bool**.\n- **Wallet addresses or object IDs**: Use **address**.\n\nWhen in doubt, go bigger on integers and use Option for anything that could be absent. It's better to be safe than to debug an overflow at 2 AM.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Token Balances', content: 'Use u64. Sui\'s native token uses u64 for MIST amounts (the smallest unit, like cents for dollars). Most DeFi protocols follow this convention, so sticking with u64 keeps your code compatible.' },
                { label: 'Percentages', content: 'Use u64 with basis points: 1% = 100, 0.01% = 1, 100% = 10,000. This avoids floating point entirely (Move doesn\'t have floats!). Basis points are the standard in finance for this exact reason.' },
                { label: 'Timestamps', content: 'Use u64. Sui\'s clock module returns milliseconds since epoch (Jan 1, 1970) as u64. At that size, it won\'t overflow for billions of years — so you\'re covered.' },
                { label: 'User-Facing Text', content: 'Use `string::String` (UTF-8) for display names, descriptions, and anything people will read. It supports every language and symbol, so your users can write in any language.' },
                { label: 'Internal Identifiers', content: 'Use `ascii::String` or `vector<u8>` for keys, tags, and identifiers that don\'t need Unicode support. They\'re simpler and signal that this is internal data, not user-facing text.' },
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
      question: 'You try to cast 500 from u64 to u8 with `(500u64 as u8)`. What happens?',
      options: [
        'It wraps around to 244 (500 - 256)',
        'It compiles but returns 0',
        'The transaction aborts at runtime because 500 exceeds u8 max (255)',
        'It silently truncates to 255',
      ],
      correctAnswer: 2,
      explanation: 'Move refuses to silently lose data. When you try to narrow a value that doesn\'t fit (500 into a u8 that maxes out at 255), the transaction aborts at runtime. This is a safety feature — in some other languages, the value would silently wrap around or truncate, which has caused millions of dollars in bugs. Move would rather crash than give you a wrong answer.',
      weaknessTopic: 'move-types',
      practiceHint: 'Think about safety: what should a language do when a value can\'t fit in the target type? Move picks the safest option.',
    },
    {
      question: 'How do you create an empty optional value of type Option<u64>? (Hint: there\'s no `null` in Move!)',
      options: [
        'let x: Option<u64> = null;',
        'let x: Option<u64> = option::none();',
        'let x: Option<u64> = 0;',
        'let x: Option<u64> = Option::empty();',
      ],
      correctAnswer: 1,
      explanation: 'Move doesn\'t have `null` — that\'s a deliberate design choice to avoid the "billion dollar mistake" that `null` has caused in other languages. Instead, you use `option::none()` to say "nothing here" and `option::some(value)` to say "here\'s a value." This forces you to always handle the "might be empty" case, which prevents crashes.',
      weaknessTopic: 'move-types',
      practiceHint: 'Move replaced null with a safer system. What function from std::option creates an empty "box"?',
    },
    {
      question: 'What\'s the difference between `vector<u8>` and `string::String`?',
      options: [
        'They are identical types with different names',
        '`vector<u8>` holds raw bytes with no validation, while `string::String` validates UTF-8 encoding',
        '`string::String` is mutable but `vector<u8>` is not',
        '`vector<u8>` can only hold ASCII, while `string::String` holds any bytes',
      ],
      correctAnswer: 1,
      explanation: '`vector<u8>` is just a bag of bytes — it doesn\'t care what\'s inside. `string::String` wraps `vector<u8>` but adds a guarantee: the bytes must form valid UTF-8 text. If you try to create a `string::String` from garbage bytes, it aborts. Why does this matter? Because when you display text to users, invalid bytes can cause rendering bugs or security issues. The validation catches that early.',
      weaknessTopic: 'move-types',
      practiceHint: 'One type validates that the bytes are valid text. The other just holds raw bytes with no checks. Which is which?',
    },
    {
      question: 'What\'s the correct way to declare a constant error code in Sui Move?',
      options: [
        'error ENotFound = 404;',
        'const ENotFound: u64 = 1;',
        'let ENotFound = 1;',
        'static ERROR_NOT_FOUND: u64 = 1;',
      ],
      correctAnswer: 1,
      explanation: 'Constants use the `const` keyword, a name, a type annotation, and a value: `const ENotFound: u64 = 1;`. Error codes start with `E` by convention so they\'re easy to spot. There\'s no `error` keyword, no `static` keyword, and `let` is only for variables inside functions — not module-level constants. Getting the naming convention right makes your error messages easy to understand when debugging.',
      weaknessTopic: 'move-types',
      practiceHint: 'Constants use `const` at the module level. Error codes by convention start with `E` and are of type u64.',
    },
    {
      question: 'What does `let mut v = vector::empty<u64>();` create?',
      options: [
        'An immutable empty vector of u64 values',
        'A mutable empty vector of u64 values that can have elements added to it',
        'A vector with one element: 0',
        'Compilation error because vectors must have initial elements',
      ],
      correctAnswer: 1,
      explanation: '`vector::empty<u64>()` creates a new, empty vector that holds u64 values. The `let mut` part is critical — it makes the binding mutable, which means you can modify it later with `push_back`, `pop_back`, etc. Without `mut`, the vector would be frozen and you couldn\'t add or remove items. Empty vectors are totally valid — you fill them up as your program runs.',
      weaknessTopic: 'move-types',
      practiceHint: 'The `mut` keyword is the key here. What does it let you do that a plain `let` doesn\'t?',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module type_master::registry {
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // TODO 1: Declare an error constant called EInvalidAge
    // It should be of type u64 with value 0
    // Remember: constants use the format: const NAME: Type = value;
    // Error codes start with "E" by convention


    // TODO 2: Declare a constant called MAX_NAME_LENGTH
    // It should be of type u64 with value 64
    // This sets an upper limit on name length — like a speed limit sign


    // TODO 3: Declare a constant called DEFAULT_SCORE
    // It should be of type u8 with value 100
    // We'll cast this to u64 later — good practice for type casting!


    // TODO 4: Define a public struct called Player with abilities: key, store
    // Fields (in this order):
    //   id: UID              — every Sui object needs a unique ID
    //   name: String         — the player's display name (UTF-8 text)
    //   age: u8              — age fits in 0-255, so u8 is perfect
    //   score: u64           — scores can get big, so we use u64
    //   bio: Option<String>  — optional! not every player writes a bio
    //   tags: vector<u8>     — a list of bytes for tag data
    // Hint: public struct Name has key, store { field: Type, ... }


    // TODO 5: Write a public entry function called \`create_player\`
    // Parameters: name_bytes: vector<u8>, age: u8, ctx: &mut TxContext
    //
    // Step by step:
    //   a) First, validate the age: assert!(age > 0 && age < 150, EInvalidAge)
    //      This makes sure nobody enters age 0 or age 200
    //   b) Create a Player struct with:
    //      - id: object::new(ctx)          — generates a unique blockchain ID
    //      - name: string::utf8(name_bytes) — converts raw bytes to a UTF-8 String
    //      - age: age                       — just pass through the age parameter
    //      - score: (DEFAULT_SCORE as u64)  — cast the u8 constant to u64!
    //      - bio: option::none()            — no bio yet (empty box)
    //      - tags: vector::empty()          — empty list, can add tags later
    //   c) Transfer the Player to the sender:
    //      transfer::transfer(player, tx_context::sender(ctx))


    // TODO 6: Write a public entry function called \`set_bio\`
    // Parameters: player: &mut Player, bio_bytes: vector<u8>
    // This lets a player add or update their bio
    // Set player.bio to option::some(string::utf8(bio_bytes))
    // That wraps the UTF-8 string in Some — the box now has something in it!


    // TODO 7: Write a public fun called \`get_score_as_u128\`
    // Parameters: player: &Player
    // Returns: u128
    // Cast the player's score from u64 to u128 and return it
    // Hint: (player.score as u128) — this is a safe widening cast

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
    'Let\'s start with the constants (TODOs 1-3). They all follow the same pattern: `const NAME: Type = value;`. For error codes, start the name with `E` (like `EInvalidAge`). For regular constants, use UPPER_SNAKE_CASE (like `MAX_NAME_LENGTH`). Don\'t forget the type annotation!',
    'For TODO 4 (the struct): Use `public struct Player has key, store { ... }`. List each field with its name, colon, and type — separated by commas. The tricky ones are `bio: Option<String>` (the optional field) and `tags: vector<u8>` (the byte list).',
    'For TODO 5 (create_player): Start with `assert!(age > 0 && age < 150, EInvalidAge)` to validate the input. Then create the Player struct — the key casting moment is `score: (DEFAULT_SCORE as u64)` which converts the u8 constant to u64. Finally, transfer with `transfer::transfer(player, tx_context::sender(ctx))`.',
    'Almost there! For TODO 6 (set_bio): Wrap the string in an Option with `player.bio = option::some(string::utf8(bio_bytes))`. For TODO 7 (get_score_as_u128): Just return `(player.score as u128)` — this is a safe widening cast from u64 to u128, so it can never fail.',
  ],
};
