import { LessonContent } from '@/app/types/lesson';

export const moveLesson1: LessonContent = {
  id: 'move-1',
  title: 'Hello Move',
  description: 'Your first steps with the Move programming language on Sui. Learn about module structure, functions, imports, and basic types.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'move',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Welcome to the world of Move on Sui! Move is a smart contract language designed for safety and expressiveness. In this lesson, you'll learn how Move modules are structured, how to define functions, and the basic types that power every Sui smart contract.",
    quizTransition: "You've explored the foundations of Move. Let's see how well you've absorbed the core concepts...",
    practiceTransition: "Time to write your very first Move module from scratch! Fill in the blanks to build a working on-chain greeting contract.",
    celebrationMessage: "Outstanding! You've written your first Move module on Sui. You now understand module structure, function visibility, and basic types.",
    nextLessonTease: "Next up: we'll dive deep into Move's rich type system, including vectors, options, and strings.",
  },

  teachingSections: [
    {
      sectionTitle: 'Module Structure',
      slides: [
        {
          title: 'What Is a Move Module?',
          emoji: '\u{1F4E6}',
          content: "A Move module is the fundamental unit of code organization on Sui. Every smart contract lives inside a module. A module groups together struct definitions, constants, and functions that operate on those structs. Modules are published to the blockchain as part of a package, and once published, their code is immutable. Think of a module like a class in object-oriented programming, but with stronger safety guarantees enforced by the Move compiler.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Module', content: 'A named container for structs, functions, and constants. Declared with the `module` keyword followed by an address and name.' },
                { label: 'Package', content: 'A collection of one or more modules that are published together to the Sui blockchain as a single unit.' },
                { label: 'Immutability', content: 'Once a package is published on Sui, its code cannot be changed. You can only publish upgraded versions using the upgrade capability.' },
                { label: 'Address', content: 'Every module is associated with a blockchain address. On Sui, this is typically the package ID after publishing.' },
              ],
            },
          },
        },
        {
          title: 'Anatomy of a Module',
          emoji: '\u{1F9EC}',
          content: "Every Sui Move module starts with a module declaration that includes the package address and module name. Inside the module block, you define imports with `use`, constants with `const`, struct types with `struct`, and functions with `fun`. The order matters: imports come first, then constants, then struct definitions, and finally functions. Let's look at the skeleton of a typical module.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module hello_world::greeter {\n    // Imports from the Sui framework\n    use sui::event;\n\n    // Constants\n    const DEFAULT_GREETING: vector<u8> = b"Hello, Sui!";\n\n    // Struct definitions\n    public struct Greeting has key, store {\n        id: UID,\n        text: vector<u8>,\n    }\n\n    // Functions\n    public entry fun create_greeting(ctx: &mut TxContext) {\n        let greeting = Greeting {\n            id: object::new(ctx),\n            text: DEFAULT_GREETING,\n        };\n        transfer::transfer(greeting, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 1, explanation: "Module declaration: `module <package_address>::<module_name>`. On Sui, the address is resolved from Move.toml or becomes the package ID on-chain." },
                { line: 3, explanation: "The `use` keyword imports types and functions from other modules. `sui::event` is part of the Sui framework." },
                { line: 6, explanation: "Constants are declared with `const` and must have a type annotation. They are compile-time values." },
                { line: 9, explanation: "Structs define data types. `has key, store` are abilities that control what operations are allowed on the struct." },
                { line: 15, explanation: "Functions are declared with `fun`. The `public entry` modifier means this function can be called directly in a transaction." },
              ],
            },
          },
        },
        {
          title: 'The use Keyword: Imports',
          emoji: '\u{1F517}',
          content: "The `use` keyword brings types and functions from other modules into scope. Sui Move provides a rich standard library and framework that you'll import from frequently. Common imports include `sui::object` for creating on-chain objects, `sui::transfer` for ownership operations, and `sui::tx_context` for transaction metadata. You can import specific items or entire modules, and you can alias imports to avoid name conflicts.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'object', label: 'sui::object', emoji: '\u{1F4E6}' },
                { id: 'transfer', label: 'sui::transfer', emoji: '\u{1F4E8}' },
                { id: 'tx_context', label: 'sui::tx_context', emoji: '\u{1F4CB}' },
                { id: 'event', label: 'sui::event', emoji: '\u{1F514}' },
              ],
              targets: [
                { id: 'create', label: 'Creating new on-chain objects (UID)' },
                { id: 'send', label: 'Transferring ownership of objects' },
                { id: 'sender', label: 'Getting the transaction sender address' },
                { id: 'emit', label: 'Emitting on-chain events' },
              ],
              correctPairs: [
                { itemId: 'object', targetId: 'create' },
                { itemId: 'transfer', targetId: 'send' },
                { itemId: 'tx_context', targetId: 'sender' },
                { itemId: 'event', targetId: 'emit' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-001',
    },
    {
      sectionTitle: 'Functions & Visibility',
      slides: [
        {
          title: 'Defining Functions with fun',
          emoji: '\u{2699}\u{FE0F}',
          content: "Functions in Move are declared with the `fun` keyword. Every function has a name, an optional parameter list, an optional return type, and a body. Parameters are typed with a colon syntax (like `name: Type`), and the return type follows the parameter list after a colon. Move functions must explicitly declare what they return. If a function doesn't return a value, no return type is specified. The last expression in a function body (without a semicolon) is the return value.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// A function that takes two u64 values and returns their sum\nfun add(a: u64, b: u64): u64 {\n    a + b\n}\n\n// A function that takes no parameters and returns nothing\nfun do_nothing() {\n    // empty body\n}\n\n// A function with multiple statements\nfun compute(x: u64): u64 {\n    let doubled = x * 2;\n    let result = doubled + 10;\n    result  // no semicolon = return value\n}`,
              highlights: [
                { line: 2, explanation: "Parameters are declared as `name: Type`. Return type follows after `:` at the end of the signature." },
                { line: 3, explanation: "The last expression without a semicolon is implicitly returned. Here `a + b` is the return value." },
                { line: 7, explanation: "Functions with no return type simply omit the `: ReturnType` part." },
                { line: 15, explanation: "Omitting the semicolon on the last line makes it the return expression. Adding a semicolon would cause a type error." },
              ],
            },
          },
        },
        {
          title: 'Visibility: public, public(package), entry',
          emoji: '\u{1F441}\u{FE0F}',
          content: "Move has a precise visibility system that controls who can call a function. A bare `fun` (no modifier) is private to the module. `public fun` can be called by any other module. `public(package) fun` can only be called by other modules within the same package. `entry fun` marks a function as a transaction entry point, callable directly from a Sui transaction. You can combine `public` and `entry` as `public entry fun` to make a function both callable from other modules and directly from transactions.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'fun (private)', content: 'Only callable from within the same module. This is the default visibility. Use it for internal helper functions.' },
                { label: 'public fun', content: 'Callable from any module on-chain. Use it when you want to expose functionality as a library for other developers.' },
                { label: 'public(package) fun', content: 'Callable only by other modules in the same published package. Useful for shared internal logic across your own modules.' },
                { label: 'entry fun', content: 'Can be called directly as a transaction entry point by users via the Sui CLI or SDKs. Parameters must be primitives, objects, or vectors of these.' },
                { label: 'public entry fun', content: 'Combines both: callable from other modules AND as a transaction entry point. The most common visibility for user-facing functions.' },
              ],
            },
          },
        },
        {
          title: 'Entry Functions on Sui',
          emoji: '\u{1F680}',
          content: "Entry functions are special in Sui because they define the interface between off-chain clients and on-chain logic. When a user submits a transaction, they specify which entry function to call and provide the arguments. Sui automatically resolves object arguments by fetching them from the blockchain. The `TxContext` parameter is always injected automatically by the runtime and gives you access to the sender's address and a way to create new object IDs. Every meaningful Sui smart contract has at least one entry function.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::counter {\n    public struct Counter has key {\n        id: UID,\n        value: u64,\n    }\n\n    // Entry: creates a new Counter, callable from a transaction\n    public entry fun create(ctx: &mut TxContext) {\n        let counter = Counter {\n            id: object::new(ctx),\n            value: 0,\n        };\n        transfer::transfer(counter, tx_context::sender(ctx));\n    }\n\n    // Entry: increments an existing Counter\n    public entry fun increment(counter: &mut Counter) {\n        counter.value = counter.value + 1;\n    }\n\n    // Private helper: not callable from transactions\n    fun is_even(value: u64): bool {\n        value % 2 == 0\n    }\n}`,
              highlights: [
                { line: 8, explanation: "`public entry fun create(ctx: &mut TxContext)` - TxContext is always the last parameter and is auto-injected by the Sui runtime." },
                { line: 13, explanation: "`transfer::transfer` sends the newly created object to the transaction sender." },
                { line: 17, explanation: "Entry functions can take object references as parameters. Sui resolves `&mut Counter` by object ID from the transaction arguments." },
                { line: 22, explanation: "Private functions (no `public` or `entry`) are internal helpers. They cannot be called from transactions or other modules." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-002',
    },
    {
      sectionTitle: 'Basic Types',
      slides: [
        {
          title: 'Integer and Boolean Types',
          emoji: '\u{1F522}',
          content: "Move provides unsigned integer types of various sizes: u8, u16, u32, u64, u128, and u256. There is no signed integer type in Move, which eliminates an entire class of underflow bugs. The most commonly used integer type in Sui is u64, which is used for amounts, counters, and timestamps. The `bool` type represents true or false values and is used in conditions and flags. Integer literals can include underscores for readability, like `1_000_000`.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'u8', label: 'u8', emoji: '\u{1F4A7}' },
                { id: 'u64', label: 'u64', emoji: '\u{1F4AA}' },
                { id: 'u128', label: 'u128', emoji: '\u{1F30D}' },
                { id: 'bool', label: 'bool', emoji: '\u{2705}' },
              ],
              targets: [
                { id: 'byte', label: 'Single byte value (0-255)' },
                { id: 'amount', label: 'Token amounts, counters, timestamps' },
                { id: 'large', label: 'Very large numbers, crypto math' },
                { id: 'flag', label: 'True/false conditions and flags' },
              ],
              correctPairs: [
                { itemId: 'u8', targetId: 'byte' },
                { itemId: 'u64', targetId: 'amount' },
                { itemId: 'u128', targetId: 'large' },
                { itemId: 'bool', targetId: 'flag' },
              ],
            },
          },
        },
        {
          title: 'The address Type',
          emoji: '\u{1F3E0}',
          content: "The `address` type is a 32-byte value that uniquely identifies accounts and objects on Sui. Every user wallet has an address, and every object on the blockchain has an address-like object ID. Address literals are written as hex strings prefixed with `0x`, like `@0x1` for the Sui framework address. In function parameters, you'll often see `address` used for specifying recipients of transfers or for access control checks. The special syntax `tx_context::sender(ctx)` returns the address of the user who submitted the transaction.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Address Format', content: 'Addresses are 32 bytes, written as 64 hex characters prefixed with 0x. Example: 0x0000...0001 for the Sui framework.' },
                { label: 'Named Addresses', content: 'In Move.toml, you can define named addresses like `my_package = "0x0"` which get replaced at publish time with the real package ID.' },
                { label: 'Sender Address', content: '`tx_context::sender(ctx)` returns the address of the account that submitted the current transaction.' },
                { label: 'Comparison', content: 'Addresses can be compared with `==` and `!=`. This is commonly used for access control: `assert!(tx_context::sender(ctx) == owner)`.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together',
          emoji: '\u{1F9E9}',
          content: "Now let's see how modules, functions, and types work together in a complete Sui Move example. This profile module creates an on-chain profile object with a name and age. Notice how `u8` is used for age (0-255 is plenty), `vector<u8>` holds raw byte data for the name, and `address` identifies the owner. The `entry` function lets users create their profile directly from a wallet transaction.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::profile {\n    public struct Profile has key, store {\n        id: UID,\n        name: vector<u8>,\n        age: u8,\n        active: bool,\n    }\n\n    public entry fun create_profile(\n        name: vector<u8>,\n        age: u8,\n        ctx: &mut TxContext,\n    ) {\n        let profile = Profile {\n            id: object::new(ctx),\n            name,\n            age,\n            active: true,\n        };\n        transfer::transfer(profile, tx_context::sender(ctx));\n    }\n\n    public entry fun deactivate(profile: &mut Profile) {\n        profile.active = false;\n    }\n\n    public fun is_active(profile: &Profile): bool {\n        profile.active\n    }\n}`,
              highlights: [
                { line: 2, explanation: "`has key, store` lets this struct be an owned Sui object (`key`) and be stored inside other objects (`store`)." },
                { line: 4, explanation: "`vector<u8>` is Move's way of representing raw byte strings. We'll learn about proper string types in the next lesson." },
                { line: 5, explanation: "`u8` is perfect for age since human ages fit in 0-255." },
                { line: 16, explanation: "When a field name matches a variable name, Move allows shorthand: `name` instead of `name: name`." },
                { line: 27, explanation: "`public fun` without `entry` means other modules can call this, but users can't call it directly in a transaction." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-003',
    },
  ],

  quiz: [
    {
      question: 'How do you declare a module in Sui Move?',
      options: [
        'contract MyModule { ... }',
        'module my_package::my_module { ... }',
        'pragma module MyModule;',
        'def module(my_package, my_module) { ... }',
      ],
      correctAnswer: 1,
      explanation: 'In Sui Move, modules are declared with the `module` keyword followed by the package address, a double colon, and the module name: `module my_package::my_module { ... }`. This is different from Solidity\'s `contract` keyword or other language patterns.',
      weaknessTopic: 'move-basics',
      practiceHint: 'The module declaration uses the format: module <address>::<name> { ... }',
    },
    {
      question: 'What does the `entry` modifier on a function mean in Sui Move?',
      options: [
        'The function runs first when the module is published',
        'The function can be called directly as a transaction entry point',
        'The function is the constructor for the module',
        'The function is automatically called every block',
      ],
      correctAnswer: 1,
      explanation: 'The `entry` modifier marks a function as callable directly from a Sui transaction. When users interact with your smart contract via the CLI or SDK, they call entry functions. Non-entry functions can only be called by other Move code.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Think about how off-chain clients (wallets, CLI) interact with on-chain code.',
    },
    {
      question: 'What is the visibility of a function declared as just `fun my_func() { ... }` with no modifier?',
      options: [
        'Public - callable by any module',
        'Entry - callable from transactions',
        'Private - only callable within the same module',
        'Protected - callable by child modules',
      ],
      correctAnswer: 2,
      explanation: 'A function declared with just `fun` and no visibility modifier is private to the module. It can only be called by other functions within the same module. To make it accessible outside, you need `public`, `public(package)`, or `entry`.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Move defaults to the most restrictive visibility. What is that?',
    },
    {
      question: 'Which of the following is NOT a valid Move integer type?',
      options: [
        'u64',
        'u256',
        'i32',
        'u8',
      ],
      correctAnswer: 2,
      explanation: 'Move does not have signed integer types. There is no `i32`, `i64`, or any `i` prefixed type. Move only supports unsigned integers: u8, u16, u32, u64, u128, and u256. This design choice eliminates negative number underflow bugs.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Move only supports unsigned integers. What prefix do they all share?',
    },
    {
      question: 'What does `tx_context::sender(ctx)` return in a Sui Move function?',
      options: [
        'The module address where the function is defined',
        'The address of the user who submitted the transaction',
        'The object ID of the first argument',
        'A boolean indicating if the transaction is valid',
      ],
      correctAnswer: 1,
      explanation: '`tx_context::sender(ctx)` returns the `address` of the account that submitted the current transaction. This is commonly used to set ownership of newly created objects or for access control checks.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Think about who initiates a transaction and how the contract knows their identity.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module hello_move::greeter {
    // TODO 1: Import the sui::event module using the \`use\` keyword


    // TODO 2: Define a constant called GREETING of type vector<u8>
    // Set it to b"Hello, Move on Sui!"


    // TODO 3: Define a public struct called GreetingObject
    // It should have abilities: key, store
    // Fields: id (UID), message (vector<u8>), greeting_count (u64)


    // TODO 4: Define a public struct called GreetingEvent with ability: copy, drop
    // Fields: creator (address), message (vector<u8>)


    // TODO 5: Write a public entry function called \`create_greeting\`
    // Parameters: ctx: &mut TxContext
    // It should:
    //   - Create a new GreetingObject with GREETING as the message, count 0
    //   - Emit a GreetingEvent with the sender's address and GREETING
    //   - Transfer the object to the sender


    // TODO 6: Write a public entry function called \`update_greeting\`
    // Parameters: obj: &mut GreetingObject, new_message: vector<u8>
    // It should update the message and increment greeting_count by 1

}`,

  solution: `module hello_move::greeter {
    // TODO 1: Import the sui::event module using the \`use\` keyword
    use sui::event;

    // TODO 2: Define a constant called GREETING of type vector<u8>
    // Set it to b"Hello, Move on Sui!"
    const GREETING: vector<u8> = b"Hello, Move on Sui!";

    // TODO 3: Define a public struct called GreetingObject
    // It should have abilities: key, store
    // Fields: id (UID), message (vector<u8>), greeting_count (u64)
    public struct GreetingObject has key, store {
        id: UID,
        message: vector<u8>,
        greeting_count: u64,
    }

    // TODO 4: Define a public struct called GreetingEvent with ability: copy, drop
    // Fields: creator (address), message (vector<u8>)
    public struct GreetingEvent has copy, drop {
        creator: address,
        message: vector<u8>,
    }

    // TODO 5: Write a public entry function called \`create_greeting\`
    // Parameters: ctx: &mut TxContext
    // It should:
    //   - Create a new GreetingObject with GREETING as the message, count 0
    //   - Emit a GreetingEvent with the sender's address and GREETING
    //   - Transfer the object to the sender
    public entry fun create_greeting(ctx: &mut TxContext) {
        let greeting = GreetingObject {
            id: object::new(ctx),
            message: GREETING,
            greeting_count: 0,
        };
        event::emit(GreetingEvent {
            creator: tx_context::sender(ctx),
            message: GREETING,
        });
        transfer::transfer(greeting, tx_context::sender(ctx));
    }

    // TODO 6: Write a public entry function called \`update_greeting\`
    // Parameters: obj: &mut GreetingObject, new_message: vector<u8>
    // It should update the message and increment greeting_count by 1
    public entry fun update_greeting(obj: &mut GreetingObject, new_message: vector<u8>) {
        obj.message = new_message;
        obj.greeting_count = obj.greeting_count + 1;
    }
}`,

  hints: [
    'Start with the import: `use sui::event;` brings the event module into scope so you can emit events.',
    'Constants use the syntax: `const NAME: Type = value;`. For a byte string, use `b"your text here"` which creates a `vector<u8>`.',
    'Structs are declared with `public struct Name has ability1, ability2 { field: Type, ... }`. Objects need `key` ability and a `id: UID` field.',
    'In entry functions, use `object::new(ctx)` to create a UID, `event::emit(...)` to emit events, and `transfer::transfer(obj, recipient)` to send objects.',
  ],
};
