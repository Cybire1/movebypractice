import { LessonContent } from '@/app/types/lesson';

export const moveLesson4: LessonContent = {
  id: 'move-4',
  title: 'Structs & Objects',
  description: 'Master the Sui object model by defining structs with abilities, creating objects with UID, and understanding how the key, store, copy, and drop abilities shape data ownership and transfer on Sui.',
  difficulty: 'intermediate',
  xpReward: 250,
  order: 4,
  language: 'move',
  prerequisiteLessons: ['move-3'],

  narrative: {
    welcomeMessage: "Welcome to the heart of Sui Move! Everything on Sui is an object, and objects are defined as structs. In this lesson you will learn how to define structs, assign abilities, and create first-class Sui objects that live on-chain. This knowledge is the foundation for building any Sui application.",
    quizTransition: "You have explored structs, abilities, and the Sui object model. Let's see how well you internalized these concepts with a quick quiz...",
    practiceTransition: "Great work on the quiz! Now it is time to write a real Sui module that defines a struct, creates an object, and transfers it to a user.",
    celebrationMessage: "Outstanding! You can now define Sui objects, assign abilities, and transfer ownership on-chain. You are ready to tackle collections and dynamic fields next!",
    nextLessonTease: "Next up: Collections & Dynamic Fields. You will learn how to store groups of values with vectors, Tables, and dynamic fields to build complex on-chain data structures.",
  },

  teachingSections: [
    {
      sectionTitle: 'Defining Structs and the Ability System',
      slides: [
        {
          title: 'What is a Struct?',
          emoji: '🧱',
          content: "In Sui Move, a struct is the only way to define a custom type. Structs are similar to classes in other languages but without methods attached to them. A struct groups related data into a single named type. You define a struct inside a module with the `struct` keyword, followed by the name, optional abilities, and the fields enclosed in braces.\n\nEvery field has a name and a type. Struct names must start with an uppercase letter and follow PascalCase convention. Fields are accessed with dot notation on instances of the struct.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::profile {\n    use std::string::String;\n\n    /// A simple user profile with no abilities\n    public struct Profile {\n        name: String,\n        age: u64,\n        score: u64,\n    }\n}`,
              highlights: [
                { line: 5, explanation: "The 'public struct' keyword makes this type visible outside the module. Without 'public', only the defining module can use it." },
                { line: 6, explanation: "Each field has a name and a type separated by a colon. String is imported from std::string." },
                { line: 8, explanation: "Multiple fields are separated by commas. The last comma is optional but conventional." },
              ],
            },
          },
        },
        {
          title: 'The Four Abilities',
          emoji: '🔑',
          content: "Every struct in Move can be annotated with up to four abilities that control what the runtime allows you to do with values of that type.\n\n- **copy**: The value can be duplicated (e.g., integers have copy).\n- **drop**: The value can be silently discarded when it goes out of scope. Without drop, you must explicitly consume or transfer the value.\n- **store**: The value can be stored inside another struct or placed into global storage.\n- **key**: The value can be used as a top-level object in Sui's global object store. A struct with `key` MUST have `id: UID` as its first field.\n\nAbilities are declared with the `has` keyword after the struct name.",
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
          content: "You can combine abilities depending on what you want to allow. Here are common patterns:\n\n- `has key, store` -- A transferable Sui object. The `key` ability makes it a Sui object, and `store` lets it be wrapped inside other objects or transferred via `public_transfer`.\n- `has store` -- A value that can only live nested inside a Sui object, never as a standalone top-level object.\n- `has copy, drop, store` -- A lightweight data type (like a config or a record) that can be freely copied, discarded, and stored.\n- `has key` (without store) -- A soul-bound object. It can only be transferred by the module that defines it using `transfer::transfer`, never via `public_transfer`.\n\nChoosing the right combination is a key design decision in Sui Move.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'key, store', content: 'Transferable Sui object. Anyone can call sui::transfer::public_transfer to move it between addresses. Most NFTs and tokens use this pattern.' },
                { label: 'key only', content: 'Soul-bound object. Only the defining module can transfer it with transfer::transfer. Useful for identity tokens or non-transferable badges.' },
                { label: 'store only', content: 'A nested-only value. Cannot exist as a top-level object but can be stored as a field inside a Sui object. Think of it like an inner component.' },
                { label: 'copy, drop, store', content: 'A freely usable data struct. Can be duplicated, dropped, and stored anywhere. Ideal for configs, events, and lightweight records.' },
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
          content: "On Sui, an object is simply a struct that has the `key` ability and whose first field is `id: UID`. The UID (Unique Identifier) is generated by the Sui runtime and globally identifies the object across the entire network.\n\nYou create a UID by calling `object::new(ctx)`, where `ctx` is a mutable reference to `TxContext`. The TxContext is automatically provided to `entry` and `init` functions and contains information about the current transaction, including a counter used to derive fresh UIDs.\n\nOnce created, a Sui object must be explicitly transferred to an address, shared, or frozen. You cannot simply let it go out of scope (unless it has `drop`, which Sui objects almost never should).",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::sword {\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use sui::transfer;\n\n    /// A sword is a Sui object (key + UID)\n    public struct Sword has key, store {\n        id: UID,\n        damage: u64,\n        durability: u64,\n    }\n\n    /// Create a new Sword and transfer it to the caller\n    public entry fun forge_sword(\n        damage: u64,\n        durability: u64,\n        ctx: &mut TxContext,\n    ) {\n        let sword = Sword {\n            id: object::new(ctx),\n            damage,\n            durability,\n        };\n        transfer::public_transfer(sword, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 7, explanation: "'has key, store' makes Sword a transferable Sui object. key requires a UID field; store enables public_transfer." },
                { line: 8, explanation: "'id: UID' MUST be the first field of any struct with the key ability. This is enforced by the Sui runtime." },
                { line: 20, explanation: "object::new(ctx) creates a globally unique UID for this object. Each call produces a different ID." },
                { line: 24, explanation: "public_transfer sends the object to the transaction sender's address. The object is now owned by that address." },
              ],
            },
          },
        },
        {
          title: 'Object Ownership Models',
          emoji: '👤',
          content: "Sui has four distinct ownership models for objects:\n\n1. **Address-Owned**: The most common model. An object is owned by a specific address and only that address can use it in transactions. Created via `transfer::transfer` or `transfer::public_transfer`.\n\n2. **Shared**: Any address can read and mutate the object. Created via `transfer::share_object` or `transfer::public_share_object`. Shared objects require consensus, making transactions slightly slower.\n\n3. **Immutable (Frozen)**: The object can never be mutated again. Anyone can read it. Created via `transfer::freeze_object` or `transfer::public_freeze_object`. Ideal for configs and constants.\n\n4. **Wrapped (Child)**: The object is stored as a field inside another object. It has no independent on-chain identity until unwrapped.",
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
          content: "The lifecycle of a Sui object follows a clear pattern: define the struct, create a value by packing fields (including a fresh UID), and then place it into one of the ownership models.\n\nStruct packing uses a literal syntax: `TypeName { field1: value1, field2: value2 }`. If a variable has the same name as a field, you can use shorthand: `TypeName { field1, field2 }`.\n\nTo read or modify fields, you use dot notation (`obj.field`). To unpack a struct (destructure it), you bind its fields to local variables: `let TypeName { id, damage, durability } = sword;`. Unpacking is the only way to access the `id` field for deletion via `object::delete(id)`.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `/// Pack: create a new Sword\nlet sword = Sword {\n    id: object::new(ctx),\n    damage: 100,\n    durability: 50,\n};\n\n/// Access fields with dot notation\nlet d = sword.damage;       // 100\nsword.durability = 45;       // modify field\n\n/// Unpack: destructure the struct\nlet Sword { id, damage, durability } = sword;\n\n/// Delete the UID (required to destroy a Sui object)\nobject::delete(id);`,
              highlights: [
                { line: 2, explanation: "Struct packing creates a new value. All fields must be supplied." },
                { line: 9, explanation: "Dot notation reads a field. The struct must be borrowed or owned." },
                { line: 10, explanation: "You can mutate a field if you have a mutable reference or own the value." },
                { line: 13, explanation: "Unpacking (destructuring) binds each field to a local variable and consumes the struct." },
                { line: 16, explanation: "object::delete destroys the UID. This is required because UID does not have drop." },
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
          content: "Every Sui module can optionally define a special `init` function that runs exactly once when the module is first published. The init function receives a `TxContext` (and optionally a One-Time Witness) and is the ideal place to create singleton objects like admin capabilities or global configuration.\n\nA One-Time Witness (OTW) is an auto-generated struct whose name matches the module name in ALL_CAPS. It has only `drop` ability and is created exactly once by the runtime. This guarantees that certain setup logic can never be repeated.\n\nPattern: `fun init(witness: MODULE_NAME, ctx: &mut TxContext) { ... }`",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::game {\n    use sui::object::{Self, UID};\n    use sui::tx_context::{Self, TxContext};\n    use sui::transfer;\n\n    /// One-Time Witness (auto-generated, name = MODULE_NAME)\n    public struct GAME has drop {}\n\n    /// Admin capability object\n    public struct AdminCap has key, store {\n        id: UID,\n    }\n\n    /// Runs once at publish time\n    fun init(_witness: GAME, ctx: &mut TxContext) {\n        let admin = AdminCap {\n            id: object::new(ctx),\n        };\n        transfer::transfer(admin, tx_context::sender(ctx));\n    }\n}`,
              highlights: [
                { line: 7, explanation: "The OTW struct must match the module name in ALL_CAPS and have only the 'drop' ability." },
                { line: 15, explanation: "The init function runs exactly once when the module is published. The runtime injects the OTW." },
                { line: 19, explanation: "transfer::transfer (not public_transfer) is used because AdminCap has key but not store -- only this module can transfer it." },
              ],
            },
          },
        },
        {
          title: 'Capability Pattern for Access Control',
          emoji: '🛡',
          content: "The capability pattern is the idiomatic way to implement access control in Sui Move. Instead of checking addresses directly, you define a capability struct (e.g., AdminCap) and require it as a parameter in privileged functions. Only the address that owns the capability object can call those functions.\n\nThis is more composable than address checks because capabilities can be transferred, shared, or destroyed. It also decouples authorization from identity: you don't need to hard-code admin addresses.\n\nCapability objects are typically created in the `init` function and transferred to the deployer.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why not check addresses?', content: 'Hard-coding addresses makes upgrades difficult. If the admin address changes, you would need to redeploy. Capabilities can simply be transferred to a new admin.' },
                { label: 'Can capabilities be shared?', content: 'Yes. You can share_object a capability to allow anyone to call admin functions, or wrap it in a multi-sig scheme for governance.' },
                { label: 'Destroying capabilities', content: 'You can revoke access by destroying the capability object (unpacking it and deleting the UID). Once deleted, no one can call the guarded functions.' },
                { label: 'Multiple capability types', content: 'A module can define multiple cap types (AdminCap, MinterCap, PauseCap) for fine-grained role-based access control.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together',
          emoji: '🎯',
          content: "Let's review the complete pattern for building a Sui module with objects:\n\n1. **Define your struct** with the appropriate abilities. Use `key, store` for transferable objects, `key` alone for soul-bound objects.\n2. **Always include `id: UID`** as the first field of any struct with the `key` ability.\n3. **Create objects** by packing the struct with `object::new(ctx)` for the UID.\n4. **Transfer ownership** using the correct function: `public_transfer` for `key + store` objects, `transfer` for `key`-only objects.\n5. **Use the capability pattern** for access control instead of hard-coding addresses.\n6. **Use `init`** to set up singleton objects and distribute initial capabilities.\n\nRemember: every Sui object must be explicitly placed -- transferred, shared, or frozen. You cannot let objects go out of scope.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Common mistake: Missing UID', content: 'If you add the key ability but forget the id: UID field, the compiler will reject the module. Always make id: UID the first field.' },
                { label: 'Common mistake: Wrong transfer function', content: 'Using public_transfer on a key-only struct (no store) will fail. Use transfer::transfer for key-only objects and transfer::public_transfer for key+store objects.' },
                { label: 'Common mistake: Forgetting to place objects', content: 'If you create an object and let it go out of scope without transferring, sharing, or freezing it, the compiler will error because UID does not have drop.' },
                { label: 'Tip: Use entry functions', content: 'Mark functions as public entry when they should be callable directly from a transaction. Entry functions can take objects by value, reference, or mutable reference.' },
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
      explanation: "The 'key' ability marks a struct as a Sui object that can exist at the top level of global storage. A struct with 'key' must also have 'id: UID' as its first field. Without 'key', a struct can only exist nested inside other objects (if it has 'store').",
      weaknessTopic: 'structs-objects',
      practiceHint: "Remember the rule: key = top-level Sui object, and it always requires a UID field.",
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
      explanation: "You create a new UID by calling object::new(ctx), where ctx is a &mut TxContext. The TxContext provides the entropy needed to generate a globally unique identifier. Each call to object::new produces a different UID.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The object module provides the new() function that takes a mutable reference to TxContext.",
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
      explanation: "transfer::transfer is the module-private transfer function that works with key-only objects. transfer::public_transfer requires the object to have both key and store abilities. A key-only object (soul-bound) can only be transferred by the module that defines it.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The 'public_' prefix on transfer functions requires the store ability. Without store, use the non-public version.",
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
      explanation: "UID does not have the 'drop' ability, so a struct containing a UID cannot be silently discarded. If you create an object and let it go out of scope without explicitly placing it (transfer, share, or freeze), the Move compiler will reject the code with an error.",
      weaknessTopic: 'structs-objects',
      practiceHint: "Think about the drop ability. UID lacks it, so the compiler forces you to handle every object explicitly.",
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
      explanation: "A One-Time Witness is a struct whose name matches the module name in ALL_CAPS (e.g., module 'game' has OTW 'GAME'). It has only the 'drop' ability and is instantiated exactly once by the runtime, passed to the init function. This guarantees certain setup code runs only once.",
      weaknessTopic: 'structs-objects',
      practiceHint: "The OTW name convention is ALL_CAPS matching the module name, and it only has the drop ability.",
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
    // Hint: A transferable Sui object needs 'key' and 'store' abilities.


    // TODO 2: Write a public entry function called 'create_hero' that:
    //         - Takes 'name: String', 'power: u64', and 'ctx: &mut TxContext'
    //         - Creates a new Hero with level set to 1
    //         - Transfers the hero to the transaction sender


    // TODO 3: Write a public entry function called 'level_up' that:
    //         - Takes a mutable reference to a Hero
    //         - Increases the hero's level by 1
    //         - Increases the hero's power by 10


    // TODO 4: Write a public function called 'hero_power' that:
    //         - Takes an immutable reference to a Hero
    //         - Returns the hero's power as u64

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
    "A transferable Sui object needs both 'key' and 'store' abilities. Declare it as: public struct Hero has key, store { ... }",
    "The first field of any struct with 'key' must be 'id: UID'. Create it with object::new(ctx) inside your function.",
    "Use transfer::public_transfer(object, recipient) to send a key+store object. Get the sender address with tx_context::sender(ctx).",
    "For level_up, take 'hero: &mut Hero' to get a mutable reference. Then use dot notation: hero.level = hero.level + 1.",
  ],
};
