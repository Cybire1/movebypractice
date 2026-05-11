import { LessonContent } from '@/app/types/lesson';

export const moveLesson4: LessonContent = {
  id: 'move-4',
  title: 'Structs & Objects',
  description: 'Learn how to create your own data types and turn them into real objects on the Sui blockchain. We\'ll break down structs, abilities, and the object model step by step — no prior experience needed.',
  difficulty: 'intermediate',
  xpReward: 250,
  order: 4,
  language: 'move',
  prerequisiteLessons: ['move-3'],

  narrative: {
    welcomeMessage: "Hey! Welcome to the most exciting part of Sui Move so far. Here's the big idea: everything on Sui is an object, and objects are built from structs. By the end of this lesson, you'll know how to design your own data types, give them the right permissions, and create real objects that live on the blockchain. Don't worry if that sounds like a lot — we'll take it one step at a time.",
    quizTransition: "Nice work! You've explored structs, abilities, and the Sui object model. Let's do a quick quiz to see what stuck...",
    practiceTransition: "Awesome job on the quiz! Now let's get your hands dirty. You're going to write a real Sui module that defines a struct, creates an object, and transfers it to a user. The hints will guide you through it.",
    celebrationMessage: "You did it! You can now define Sui objects, assign abilities, and transfer ownership on-chain. That's a huge milestone — you're building real blockchain skills!",
    nextLessonTease: "Next up: Collections & Dynamic Fields. You'll learn how to store groups of values with vectors, Tables, and dynamic fields — basically, how to build complex data structures on-chain.",
  },

  teachingSections: [
    {
      sectionTitle: 'Defining Structs and the Ability System',
      slides: [
        {
          title: 'What is a Struct?',
          emoji: '🧱',
          content: "A struct is like a blueprint or a form — it defines what information goes together. Think of a driver's license: it has your name, photo, and birthdate all on one card. That's exactly what a struct does in code — it bundles related pieces of data into one neat package.\n\nIn Sui Move, a struct is the only way to create your own custom type. You define one inside a module using the `struct` keyword, give it a name (always starting with an uppercase letter, like `Profile` or `Sword`), and list the fields it contains.\n\nEach field has a name and a type, separated by a colon. You access fields using dot notation (like `profile.name`). Let's see what this looks like:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::profile {\n    use std::string::String;\n\n    /// A simple user profile with no abilities\n    public struct Profile {\n        name: String,\n        age: u64,\n        score: u64,\n    }\n}`,
              highlights: [
                { line: 5, explanation: "The 'public struct' keyword makes this type visible outside the module. Without 'public', only code inside this module could use it. Think of it like making a form available to other departments." },
                { line: 6, explanation: "Each field has a name and a type separated by a colon. Here, 'name' is a String (imported from std::string above). It's like a labeled blank on a form." },
                { line: 8, explanation: "Multiple fields are separated by commas. The last comma is optional but most Move developers include it — it's just a convention." },
              ],
            },
          },
        },
        {
          title: 'The Four Abilities',
          emoji: '🔑',
          content: "Here's the thing — in Move, you can't just do whatever you want with data. Every struct has a set of \"abilities\" that act like permissions. Think of abilities as rules about what you're allowed to do with a piece of data. Can it be copied? Can it be thrown away? Can it live on the blockchain as its own thing?\n\nThere are exactly four abilities:\n\n- **copy**: The value can be duplicated — like photocopying a document. Numbers have this by default.\n- **drop**: The value can be silently discarded when you're done with it. Without drop, you MUST explicitly do something with the value — you can't just ignore it.\n- **store**: The value can be stored inside another struct or placed into global storage. Think of it as \"this can go in a filing cabinet.\"\n- **key**: This is the big one. It turns your struct into a real Sui object that lives on the blockchain. A struct with `key` MUST have `id: UID` as its first field.\n\nYou declare abilities with the `has` keyword after the struct name. Let's match them up:",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'copy', label: 'copy', emoji: '📋' },
                { id: 'drop', label: 'drop', emoji: '🗑' },
                { id: 'store', label: 'store', emoji: '💾' },
                { id: 'key', label: 'key', emoji: '🔑' },
              ],
              targets: [
                { id: 'duplicate', label: 'Value can be duplicated' },
                { id: 'discard', label: 'Value can be silently discarded' },
                { id: 'nested', label: 'Value can be nested inside other structs / stored in global storage' },
                { id: 'toplevel', label: 'Value serves as a top-level Sui object (requires UID)' },
              ],
              correctPairs: [
                { itemId: 'copy', targetId: 'duplicate' },
                { itemId: 'drop', targetId: 'discard' },
                { itemId: 'store', targetId: 'nested' },
                { itemId: 'key', targetId: 'toplevel' },
              ],
            },
          },
        },
        {
          title: 'Ability Combinations in Practice',
          emoji: '🧩',
          content: "You can mix and match abilities depending on what behavior you want. This is actually one of the most important design decisions you'll make in Sui Move — it determines how your data can be used. Let's look at the common recipes:\n\n- `has key, store` -- The most common pattern for objects you want users to trade or transfer freely. The `key` makes it a Sui object, and `store` lets anyone transfer it. Most NFTs and tokens use this.\n- `has store` -- A value that can only live nested inside another object — like a component inside a machine. It can't exist on its own on the blockchain.\n- `has copy, drop, store` -- A lightweight data type that can be freely copied, thrown away, and stored. Great for configs, records, or events.\n- `has key` (without store) -- A \"soul-bound\" object. Only the module that created it can transfer it. Perfect for identity tokens or badges that shouldn't be tradeable.\n\nClick each combination below to learn more:",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'key, store', content: 'Transferable Sui object. Anyone can call sui::transfer::public_transfer to move it between addresses. Most NFTs and tokens use this pattern. This is your go-to for anything users should be able to trade or send to friends.' },
                { label: 'key only', content: 'Soul-bound object. Only the defining module can transfer it with transfer::transfer. Useful for identity tokens or non-transferable badges — like a membership card that only the club can issue and revoke.' },
                { label: 'store only', content: 'A nested-only value. Cannot exist as a top-level object but can be stored as a field inside a Sui object. Think of it like an engine inside a car — it only exists as part of something bigger.' },
                { label: 'copy, drop, store', content: 'A freely usable data struct. Can be duplicated, dropped, and stored anywhere. Ideal for configs, events, and lightweight records. Think of it like a sticky note — easy to copy, easy to throw away.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-004a',
    },
    {
      sectionTitle: 'The Sui Object Model and UID',
      slides: [
        {
          title: 'What Makes a Sui Object?',
          emoji: '📦',
          content: "Let's see what turns a regular struct into a real Sui object that lives on the blockchain. The recipe is simple — two ingredients:\n\n1. Give the struct the `key` ability\n2. Make its first field `id: UID`\n\nEvery Sui object needs a unique ID — like how every house has a unique address. Without it, the blockchain wouldn't know which object is which. You create a UID by calling `object::new(ctx)`, where `ctx` is the transaction context that Sui automatically provides.\n\nHere's an important rule that catches a lot of beginners: once you create a Sui object, you MUST explicitly do something with it — transfer it to someone, share it, or freeze it. You can't just create it and walk away. Why? Because the UID inside doesn't have the `drop` ability, so the compiler forces you to handle it. This is actually a great safety feature — it prevents objects from getting lost!",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::sword {\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use sui::transfer;\n\n    /// A sword is a Sui object (key + UID)\n    public struct Sword has key, store {\n        id: UID,\n        damage: u64,\n        durability: u64,\n    }\n\n    /// Create a new Sword and transfer it to the caller\n    public entry fun forge_sword(\n        damage: u64,\n        durability: u64,\n        ctx: &mut TxContext,\n    ) {\n        let sword = Sword {\n            id: object::new(ctx),\n            damage,\n            durability,\n        };\n        transfer::public_transfer(sword, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 7, explanation: "'has key, store' makes Sword a transferable Sui object. 'key' says 'this is a blockchain object' and 'store' says 'anyone can transfer it.' Together, they're the standard combo for tradeable items." },
                { line: 8, explanation: "'id: UID' MUST be the first field of any struct with key. This is your object's unique address on the blockchain — like a serial number. The Sui runtime enforces this rule." },
                { line: 20, explanation: "object::new(ctx) creates a globally unique UID. Each call produces a different ID, so every sword gets its own identity. The 'ctx' parameter provides the randomness needed." },
                { line: 24, explanation: "public_transfer sends the object to the transaction sender's address. After this, the caller 'owns' the sword. We use public_transfer (not just transfer) because Sword has the 'store' ability." },
              ],
            },
          },
        },
        {
          title: 'Object Ownership Models',
          emoji: '👤',
          content: "Just like in real life, things on Sui can be owned differently. Your phone is personally yours — only you can use it. A park bench is shared — anyone can sit on it. A bronze statue in a museum is permanent and read-only — everyone can look, nobody can change it.\n\nSui has four ownership models that work the same way:\n\n1. **Address-Owned**: The most common. An object belongs to a specific person, and only they can use it in transactions. Like your phone in your pocket.\n\n2. **Shared**: Any address can read and mutate the object. Created via `transfer::share_object`. Like a public whiteboard anyone can write on. (Heads up: shared objects are a bit slower because they require network consensus.)\n\n3. **Immutable (Frozen)**: The object can never be changed again. Anyone can read it. Created via `transfer::freeze_object`. Like publishing a book — once it's printed, the words don't change.\n\n4. **Wrapped (Child)**: The object is stored as a field inside another object. It doesn't have its own independent identity until it's unwrapped. Like a battery inside a remote control.\n\nLet's match the transfer functions to their ownership models:",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'addr', label: 'transfer::public_transfer', emoji: '👤' },
                { id: 'shared', label: 'transfer::public_share_object', emoji: '🌐' },
                { id: 'frozen', label: 'transfer::public_freeze_object', emoji: '🧊' },
                { id: 'wrapped', label: 'Stored as a struct field', emoji: '📥' },
              ],
              targets: [
                { id: 'owned', label: 'Address-Owned: Only owner can use it' },
                { id: 'anyone-mutate', label: 'Shared: Anyone can read and mutate' },
                { id: 'immutable', label: 'Immutable: Anyone can read, nobody can mutate' },
                { id: 'child', label: 'Wrapped: Lives inside another object' },
              ],
              correctPairs: [
                { itemId: 'addr', targetId: 'owned' },
                { itemId: 'shared', targetId: 'anyone-mutate' },
                { itemId: 'frozen', targetId: 'immutable' },
                { itemId: 'wrapped', targetId: 'child' },
              ],
            },
          },
        },
        {
          title: 'Creating and Transferring Objects',
          emoji: '🚀',
          content: "Now let's see the full lifecycle of a Sui object — from birth to ownership. It follows a clear pattern:\n\n1. **Pack it**: Create a new value by filling in all the fields (including a fresh UID)\n2. **Use it**: Read or modify fields with dot notation\n3. **Place it**: Transfer, share, or freeze it\n\nWhen you create a struct value, you use this syntax: `TypeName { field1: value1, field2: value2 }`. There's a nice shortcut too: if your variable name matches the field name, you can just write `TypeName { field1, field2 }` instead of repeating yourself.\n\nTo destroy an object (take it apart), you \"unpack\" or destructure it: `let TypeName { id, damage, durability } = sword;`. This gives you each field as a separate variable. Fun fact: unpacking is the ONLY way to get at the `id` field so you can delete it with `object::delete(id)`. This is how you permanently destroy a Sui object.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `/// Pack: create a new Sword\nlet sword = Sword {\n    id: object::new(ctx),\n    damage: 100,\n    durability: 50,\n};\n\n/// Access fields with dot notation\nlet d = sword.damage;       // 100\nsword.durability = 45;       // modify field\n\n/// Unpack: destructure the struct\nlet Sword { id, damage, durability } = sword;\n\n/// Delete the UID (required to destroy a Sui object)\nobject::delete(id);`,
              highlights: [
                { line: 2, explanation: "Struct packing creates a new value. You must supply every single field — no defaults. Miss one and the compiler will tell you." },
                { line: 9, explanation: "Dot notation reads a field. Just like in most languages — object.field gives you the value." },
                { line: 10, explanation: "You can mutate a field if you own the value or have a mutable reference (&mut). Without &mut, it's read-only." },
                { line: 13, explanation: "Unpacking (destructuring) takes the struct apart and binds each field to a local variable. The original struct is consumed — it's gone after this." },
                { line: 16, explanation: "object::delete destroys the UID. You MUST do this when destroying a Sui object because UID doesn't have the 'drop' ability — the compiler won't let you just forget about it." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-004b',
    },
    {
      sectionTitle: 'Advanced Struct Patterns',
      slides: [
        {
          title: 'The init Function and One-Time Witness',
          emoji: '🏗',
          content: "The `init` function is like a grand opening ceremony — it runs exactly once when you first publish your module to the blockchain, and it's your chance to set things up. Need to create an admin badge? Do it in init. Need to set up a global config? Do it in init. After that first run, init can never be called again.\n\nThere's also a cool concept called a One-Time Witness (OTW). It's an auto-generated struct whose name matches your module name in ALL_CAPS. For example, if your module is called `game`, the OTW is `GAME`. It has only the `drop` ability and is created exactly once by the Sui runtime. Why does this matter? It gives you a cryptographic guarantee that certain setup code can only run once — ever. This is how Sui prevents someone from re-running your initialization logic.\n\nThe pattern looks like: `fun init(witness: MODULE_NAME, ctx: &mut TxContext) { ... }`",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::game {\n    use sui::object::{Self, UID};\n    use sui::tx_context::{Self, TxContext};\n    use sui::transfer;\n\n    /// One-Time Witness (auto-generated, name = MODULE_NAME)\n    public struct GAME has drop {}\n\n    /// Admin capability object\n    public struct AdminCap has key, store {\n        id: UID,\n    }\n\n    /// Runs once at publish time\n    fun init(_witness: GAME, ctx: &mut TxContext) {\n        let admin = AdminCap {\n            id: object::new(ctx),\n        };\n        transfer::transfer(admin, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 7, explanation: "The OTW struct must match the module name in ALL_CAPS and have only the 'drop' ability. The Sui runtime creates exactly one instance of this and passes it to init. Think of it as a one-time key that gets used and thrown away." },
                { line: 15, explanation: "The init function runs exactly once when the module is published. The runtime injects the OTW automatically — you don't create it yourself. Notice the underscore prefix '_witness' which tells the compiler 'I know I'm not using this variable directly.'" },
                { line: 19, explanation: "transfer::transfer (not public_transfer) is used here because AdminCap has key but not store — only this module can transfer it. This makes it a soul-bound admin badge." },
              ],
            },
          },
        },
        {
          title: 'Capability Pattern for Access Control',
          emoji: '🛡',
          content: "Here's a really important pattern you'll use all the time: the capability pattern. Instead of checking \"are you the admin?\" by looking at someone's address, you check \"do you have the admin badge?\"\n\nIt's like how a security badge gets you into a building — whoever holds it has access. You don't check people's names at the door; you check if they have the right badge.\n\nHere's how it works: you define a capability struct (like `AdminCap`), create it in the `init` function, and give it to the deployer. Then in any privileged function, you require the caller to pass in their `AdminCap` as a parameter. If they don't have one, they can't call the function. Simple as that.\n\nWhy is this better than checking addresses? Because capabilities can be transferred to a new admin, shared for governance, or destroyed to revoke access. If you hard-coded an address, you'd have to redeploy the whole contract to change admins.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why not check addresses?', content: 'Hard-coding addresses makes upgrades painful. If the admin address changes, you would need to redeploy the entire module. With capabilities, you just transfer the badge to the new admin — no code changes needed. Much cleaner!' },
                { label: 'Can capabilities be shared?', content: 'Yes! You can share_object a capability to allow anyone to call admin functions, or wrap it in a multi-sig scheme for governance. This flexibility is why the capability pattern is so powerful.' },
                { label: 'Destroying capabilities', content: 'You can revoke access by destroying the capability object (unpacking it and deleting the UID). Once deleted, no one can call the guarded functions. It\'s like shredding a security badge — permanent revocation.' },
                { label: 'Multiple capability types', content: 'A module can define multiple cap types (AdminCap, MinterCap, PauseCap) for fine-grained role-based access control. Each role gets its own badge type, so you can give different people different levels of access.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together',
          emoji: '🎯',
          content: "Let's review the complete recipe for building a Sui module with objects. Think of this as your checklist:\n\n1. **Define your struct** with the right abilities. Use `key, store` for objects users can trade, `key` alone for soul-bound objects.\n2. **Always include `id: UID`** as the first field of any struct with `key`. The compiler will reject your code if you forget this.\n3. **Create objects** by packing the struct and using `object::new(ctx)` for the UID.\n4. **Transfer ownership** using the correct function: `public_transfer` for `key + store` objects, `transfer` for `key`-only objects. Using the wrong one is a common mistake!\n5. **Use the capability pattern** for access control — give out badges, don't check IDs.\n6. **Use `init`** to set up singleton objects and hand out initial capabilities.\n\nRemember the golden rule: every Sui object must be explicitly placed — transferred, shared, or frozen. You cannot let objects vanish into thin air. Click below for the most common mistakes beginners make:",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Common mistake: Missing UID', content: 'If you add the key ability but forget the id: UID field, the compiler will reject the module. This is the #1 beginner mistake with structs. Always make id: UID the FIRST field.' },
                { label: 'Common mistake: Wrong transfer function', content: 'Using public_transfer on a key-only struct (no store) will fail at compile time. Quick rule: has store? Use public_transfer. No store? Use transfer. Getting this wrong gives you a confusing error message.' },
                { label: 'Common mistake: Forgetting to place objects', content: 'If you create an object and let it go out of scope without transferring, sharing, or freezing it, the compiler will error. This happens because UID does not have drop — Move forces you to be responsible with every object.' },
                { label: 'Tip: Use entry functions', content: 'Mark functions as public entry when they should be callable directly from a wallet or transaction. Entry functions can take objects by value, reference, or mutable reference — Sui handles the lookup for you.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-004c',
    },
  ],

  quiz: [
    {
      question: 'Which ability must a struct have to be a top-level Sui object?',
      options: [
        'store',
        'copy',
        'key',
        'drop',
      ],
      correctAnswer: 2,
      explanation: "The 'key' ability is what turns a regular struct into a real Sui object that lives on the blockchain. Think of it like a registration sticker — without it, your struct is just data floating around inside your code. With 'key', it becomes a first-class citizen on the network. And remember, any struct with 'key' must also have 'id: UID' as its first field. Why this matters: this is the foundation of everything you build on Sui. Every NFT, every token, every game item is a struct with the 'key' ability.",
      weaknessTopic: 'structs-objects',
      practiceHint: "Remember the rule: key = top-level Sui object, and it always requires a UID field. Without key, a struct can only live nested inside another object (if it has store).",
    },
    {
      question: 'What is the correct way to create a fresh UID for a new Sui object?',
      options: [
        'UID::new()',
        'object::new(ctx)',
        'sui::uid::create()',
        'tx_context::fresh_id(ctx)',
      ],
      correctAnswer: 1,
      explanation: "You create a new UID by calling object::new(ctx), where ctx is a &mut TxContext. The TxContext provides the entropy (randomness) needed to generate a globally unique identifier — every call produces a different one. Why this matters: if you get this wrong, your code won't compile. This is the one function you'll call every single time you create a Sui object, so it's worth memorizing.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The object module provides the new() function that takes a mutable reference to TxContext. It's always object::new(ctx) — the ctx is what makes each ID unique.",
    },
    {
      question: 'A struct has `has key` but NOT `store`. Which transfer function must you use?',
      options: [
        'transfer::public_transfer',
        'transfer::public_share_object',
        'transfer::transfer',
        'transfer::freeze_object',
      ],
      correctAnswer: 2,
      explanation: "transfer::transfer is the module-private transfer function that works with key-only objects. The 'public_' variants require the object to have both key AND store abilities. A key-only object is 'soul-bound' — only the module that defines it can move it around. Why this matters: using the wrong transfer function is one of the most common compile errors beginners hit. Quick rule of thumb: has store? Use public_transfer. No store? Use transfer.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The 'public_' prefix on transfer functions requires the store ability. Without store, you must use the non-public version. Think of 'store' as the permission that says 'anyone can move this around.'",
    },
    {
      question: 'What happens if you create a Sui object but never transfer, share, or freeze it?',
      options: [
        'It is automatically transferred to the transaction sender',
        'It is stored in a default global pool',
        'The compiler produces an error because UID does not have drop',
        'It becomes an immutable object by default',
      ],
      correctAnswer: 2,
      explanation: "UID does not have the 'drop' ability, so Move won't let you silently discard it. If you create an object and just let it go out of scope, the compiler will catch this and give you an error. This is actually a brilliant safety feature — it makes it impossible to accidentally lose objects. Why this matters: this is Move's ownership system protecting you. Every object must be explicitly handled, which prevents the kind of bugs where assets get permanently stuck or lost.",
      weaknessTopic: 'structs-objects',
      practiceHint: "Think about the drop ability. UID lacks it, so the compiler forces you to handle every object explicitly. You MUST transfer, share, or freeze it — no exceptions.",
    },
    {
      question: 'What is a One-Time Witness (OTW) in Sui Move?',
      options: [
        'A struct with copy and drop that can be created in any function',
        'An auto-generated struct matching the module name in ALL_CAPS, with only drop, created once at publish',
        'A special UID that can only be used once per transaction',
        'A cryptographic proof attached to each transaction',
      ],
      correctAnswer: 1,
      explanation: "A One-Time Witness is a struct whose name matches the module name in ALL_CAPS (e.g., module 'game' has OTW 'GAME'). It has only the 'drop' ability and is created exactly once by the Sui runtime, then passed to the init function. After init finishes, it's gone forever. Why this matters: the OTW is how Sui guarantees certain setup code can only run once. It's used in patterns like creating a coin type or initializing a singleton config — things that should never happen twice.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The OTW name convention is ALL_CAPS matching the module name, and it only has the drop ability. It's the Sui runtime's way of giving you a one-time-use key for your init function.",
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module lesson4::hero {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;

    // TODO 1: Define a struct called 'Hero' that is a transferable Sui object.
    //         It should have the following fields:
    //           - id: UID
    //           - name: String
    //           - power: u64
    //           - level: u8
    //
    // Remember: a transferable Sui object needs BOTH 'key' and 'store' abilities.
    // The syntax is: public struct Name has key, store { ... }
    // And 'id: UID' MUST be the very first field — the compiler enforces this!


    // TODO 2: Write a public entry function called 'create_hero' that:
    //         - Takes 'name: String', 'power: u64', and 'ctx: &mut TxContext'
    //         - Creates a new Hero with level set to 1
    //         - Transfers the hero to the transaction sender
    //
    // Step by step:
    //   a) Pack the Hero struct: Hero { id: object::new(ctx), name, power, level: 1 }
    //   b) Send it to the caller: transfer::public_transfer(hero, tx_context::sender(ctx))
    //   Note: We use public_transfer because Hero has both key AND store.


    // TODO 3: Write a public entry function called 'level_up' that:
    //         - Takes a mutable reference to a Hero (hero: &mut Hero)
    //         - Increases the hero's level by 1
    //         - Increases the hero's power by 10
    //
    // Use dot notation to read and write fields:
    //   hero.level = hero.level + 1;
    //   hero.power = hero.power + 10;


    // TODO 4: Write a public function called 'hero_power' that:
    //         - Takes an immutable reference to a Hero (hero: &Hero)
    //         - Returns the hero's power as u64
    //
    // Remember: the last expression without a semicolon is the return value.
    // So just write: hero.power

}`,

  solution: `module lesson4::hero {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;

    // TODO 1: Define a struct called 'Hero' that is a transferable Sui object.
    public struct Hero has key, store {
        id: UID,
        name: String,
        power: u64,
        level: u8,
    }

    // TODO 2: Write a public entry function called 'create_hero'
    public entry fun create_hero(
        name: String,
        power: u64,
        ctx: &mut TxContext,
    ) {
        let hero = Hero {
            id: object::new(ctx),
            name,
            power,
            level: 1,
        };
        transfer::public_transfer(hero, tx_context::sender(ctx));
    }

    // TODO 3: Write a public entry function called 'level_up'
    public entry fun level_up(hero: &mut Hero) {
        hero.level = hero.level + 1;
        hero.power = hero.power + 10;
    }

    // TODO 4: Write a public function called 'hero_power'
    public fun hero_power(hero: &Hero): u64 {
        hero.power
    }
}`,

  hints: [
    "Let's start with TODO 1. A transferable Sui object needs both 'key' and 'store' abilities. Write it as: public struct Hero has key, store { ... }. Don't forget that 'id: UID' must be the first field!",
    "For TODO 2, you need to create a Hero and send it to the caller. First, pack the struct: let hero = Hero { id: object::new(ctx), name, power, level: 1 }. Then transfer it: transfer::public_transfer(hero, tx_context::sender(ctx)). We use public_transfer because Hero has store.",
    "For TODO 3, take 'hero: &mut Hero' as the parameter. The &mut means you can change the hero's fields. Then use dot notation: hero.level = hero.level + 1 and hero.power = hero.power + 10.",
    "Almost there! For TODO 4, take 'hero: &Hero' (no mut — we're just reading). The return type is u64. The body is just: hero.power (no semicolon — that makes it the return value).",
  ],
};
