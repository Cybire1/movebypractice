import { LessonContent } from '@/app/types/lesson';

export const moveLesson6: LessonContent = {
  id: 'move-6',
  title: 'Ownership & Transfer',
  description: 'Learn how Sui decides who owns what — and how to move, share, or lock things down. We\'ll cover owned, shared, and immutable objects, plus transfer functions, custom transfer policies, and more.',
  difficulty: 'advanced',
  xpReward: 350,
  order: 6,
  language: 'move',
  prerequisiteLessons: ['move-5'],

  narrative: {
    welcomeMessage: "Hey! Welcome to one of the most important lessons in this entire course. Ownership is what makes Sui fundamentally different from other blockchains. Instead of everything being stored in one big shared bucket, every object on Sui has an owner — just like in real life, your stuff is yours. Once you understand this, you'll see why Sui is so fast and how to design contracts that really take advantage of it.",
    quizTransition: "You've explored the three types of ownership, transfer functions, sharing, freezing, and even object-to-object transfers. Let's do a quick check to see how well these ideas stuck.",
    practiceTransition: "Alright, time to build something real! You're going to create a module that uses every transfer pattern: owned transfers, sharing, freezing, and a custom transfer policy. Don't stress — the hints will walk you through it step by step.",
    celebrationMessage: "Amazing work! You now understand the Sui ownership model — one of the things that makes Sui truly unique. You can move objects between addresses, open them up for everyone, or lock them down permanently. That's powerful stuff.",
    nextLessonTease: "Next up: Advanced Generics & Patterns. You'll learn the witness pattern, phantom types, hot potato, and capability-based access control — the design patterns behind real production Sui protocols.",
  },

  teachingSections: [
    {
      sectionTitle: 'The Sui Object Ownership Model',
      slides: [
        {
          title: 'Three Kinds of Ownership',
          emoji: '🏠',
          content: "Ownership on Sui works a lot like ownership in real life. Your phone is yours — only you can use it. A park bench is shared — anyone can sit on it. A statue in a museum is frozen — everyone can look but nobody can change it.\n\nEvery object on Sui is in exactly one of these three states at any time:\n\n**Owned objects** belong to a single address. Only that person can use them in transactions. Think of these as your personal belongings.\n\n**Shared objects** are accessible by anyone. Any transaction can read or modify them, but this requires the network to agree on what order things happen (we call this \"consensus\"). Think of these as public resources.\n\n**Immutable objects** are frozen forever. Anyone can look at them, but nobody can change, delete, or move them. Think of these as things behind glass in a museum.\n\nKnowing when to use each type is a core Sui design skill. Owned objects are fast (no waiting). Shared objects let people collaborate (like a marketplace). Immutable objects give you trustworthy reference data that can never be tampered with.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Owned Objects', content: 'Belong to a single address — like your phone. Only you can use them in transactions. Here\'s the cool part: transactions on separate owned objects can all run at the same time with zero waiting.' },
                { label: 'Shared Objects', content: 'Accessible by anyone — like a park bench. Multiple transactions might try to use them at once, so the network has to agree on the order. You create one with transfer::share_object.' },
                { label: 'Immutable Objects', content: 'Frozen permanently — like a statue in a museum. Anyone can look, but nobody can change, move, or delete them. You create one with transfer::freeze_object.' },
                { label: 'Object-Centric Design', content: 'Here\'s what makes Sui different from other blockchains: instead of storing everything in big global tables, every piece of data is its own typed object with a unique ID, an owner, and a version number. It\'s like giving every item its own passport.' },
              ],
            },
          },
        },
        {
          title: 'How Ownership Affects Execution',
          emoji: '🚀',
          content: "Here's something cool about Sui: when you use your own stuff (owned objects), transactions are lightning fast because there's no waiting in line. Shared objects need everyone to agree on the order, which takes a tiny bit longer.\n\nLet's break that down:\n\nWhen a transaction only touches **owned objects**, Sui can process it without going through consensus at all. That's right — no waiting for the whole network to agree. This is why Sui can achieve sub-second finality for things like transferring your NFT or updating your profile.\n\nWhen a transaction touches at least one **shared object**, it needs to go through consensus (a process called Mysticeti) so that everyone agrees on the order. This is still fast, but it's a bit slower than owned-only transactions.\n\n**Immutable objects** are the best of both worlds — any transaction can read them without adding any consensus overhead, because they never change. No conflicts possible!\n\nThe takeaway for you as a developer: use owned objects for personal stuff (user profiles, inventory items), shared objects only when multiple people truly need to read and write the same state (like a DEX pool), and immutable objects for reference data that should never change.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'user-nft', label: 'User\'s NFT', emoji: '🖼️' },
                { id: 'dex-pool', label: 'DEX Liquidity Pool', emoji: '💱' },
                { id: 'published-metadata', label: 'Published Package Info', emoji: '📦' },
                { id: 'game-inventory', label: 'Player Inventory', emoji: '🎒' },
              ],
              targets: [
                { id: 'owned', label: 'Owned Object' },
                { id: 'shared', label: 'Shared Object' },
                { id: 'immutable', label: 'Immutable Object' },
              ],
              correctPairs: [
                { itemId: 'user-nft', targetId: 'owned' },
                { itemId: 'dex-pool', targetId: 'shared' },
                { itemId: 'published-metadata', targetId: 'immutable' },
                { itemId: 'game-inventory', targetId: 'owned' },
              ],
            },
          },
        },
        {
          title: 'Object References in Function Signatures',
          emoji: '📋',
          content: "How you hand an object to a function matters a lot. It's like the difference between giving someone your car versus lending them the keys.\n\nThere are four ways to pass an object to a function:\n\n**By value** (`obj: MyStruct`) — you're giving away the object entirely. The function takes full ownership, and you lose it. Inside the function, the object must be explicitly transferred to someone, shared, frozen, or taken apart (destructured). If you forget to handle it, the compiler will yell at you.\n\n**By mutable reference** (`obj: &mut MyStruct`) — you're lending it with permission to make changes. The function can read and modify fields, but you still own the object when the function is done. Like lending someone your car keys with permission to adjust the mirrors.\n\n**By immutable reference** (`obj: &MyStruct`) — read-only access. The function can look but can't touch. Like showing someone a painting through a window.\n\n**Receiving** (`obj: Receiving<MyStruct>`) — a special pattern for objects that were sent to another object (not directly to you). We'll cover this in detail shortly.\n\nA common beginner mistake is taking an object by value when you only needed a reference — and then wondering where the object went! If you just need to read or modify, use a reference.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::references {\n    use sui::transfer;\n\n    public struct Item has key, store {\n        id: UID,\n        value: u64,\n    }\n\n    // By value: takes ownership, must handle the object\n    public fun consume_item(item: Item) {\n        let Item { id, value: _ } = item;\n        object::delete(id);\n    }\n\n    // By mutable reference: can modify, caller keeps ownership\n    public fun upgrade_item(item: &mut Item) {\n        item.value = item.value + 10;\n    }\n\n    // By immutable reference: read-only access\n    public fun read_value(item: &Item): u64 {\n        item.value\n    }\n}`,
              highlights: [
                { line: 4, explanation: "This struct has both 'key' (makes it a blockchain object with a UID) and 'store' (lets it be publicly transferred and stored inside other objects). These two together give maximum flexibility." },
                { line: 10, explanation: "By-value parameter — you're giving the function the whole Item. It now MUST do something with it: transfer it, share it, freeze it, or take it apart. You can't just leave it hanging." },
                { line: 11, explanation: "Destructuring (taking apart) the struct. This pulls out the fields and destroys the object. The UID must be explicitly deleted — Sui won't let you just throw it away silently." },
                { line: 16, explanation: "Mutable reference (&mut): the function can change item.value, but the original owner still has the object when the function returns. This is lending, not giving." },
                { line: 21, explanation: "Immutable reference (&): strictly read-only. If you tried to write to item.value here, the compiler would stop you with an error." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-016',
    },
    {
      sectionTitle: 'The Transfer API',
      slides: [
        {
          title: 'transfer::transfer vs transfer::public_transfer',
          emoji: '📤',
          content: "Think of it this way: `transfer::transfer` is like a private courier that only the creator can use. `transfer::public_transfer` is like the postal service — anyone can send the package.\n\nHere's the detail:\n\n`transfer::transfer` can move any object that has the `key` ability, but it can **only be called inside the module that defines the struct**. This is the creator keeping control. Nobody else can move your object unless you let them.\n\n`transfer::public_transfer` works on objects that have **both `key` and `store`** abilities, and it can be called from **any module** — including transaction blocks that users build from their wallets. This is the permissionless, open-for-everyone version.\n\nThe same pattern applies to sharing and freezing:\n- `transfer::share_object` vs `transfer::public_share_object`\n- `transfer::freeze_object` vs `transfer::public_freeze_object`\n\nSo here's the design decision you'll face with every struct: if you want users to freely trade your object (like a standard NFT), give it `store`. If you want to control every transfer (like enforcing royalties), leave off `store` and expose your own transfer function that calls `transfer::transfer` internally. We'll see a real example of that pattern in a bit.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'transfer::transfer', content: 'The private courier. Moves an object with the key ability, but can ONLY be called from within the module that defined the struct. This is how you keep control over transfers.' },
                { label: 'transfer::public_transfer', content: 'The postal service. Moves an object with key + store abilities, and can be called from ANY module — including user-built transaction blocks. This is the open, permissionless option.' },
                { label: 'Why Omit store?', content: 'No store = no public_transfer = all transfers must go through YOUR module. This is your gateway to enforcing royalties, cooldowns, allowlists, or any custom rules you can dream up.' },
                { label: 'The store Ability', content: 'Adding store to your struct does three things: (1) enables public_transfer, (2) lets it be stored as a field inside other objects, and (3) lets it be used in dynamic fields. It\'s the "maximum composability" ability.' },
              ],
            },
          },
        },
        {
          title: 'Sharing and Freezing Objects',
          emoji: '🌐',
          content: "Sharing is permanent — once you put something in the public square, you can't take it back. Freezing is like putting something in a museum display case — everyone can see it, but nobody can touch it.\n\nLet's look at each one:\n\n**Sharing** makes an object accessible to everyone. Any transaction from any address can read or modify it. You share an object by calling `transfer::share_object(obj)` inside the defining module, or `transfer::public_share_object(obj)` for objects with `store`. Shared objects are perfect for global state — things like liquidity pools, auction contracts, or game worlds that many people interact with.\n\nBut here's the important part: sharing is a **one-way door**. Once an object is shared, it can never become owned again. Ever. So think carefully before sharing!\n\n**Freezing** makes an object permanently immutable. Once frozen, nobody can change it, delete it, or move it — not even you. You freeze with `transfer::freeze_object(obj)` or `transfer::public_freeze_object(obj)`. Frozen objects are great for published configuration, metadata, or reference data that should be trustworthy forever.\n\nBoth sharing and freezing take the object by value — meaning you need to own it first, and afterward you don't hold it anymore. You're giving it to the network.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::transfer_patterns {\n    use sui::transfer;\n\n    public struct GameWorld has key {\n        id: UID,\n        name: vector<u8>,\n        player_count: u64,\n    }\n\n    public struct Trophy has key, store {\n        id: UID,\n        title: vector<u8>,\n    }\n\n    // Share the game world — anyone can interact with it\n    fun init(ctx: &mut TxContext) {\n        let world = GameWorld {\n            id: object::new(ctx),\n            name: b"Sui Arena",\n            player_count: 0,\n        };\n        transfer::share_object(world);\n    }\n\n    // Award a trophy to a player (owned transfer)\n    public fun award_trophy(\n        recipient: address,\n        title: vector<u8>,\n        ctx: &mut TxContext,\n    ) {\n        let trophy = Trophy {\n            id: object::new(ctx),\n            title,\n        };\n        // Trophy has store, so we could use public_transfer,\n        // but transfer works here too since we are in the defining module\n        transfer::public_transfer(trophy, recipient);\n    }\n\n    // Freeze a trophy as a permanent monument\n    public fun immortalize_trophy(trophy: Trophy) {\n        transfer::freeze_object(trophy);\n    }\n}`,
              highlights: [
                { line: 4, explanation: "GameWorld has only 'key' — no 'store'. That means it can be shared, frozen, or transferred within this module, but nobody outside can publicly transfer it. The module stays in control." },
                { line: 10, explanation: "Trophy has both 'key' and 'store' — the full combo. This means it can be publicly transferred, shared, or frozen from anywhere, including user wallets." },
                { line: 22, explanation: "share_object takes the GameWorld by value and makes it shared. From this moment on, any transaction from any address can access this game world. No take-backs!" },
                { line: 37, explanation: "public_transfer sends the Trophy to a specific address. Since Trophy has store, this could also be called from a PTB (Programmable Transaction Block) outside this module." },
                { line: 42, explanation: "freeze_object takes the Trophy by value and locks it forever. No more changes, no more transfers. It becomes a permanent, read-only monument on-chain." },
              ],
            },
          },
        },
        {
          title: 'Receiving Objects (Object-to-Object Transfer)',
          emoji: '📬',
          content: "Object-to-object transfer is like getting mail delivered to your house. Someone sends a package to your \"mailbox\" object, and you pick it up when you're ready.\n\nHere's how it works: instead of transferring an object to a wallet address, you transfer it to another object's address using `transfer::transfer(child, object::id_to_address(&parent_id))`. The child object is now \"in the mailbox\" of the parent object.\n\nThe parent's owner can then claim it using `transfer::receive<T>(&mut parent.id, receiving_ticket)`. The `Receiving<T>` type is a special ticket that proves \"hey, this object was sent to your parent — here's your claim stub.\"\n\nThis pattern is super useful for inbox-style designs. Imagine a user's profile object that can receive items, messages, or tokens — even when the user is offline. They log in later and pick up everything that was sent to them.\n\nA few rules to remember:\n1. You need a mutable reference to the parent's UID to call `receive` — this proves you own the parent.\n2. The received object comes back by value, so you need to do something with it (transfer it, use it, etc.).\n3. Only the parent's owner can initiate the receive — nobody else can open your mailbox.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::inbox {\n    use sui::transfer::{Self, Receiving};\n\n    public struct Mailbox has key {\n        id: UID,\n        owner_name: vector<u8>,\n    }\n\n    public struct Letter has key, store {\n        id: UID,\n        content: vector<u8>,\n    }\n\n    // Send a letter to someone's mailbox\n    public fun send_letter(\n        mailbox_id: ID,\n        content: vector<u8>,\n        ctx: &mut TxContext,\n    ) {\n        let letter = Letter {\n            id: object::new(ctx),\n            content,\n        };\n        // Transfer the letter TO the mailbox object\n        transfer::public_transfer(letter, object::id_to_address(&mailbox_id));\n    }\n\n    // Mailbox owner receives a letter\n    public fun receive_letter(\n        mailbox: &mut Mailbox,\n        incoming: Receiving<Letter>,\n    ): Letter {\n        transfer::public_receive(&mut mailbox.id, incoming)\n    }\n}`,
              highlights: [
                { line: 2, explanation: "We import both the transfer module and the Receiving type. Receiving<T> is the 'claim ticket' for object-to-object transfers — it proves something was sent to your parent object." },
                { line: 9, explanation: "Letter needs 'store' because we're using public_transfer and public_receive. Without store, you'd use the module-only versions (transfer and receive) instead." },
                { line: 25, explanation: "object::id_to_address converts an object ID into an address format. This is the magic that lets you send objects TO other objects instead of just to wallet addresses." },
                { line: 31, explanation: "Receiving<Letter> is the claim ticket. It shows up as a transaction input and says 'a Letter was sent to this Mailbox — here, claim it.'" },
                { line: 33, explanation: "public_receive claims the letter. Notice it needs &mut mailbox.id — this proves you own the mailbox. Only the mailbox owner can pick up their mail!" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-move-017',
    },
    {
      sectionTitle: 'Custom Transfer Policies & Advanced Patterns',
      slides: [
        {
          title: 'Custom Transfer Policies',
          emoji: '🛡️',
          content: "By leaving off the `store` ability, you become the gatekeeper of all transfers. Want to charge a royalty? Enforce a cooldown? Require an allowlist? This is how.\n\nHere's the pattern: when your struct has only `key` (no `store`), nobody can use `public_transfer` on it. The only way to move the object is through functions that YOU define in your module — functions that internally call `transfer::transfer`.\n\nThis is huge for things like NFT royalties. Without `store`, you can write a `transfer_with_royalty` function that collects a fee every time the NFT changes hands. Nobody can bypass your function because `public_transfer` simply won't work on your struct.\n\nThe Sui ecosystem has even formalized this with the Kiosk framework, which uses `TransferPolicy<T>` objects to define rules (royalty percentages, lock-up periods, allowlists) that must be satisfied before a transfer goes through.\n\nThe recipe is simple:\n1. Define your struct with `key` only — no `store`.\n2. Write a custom function that checks your conditions.\n3. Call `transfer::transfer` inside that function.\n4. Users can't go around you because `public_transfer` requires `store`.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::royalty_nft {\n    use sui::transfer;\n    use sui::coin::{Self, Coin};\n    use sui::sui::SUI;\n\n    // key only — NO store — forces transfers through our module\n    public struct RoyaltyNFT has key {\n        id: UID,\n        name: vector<u8>,\n        creator: address,\n        royalty_bps: u64,  // basis points (e.g., 250 = 2.5%)\n    }\n\n    public fun transfer_with_royalty(\n        nft: RoyaltyNFT,\n        mut payment: Coin<SUI>,\n        recipient: address,\n        ctx: &mut TxContext,\n    ) {\n        // Calculate and split the royalty\n        let royalty_amount = coin::value(&payment) * nft.royalty_bps / 10_000;\n        let royalty_coin = coin::split(&mut payment, royalty_amount, ctx);\n\n        // Send royalty to creator\n        transfer::public_transfer(royalty_coin, nft.creator);\n        // Send remaining payment back to caller\n        transfer::public_transfer(payment, tx_context::sender(ctx));\n        // Transfer the NFT to the buyer\n        transfer::transfer(nft, recipient);\n    }\n}`,
              highlights: [
                { line: 7, explanation: "This is the key decision: 'key' without 'store'. This single choice means NOBODY can use public_transfer on this NFT. Every transfer must go through this module's functions." },
                { line: 11, explanation: "royalty_bps stores the royalty as basis points. 250 bps = 2.5% of the sale price. Basis points are standard in finance — 10,000 bps = 100%." },
                { line: 14, explanation: "This is the ONLY way to transfer the NFT. The function name says it all: you can't transfer without paying the royalty. No exceptions, no workarounds." },
                { line: 22, explanation: "coin::split carves out the royalty portion from the payment. The creator gets paid on every single transfer — that's the power of custom transfer policies." },
                { line: 29, explanation: "transfer::transfer (not public_transfer) works here because we're inside the defining module. This is the module's special privilege." },
              ],
            },
          },
        },
        {
          title: 'Wrapping and Unwrapping Objects',
          emoji: '🎁',
          content: "**Wrapping** is like putting an object inside a box and closing the lid. Once wrapped, the inner object disappears from the outside world — it's no longer independently accessible. It becomes part of the wrapper object.\n\nFor an object to be wrappable (stored as a field inside another struct), it needs the `store` ability. When you later unpack (destructure) the wrapper, the inner object reappears and you need to do something with it — transfer it, share it, freeze it, or destroy it.\n\nWhy is this useful? Think about escrow. You wrap an NFT inside an Escrow object, and the NFT is locked until the escrow conditions are met. Nobody can access the NFT directly — it's sealed inside the box. When conditions are fulfilled, you unwrap and release it.\n\nWrapping is also the foundation of dynamic fields and dynamic object fields, where objects are stored under dynamic keys on a parent object. Under the hood, Sui is wrapping them for you.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Wrapping', content: 'Storing an object (with the store ability) as a field in another struct. The inner object vanishes from the global object pool — like putting a toy inside a locked treasure chest. Nobody can see or touch it directly.' },
                { label: 'Unwrapping', content: 'Taking the wrapper apart (destructuring) to get the inner object back out. The inner object reappears in the world and you need to handle it — transfer, share, freeze, or destroy it.' },
                { label: 'Escrow Example', content: 'Imagine: Escrow { id, item: Item, unlock_time: u64 }. The Item is sealed inside. When the clock passes unlock_time, you destructure the Escrow and release the Item. Until then, it\'s locked tight.' },
                { label: 'Dynamic Fields', content: 'Dynamic fields actually use wrapping behind the scenes. When you add a dynamic field to an object, the value gets wrapped into Sui\'s internal storage under a dynamic key. Same concept, just automated.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together: Ownership Design Decisions',
          emoji: '🧭',
          content: "When you're designing a Sui module, every object needs an ownership strategy. Here's a simple decision framework to help you choose:\n\n**Use owned objects** when the state belongs to one person and doesn't need to be shared. Examples: user profiles, inventory items, personal settings. Why: maximum speed, no consensus overhead, transactions fly through.\n\n**Use shared objects** when multiple people need to read and write the same state. Examples: AMM liquidity pools, auction contracts, multiplayer game worlds. The trade-off: every transaction goes through consensus, which is a bit slower.\n\n**Use immutable objects** for data that should never change once created. Examples: published artwork metadata, protocol parameters locked at launch, package info. Why: zero-cost reads from any transaction — and everyone can trust the data hasn't been tampered with.\n\n**Use wrapping** when an object should be temporarily inaccessible. Examples: escrowed assets, staked tokens, items in a crafting recipe. The object is locked inside another object until conditions are met.\n\n**Omit `store`** when you need to control every transfer (royalties, cooldowns, allowlists). **Include `store`** when you want maximum composability and want users to freely trade your objects.\n\nDon't worry about memorizing all of this — you'll develop intuition as you build more. The important thing is knowing these options exist.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'amm-pool', label: 'AMM Liquidity Pool', emoji: '🏊' },
                { id: 'staked-token', label: 'Staked Token (locked)', emoji: '🔒' },
                { id: 'player-sword', label: 'Player\'s Sword', emoji: '⚔️' },
                { id: 'protocol-config', label: 'Published Protocol Config', emoji: '📜' },
              ],
              targets: [
                { id: 'shared', label: 'Shared Object' },
                { id: 'wrapped', label: 'Wrapped (inside another object)' },
                { id: 'owned', label: 'Owned Object' },
                { id: 'immutable', label: 'Immutable Object' },
              ],
              correctPairs: [
                { itemId: 'amm-pool', targetId: 'shared' },
                { itemId: 'staked-token', targetId: 'wrapped' },
                { itemId: 'player-sword', targetId: 'owned' },
                { itemId: 'protocol-config', targetId: 'immutable' },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-move-018',
    },
  ],

  quiz: [
    {
      question: 'What\'s the key difference between transfer::transfer and transfer::public_transfer?',
      options: [
        'transfer::transfer is faster because it skips validation',
        'transfer::public_transfer can only be called by the package publisher',
        'transfer::transfer can only be called within the defining module, while public_transfer can be called from any module but requires the store ability',
        'There is no difference; they are aliases for the same function',
      ],
      correctAnswer: 2,
      explanation: 'transfer::transfer is the "private courier" — it works on objects with the key ability but is restricted to the module that defines the struct. transfer::public_transfer is the "postal service" — it works on objects with both key and store, and can be called from anywhere, including programmable transaction blocks. Why this matters: this distinction is how you decide whether users can freely trade your objects or whether all transfers must go through your module\'s custom logic.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Think about where the transfer call is happening. Inside the defining module? transfer works on key-only structs. Outside the module? You need public_transfer, which requires store. The abilities on your struct determine which doors are open.',
    },
    {
      question: 'What happens when you call transfer::share_object on an owned object?',
      options: [
        'The object becomes shared and can later be converted back to an owned object',
        'The object becomes shared permanently — it can never become owned again',
        'The object is cloned: one copy stays owned, the other becomes shared',
        'The function only works if the object has the copy ability',
      ],
      correctAnswer: 1,
      explanation: 'Sharing is a one-way door — once you walk through, you can\'t go back. Once an object is shared, it can never become owned again. This is enforced at the protocol level, not just by convention. Why this matters: you need to be absolutely sure before sharing an object. If you share a registry or a pool, that decision is permanent. Design your module so that objects are only shared when they truly need collaborative access.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Remember: sharing is like releasing a bird — you can\'t un-release it. Once shared, always shared. Design carefully and only share objects that truly need to be accessed by multiple parties.',
    },
    {
      question: 'Why would you leave off the store ability from a struct that represents an NFT?',
      options: [
        'To make the NFT cheaper to store on-chain',
        'To prevent the NFT from being used in dynamic fields',
        'To force all transfers through custom module functions, enabling royalty enforcement or transfer restrictions',
        'The store ability has no effect on transfer behavior',
      ],
      correctAnswer: 2,
      explanation: 'Without store, public_transfer won\'t work on your NFT — so the only way to move it is through functions YOU define in your module. This is the foundation of royalty enforcement. Why this matters: if you\'re building an NFT collection and want to guarantee the creator gets a cut on every resale, omitting store is your most powerful tool. Nobody can bypass your transfer function, period.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'No store = no public_transfer = the module controls every movement. Think of it as being the bouncer at the door — nothing moves without your say-so.',
    },
    {
      question: 'How does the Receiving<T> type work in Sui Move?',
      options: [
        'It is a wrapper that encrypts the object during transfer',
        'It represents a proof that an object of type T was transferred to a parent object, and is used with transfer::receive to claim it',
        'It automatically converts an object to a shared object upon receipt',
        'It is a legacy type that has been deprecated in favor of direct transfers',
      ],
      correctAnswer: 1,
      explanation: 'Receiving<T> is a claim ticket — like a slip from the post office that says "you have a package waiting." When an object is transferred to another object (not a wallet address), the parent object\'s owner uses transfer::receive (or public_receive) with a mutable reference to the parent\'s UID and the Receiving ticket to claim the child. Why this matters: this pattern enables inbox-style designs where objects can receive items even when the owner is offline.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Think of Receiving<T> as a mail slip. Someone sent a package to your object\'s "address." You need the slip (Receiving<T>) and your key (&mut UID) to pick it up.',
    },
    {
      question: 'When you wrap an object inside another struct, what happens to the inner object?',
      options: [
        'It remains independently accessible in the global object pool',
        'It is deleted permanently and cannot be recovered',
        'It disappears from the global object pool and becomes part of the wrapper — inaccessible until the wrapper is unpacked',
        'It becomes an immutable object automatically',
      ],
      correctAnswer: 2,
      explanation: 'Wrapping is like putting an object inside a locked box. It vanishes from the global object pool — nobody can see it, use it, or interact with it directly. It only comes back when you destructure (unpack) the wrapper. Why this matters: wrapping is the foundation of escrow, staking, and locking patterns. When you need to temporarily make an object inaccessible (like locking tokens during a staking period), wrapping is your tool.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'When an object is wrapped, it\'s sealed inside another object — invisible to the outside world. Unwrapping (destructuring the wrapper) is the only way to get it back out.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module ownership_practice::transfer_patterns {
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // TODO 1: Define a struct 'Artifact' with key and store abilities
    // Fields: id (UID), name (vector<u8>), power (u64)
    //
    // Why key AND store? Because we want Artifacts to be freely tradeable.
    // 'key' makes it a blockchain object, 'store' enables public_transfer.
    // Hint: public struct Artifact has key, store { ... }

    // TODO 2: Define a struct 'SoulboundBadge' with key ability ONLY (no store!)
    // Fields: id (UID), title (vector<u8>), owner (address)
    //
    // Why key only? Because we want to CONTROL transfers — nobody should
    // be able to transfer this badge except through our custom function.
    // Hint: public struct SoulboundBadge has key { ... }

    // TODO 3: Define a struct 'GlobalRegistry' with key ability
    // Fields: id (UID), total_artifacts (u64)
    //
    // This will become a shared object so everyone can access it.
    // Shared objects only need 'key' — they don't need 'store'.
    // Hint: public struct GlobalRegistry has key { ... }

    // TODO 4: Write an init function that:
    //   - Creates a GlobalRegistry with total_artifacts = 0
    //   - Shares the GlobalRegistry using transfer::share_object
    //
    // Remember: init runs once when the module is published.
    // After sharing, anyone can pass this registry to functions.
    // Hint: fun init(ctx: &mut TxContext) { ... transfer::share_object(registry); }

    // TODO 5: Write a public function 'mint_artifact' that:
    //   - Takes registry (&mut GlobalRegistry), name (vector<u8>),
    //     recipient (address), and ctx (&mut TxContext)
    //   - Creates a new Artifact with the given name and power = 100
    //   - Increments registry.total_artifacts by 1
    //   - Uses transfer::public_transfer to send the Artifact to recipient
    //
    // We use public_transfer here because Artifact has 'store'.
    // Hint: Don't forget to create the UID with object::new(ctx)

    // TODO 6: Write a public function 'mint_soulbound_badge' that:
    //   - Takes title (vector<u8>) and ctx (&mut TxContext)
    //   - Creates a SoulboundBadge with the sender's address as owner
    //   - Uses transfer::transfer (NOT public_transfer!) to send it to the sender
    //
    // We use transfer::transfer because SoulboundBadge does NOT have store.
    // Get the sender with tx_context::sender(ctx).
    // Hint: let sender = tx_context::sender(ctx);

    // TODO 7: Write a public function 'freeze_artifact' that:
    //   - Takes an Artifact by value (not by reference!)
    //   - Freezes it using transfer::public_freeze_object
    //
    // After freezing, the artifact becomes permanently immutable —
    // anyone can read it, but nobody can ever change or move it again.
    // Hint: public fun freeze_artifact(artifact: Artifact) { ... }

    // TODO 8: Write a public function 'transfer_soulbound_with_approval' that:
    //   - Takes badge (SoulboundBadge), new_owner (address), and ctx (&mut TxContext)
    //   - Asserts that the sender is the current badge.owner
    //   - Updates badge.owner to new_owner
    //   - Uses transfer::transfer to send it to new_owner
    //
    // This is a CUSTOM TRANSFER POLICY! Only the current owner can transfer.
    // Because SoulboundBadge has no 'store', this is the ONLY way to move it.
    // Hint: assert!(badge.owner == tx_context::sender(ctx), 0);
}`,

  solution: `module ownership_practice::transfer_patterns {
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // 1: Artifact with key + store = publicly transferable
    public struct Artifact has key, store {
        id: UID,
        name: vector<u8>,
        power: u64,
    }

    // 2: SoulboundBadge with key only = module-controlled transfers
    public struct SoulboundBadge has key {
        id: UID,
        title: vector<u8>,
        owner: address,
    }

    // 3: GlobalRegistry with key only (will be shared)
    public struct GlobalRegistry has key {
        id: UID,
        total_artifacts: u64,
    }

    // 4: Init function — create and share the registry
    fun init(ctx: &mut TxContext) {
        let registry = GlobalRegistry {
            id: object::new(ctx),
            total_artifacts: 0,
        };
        transfer::share_object(registry);
    }

    // 5: Mint an artifact and publicly transfer to recipient
    public fun mint_artifact(
        registry: &mut GlobalRegistry,
        name: vector<u8>,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let artifact = Artifact {
            id: object::new(ctx),
            name,
            power: 100,
        };
        registry.total_artifacts = registry.total_artifacts + 1;
        transfer::public_transfer(artifact, recipient);
    }

    // 6: Mint a soulbound badge — only transferable through our custom function
    public fun mint_soulbound_badge(
        title: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let badge = SoulboundBadge {
            id: object::new(ctx),
            title,
            owner: sender,
        };
        transfer::transfer(badge, sender);
    }

    // 7: Freeze an artifact — makes it permanently immutable
    public fun freeze_artifact(artifact: Artifact) {
        transfer::public_freeze_object(artifact);
    }

    // 8: Custom transfer policy for soulbound badge
    public fun transfer_soulbound_with_approval(
        mut badge: SoulboundBadge,
        new_owner: address,
        ctx: &mut TxContext,
    ) {
        assert!(badge.owner == tx_context::sender(ctx), 0);
        badge.owner = new_owner;
        transfer::transfer(badge, new_owner);
    }
}`,

  hints: [
    'Let\'s start with the struct definitions. This is all about abilities! Artifact needs \'has key, store\' because we want anyone to be able to transfer it freely. SoulboundBadge needs only \'has key\' because we want to control all transfers. GlobalRegistry needs \'has key\' because it\'ll be shared. Remember: the abilities you choose shape everything else.',
    'Nice progress! For the init function, create a GlobalRegistry with object::new(ctx) for the UID and 0 for total_artifacts. Then call transfer::share_object(registry) to make it accessible to everyone. Remember: init takes only &mut TxContext as a parameter — Sui calls it automatically when you publish.',
    'You\'re doing great! Here\'s where transfer vs public_transfer matters: for mint_artifact, use transfer::public_transfer because Artifact has store. For mint_soulbound_badge, use transfer::transfer because SoulboundBadge does NOT have store. Get the sender\'s address with tx_context::sender(ctx).',
    'Almost there! For transfer_soulbound_with_approval, first check that the caller is the current owner: assert!(badge.owner == tx_context::sender(ctx), 0). Then update badge.owner to the new_owner address before calling transfer::transfer. This is a real custom transfer policy — the kind used to enforce royalties in production NFT protocols!',
  ],
};
