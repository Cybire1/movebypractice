import { LessonContent } from '../types/lesson';

export const moveLesson7: LessonContent = {
  id: 'move-7',
  title: 'Advanced Generics & Patterns',
  description: 'Master generic types with ability constraints, phantom type parameters, the witness pattern, one-time witness (OTW), hot potato, and capability-based access control — the design patterns that power production Sui protocols.',
  difficulty: 'advanced',
  xpReward: 500,
  order: 7,
  language: 'move',
  prerequisiteLessons: ['move-6'],

  narrative: {
    welcomeMessage: "You have arrived at the architectural heart of Sui Move. The patterns you will learn in this lesson — witness, one-time witness, hot potato, capability — are not academic curiosities. They are the exact patterns used by SuiFrens, DeepBook, Cetus, and every serious Sui protocol. Mastering these will transform you from someone who writes Move code into someone who designs Move systems.",
    quizTransition: "These patterns are subtle and powerful. Let's test whether you have internalized not just the syntax but the reasoning behind each design pattern.",
    practiceTransition: "Now implement these patterns from scratch. You will build a generic container, a coin-like type using the one-time witness pattern, and a capability-guarded admin module.",
    celebrationMessage: "Outstanding! You have mastered the advanced patterns that separate beginner Move from production-grade Sui architecture. Witness, OTW, hot potato, capability — these are now in your toolkit.",
    nextLessonTease: "With these patterns in hand, you are ready to build real DeFi and NFT protocols. The next lessons will apply everything you have learned to build production smart contracts on Sui.",
  },

  teachingSections: [
    {
      sectionTitle: 'Generics and Ability Constraints',
      slides: [
        {
          title: 'Generic Types in Move',
          emoji: '🧬',
          content: "Generics let you write code that works over many types while preserving type safety. In Move, generic type parameters are declared in angle brackets: `struct Box<T>` or `fun wrap<T>(item: T)`. Unlike templates in C++ that are essentially copy-paste, Move generics are **fully parametric** — the compiler ensures your generic code works for every possible type `T`.\n\nYou can constrain what types are allowed using ability constraints: `<T: store>` means T must have the `store` ability, `<T: key + store>` means T must have both. These constraints are checked at compile time and enable the compiler to guarantee safety properties. For example, a generic vault `Vault<T: key + store>` can only hold objects that are storable and have UIDs — you cannot accidentally put a non-object type inside it.\n\nMultiple type parameters are supported: `struct Pair<A: store, B: store>` holds two different storable types. The Sui framework uses generics extensively — `Coin<T>` is the canonical example, where T identifies the currency type.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::generics {\n    // Generic struct: Box can hold any type with store ability\n    public struct Box<T: store> has key, store {\n        id: UID,\n        content: T,\n    }\n\n    // Generic function: create a box with any storable content\n    public fun create_box<T: store>(\n        content: T,\n        ctx: &mut TxContext,\n    ): Box<T> {\n        Box {\n            id: object::new(ctx),\n            content,\n        }\n    }\n\n    // Generic function: extract the content, destroying the box\n    public fun unbox<T: store>(box: Box<T>): T {\n        let Box { id, content } = box;\n        object::delete(id);\n        content\n    }\n\n    // Multiple type parameters with different constraints\n    public struct Pair<A: store, B: store> has key, store {\n        id: UID,\n        first: A,\n        second: B,\n    }\n}`,
              highlights: [
                { line: 3, explanation: "Box<T: store> constrains T to types with the store ability. The Box itself has key + store, making it a transferable object." },
                { line: 9, explanation: "The function is generic over T: store. The same constraint appears on the function as on the struct." },
                { line: 20, explanation: "Destructuring a generic struct: the content of type T is returned. The UID is deleted to destroy the box." },
                { line: 27, explanation: "Multiple type parameters: A and B can be different types, each constrained to have store." },
              ],
            },
          },
        },
        {
          title: 'Phantom Type Parameters',
          emoji: '👻',
          content: "A **phantom type parameter** is a generic parameter that appears in the struct declaration but is **not used in any field**. It exists purely as a type-level tag. In Move, phantom parameters are declared with the `phantom` keyword: `struct Coin<phantom T>`.\n\nWhy is this useful? Because it lets you create distinct types that share the same runtime representation. `Coin<SUI>` and `Coin<USDC>` have identical runtime layouts (both are just a UID and a u64 balance), but the type system treats them as completely different types. You cannot pass a `Coin<SUI>` where a `Coin<USDC>` is expected.\n\nThe `phantom` keyword also relaxes ability inference: a phantom parameter does not need to satisfy the abilities of the struct. For instance, `Coin<phantom T> has store` does not require T to have `store`. This is critical because currency marker types like `SUI` or `USDC` are empty structs that may only have `drop` — without phantom, the Coin struct could not have `store`.\n\nPhantom types are the backbone of the Sui token system, the Transfer Policy system, and many other frameworks.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What Makes It Phantom?', content: 'A phantom type parameter is NOT used in any struct field. It exists only in the type signature. Declared with the phantom keyword: struct MyType<phantom T>.' },
                { label: 'Why Phantom Matters', content: 'Without phantom, if your struct has store, ALL type parameters must also have store. Phantom exempts the parameter from this requirement, allowing marker types with only drop.' },
                { label: 'Coin<phantom T>', content: 'The Sui Coin type uses phantom T. SUI, USDC, etc. are empty marker structs (one-time witnesses). Coin<SUI> and Coin<USDC> are different types but same layout.' },
                { label: 'Type Safety', content: 'Phantom types prevent mixing. A function taking Coin<SUI> will reject Coin<USDC> at compile time, even though both have the same fields.' },
              ],
            },
          },
        },
        {
          title: 'Type Reflection and Type Names',
          emoji: '🔍',
          content: "Sui Move provides the `std::type_name` module for runtime type introspection. `type_name::get<T>()` returns a `TypeName` struct containing the fully qualified name of type T as a string. This is useful for logging, error messages, and building type-indexed registries.\n\nA common pattern is to use `type_name::get<T>()` as a key in a `Table` or `Bag` to create a **type-indexed map** — a collection that stores one value per type. This is how many DeFi protocols manage multiple coin types: they have a single shared object with a `Bag` field, and each coin type T gets its own entry keyed by the TypeName of T.\n\nAnother use is **type guards**: asserting at runtime that a generic parameter matches an expected type. While Move's type system catches most errors at compile time, type guards are useful when working with dynamic fields or bags where the type information is erased.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::type_registry {\n    use std::type_name::{Self, TypeName};\n    use sui::bag::{Self, Bag};\n\n    public struct Registry has key {\n        id: UID,\n        entries: Bag,  // type-indexed storage\n    }\n\n    // Register a value under its type name\n    public fun register<T: store>(\n        registry: &mut Registry,\n        value: T,\n    ) {\n        let type_key = type_name::get<T>();\n        assert!(!bag::contains(&registry.entries, type_key), 0);\n        bag::add(&mut registry.entries, type_key, value);\n    }\n\n    // Retrieve a value by its type\n    public fun get<T: store>(registry: &Registry): &T {\n        let type_key = type_name::get<T>();\n        bag::borrow(&registry.entries, type_key)\n    }\n\n    // Check if a type is registered\n    public fun is_registered<T: store>(registry: &Registry): bool {\n        let type_key = type_name::get<T>();\n        bag::contains(&registry.entries, type_key)\n    }\n}`,
              highlights: [
                { line: 2, explanation: "std::type_name provides TypeName and get<T>() for runtime type introspection." },
                { line: 7, explanation: "Bag is a heterogeneous collection. Combined with TypeName keys, it becomes a type-indexed map." },
                { line: 15, explanation: "type_name::get<T>() returns a TypeName that uniquely identifies type T. Used as the key." },
                { line: 16, explanation: "Assert the type is not already registered — each type gets exactly one entry." },
                { line: 22, explanation: "Retrieve by type: type_name::get<T>() reconstructs the same key, so you get back the value of type T." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-019',
    },
    {
      sectionTitle: 'The Witness and One-Time Witness Patterns',
      slides: [
        {
          title: 'The Witness Pattern',
          emoji: '👁️',
          content: "The **witness pattern** uses a type as proof of authority. A witness is a struct — typically with only the `drop` ability — that can only be created inside the module that defines it. By requiring a witness as a function parameter, you can gate access to a function so that only the defining module can call it.\n\nHere is the core idea: module A defines `struct MyWitness has drop {}`. Module B has a function `fun register<T: drop>(witness: T)`. Only module A can create a `MyWitness` value and pass it to `register<MyWitness>`. Module C cannot create a `MyWitness` — the compiler enforces that structs can only be constructed in their defining module.\n\nThis pattern provides **module-level authorization without capabilities or signatures**. It is used extensively in the Sui framework: `coin::create_currency` requires a witness to prove you are the module that defines the coin type. `transfer_policy::new` requires a witness to prove you are the creator of the NFT type.\n\nThe witness is typically a zero-sized struct (no fields) with only `drop`. It is created, passed to the framework function, and immediately dropped — it exists purely as a type-level proof.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::witness_demo {\n    // The witness: can ONLY be created in this module\n    public struct MY_WITNESS has drop {}\n\n    // Use the witness to register with a framework\n    fun init(ctx: &mut TxContext) {\n        // Create the witness — only this module can do this\n        let witness = MY_WITNESS {};\n\n        // Pass it to a framework function that requires proof\n        framework::register<MY_WITNESS>(witness, ctx);\n    }\n}\n\nmodule examples::framework {\n    // T: drop serves as a witness — proof that the caller\n    // is the module that defines T\n    public fun register<T: drop>(_witness: T, ctx: &mut TxContext) {\n        // _witness is consumed (dropped) here\n        // We now know the caller is the module that defines T\n        // ... perform privileged registration ...\n    }\n}`,
              highlights: [
                { line: 3, explanation: "MY_WITNESS is a zero-sized struct with only 'drop'. It has no fields — it exists purely as a type-level proof of authority." },
                { line: 8, explanation: "Creating the witness. Only code inside examples::witness_demo can write MY_WITNESS {}. No other module can construct it." },
                { line: 11, explanation: "Pass the witness to the framework. The type parameter T = MY_WITNESS links the registration to this specific module." },
                { line: 18, explanation: "The framework function requires T: drop. The _witness parameter is consumed (dropped), proving the caller controls module T." },
              ],
            },
          },
        },
        {
          title: 'One-Time Witness (OTW)',
          emoji: '1️⃣',
          content: "A **one-time witness (OTW)** is a special witness that can only exist **once** — it is created automatically by the Sui runtime and passed to the module's `init` function. This guarantees that certain setup operations (like creating a currency) can only happen once, during module publication.\n\nThe OTW rules are strict. A struct is an OTW if and only if:\n1. It is named after the module in **UPPER_CASE** (e.g., module `my_coin` has OTW `MY_COIN`)\n2. It has **only the `drop` ability** (no `key`, `store`, or `copy`)\n3. It has **no fields**\n4. It is not created anywhere except the `init` function (where Sui automatically provides it)\n\nThe Sui runtime creates exactly one instance of the OTW and passes it as the first parameter to `init`. After `init` returns, no more instances can ever be created. This is how `coin::create_currency` ensures each coin type is created exactly once.\n\nYou can verify an OTW at runtime using `sui::types::is_one_time_witness<T>(witness)` which returns true only for valid OTW instances.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'upper-name', label: 'Named in UPPER_CASE matching module', emoji: '🔤' },
                { id: 'drop-only', label: 'Has only the drop ability', emoji: '💧' },
                { id: 'no-fields', label: 'Has zero fields', emoji: '📭' },
                { id: 'auto-created', label: 'Auto-created by Sui runtime in init', emoji: '🤖' },
              ],
              targets: [
                { id: 'rule1', label: 'OTW Rule 1' },
                { id: 'rule2', label: 'OTW Rule 2' },
                { id: 'rule3', label: 'OTW Rule 3' },
                { id: 'rule4', label: 'OTW Rule 4' },
              ],
              correctPairs: [
                { itemId: 'upper-name', targetId: 'rule1' },
                { itemId: 'drop-only', targetId: 'rule2' },
                { itemId: 'no-fields', targetId: 'rule3' },
                { itemId: 'auto-created', targetId: 'rule4' },
              ],
            },
          },
        },
        {
          title: 'OTW in Practice: Creating a Currency',
          emoji: '🪙',
          content: "The most common use of OTW is creating a fungible token with `coin::create_currency`. This function takes an OTW witness as its first argument, guaranteeing that the currency can only be created once — during module publication.\n\n`coin::create_currency` returns two objects: a `TreasuryCap<T>` (the minting authority) and a `CoinMetadata<T>` (name, symbol, decimals, etc.). The TreasuryCap is typically transferred to the deployer or shared, while CoinMetadata is often frozen as an immutable reference.\n\nThe pattern is elegant: the OTW proves you are the module author AND that this is the first (and only) time this code runs. The phantom type parameter T on Coin, TreasuryCap, and CoinMetadata links everything back to your module, ensuring type safety across the entire token lifecycle.\n\nThis same pattern applies beyond coins: `display::new<T>(witness)` for creating Display objects, `transfer_policy::new<T>(witness)` for creating transfer policies, and many other Sui framework functions.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::my_coin {\n    use sui::coin;\n    use sui::transfer;\n\n    // OTW: named MY_COIN (module is my_coin), drop only, no fields\n    public struct MY_COIN has drop {}\n\n    fun init(witness: MY_COIN, ctx: &mut TxContext) {\n        // create_currency consumes the OTW — can never be called again\n        let (treasury_cap, metadata) = coin::create_currency(\n            witness,         // OTW consumed here\n            6,               // decimals\n            b"MYC",          // symbol\n            b"My Coin",      // name\n            b"A custom coin", // description\n            option::none(),  // icon URL\n            ctx,\n        );\n\n        // Freeze metadata — immutable forever\n        transfer::public_freeze_object(metadata);\n        // Transfer mint authority to deployer\n        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));\n    }\n\n    // Mint new coins using the TreasuryCap\n    public fun mint(\n        cap: &mut coin::TreasuryCap<MY_COIN>,\n        amount: u64,\n        recipient: address,\n        ctx: &mut TxContext,\n    ) {\n        let minted = coin::mint(cap, amount, ctx);\n        transfer::public_transfer(minted, recipient);\n    }\n}`,
              highlights: [
                { line: 6, explanation: "MY_COIN is the OTW. Name matches module (my_coin -> MY_COIN), has only drop, has no fields." },
                { line: 8, explanation: "Sui automatically creates one MY_COIN instance and passes it to init. No other init call can ever happen." },
                { line: 10, explanation: "coin::create_currency consumes the OTW witness. This can never be called again for MY_COIN." },
                { line: 21, explanation: "CoinMetadata is frozen — anyone can read the coin's name/symbol/decimals but nobody can change them." },
                { line: 28, explanation: "TreasuryCap<MY_COIN> is the minting authority. The phantom type MY_COIN ties it to this specific coin." },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-move-020',
    },
    {
      sectionTitle: 'Hot Potato, Capability, and Advanced Design Patterns',
      slides: [
        {
          title: 'The Hot Potato Pattern',
          emoji: '🥔',
          content: "A **hot potato** is a struct with **no abilities at all** — no `key`, no `store`, no `drop`, no `copy`. Because it has no `drop`, it cannot be silently discarded. Because it has no `key` or `store`, it cannot be stored or transferred. The only way to get rid of it is to pass it to a function that explicitly consumes it by destructuring.\n\nThis creates a **forced function call chain**: if a function returns a hot potato, the caller MUST eventually pass it to the consuming function in the same transaction. There is no way to ignore it.\n\nUse cases:\n- **Flash loans**: `borrow()` returns the loaned coins plus a `HotPotato`. The `repay()` function consumes the HotPotato, verifying repayment. If you do not call `repay()`, the transaction aborts because the HotPotato cannot be dropped.\n- **Multi-step workflows**: Ensure all steps are completed. Step 1 returns a Receipt hot potato, Step 2 requires the Receipt, Step 3 consumes it.\n- **Atomic composability**: Guarantee that a sequence of operations either all complete or none do.\n\nThe compiler enforces this: any value without `drop` that is not consumed by the end of a function body is a compile error.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::flash_loan {\n    use sui::coin::{Self, Coin};\n    use sui::sui::SUI;\n    use sui::balance::{Self, Balance};\n\n    public struct LendingPool has key {\n        id: UID,\n        reserve: Balance<SUI>,\n    }\n\n    // Hot potato: NO abilities at all\n    public struct FlashLoanReceipt {\n        amount: u64,\n        fee: u64,\n    }\n\n    // Borrow: returns coins AND a hot potato receipt\n    public fun borrow(\n        pool: &mut LendingPool,\n        amount: u64,\n        ctx: &mut TxContext,\n    ): (Coin<SUI>, FlashLoanReceipt) {\n        let loan = coin::from_balance(\n            balance::split(&mut pool.reserve, amount),\n            ctx,\n        );\n        let receipt = FlashLoanReceipt {\n            amount,\n            fee: amount / 100,  // 1% fee\n        };\n        (loan, receipt)\n    }\n\n    // Repay: consumes the hot potato — MUST be called\n    public fun repay(\n        pool: &mut LendingPool,\n        mut payment: Coin<SUI>,\n        receipt: FlashLoanReceipt,\n    ) {\n        let FlashLoanReceipt { amount, fee } = receipt;\n        assert!(coin::value(&payment) >= amount + fee, 0);\n        balance::join(\n            &mut pool.reserve,\n            coin::into_balance(payment),\n        );\n    }\n}`,
              highlights: [
                { line: 12, explanation: "FlashLoanReceipt has NO abilities — no drop, key, store, or copy. It is a hot potato." },
                { line: 22, explanation: "borrow() returns both the loaned coins AND the receipt. The caller MUST deal with both." },
                { line: 35, explanation: "repay() is the ONLY function that can consume FlashLoanReceipt (by destructuring it)." },
                { line: 40, explanation: "Destructuring: let FlashLoanReceipt { amount, fee } = receipt; This is the only way to destroy a hot potato." },
                { line: 41, explanation: "Assert repayment amount covers the loan plus fee. If this fails, the transaction aborts." },
              ],
            },
          },
        },
        {
          title: 'The Capability Pattern',
          emoji: '🔑',
          content: "The **capability pattern** uses an object as a permission token. Instead of checking `msg.sender` against an admin address (fragile and hard to transfer), you create a capability object and pass it to privileged functions.\n\nA capability is a struct with `key` (and optionally `store`). Whoever owns the capability object can call functions that require it. To revoke access, destroy the capability. To delegate access, transfer it. To share admin powers, create multiple capabilities or share one.\n\nThis is far more flexible than address-based access control: capabilities can be transferred, split, time-locked (wrapped in an escrow), or composed with other patterns. The Sui framework uses this extensively — `TreasuryCap` is a capability for minting coins, `Publisher` is a capability for package-level operations.\n\nA common extension is the **AdminCap** pattern: the `init` function creates an `AdminCap` and transfers it to the deployer. Admin functions take `_: &AdminCap` as a parameter — the reference proves the caller owns the cap without consuming it.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::capability {\n    use sui::transfer;\n\n    // Capability: whoever owns this can perform admin actions\n    public struct AdminCap has key, store {\n        id: UID,\n    }\n\n    public struct Config has key {\n        id: UID,\n        fee_bps: u64,\n        paused: bool,\n    }\n\n    fun init(ctx: &mut TxContext) {\n        // Create and transfer AdminCap to deployer\n        transfer::transfer(AdminCap {\n            id: object::new(ctx),\n        }, tx_context::sender(ctx));\n\n        // Create and share Config\n        transfer::share_object(Config {\n            id: object::new(ctx),\n            fee_bps: 100,\n            paused: false,\n        });\n    }\n\n    // Admin-only: requires a reference to AdminCap\n    public fun set_fee(\n        _cap: &AdminCap,  // proof of admin authority\n        config: &mut Config,\n        new_fee: u64,\n    ) {\n        config.fee_bps = new_fee;\n    }\n\n    // Admin-only: pause the protocol\n    public fun set_paused(\n        _cap: &AdminCap,\n        config: &mut Config,\n        paused: bool,\n    ) {\n        config.paused = paused;\n    }\n\n    // Destroy the AdminCap to renounce admin privileges forever\n    public fun renounce_admin(cap: AdminCap) {\n        let AdminCap { id } = cap;\n        object::delete(id);\n    }\n}`,
              highlights: [
                { line: 5, explanation: "AdminCap has key + store: it's a transferable object. Whoever holds it is the admin." },
                { line: 17, explanation: "The AdminCap is created in init and sent to the deployer. Only one exists (unless you create more)." },
                { line: 31, explanation: "_cap: &AdminCap — the underscore means we don't use the value, just need proof the caller owns one." },
                { line: 48, explanation: "Renouncing admin: destroy the capability by destructuring. Once deleted, no one can call admin functions." },
                { line: 50, explanation: "object::delete(id) destroys the UID. The AdminCap is gone forever — admin access is permanently revoked." },
              ],
            },
          },
        },
        {
          title: 'Composing Patterns: Real-World Architecture',
          emoji: '🏗️',
          content: "Production Sui protocols combine multiple patterns. Here is how they compose:\n\n**OTW + Capability**: `init` uses the OTW to create a currency and receives a `TreasuryCap`. The TreasuryCap IS the capability — whoever owns it can mint. This is the standard coin pattern.\n\n**Witness + Phantom Types**: `transfer_policy::new<T>(witness)` uses a witness to prove you are the module author of type T. The phantom type T links the policy to your specific NFT type.\n\n**Hot Potato + Capability**: A flash loan function returns a hot potato receipt. A separate function consumes the receipt, and an admin function (guarded by a capability) can update loan parameters.\n\n**Capability + Wrapping**: Wrap a capability inside a time-lock struct. The capability cannot be used until the time-lock expires and the wrapper is unpacked. This creates delayed governance.\n\nThe key insight: each pattern solves one problem (authorization, one-time setup, forced completion, type safety), and they compose cleanly because Move's type system makes them orthogonal.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'OTW + Capability', content: 'coin::create_currency uses OTW for one-time setup and returns TreasuryCap as the ongoing capability for minting. Two patterns, one elegant flow.' },
                { label: 'Witness + Phantom', content: 'display::new<T>(witness) links a Display to type T via phantom parameter. The witness proves the caller is the module author of T. Used for NFT metadata.' },
                { label: 'Hot Potato + Capability', content: 'Flash loans use hot potato for forced repayment. Admin functions (guarded by capability) can adjust fee parameters. Independent concerns, composable patterns.' },
                { label: 'Capability + Wrapping', content: 'Wrap an AdminCap in a TimeLock { cap: AdminCap, unlock_epoch: u64 } struct. The cap is inaccessible until the time-lock is unpacked after the target epoch.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-move-021',
    },
  ],

  quiz: [
    {
      question: 'What is the purpose of the phantom keyword in a struct type parameter?',
      options: [
        'It makes the type parameter invisible to other modules for privacy',
        'It indicates the type parameter is not used in any field, allowing it to skip ability constraints that would otherwise be required',
        'It automatically adds all four abilities to the type parameter',
        'It creates a copy of the struct with the type parameter removed',
      ],
      correctAnswer: 1,
      explanation: 'The phantom keyword declares that a type parameter is not used in any struct field. This exempts it from ability requirements — for example, a struct with store can have a phantom type parameter T even if T does not have store. This is essential for marker types like coin currency identifiers.',
      weaknessTopic: 'generics',
      practiceHint: 'Think about Coin<phantom T>. The T (like SUI) only has drop, yet Coin has store. Without phantom, this would be a compile error because T would need store too.',
    },
    {
      question: 'Which of the following is NOT a requirement for a struct to be a valid One-Time Witness (OTW)?',
      options: [
        'It must be named in UPPER_CASE matching the module name',
        'It must have only the drop ability',
        'It must have at least one field storing the module address',
        'It must have no fields',
      ],
      correctAnswer: 2,
      explanation: 'A valid OTW must: (1) be named in UPPER_CASE matching the module name, (2) have only the drop ability, and (3) have zero fields. Having a field storing the module address is NOT a requirement — OTW structs must have no fields at all.',
      weaknessTopic: 'generics',
      practiceHint: 'OTW structs are completely empty: struct MY_TOKEN has drop {}. No fields, no key, no store, no copy. Just drop and an empty body.',
    },
    {
      question: 'What makes a "hot potato" struct enforce a required function call?',
      options: [
        'It has the key ability, which forces it to be transferred before the transaction ends',
        'It has no abilities at all, so it cannot be dropped, stored, copied, or transferred — it must be destructured by a specific function',
        'It uses a special #[hot_potato] attribute recognized by the Sui runtime',
        'It contains a timestamp field that causes the transaction to fail after a timeout',
      ],
      correctAnswer: 1,
      explanation: 'A hot potato has no abilities (no drop, key, store, or copy). Since it cannot be dropped, the Move compiler requires that it is consumed (destructured) before the function or transaction ends. This forces the caller to invoke the specific function that destructs the hot potato.',
      weaknessTopic: 'generics',
      practiceHint: 'Remember: no drop means the compiler will not let you ignore the value. You MUST pass it to a function that takes it by value and destructures it.',
    },
    {
      question: 'In the capability pattern, why is passing _cap: &AdminCap preferred over checking tx_context::sender(ctx) == ADMIN_ADDRESS?',
      options: [
        'References are faster than address comparisons at the VM level',
        'Capabilities are transferable, revocable, and composable — they can be delegated, destroyed, time-locked, or split, unlike hardcoded address checks',
        'The Sui VM does not support address equality comparisons',
        'AdminCap references automatically expire after 24 hours for security',
      ],
      correctAnswer: 1,
      explanation: 'Capabilities are objects that can be transferred to new admins, destroyed to revoke access, wrapped in time-locks, or duplicated for multi-admin setups. Hardcoded address checks are rigid — changing the admin requires a package upgrade. Capabilities make access control dynamic and composable.',
      weaknessTopic: 'generics',
      practiceHint: 'Think about what happens when an admin wants to hand off control. With a capability, they just transfer the object. With a hardcoded address, they need a package upgrade.',
    },
    {
      question: 'How does the witness pattern provide module-level authorization?',
      options: [
        'It uses digital signatures to verify the module publisher\'s identity',
        'It relies on the Move rule that structs can only be constructed inside their defining module — passing a witness value proves the caller controls that module',
        'It checks the bytecode hash of the calling module against a whitelist',
        'It uses a global registry of authorized modules maintained by Sui validators',
      ],
      correctAnswer: 1,
      explanation: 'The witness pattern exploits a fundamental Move rule: a struct can only be instantiated (constructed with MyStruct {}) inside the module where it is defined. By requiring a witness parameter of type T, a framework function guarantees the caller must be inside module T to create and pass the witness value.',
      weaknessTopic: 'generics',
      practiceHint: 'The key insight: only module X can write X_WITNESS {}. If a function requires an X_WITNESS parameter, only module X can call it. No signatures, no registries — just the type system.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module advanced_patterns::witness_container {
    use sui::transfer;
    use sui::coin::{Self, TreasuryCap, CoinMetadata};

    // TODO 1: Define a One-Time Witness struct for this module
    // - Name it WITNESS_CONTAINER (matches module name in UPPER_CASE)
    // - It should have only the 'drop' ability
    // - It should have no fields

    // TODO 2: Define a generic Container struct
    // - Name: Container<phantom T>
    // - Abilities: key, store
    // - Fields: id (UID), value (u64), description (vector<u8>)
    // - The phantom type T acts as a tag distinguishing different container types

    // TODO 3: Define an AdminCap capability struct
    // - Abilities: key, store
    // - Fields: id (UID)

    // TODO 4: Define a hot potato struct called MintReceipt
    // - NO abilities at all (this makes it a hot potato)
    // - Fields: amount (u64), recipient (address)

    // TODO 5: Write the init function
    // - Parameters: witness (WITNESS_CONTAINER), ctx (&mut TxContext)
    // - Create an AdminCap and transfer it to the sender
    // - Use coin::create_currency with the witness to create a currency
    //   with 9 decimals, symbol "WC", name "Witness Coin",
    //   description "A coin created with the witness pattern"
    // - Freeze the CoinMetadata
    // - Transfer the TreasuryCap to the sender

    // TODO 6: Write a public function 'create_container'
    // - Generic: <phantom T>
    // - Parameters: _cap (&AdminCap), value (u64),
    //   description (vector<u8>), recipient (address), ctx (&mut TxContext)
    // - Create a Container<T> and transfer it to recipient
    // - (The AdminCap reference proves admin authorization)

    // TODO 7: Write a public function 'request_mint'
    // - Parameters: _cap (&AdminCap), amount (u64), recipient (address)
    // - Returns: MintReceipt (the hot potato)
    // - Create and return a MintReceipt with the given amount and recipient
    // - (The caller MUST call execute_mint to consume this receipt)

    // TODO 8: Write a public function 'execute_mint'
    // - Parameters: treasury_cap (&mut TreasuryCap<WITNESS_CONTAINER>),
    //   receipt (MintReceipt), ctx (&mut TxContext)
    // - Destructure the receipt to get amount and recipient
    // - Mint coins using coin::mint and transfer to recipient
    // - (This consumes the hot potato, completing the forced flow)
}`,

  solution: `module advanced_patterns::witness_container {
    use sui::transfer;
    use sui::coin::{Self, TreasuryCap, CoinMetadata};

    // 1: One-Time Witness — UPPER_CASE module name, drop only, no fields
    public struct WITNESS_CONTAINER has drop {}

    // 2: Generic Container with phantom type tag
    public struct Container<phantom T> has key, store {
        id: UID,
        value: u64,
        description: vector<u8>,
    }

    // 3: Capability for admin operations
    public struct AdminCap has key, store {
        id: UID,
    }

    // 4: Hot potato — no abilities, must be consumed
    public struct MintReceipt {
        amount: u64,
        recipient: address,
    }

    // 5: Init — OTW consumed by create_currency, AdminCap sent to deployer
    fun init(witness: WITNESS_CONTAINER, ctx: &mut TxContext) {
        // Create the AdminCap
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, tx_context::sender(ctx));

        // Create currency using the OTW
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9,
            b"WC",
            b"Witness Coin",
            b"A coin created with the witness pattern",
            option::none(),
            ctx,
        );

        // Freeze metadata as immutable
        transfer::public_freeze_object(metadata);
        // Transfer minting authority to deployer
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    // 6: Create a generic container — admin only
    public fun create_container<phantom T>(
        _cap: &AdminCap,
        value: u64,
        description: vector<u8>,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let container = Container<T> {
            id: object::new(ctx),
            value,
            description,
        };
        transfer::public_transfer(container, recipient);
    }

    // 7: Request mint — returns a hot potato receipt
    public fun request_mint(
        _cap: &AdminCap,
        amount: u64,
        recipient: address,
    ): MintReceipt {
        MintReceipt { amount, recipient }
    }

    // 8: Execute mint — consumes the hot potato
    public fun execute_mint(
        treasury_cap: &mut TreasuryCap<WITNESS_CONTAINER>,
        receipt: MintReceipt,
        ctx: &mut TxContext,
    ) {
        let MintReceipt { amount, recipient } = receipt;
        let minted = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(minted, recipient);
    }
}`,

  hints: [
    "For the OTW (TODO 1), remember the strict rules: the struct name must be the module name in UPPER_CASE (WITNESS_CONTAINER), it must have only 'drop', and it must have zero fields. Write: public struct WITNESS_CONTAINER has drop {}",
    "For the Container<phantom T> (TODO 2), use the phantom keyword so T does not need to satisfy Container's ability requirements. The struct looks like: public struct Container<phantom T> has key, store { id: UID, value: u64, description: vector<u8> }",
    "For the hot potato MintReceipt (TODO 4), simply declare the struct with NO abilities: public struct MintReceipt { amount: u64, recipient: address }. No 'has' clause at all. This makes it impossible to drop, copy, store, or transfer.",
    "In execute_mint (TODO 8), destructure the receipt with: let MintReceipt { amount, recipient } = receipt; This is the ONLY way to consume the hot potato. Then use coin::mint(treasury_cap, amount, ctx) and transfer::public_transfer to send the minted coins.",
  ],
};
