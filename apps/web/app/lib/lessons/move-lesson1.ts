import { LessonContent } from '@/app/types/lesson';

export const moveLesson1: LessonContent = {
  id: 'move-1',
  title: 'Hello Move',
  description: 'Your very first steps with Move on Sui — no blockchain experience needed. We\'ll start from scratch and build up to your first smart contract.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'move',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Hey! Welcome to Move — the language that powers smart contracts on Sui. Don't worry if you've never written blockchain code before. We'll start from the very basics and build up step by step. By the end of this lesson, you'll understand how Move programs are organized and you'll write your first one.",
    quizTransition: "Nice work making it through the concepts! Let's do a quick check to see what stuck...",
    practiceTransition: "Alright, time to get your hands dirty! You're going to fill in the blanks to build a real working smart contract. Don't stress — the hints will guide you.",
    celebrationMessage: "You did it! You just wrote your first Move smart contract. That's a huge first step — most people never get this far.",
    nextLessonTease: "Next up: we'll explore Move's type system — vectors (lists of things), options (values that might not exist), and strings.",
  },

  teachingSections: [
    {
      sectionTitle: 'What Even Is a Smart Contract?',
      slides: [
        {
          title: 'Programs That Live on a Blockchain',
          emoji: '\u{1F4E6}',
          content: "Before we write any code, let's make sure we're on the same page. A smart contract is just a program that runs on a blockchain instead of on your computer or a server. Once you publish it, anyone in the world can use it, and nobody — not even you — can secretly change how it works. That's what makes it \"smart\": the rules are transparent and enforced by code. On Sui, these programs are written in a language called Move.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Smart Contract', content: 'A program stored on the blockchain. It runs automatically when someone interacts with it — like a vending machine that nobody owns but everyone can use.' },
                { label: 'Blockchain', content: 'A shared database that nobody controls alone. Once data is written, it can\'t be secretly changed. Think of it as a public notebook that everyone can read.' },
                { label: 'Sui', content: 'A fast, modern blockchain. It\'s where your Move programs will live. Sui is designed for speed — transactions settle in under a second.' },
                { label: 'Move', content: 'The programming language you\'re learning right now! It was designed specifically for writing safe smart contracts. Think of it as a language that makes it hard to accidentally lose people\'s money.' },
              ],
            },
          },
        },
        {
          title: 'How Move Code Is Organized',
          emoji: '\u{1F9EC}',
          content: "In Move, your code lives inside a \"module.\" A module is just a container — like a file folder — that holds your data definitions and functions together. You give your module a name, and everything related to one feature goes inside it. For example, you might have a module called `greeter` that handles greeting messages, or a module called `counter` that tracks a count. Modules are grouped into \"packages\" (a package is just a collection of related modules that you publish together). Let's look at what a simple module looks like:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_app::greeter {\n    // 1. Imports: bring in tools from Sui\n    use sui::event;\n\n    // 2. Constants: fixed values that never change\n    const DEFAULT_GREETING: vector<u8> = b"Hello, Sui!";\n\n    // 3. Data: define what your \"thing\" looks like\n    public struct Greeting has key, store {\n        id: UID,\n        text: vector<u8>,\n    }\n\n    // 4. Functions: define what your contract can DO\n    public entry fun create_greeting(ctx: &mut TxContext) {\n        let greeting = Greeting {\n            id: object::new(ctx),\n            text: DEFAULT_GREETING,\n        };\n        transfer::transfer(greeting, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 1, explanation: "This is the module declaration. `my_app` is the package name, `greeter` is the module name. Think of it like a file path — `my_app/greeter`." },
                { line: 3, explanation: "`use` is how you import tools. Here we're bringing in Sui's event system. It's like `import` in JavaScript or `#include` in C." },
                { line: 6, explanation: "A constant — a value that never changes. `b\"Hello, Sui!\"` is a byte string (a way to store text in Move). Don't worry about the syntax for now." },
                { line: 9, explanation: "A `struct` defines a data shape — like a template for an object. We'll explain `has key, store` and `UID` shortly. For now, just know this creates a \"thing\" that lives on the blockchain." },
                { line: 15, explanation: "`public entry fun` means \"anyone can call this function from their wallet.\" This is how users interact with your contract." },
              ],
            },
          },
        },
        {
          title: 'The Building Blocks (You\'ll See These Everywhere)',
          emoji: '\u{1F517}',
          content: "Every Sui smart contract uses a few common building blocks from the Sui framework. Think of these as tools in your toolbox. You don't need to memorize them — you'll get familiar with them through practice. Here are the four you'll see most often:",
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
                { id: 'create', label: 'Create new things on the blockchain' },
                { id: 'send', label: 'Send things to someone\'s wallet' },
                { id: 'sender', label: 'Find out who is calling your contract' },
                { id: 'emit', label: 'Broadcast that something happened' },
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
      sectionTitle: 'Functions: Making Your Contract Do Things',
      slides: [
        {
          title: 'Writing Your First Function',
          emoji: '\u{2699}\u{FE0F}',
          content: "Functions are where the action happens. A function is a reusable block of code that does something — like \"create a greeting\" or \"add two numbers.\" In Move, you declare a function with the `fun` keyword, give it a name, and put your code inside curly braces. If your function needs input, you list the parameters in parentheses. If it produces a result, you specify the return type after a colon. Let's see three simple examples:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Example 1: Takes two numbers, returns their sum\nfun add(a: u64, b: u64): u64 {\n    a + b    // the last line (without ;) is the return value\n}\n\n// Example 2: Does something but returns nothing\nfun say_hello() {\n    // could do stuff in here\n}\n\n// Example 3: Multiple steps, returns the result\nfun double_plus_ten(x: u64): u64 {\n    let doubled = x * 2;\n    let result = doubled + 10;\n    result   // no semicolon = this is what gets returned\n}`,
              highlights: [
                { line: 2, explanation: "`a: u64` means \"a parameter called `a` that is a number.\" `u64` is Move's main number type (an unsigned 64-bit integer — it can hold values from 0 to about 18 quintillion)." },
                { line: 3, explanation: "This is Move's way of returning a value: the last line without a semicolon. No `return` keyword needed (though you can use `return` if you want to exit early)." },
                { line: 7, explanation: "This function takes nothing and returns nothing. It's the simplest kind of function." },
                { line: 15, explanation: "Notice: `result` has NO semicolon, so it becomes the return value. If you accidentally add a semicolon, you'll get a compile error. This is the #1 beginner mistake in Move!" },
              ],
            },
          },
        },
        {
          title: 'Who Can Call Your Function?',
          emoji: '\u{1F441}\u{FE0F}',
          content: "Not every function should be callable by everyone. Move lets you control access with visibility modifiers — keywords you put before `fun`. Think of it like permissions: some functions are internal helpers that only your own code should use, while others are the public-facing buttons that users press. Here are the ones that matter most:",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'fun (private)', content: 'No modifier = private. Only code inside the same module can call it. Use this for internal helper functions — like a kitchen in a restaurant that customers never enter.' },
                { label: 'public fun', content: 'Any other smart contract on Sui can call this. Use it when you\'re building a library or tool that other developers should use. Like a restaurant\'s takeout window.' },
                { label: 'entry fun', content: 'Users can call this directly from their wallet or the command line. This is the \"front door\" of your contract — how real people interact with it.' },
                { label: 'public entry fun', content: 'The best of both worlds: other contracts can call it AND users can call it from their wallets. This is the most common choice for the main functions of your contract.' },
              ],
            },
          },
        },
        {
          title: 'Entry Functions: The Front Door of Your Contract',
          emoji: '\u{1F680}',
          content: "When someone uses your smart contract — say, from a wallet app — they're calling an `entry` function. It's the connection between the real world and your on-chain code. There's one special thing about entry functions on Sui: the last parameter is usually `ctx: &mut TxContext`. You don't need to understand this deeply yet — just know that `ctx` is automatically provided by Sui and tells your function who is calling it. Let's see a complete example:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_app::counter {\n    // A Counter that lives on the blockchain\n    public struct Counter has key {\n        id: UID,\n        value: u64,\n    }\n\n    // Anyone can create a new counter (entry = callable from wallet)\n    public entry fun create(ctx: &mut TxContext) {\n        let counter = Counter {\n            id: object::new(ctx),  // give it a unique blockchain ID\n            value: 0,              // start at zero\n        };\n        // Send the counter to whoever called this function\n        transfer::transfer(counter, tx_context::sender(ctx));\n    }\n\n    // Owner can increment their counter\n    public entry fun increment(counter: &mut Counter) {\n        counter.value = counter.value + 1;\n    }\n\n    // Internal helper — not callable from wallets\n    fun is_even(value: u64): bool {\n        value % 2 == 0\n    }\n}`,
              highlights: [
                { line: 3, explanation: "This defines what a Counter looks like: it has a blockchain ID (`id`) and a number (`value`). The `has key` part means \"this thing lives on the blockchain as its own object.\"" },
                { line: 9, explanation: "`public entry fun` = the main function users call. `ctx: &mut TxContext` is auto-provided by Sui — it tells us who's calling." },
                { line: 11, explanation: "`object::new(ctx)` creates a unique ID for this counter on the blockchain. Every object needs one." },
                { line: 15, explanation: "`tx_context::sender(ctx)` gets the wallet address of whoever called the function. We send the counter to them so they own it." },
                { line: 19, explanation: "This entry function takes an existing Counter (Sui finds it by ID automatically) and lets the owner change it." },
                { line: 24, explanation: "No `public` or `entry` = private. This helper is only usable inside this module. Users can't call it." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-002',
    },
    {
      sectionTitle: 'Basic Types: The Building Blocks of Data',
      slides: [
        {
          title: 'Numbers and True/False',
          emoji: '\u{1F522}',
          content: "Every programming language has basic data types, and Move is no different. The main number type is `u64` — an unsigned (no negative numbers) 64-bit integer. It can hold values from 0 up to about 18.4 quintillion, which is plenty for most things. Move also has smaller and bigger number types (`u8` for small values like ages, `u128` and `u256` for huge numbers used in crypto math), and `bool` for true/false values. One important thing: Move has NO negative numbers. This is a safety feature — it eliminates a whole category of bugs where numbers accidentally go below zero.",
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
                { id: 'byte', label: 'Small values like age or percentage (0-255)' },
                { id: 'amount', label: 'Most common — token amounts, counters, timestamps' },
                { id: 'large', label: 'Really big math (crypto calculations)' },
                { id: 'flag', label: 'Yes/no, on/off, true/false' },
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
          title: 'Addresses: Who Is Who on the Blockchain',
          emoji: '\u{1F3E0}',
          content: "On Sui, every wallet and every object has a unique address — a long string of letters and numbers that looks like `0x7d3ab...`. Think of it like a mailing address: it tells the blockchain where to find something or where to send something. In your code, you'll use the `address` type when you need to know who's calling your contract or where to send an object. The most common way to get an address is `tx_context::sender(ctx)` — this gives you the address of the person who called your function.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What It Looks Like', content: 'An address is a long hex string like 0x7d3ab832d9c... (64 characters). You\'ll almost never type one by hand — your code gets them from the context or from function parameters.' },
                { label: 'Wallet Address', content: 'Every person on Sui has a wallet address. When they call your contract, you can find out their address with `tx_context::sender(ctx)`. This is how you know WHO is interacting with your code.' },
                { label: 'Object ID', content: 'Every thing you create on the blockchain also gets an address-like ID. This is how Sui finds objects — by their unique ID.' },
                { label: 'Comparing Addresses', content: 'You can check if two addresses are the same with `==`. This is how you build access control: `assert!(caller == owner)` means \"only the owner can do this.\"' },
              ],
            },
          },
        },
        {
          title: 'Let\'s Put It All Together',
          emoji: '\u{1F9E9}',
          content: "Time to see everything working together in one example. This module creates a simple profile on the blockchain. Read through the code — every line has an explanation. Notice how we use `u8` for age (because ages fit in 0-255), `vector<u8>` for the name (Move's way of storing text — more on this in the next lesson), and `address` to know who the profile belongs to.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_app::profile {\n    // A profile that lives on the blockchain\n    public struct Profile has key, store {\n        id: UID,           // unique blockchain ID (every object needs this)\n        name: vector<u8>,  // the person's name (stored as bytes)\n        age: u8,           // age (0-255 is more than enough!)\n        active: bool,      // is this profile active?\n    }\n\n    // Create a new profile and send it to the caller\n    public entry fun create_profile(\n        name: vector<u8>,\n        age: u8,\n        ctx: &mut TxContext,\n    ) {\n        let profile = Profile {\n            id: object::new(ctx),\n            name,       // shorthand: same as writing name: name\n            age,        // shorthand: same as writing age: age\n            active: true,\n        };\n        transfer::transfer(profile, tx_context::sender(ctx));\n    }\n\n    // Deactivate a profile (only callable from wallet)\n    public entry fun deactivate(profile: &mut Profile) {\n        profile.active = false;\n    }\n\n    // Check if profile is active (callable from other contracts, not from wallet)\n    public fun is_active(profile: &Profile): bool {\n        profile.active\n    }\n}`,
              highlights: [
                { line: 3, explanation: "`has key, store` are \"abilities\" — they tell Sui what this thing can do. `key` = it's a blockchain object with its own ID. `store` = it can be stored inside other objects. You'll learn more about abilities in a later lesson." },
                { line: 5, explanation: "`vector<u8>` is Move's way of handling text. It's a list of bytes. In the next lesson we'll learn about proper string types — for now just know `b\"Hello\"` creates one." },
                { line: 6, explanation: "`u8` can hold 0-255. Perfect for age — nobody lives past 255! Choosing the right size type is a good Move habit." },
                { line: 18, explanation: "Move shorthand: when a variable name matches the field name, you can just write `name` instead of `name: name`. Saves typing!" },
                { line: 26, explanation: "`&mut Profile` means \"give me a reference to a Profile that I can change.\" The `&mut` part means mutable (changeable). `&Profile` (without `mut`) would be read-only." },
                { line: 31, explanation: "`public fun` (no `entry`) means other contracts can call this, but users can't call it directly from their wallet. Good for utility functions." },
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
      question: 'How do you declare a module in Move?',
      options: [
        'contract MyModule { ... }',
        'module my_package::my_module { ... }',
        'class MyModule { ... }',
        'import my_module from "my_package"',
      ],
      correctAnswer: 1,
      explanation: 'In Move, you use the `module` keyword followed by the package name, then `::`, then the module name. So `module my_package::my_module { ... }`. It\'s different from Solidity (which uses `contract`) or regular programming languages.',
      weaknessTopic: 'move-basics',
      practiceHint: 'The keyword is `module`, and the format uses `::` to separate the package from the module name.',
    },
    {
      question: 'What does `entry` mean on a function?',
      options: [
        'It runs automatically when the module is published',
        'Users can call it directly from their wallet',
        'It\'s the constructor that initializes the module',
        'It runs once per blockchain block',
      ],
      correctAnswer: 1,
      explanation: 'The `entry` keyword marks a function as callable from outside the blockchain — meaning real users can call it from their wallet apps, the command line, or any Sui SDK. Without `entry`, a function can only be called by other Move code.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Think about how a user interacts with a smart contract from their wallet app.',
    },
    {
      question: 'If you write `fun helper() { ... }` with no modifier, who can call it?',
      options: [
        'Anyone — it\'s public by default',
        'Only users via wallet transactions',
        'Only other code inside the same module',
        'Only modules in the same package',
      ],
      correctAnswer: 2,
      explanation: 'A bare `fun` with no modifier is private — only other functions in the same module can call it. Move defaults to the most restrictive access. You need to explicitly add `public` or `entry` to open it up.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Move plays it safe: if you don\'t say otherwise, functions are locked down.',
    },
    {
      question: 'Which of these is NOT a valid number type in Move?',
      options: [
        'u64 (unsigned 64-bit)',
        'u256 (unsigned 256-bit)',
        'i32 (signed 32-bit)',
        'u8 (unsigned 8-bit)',
      ],
      correctAnswer: 2,
      explanation: 'Move does not have signed number types — no `i32`, `i64`, or anything with an `i`. Every number in Move is unsigned (zero or positive). This prevents a whole class of bugs where numbers accidentally go below zero.',
      weaknessTopic: 'move-basics',
      practiceHint: 'All Move numbers start with `u` (unsigned). There\'s no `i` prefix.',
    },
    {
      question: 'How do you find out who called your smart contract?',
      options: [
        'Read the `msg.sender` global variable',
        'Call `tx_context::sender(ctx)`',
        'Check the `self.caller` property',
        'It\'s passed as the first parameter automatically',
      ],
      correctAnswer: 1,
      explanation: '`tx_context::sender(ctx)` returns the address of the person who submitted the transaction. The `ctx` parameter is automatically provided by Sui to every entry function — you just need to include it as the last parameter.',
      weaknessTopic: 'move-basics',
      practiceHint: 'Sui passes a context object (`ctx`) to entry functions. The sender\'s address comes from this context.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module hello_move::greeter {
    // TODO 1: Import the event module from Sui
    // Hint: use sui::event;


    // TODO 2: Create a constant called GREETING
    // It should be of type vector<u8> and contain b"Hello, Move on Sui!"
    // Hint: const NAME: vector<u8> = b"your text";


    // TODO 3: Define a struct called GreetingObject
    // It needs: abilities key and store
    // Fields: id (UID), message (vector<u8>), greeting_count (u64)
    // Hint: public struct Name has key, store { field: Type, ... }


    // TODO 4: Define a struct called GreetingEvent
    // It needs: abilities copy and drop (events need these to be emittable)
    // Fields: creator (address), message (vector<u8>)


    // TODO 5: Write a public entry function called create_greeting
    // It takes one parameter: ctx: &mut TxContext
    // Inside it should:
    //   a) Create a GreetingObject with GREETING as message and 0 as greeting_count
    //   b) Emit a GreetingEvent with the caller's address and GREETING
    //   c) Transfer the object to whoever called this function
    // Hint: object::new(ctx) creates an ID
    // Hint: event::emit(YourEvent { ... }) emits an event
    // Hint: transfer::transfer(obj, tx_context::sender(ctx)) sends it


    // TODO 6: Write a public entry function called update_greeting
    // Parameters: obj: &mut GreetingObject, new_message: vector<u8>
    // It should set obj.message to new_message
    // and add 1 to obj.greeting_count

}`,

  solution: `module hello_move::greeter {
    // TODO 1: Import the event module from Sui
    use sui::event;

    // TODO 2: Create a constant called GREETING
    const GREETING: vector<u8> = b"Hello, Move on Sui!";

    // TODO 3: Define a struct called GreetingObject
    public struct GreetingObject has key, store {
        id: UID,
        message: vector<u8>,
        greeting_count: u64,
    }

    // TODO 4: Define a struct called GreetingEvent
    public struct GreetingEvent has copy, drop {
        creator: address,
        message: vector<u8>,
    }

    // TODO 5: Write a public entry function called create_greeting
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

    // TODO 6: Write a public entry function called update_greeting
    public entry fun update_greeting(obj: &mut GreetingObject, new_message: vector<u8>) {
        obj.message = new_message;
        obj.greeting_count = obj.greeting_count + 1;
    }
}`,

  hints: [
    'For TODO 1: Just write `use sui::event;` — this imports Sui\'s event system so you can broadcast when things happen.',
    'For TODO 2: Constants look like this: `const GREETING: vector<u8> = b"Hello, Move on Sui!";`. The `b` before the quotes turns text into bytes.',
    'For TODO 3: A struct with abilities looks like: `public struct GreetingObject has key, store { id: UID, message: vector<u8>, greeting_count: u64, }`. Don\'t forget the commas between fields!',
    'For TODO 5: Use `object::new(ctx)` to create an ID, `event::emit(GreetingEvent { ... })` to broadcast the event, and `transfer::transfer(greeting, tx_context::sender(ctx))` to send it to the caller.',
  ],
};
