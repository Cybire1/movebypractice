import { LessonContent } from '@/app/types/lesson';

export const moveLesson7: LessonContent = {
  id: 'move-7',
  title: 'Advanced Generics & Patterns',
  description: 'The final boss of Move on Sui. You\'ll learn the design patterns that power every serious Sui protocol — generics, phantom types, witness, one-time witness, hot potato, and capability. It\'s the most advanced lesson, but you\'ve built up to this. Let\'s go.',
  difficulty: 'advanced',
  xpReward: 500,
  order: 7,
  language: 'move',
  prerequisiteLessons: ['move-6'],

  narrative: {
    welcomeMessage: "Hey, welcome to the big one! This is the most advanced lesson in the course, and I'm not going to sugarcoat it — these patterns take some effort to wrap your head around. But here's the thing: these are the EXACT patterns used by SuiFrens, DeepBook, Cetus, and every production Sui protocol out there. Once you get these, you won't just write Move code — you'll design Move systems. Take your time, re-read things if you need to, and trust the process. You've got this.",
    quizTransition: "Alright, these patterns have a lot of moving parts. Let's check in and see how well the ideas have clicked — not just the syntax, but the reasoning behind each pattern.",
    practiceTransition: "Now for the fun part — building these patterns from scratch! You'll create a generic container, a coin using the one-time witness pattern, and a capability-guarded admin module. Don't worry, the hints will walk you through it step by step.",
    celebrationMessage: "You did it! Seriously — witness, OTW, hot potato, capability — these are the patterns that separate \"I'm learning Move\" from \"I build production Sui protocols.\" They're all in your toolkit now.",
    nextLessonTease: "With these patterns under your belt, you're ready to build real DeFi and NFT protocols. The next lessons will put everything together into production smart contracts on Sui.",
  },

  teachingSections: [
    {
      sectionTitle: 'Generics and Ability Constraints',
      slides: [
        {
          title: 'Generic Types in Move',
          emoji: '🧬',
          content: "Generics are like making a container that works with anything. Instead of building a \"Box for swords\" and a \"Box for potions\" and a \"Box for gold,\" you build a \"Box for <anything>\" and specify what goes in it when you actually use it. That's what `struct Box<T>` means — T is a placeholder for \"whatever type you want.\"\n\nBut here's the catch: you usually don't want your box to hold literally anything. What if someone tries to put something in that can't be stored on the blockchain? That's where **ability constraints** come in. When you write `<T: store>`, you're saying \"T can be any type, as long as it has the `store` ability.\" It's like saying \"this shelf can hold anything, as long as it fits through the door.\" The compiler checks this for you at build time — no surprises at runtime.\n\nYou can even have multiple placeholders: `struct Pair<A: store, B: store>` holds two different storable types. The Sui framework uses generics everywhere — `Coin<T>` is the classic example, where T identifies which currency the coin represents (SUI, USDC, etc.).",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::generics {\n    // Generic struct: Box can hold any type with store ability\n    public struct Box<T: store> has key, store {\n        id: UID,\n        content: T,\n    }\n\n    // Generic function: create a box with any storable content\n    public fun create_box<T: store>(\n        content: T,\n        ctx: &mut TxContext,\n    ): Box<T> {\n        Box {\n            id: object::new(ctx),\n            content,\n        }\n    }\n\n    // Generic function: extract the content, destroying the box\n    public fun unbox<T: store>(box: Box<T>): T {\n        let Box { id, content } = box;\n        object::delete(id);\n        content\n    }\n\n    // Multiple type parameters with different constraints\n    public struct Pair<A: store, B: store> has key, store {\n        id: UID,\n        first: A,\n        second: B,\n    }\n}`,
              highlights: [
                { line: 3, explanation: "Box<T: store> means \"Box can hold any type T, as long as T has the store ability.\" The Box itself has key + store, making it a full blockchain object you can own and transfer." },
                { line: 9, explanation: "The function is also generic over T: store — the same constraint as the struct. This keeps everything consistent." },
                { line: 20, explanation: "Destructuring a generic struct to get the content out. The UID is deleted (destroying the box), and the content of type T is returned to the caller." },
                { line: 27, explanation: "Two type parameters! A and B can be completely different types. Each one just needs to have store." },
              ],
            },
          },
        },
        {
          title: 'Phantom Type Parameters',
          emoji: '👻',
          content: "This one's a bit mind-bending, but stay with me. A **phantom type parameter** is a label that exists only to tell types apart — like how a $1 bill and a $100 bill are both pieces of paper, but the number printed on them makes them very different. `Coin<SUI>` and `Coin<USDC>` work the same way: they have the exact same internal structure (a UID and a balance), but the type system treats them as completely different things. You can't accidentally mix them up.\n\nSo why the `phantom` keyword? Here's the practical reason: normally, if your struct has the `store` ability, the compiler requires ALL type parameters to also have `store`. But currency marker types like `SUI` or `USDC` are tiny empty structs that might only have `drop`. Without `phantom`, the Coin struct couldn't have `store` because its type parameter T doesn't have `store`. The `phantom` keyword says \"hey compiler, T isn't used in any field — it's just a label — so don't enforce ability requirements on it.\"\n\nThis pattern is the backbone of the Sui token system. Every time you see `Coin<phantom T>`, that phantom T is what keeps your SUI separate from your USDC, even though both coins look identical under the hood.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What Makes It Phantom?', content: 'A phantom type parameter is NOT used in any struct field. It exists only in the type signature as a label. You declare it with the phantom keyword: struct MyType<phantom T>. Think of it as a name tag that the struct wears but never opens.' },
                { label: 'Why Phantom Matters', content: 'Without phantom, if your struct has store, ALL type parameters must also have store. Phantom exempts the parameter from this rule. This is critical because marker types (like SUI, USDC) often only have drop — without phantom, you couldn\'t put them in a Coin that has store.' },
                { label: 'Coin<phantom T>', content: 'The Sui Coin type uses phantom T. SUI, USDC, etc. are empty marker structs. Coin<SUI> and Coin<USDC> have the same fields internally but are treated as completely different types. You literally cannot pass one where the other is expected.' },
                { label: 'Type Safety', content: 'Phantom types prevent mixing. A function taking Coin<SUI> will reject Coin<USDC> at compile time. This is how Move prevents you from accidentally sending the wrong currency — the compiler catches it before your code ever runs.' },
              ],
            },
          },
        },
        {
          title: 'Type Reflection and Type Names',
          emoji: '🔍',
          content: "Sometimes you need to ask \"what type am I working with?\" at runtime. Sui Move gives you the `std::type_name` module for this. Calling `type_name::get<T>()` returns the fully qualified name of type T as a string — like getting a type's ID card.\n\nWhere this gets really useful is building **type-indexed maps**. Imagine you're building a DeFi protocol that supports multiple coins. You need a collection that stores one entry per coin type. You can use a `Bag` (a heterogeneous collection) with `TypeName` keys: the key for the SUI entry is the TypeName of SUI, the key for USDC is the TypeName of USDC, and so on. Each type gets exactly one slot. This is how many real Sui DeFi protocols manage multiple coin types — one shared object with a Bag inside it.\n\nAnother use is **type guards**: double-checking at runtime that a generic parameter matches what you expect. While Move's type system catches most errors at compile time, type guards are handy when working with dynamic fields or bags where type information can get erased.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::type_registry {\n    use std::type_name::{Self, TypeName};\n    use sui::bag::{Self, Bag};\n\n    public struct Registry has key {\n        id: UID,\n        entries: Bag,  // type-indexed storage\n    }\n\n    // Register a value under its type name\n    public fun register<T: store>(\n        registry: &mut Registry,\n        value: T,\n    ) {\n        let type_key = type_name::get<T>();\n        assert!(!bag::contains(&registry.entries, type_key), 0);\n        bag::add(&mut registry.entries, type_key, value);\n    }\n\n    // Retrieve a value by its type\n    public fun get<T: store>(registry: &Registry): &T {\n        let type_key = type_name::get<T>();\n        bag::borrow(&registry.entries, type_key)\n    }\n\n    // Check if a type is registered\n    public fun is_registered<T: store>(registry: &Registry): bool {\n        let type_key = type_name::get<T>();\n        bag::contains(&registry.entries, type_key)\n    }\n}`,
              highlights: [
                { line: 2, explanation: "std::type_name gives you TypeName and get<T>() — your tools for asking \"what type is this?\" at runtime." },
                { line: 7, explanation: "Bag is a collection that can hold different types. Pair it with TypeName keys and you get a map where each type gets one entry — super useful for multi-coin protocols." },
                { line: 15, explanation: "type_name::get<T>() returns a unique identifier for whatever type T is. We use this as the key in our Bag." },
                { line: 16, explanation: "Assert the type isn't already registered — each type gets exactly one entry. No duplicates allowed." },
                { line: 22, explanation: "To look something up, we reconstruct the same TypeName key with type_name::get<T>() and borrow from the Bag." },
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
          content: "The witness pattern is like showing your employee badge to prove you work at a company. Only your module can create the badge, so showing it proves you're authorized.\n\nHere's how it works: a witness is a struct — usually with only the `drop` ability and no fields — that can only be created inside the module that defines it. This is a fundamental rule in Move: you can only write `MyStruct {}` inside the module where `MyStruct` is defined. Nobody else can forge your struct.\n\nSo if a framework function says \"give me a value of type T,\" only the module that defines T can create one and pass it in. That's the entire trick! No signatures, no registries, no permission lists — just the type system doing its thing.\n\nThis pattern is used everywhere in Sui: `coin::create_currency` requires a witness to prove you're the module that defines the coin type. `transfer_policy::new` requires a witness to prove you're the creator of the NFT type. The witness itself is typically a zero-sized struct (no fields) that gets created, passed to the framework function, and immediately dropped. It exists purely as a proof of identity.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::witness_demo {\n    // The witness: can ONLY be created in this module\n    public struct MY_WITNESS has drop {}\n\n    // Use the witness to register with a framework\n    fun init(ctx: &mut TxContext) {\n        // Create the witness — only this module can do this\n        let witness = MY_WITNESS {};\n\n        // Pass it to a framework function that requires proof\n        framework::register<MY_WITNESS>(witness, ctx);\n    }\n}\n\nmodule examples::framework {\n    // T: drop serves as a witness — proof that the caller\n    // is the module that defines T\n    public fun register<T: drop>(_witness: T, ctx: &mut TxContext) {\n        // _witness is consumed (dropped) here\n        // We now know the caller is the module that defines T\n        // ... perform privileged registration ...\n    }\n}`,
              highlights: [
                { line: 3, explanation: "MY_WITNESS is a zero-sized struct with only 'drop'. No fields, no data — it's purely an identity badge. Only code inside this module can create one." },
                { line: 8, explanation: "Creating the witness. Only code inside examples::witness_demo can write MY_WITNESS {}. No other module can forge this — Move's compiler enforces it." },
                { line: 11, explanation: "Pass the witness to the framework. The type parameter T = MY_WITNESS links this registration to this specific module. It's like handing over your badge." },
                { line: 18, explanation: "The framework function requires T: drop. The _witness parameter is consumed (dropped), proving the caller controls the module that defines T. Proof delivered, badge collected." },
              ],
            },
          },
        },
        {
          title: 'One-Time Witness (OTW)',
          emoji: '1️⃣',
          content: "A One-Time Witness is like a golden ticket — it's created exactly once, automatically, when your code is first published. It's used to prove \"this is the first and only time this setup happens.\"\n\nThe Sui runtime creates exactly one instance of the OTW and passes it as the first parameter to your module's `init` function. After `init` returns, no more instances can ever be created. Ever. This is how `coin::create_currency` ensures each coin type is set up exactly once.\n\nThe rules for making a valid OTW are strict (and a common source of mistakes, so pay attention):\n1. It must be named after the module in **UPPER_CASE** (module `my_coin` -> struct `MY_COIN`)\n2. It must have **only the `drop` ability** (no key, store, or copy)\n3. It must have **no fields** (completely empty)\n4. It must not be created anywhere in your code — Sui creates it for you and passes it to `init`\n\nA common beginner mistake is adding fields or extra abilities to the OTW struct. Don't! It needs to be as minimal as possible: `public struct MY_COIN has drop {}` and nothing more.\n\nYou can even verify an OTW at runtime using `sui::types::is_one_time_witness<T>(witness)` — this returns true only for the real deal.",
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
          content: "Let's see the OTW in action with the most common real-world use: creating a fungible token using `coin::create_currency`.\n\nThis function takes your OTW witness as its first argument — guaranteeing the currency can only be created once, during module publication. It returns two objects: a `TreasuryCap<T>` (the minting authority — whoever has this can create new coins) and a `CoinMetadata<T>` (the coin's name, symbol, decimals, etc.).\n\nThe typical pattern is: freeze the CoinMetadata so it's publicly readable but nobody can tamper with it, and transfer the TreasuryCap to the deployer (or share it, depending on your design).\n\nHere's why this design is so elegant: the OTW proves you are the module author AND that this is the first (and only) time this setup runs. The phantom type parameter T on Coin, TreasuryCap, and CoinMetadata ties everything back to your module. Your coin type is forever linked to your module — no one can create a fake version.\n\nThis same pattern extends beyond coins: `display::new<T>(witness)` for NFT display metadata, `transfer_policy::new<T>(witness)` for transfer rules, and many other Sui framework functions all use this approach.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::my_coin {\n    use sui::coin;\n    use sui::transfer;\n\n    // OTW: named MY_COIN (module is my_coin), drop only, no fields\n    public struct MY_COIN has drop {}\n\n    fun init(witness: MY_COIN, ctx: &mut TxContext) {\n        // create_currency consumes the OTW — can never be called again\n        let (treasury_cap, metadata) = coin::create_currency(\n            witness,         // OTW consumed here\n            6,               // decimals\n            b"MYC",          // symbol\n            b"My Coin",      // name\n            b"A custom coin", // description\n            option::none(),  // icon URL\n            ctx,\n        );\n\n        // Freeze metadata — immutable forever\n        transfer::public_freeze_object(metadata);\n        // Transfer mint authority to deployer\n        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));\n    }\n\n    // Mint new coins using the TreasuryCap\n    public fun mint(\n        cap: &mut coin::TreasuryCap<MY_COIN>,\n        amount: u64,\n        recipient: address,\n        ctx: &mut TxContext,\n    ) {\n        let minted = coin::mint(cap, amount, ctx);\n        transfer::public_transfer(minted, recipient);\n    }\n}`,
              highlights: [
                { line: 6, explanation: "MY_COIN is the OTW. Name matches the module (my_coin -> MY_COIN), has only drop, has no fields. This is the golden ticket." },
                { line: 8, explanation: "Sui automatically creates one MY_COIN instance and passes it to init. You don't write MY_COIN {} yourself — the runtime does it for you, exactly once." },
                { line: 10, explanation: "coin::create_currency eats the OTW witness. Once consumed, it's gone forever. This can never be called again for MY_COIN." },
                { line: 21, explanation: "CoinMetadata is frozen — anyone can read the coin's name/symbol/decimals but nobody can change them. Public info, permanently locked." },
                { line: 28, explanation: "TreasuryCap<MY_COIN> is the minting authority. The phantom type MY_COIN ties it to this specific coin — you can't use it to mint a different currency." },
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
          content: "This is a fun one! A hot potato is data you MUST pass to someone else — you can't drop it, store it, or ignore it. Like in the kids' game, you HAVE to pass it along before the music stops.\n\nTechnically, a hot potato is a struct with **no abilities at all** — no `key`, no `store`, no `drop`, no `copy`. Because it has no `drop`, the compiler won't let you silently discard it. Because it has no `key` or `store`, you can't stash it anywhere. The ONLY way to get rid of it is to pass it to a function that explicitly destroys it by destructuring.\n\nWhy is this useful? Think about flash loans. A `borrow()` function gives you some coins AND a hot potato receipt. You can do whatever you want with the coins, but that receipt is burning a hole in your hands. The only way to get rid of it is to call `repay()`, which destructures the receipt and verifies you paid back the loan plus fees. If you don't call `repay()`? The transaction aborts — the compiler literally won't let you ignore the hot potato.\n\nThis pattern is also great for multi-step workflows: Step 1 returns a receipt, Step 2 requires it, Step 3 consumes it. If you skip a step, the compiler catches it. It's like a forced checklist that the type system enforces.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::flash_loan {\n    use sui::coin::{Self, Coin};\n    use sui::sui::SUI;\n    use sui::balance::{Self, Balance};\n\n    public struct LendingPool has key {\n        id: UID,\n        reserve: Balance<SUI>,\n    }\n\n    // Hot potato: NO abilities at all\n    public struct FlashLoanReceipt {\n        amount: u64,\n        fee: u64,\n    }\n\n    // Borrow: returns coins AND a hot potato receipt\n    public fun borrow(\n        pool: &mut LendingPool,\n        amount: u64,\n        ctx: &mut TxContext,\n    ): (Coin<SUI>, FlashLoanReceipt) {\n        let loan = coin::from_balance(\n            balance::split(&mut pool.reserve, amount),\n            ctx,\n        );\n        let receipt = FlashLoanReceipt {\n            amount,\n            fee: amount / 100,  // 1% fee\n        };\n        (loan, receipt)\n    }\n\n    // Repay: consumes the hot potato — MUST be called\n    public fun repay(\n        pool: &mut LendingPool,\n        mut payment: Coin<SUI>,\n        receipt: FlashLoanReceipt,\n    ) {\n        let FlashLoanReceipt { amount, fee } = receipt;\n        assert!(coin::value(&payment) >= amount + fee, 0);\n        balance::join(\n            &mut pool.reserve,\n            coin::into_balance(payment),\n        );\n    }\n}`,
              highlights: [
                { line: 12, explanation: "FlashLoanReceipt has NO abilities — notice there's no 'has' clause at all. No drop, no key, no store, no copy. This is what makes it a hot potato. You can't ignore it, store it, or throw it away." },
                { line: 22, explanation: "borrow() returns both the loaned coins AND the receipt. You get your money, but you also get this burning hot potato that you MUST deal with." },
                { line: 35, explanation: "repay() is the ONLY function that can consume FlashLoanReceipt — it takes it by value and destructures it. This is the only exit." },
                { line: 40, explanation: "Destructuring: let FlashLoanReceipt { amount, fee } = receipt; This is the ONLY way to destroy a hot potato — by pulling it apart in a function that explicitly handles it." },
                { line: 41, explanation: "Assert repayment covers the loan plus fee. If this check fails, the whole transaction aborts. You borrowed 100? You're paying back 101 (with the 1% fee)." },
              ],
            },
          },
        },
        {
          title: 'The Capability Pattern',
          emoji: '🔑',
          content: "Instead of checking someone's ID card, you check if they're holding the right key. Whoever has the admin key can do admin things. Keys can be handed off, destroyed, or locked away.\n\nLet's compare this to the alternative. In some blockchains, you'd write something like \"if the caller's address equals the admin address, allow the action.\" That works, but it's rigid — what if you want to change the admin? You'd need to upgrade the entire package. What if you want two admins? Or a time-delayed admin? Things get messy fast.\n\nWith the capability pattern, you create an `AdminCap` object (a struct with `key` and optionally `store`) during `init` and transfer it to the deployer. Admin functions take `_: &AdminCap` as a parameter — just having a reference to the cap proves you own it. Want to transfer admin rights? Just transfer the object. Want to revoke access forever? Destroy the cap. Want to add a time-lock? Wrap the cap in an escrow struct.\n\nThe Sui framework uses this pattern extensively. `TreasuryCap` is a capability for minting coins. `Publisher` is a capability for package-level operations. Once you recognize the pattern, you'll see it everywhere.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::capability {\n    use sui::transfer;\n\n    // Capability: whoever owns this can perform admin actions\n    public struct AdminCap has key, store {\n        id: UID,\n    }\n\n    public struct Config has key {\n        id: UID,\n        fee_bps: u64,\n        paused: bool,\n    }\n\n    fun init(ctx: &mut TxContext) {\n        // Create and transfer AdminCap to deployer\n        transfer::transfer(AdminCap {\n            id: object::new(ctx),\n        }, tx_context::sender(ctx));\n\n        // Create and share Config\n        transfer::share_object(Config {\n            id: object::new(ctx),\n            fee_bps: 100,\n            paused: false,\n        });\n    }\n\n    // Admin-only: requires a reference to AdminCap\n    public fun set_fee(\n        _cap: &AdminCap,  // proof of admin authority\n        config: &mut Config,\n        new_fee: u64,\n    ) {\n        config.fee_bps = new_fee;\n    }\n\n    // Admin-only: pause the protocol\n    public fun set_paused(\n        _cap: &AdminCap,\n        config: &mut Config,\n        paused: bool,\n    ) {\n        config.paused = paused;\n    }\n\n    // Destroy the AdminCap to renounce admin privileges forever\n    public fun renounce_admin(cap: AdminCap) {\n        let AdminCap { id } = cap;\n        object::delete(id);\n    }\n}`,
              highlights: [
                { line: 5, explanation: "AdminCap has key + store — it's a real blockchain object that can be owned and transferred. Whoever holds it is the admin. Simple as that." },
                { line: 17, explanation: "The AdminCap is created in init and sent to the deployer. Only one exists (unless you choose to create more). The deployer starts as admin." },
                { line: 31, explanation: "_cap: &AdminCap — the underscore means we don't read any data from it; we just need proof the caller owns one. It's like a bouncer checking your wristband at the door." },
                { line: 48, explanation: "Renouncing admin: destroy the capability by destructuring it. Once the AdminCap is deleted, nobody can call admin functions anymore. It's a permanent, irreversible action." },
                { line: 50, explanation: "object::delete(id) destroys the UID. The AdminCap is gone forever — admin access is permanently revoked. This is how you \"burn the key.\"" },
              ],
            },
          },
        },
        {
          title: 'Composing Patterns: Real-World Architecture',
          emoji: '🏗️',
          content: "Here's where it all comes together. In the real world, production Sui protocols don't use just one of these patterns — they combine them. Each pattern solves one specific problem, and they fit together like LEGO bricks because Move's type system keeps them cleanly separated.\n\n**OTW + Capability**: Your `init` uses the OTW to create a currency and receives a `TreasuryCap` in return. The TreasuryCap IS a capability — whoever owns it can mint coins. One pattern for one-time setup, another for ongoing access control.\n\n**Witness + Phantom Types**: `transfer_policy::new<T>(witness)` uses a witness to prove you wrote the code for type T. The phantom type T links the policy to your specific NFT type. Authorization plus type safety in one function call.\n\n**Hot Potato + Capability**: Flash loans use a hot potato for forced repayment, while admin functions (guarded by a capability) control fee parameters. Two independent concerns, composed cleanly.\n\n**Capability + Wrapping**: Wrap an AdminCap inside a time-lock struct. The capability can't be used until the time-lock expires and the wrapper is unpacked. Instant delayed governance.\n\nThe key insight: each pattern solves one problem (authorization, one-time setup, forced completion, type safety), and they compose cleanly because they don't step on each other's toes.",
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
      question: 'What does the phantom keyword actually do when you put it on a struct type parameter?',
      options: [
        'It makes the type parameter invisible to other modules for privacy',
        'It indicates the type parameter is not used in any field, allowing it to skip ability constraints that would otherwise be required',
        'It automatically adds all four abilities to the type parameter',
        'It creates a copy of the struct with the type parameter removed',
      ],
      correctAnswer: 1,
      explanation: 'The phantom keyword tells the compiler "this type parameter isn\'t used in any struct field — it\'s just a label." This matters because normally, if your struct has store, ALL type parameters must also have store. Phantom exempts the parameter from that rule. Why does this matter in practice? Think about Coin<phantom T>. The T (like SUI) might only have drop, yet Coin needs store. Without phantom, the compiler would reject this. Phantom makes the entire Sui token system possible.',
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
      explanation: 'Trick question vibes, but it\'s straightforward once you know the rules. A valid OTW must: (1) be named in UPPER_CASE matching the module name, (2) have only drop, and (3) have zero fields. "Having a field storing the module address" is completely wrong — OTW structs must be empty. Why does this matter? The OTW is a golden ticket, not a data carrier. Its entire purpose is to exist once and prove "this is the first time this module is being set up." No data needed.',
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
      explanation: 'A hot potato has zero abilities — no drop, no key, no store, no copy. Since it can\'t be dropped, the Move compiler will literally refuse to compile your code if you don\'t consume it. The only way to consume it is to pass it to a function that takes it by value and destructures it. Why does this matter? This is how flash loans work! The receipt hot potato forces you to call the repay function. Skip it and your code won\'t even compile, let alone run. The type system becomes your enforcer.',
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
      explanation: 'Think about what happens when an admin wants to hand off control. With a capability, they just transfer the object to the new admin — done. With a hardcoded address? You\'d need to upgrade the entire package. Capabilities can be transferred, destroyed (to permanently revoke access), wrapped in time-locks for delayed governance, or duplicated for multi-admin setups. They\'re objects, so they compose with every other pattern in Move. This flexibility is why every serious Sui protocol uses capabilities instead of address checks.',
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
      explanation: 'This one is beautifully simple. Move has a fundamental rule: you can only write MyStruct {} (construct a struct) inside the module where MyStruct is defined. So if a framework function says "give me a value of type T," only the module that defines T can create one and pass it in. No cryptographic signatures, no whitelists, no registries — just the type system enforcing who can create what. It\'s authorization through construction rights, and it\'s one of the most elegant patterns in all of smart contract programming.',
      weaknessTopic: 'generics',
      practiceHint: 'The key insight: only module X can write X_WITNESS {}. If a function requires an X_WITNESS parameter, only module X can call it. No signatures, no registries — just the type system.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module advanced_patterns::witness_container {
    use sui::transfer;
    use sui::coin::{Self, TreasuryCap, CoinMetadata};

    // TODO 1: Define a One-Time Witness struct for this module
    // Remember the OTW rules:
    //   - Name must be UPPER_CASE version of the module name -> WITNESS_CONTAINER
    //   - Must have ONLY the 'drop' ability (no key, store, or copy)
    //   - Must have NO fields (completely empty struct)
    // Write it like: public struct NAME has drop {}

    // TODO 2: Define a generic Container struct
    // This is a generic struct with a phantom type parameter:
    //   - Name: Container<phantom T>
    //     (phantom because T is just a label — it's not used in any field)
    //   - Abilities: key, store (so it can be a transferable object)
    //   - Fields:
    //       id: UID          (every Sui object needs this)
    //       value: u64       (some numeric value)
    //       description: vector<u8>  (text as bytes)

    // TODO 3: Define an AdminCap capability struct
    // This is the "key" that proves someone is an admin:
    //   - Abilities: key, store (so it can be owned and transferred)
    //   - Fields: id (UID)   (just the UID — the cap's existence IS the permission)

    // TODO 4: Define a hot potato struct called MintReceipt
    // The trick: give it NO abilities at all (no 'has' clause!)
    // This means it can't be dropped, stored, copied, or transferred.
    // The caller MUST pass it to execute_mint to get rid of it.
    //   - Fields: amount (u64), recipient (address)

    // TODO 5: Write the init function
    // This runs once when the module is published. Two things happen here:
    //   Step 1: Create an AdminCap and transfer it to the sender
    //     - transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx))
    //   Step 2: Use coin::create_currency with the witness to create a currency
    //     - Pass: witness, 9 (decimals), b"WC" (symbol), b"Witness Coin" (name),
    //       b"A coin created with the witness pattern" (description), option::none() (icon), ctx
    //     - This returns (treasury_cap, metadata)
    //   Step 3: Freeze the metadata (transfer::public_freeze_object)
    //   Step 4: Transfer the treasury_cap to the sender (transfer::public_transfer)
    // Parameters: witness (WITNESS_CONTAINER), ctx (&mut TxContext)

    // TODO 6: Write a public function 'create_container'
    // This creates a new Container and sends it to someone. Admin only!
    //   - Generic: <phantom T>  (so you can create Container<Gold>, Container<Silver>, etc.)
    //   - Parameters: _cap (&AdminCap), value (u64),
    //     description (vector<u8>), recipient (address), ctx (&mut TxContext)
    //   - Inside: create a Container<T> with object::new(ctx) for the id,
    //     then transfer::public_transfer it to recipient
    //   - The _cap reference proves admin authorization (we don't read it, just need proof)

    // TODO 7: Write a public function 'request_mint'
    // This starts the minting process by creating a hot potato receipt.
    //   - Parameters: _cap (&AdminCap), amount (u64), recipient (address)
    //   - Returns: MintReceipt  (the hot potato!)
    //   - Inside: just create and return MintReceipt { amount, recipient }
    //   - The caller now MUST call execute_mint — they can't ignore the receipt

    // TODO 8: Write a public function 'execute_mint'
    // This finishes the minting process by consuming the hot potato.
    //   - Parameters: treasury_cap (&mut TreasuryCap<WITNESS_CONTAINER>),
    //     receipt (MintReceipt), ctx (&mut TxContext)
    //   - Step 1: Destructure the receipt: let MintReceipt { amount, recipient } = receipt;
    //     (This is the ONLY way to destroy the hot potato)
    //   - Step 2: Mint coins: let minted = coin::mint(treasury_cap, amount, ctx);
    //   - Step 3: Send them: transfer::public_transfer(minted, recipient);
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
    "Let's start with the OTW (TODO 1). Remember the golden rules: the struct name must be the module name in UPPER_CASE — so that's WITNESS_CONTAINER. It needs only the 'drop' ability and zero fields. The whole thing is just one line: public struct WITNESS_CONTAINER has drop {}",
    "For the Container<phantom T> (TODO 2), use the phantom keyword before T so it doesn't need to satisfy Container's ability requirements. Think of it like this: T is just a name tag, not actual cargo. Your struct should look like: public struct Container<phantom T> has key, store { id: UID, value: u64, description: vector<u8> }",
    "The hot potato MintReceipt (TODO 4) is actually the simplest one — just declare the struct with NO abilities at all. No 'has' clause whatsoever: public struct MintReceipt { amount: u64, recipient: address }. That's it! The absence of abilities is what gives it its power.",
    "For execute_mint (TODO 8), you need to destroy the hot potato by pulling it apart: let MintReceipt { amount, recipient } = receipt; This destructuring is the ONLY way to consume a hot potato. Then mint the coins with coin::mint(treasury_cap, amount, ctx) and send them with transfer::public_transfer. You're almost done!",
  ],
};
