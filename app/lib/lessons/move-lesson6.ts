import { LessonContent } from '@/app/types/lesson';

export const moveLesson6: LessonContent = {
  id: 'move-6',
  title: 'Ownership & Transfer',
  description: 'Master the Sui ownership model — owned, shared, and immutable objects — along with transfer functions, the store ability, and custom transfer policies.',
  difficulty: 'advanced',
  xpReward: 350,
  order: 6,
  language: 'move',
  prerequisiteLessons: ['move-5'],

  narrative: {
    welcomeMessage: "Welcome to one of the most powerful concepts in Sui Move: ownership. Unlike other blockchains where state is stored in global mappings, Sui gives every object an owner. Understanding how to transfer, share, and freeze objects is the key to building secure, performant dApps on Sui.",
    quizTransition: "You have explored owned objects, shared objects, immutable objects, and the transfer API. Let's see how well you internalized these ownership patterns.",
    practiceTransition: "Time to write real code! Implement a module that creates objects and demonstrates every transfer pattern: owned transfer, sharing, and freezing.",
    celebrationMessage: "Excellent work! You now command the Sui ownership model. You can move objects between addresses, open them up for shared access, or lock them down permanently.",
    nextLessonTease: "Next up: Advanced Generics & Patterns. You will learn the witness pattern, phantom types, hot potato, and capability-based access control — the design patterns that power production Sui protocols.",
  },

  teachingSections: [
    {
      sectionTitle: 'The Sui Object Ownership Model',
      slides: [
        {
          title: 'Three Kinds of Ownership',
          emoji: '🏠',
          content: "Every object on Sui has exactly one ownership state at any point in time. **Owned objects** belong to a single address and can only be used in transactions signed by that address. **Shared objects** are accessible by anyone — any transaction can read or mutate them, but this requires consensus ordering. **Immutable objects** are frozen forever; they can be read by anyone but never mutated or deleted. Understanding when to use each type is a core Sui design skill. Owned objects enable parallel execution (no contention), shared objects enable collaborative state (like a marketplace orderbook), and immutable objects enable trustless reference data (like published package metadata).",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Owned Objects', content: 'Belong to a single address. Only that address can use them in transactions. Transactions on distinct owned objects execute in parallel with zero contention.' },
                { label: 'Shared Objects', content: 'Accessible by any address. Require consensus ordering because multiple transactions may touch them simultaneously. Use transfer::share_object to create one.' },
                { label: 'Immutable Objects', content: 'Frozen permanently. Anyone can read them but nobody can mutate, transfer, or delete them. Created with transfer::freeze_object.' },
                { label: 'Object-Centric Design', content: 'Sui is object-centric, not account-centric. Instead of global storage slots, every piece of state is a typed object with a UID, an owner, and a version.' },
              ],
            },
          },
        },
        {
          title: 'How Ownership Affects Execution',
          emoji: '⚡',
          content: "The ownership model is not just an access control mechanism — it fundamentally shapes execution performance. When a transaction only touches **owned objects**, Sui can execute it without going through consensus at all (simple transactions). This is why Sui can achieve sub-second finality for many use cases. When a transaction touches at least one **shared object**, it must go through the consensus protocol (Mysticeti) to establish a total order with other transactions touching the same shared object. Immutable objects are the best of both worlds: they can be read by any transaction without adding consensus overhead because they never change. The design implication is clear: minimize shared objects when possible, prefer owned objects for user-specific state, and use immutable objects for reference data.",
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
          content: "How you accept an object in a function signature determines what you can do with it. There are four ways to receive an object:\n\n**By value** (`obj: MyStruct`) — the function takes full ownership. The object is consumed and must be explicitly transferred, shared, frozen, or destructured (unpacked) inside the function. If you forget to handle it, the compiler will reject your code.\n\n**By mutable reference** (`obj: &mut MyStruct`) — the function can read and modify fields but does not own the object. Ownership stays with the caller.\n\n**By immutable reference** (`obj: &MyStruct`) — read-only access. Cannot modify any fields.\n\n**Receiving** (`obj: Receiving<MyStruct>`) — for objects sent to another object via `transfer::transfer`. The parent object's owner calls `transfer::receive` to claim it. This is the foundation of object-to-object transfers.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::references {\n    use sui::transfer;\n\n    public struct Item has key, store {\n        id: UID,\n        value: u64,\n    }\n\n    // By value: takes ownership, must handle the object\n    public fun consume_item(item: Item) {\n        let Item { id, value: _ } = item;\n        object::delete(id);\n    }\n\n    // By mutable reference: can modify, caller keeps ownership\n    public fun upgrade_item(item: &mut Item) {\n        item.value = item.value + 10;\n    }\n\n    // By immutable reference: read-only access\n    public fun read_value(item: &Item): u64 {\n        item.value\n    }\n}`,
              highlights: [
                { line: 4, explanation: "The struct has both 'key' (makes it an object with UID) and 'store' (allows public_transfer and storage inside other objects)." },
                { line: 10, explanation: "By-value parameter: the function now owns the Item. It MUST be consumed — transferred, shared, frozen, or destructured." },
                { line: 11, explanation: "Destructuring (unpacking) the struct extracts its fields and destroys the object. The UID must be explicitly deleted." },
                { line: 16, explanation: "Mutable reference: the function can write to item.value but the object remains with the original owner after the call." },
                { line: 21, explanation: "Immutable reference: strictly read-only. Attempting to modify item.value here would be a compile error." },
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
          content: "Sui provides two families of transfer functions, and choosing between them depends on whether the object has the **store** ability.\n\n`transfer::transfer` can transfer any object with the `key` ability, but it can **only be called inside the module that defines the struct**. This gives the module author full control over when and how their objects move between addresses.\n\n`transfer::public_transfer` can transfer objects that have **both `key` and `store`** abilities, and it can be called from **any module** — including transaction blocks built by the client. This is the permissionless transfer.\n\nThe same split applies to sharing and freezing: `transfer::share_object` vs `transfer::public_share_object`, and `transfer::freeze_object` vs `transfer::public_freeze_object`.\n\nDesign rule: if you want users to freely trade your object (like an NFT), give it `store`. If you want to enforce custom logic on every transfer (like royalties), omit `store` and expose your own transfer function that calls `transfer::transfer` internally.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'transfer::transfer', content: 'Transfers an object with key ability. Can ONLY be called within the defining module. Gives the module author full control over transfer logic.' },
                { label: 'transfer::public_transfer', content: 'Transfers an object with key + store abilities. Can be called from ANY module, including PTBs. Enables permissionless trading.' },
                { label: 'Why Omit store?', content: 'Omitting store forces all transfers through your module, letting you enforce royalties, cooldowns, allowlists, or any custom transfer policy.' },
                { label: 'The store Ability', content: 'store allows an object to be (1) transferred publicly, (2) stored inside other objects as a field, and (3) wrapped in dynamic fields.' },
              ],
            },
          },
        },
        {
          title: 'Sharing and Freezing Objects',
          emoji: '🌐',
          content: "**Sharing** an object makes it accessible to all addresses. Once shared, an object **can never become owned again** — sharing is a one-way operation. You share an object by calling `transfer::share_object(obj)` inside the defining module, or `transfer::public_share_object(obj)` for objects with `store`. Shared objects are ideal for global state like liquidity pools, registries, or game worlds.\n\n**Freezing** an object makes it permanently immutable. Once frozen, no one can mutate, delete, or transfer it. You freeze an object with `transfer::freeze_object(obj)` or `transfer::public_freeze_object(obj)`. Frozen objects are perfect for published configuration, metadata, or reference data that should never change.\n\nBoth sharing and freezing consume the object by value — you must own it to share or freeze it, and afterward you no longer hold it.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::transfer_patterns {\n    use sui::transfer;\n\n    public struct GameWorld has key {\n        id: UID,\n        name: vector<u8>,\n        player_count: u64,\n    }\n\n    public struct Trophy has key, store {\n        id: UID,\n        title: vector<u8>,\n    }\n\n    // Share the game world — anyone can interact with it\n    fun init(ctx: &mut TxContext) {\n        let world = GameWorld {\n            id: object::new(ctx),\n            name: b"Sui Arena",\n            player_count: 0,\n        };\n        transfer::share_object(world);\n    }\n\n    // Award a trophy to a player (owned transfer)\n    public fun award_trophy(\n        recipient: address,\n        title: vector<u8>,\n        ctx: &mut TxContext,\n    ) {\n        let trophy = Trophy {\n            id: object::new(ctx),\n            title,\n        };\n        // Trophy has store, so we could use public_transfer,\n        // but transfer works here too since we are in the defining module\n        transfer::public_transfer(trophy, recipient);\n    }\n\n    // Freeze a trophy as a permanent monument\n    public fun immortalize_trophy(trophy: Trophy) {\n        transfer::freeze_object(trophy);\n    }\n}`,
              highlights: [
                { line: 4, explanation: "GameWorld has only 'key' — it can be shared/frozen/transferred within this module, but NOT publicly transferred." },
                { line: 10, explanation: "Trophy has 'key' and 'store' — it can be publicly transferred, shared, or frozen from anywhere." },
                { line: 22, explanation: "share_object takes the GameWorld by value and makes it shared. From this point, any transaction can access it." },
                { line: 37, explanation: "public_transfer sends the Trophy to a specific address. Since Trophy has store, this could also be called from a PTB." },
                { line: 42, explanation: "freeze_object takes the Trophy by value and makes it immutable forever. No more mutations or transfers." },
              ],
            },
          },
        },
        {
          title: 'Receiving Objects (Object-to-Object Transfer)',
          emoji: '📬',
          content: "Sui supports transferring objects **to other objects** (not just addresses). When you call `transfer::transfer(child, object::id_to_address(&parent_id))`, the child object is sent to the parent object. The parent's owner can then claim it using `transfer::receive<T>(&mut parent.id, receiving_ticket)`.\n\nThe receiving pattern is especially useful for inbox-style designs: a user's profile object can receive items, messages, or tokens without the user being online. The `Receiving<T>` type is a ticket that proves an object was sent to a specific parent — it appears in transaction inputs and gets resolved to the actual object inside the Move function.\n\nKey rules: (1) You need a mutable reference to the parent's UID to call `transfer::receive`. (2) The received object is returned by value, so you must handle it (transfer, consume, etc.). (3) Only the parent's owner can initiate the receive.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::inbox {\n    use sui::transfer::{Self, Receiving};\n\n    public struct Mailbox has key {\n        id: UID,\n        owner_name: vector<u8>,\n    }\n\n    public struct Letter has key, store {\n        id: UID,\n        content: vector<u8>,\n    }\n\n    // Send a letter to someone's mailbox\n    public fun send_letter(\n        mailbox_id: ID,\n        content: vector<u8>,\n        ctx: &mut TxContext,\n    ) {\n        let letter = Letter {\n            id: object::new(ctx),\n            content,\n        };\n        // Transfer the letter TO the mailbox object\n        transfer::public_transfer(letter, object::id_to_address(&mailbox_id));\n    }\n\n    // Mailbox owner receives a letter\n    public fun receive_letter(\n        mailbox: &mut Mailbox,\n        incoming: Receiving<Letter>,\n    ): Letter {\n        transfer::public_receive(&mut mailbox.id, incoming)\n    }\n}`,
              highlights: [
                { line: 2, explanation: "Import both transfer module and the Receiving type. Receiving<T> is the ticket for object-to-object transfers." },
                { line: 9, explanation: "Letter needs 'store' because we use public_transfer / public_receive. Without store, use transfer/receive within the module." },
                { line: 25, explanation: "object::id_to_address converts an object ID to an address, enabling transfer TO an object instead of a wallet." },
                { line: 31, explanation: "Receiving<Letter> is a proof that a Letter was sent to this mailbox. It appears as a transaction input." },
                { line: 33, explanation: "public_receive claims the letter. It requires &mut UID of the parent, proving you own the mailbox." },
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
          content: "By omitting `store` from your struct, you force all transfers to go through functions you define. This is the foundation of **custom transfer policies** — a pattern used extensively in NFT marketplaces and DeFi protocols.\n\nFor example, an NFT without `store` cannot be publicly transferred. Instead, you expose a `transfer_with_royalty` function that collects a fee and then calls `transfer::transfer` internally. The Sui Kiosk framework formalizes this with `TransferPolicy<T>` objects that define rules (royalty, lock-up, allowlist) which must be satisfied before a transfer completes.\n\nPattern: (1) Define your struct with `key` only. (2) Expose a custom function that validates conditions. (3) Call `transfer::transfer` inside that function. (4) Users cannot bypass your function because `public_transfer` requires `store`.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::royalty_nft {\n    use sui::transfer;\n    use sui::coin::{Self, Coin};\n    use sui::sui::SUI;\n\n    // key only — NO store — forces transfers through our module\n    public struct RoyaltyNFT has key {\n        id: UID,\n        name: vector<u8>,\n        creator: address,\n        royalty_bps: u64,  // basis points (e.g., 250 = 2.5%)\n    }\n\n    public fun transfer_with_royalty(\n        nft: RoyaltyNFT,\n        mut payment: Coin<SUI>,\n        recipient: address,\n        ctx: &mut TxContext,\n    ) {\n        // Calculate and split the royalty\n        let royalty_amount = coin::value(&payment) * nft.royalty_bps / 10_000;\n        let royalty_coin = coin::split(&mut payment, royalty_amount, ctx);\n\n        // Send royalty to creator\n        transfer::public_transfer(royalty_coin, nft.creator);\n        // Send remaining payment back to caller\n        transfer::public_transfer(payment, tx_context::sender(ctx));\n        // Transfer the NFT to the buyer\n        transfer::transfer(nft, recipient);\n    }\n}`,
              highlights: [
                { line: 7, explanation: "key without store: this NFT CANNOT be transferred with public_transfer. All transfers must go through this module." },
                { line: 11, explanation: "royalty_bps stores the royalty in basis points. 250 bps = 2.5% of the sale price." },
                { line: 14, explanation: "This is the ONLY way to transfer the NFT. Custom logic enforces royalty payment on every transfer." },
                { line: 22, explanation: "coin::split extracts the royalty portion from the payment coin." },
                { line: 29, explanation: "transfer::transfer (not public_transfer) works here because we are inside the defining module." },
              ],
            },
          },
        },
        {
          title: 'Wrapping and Unwrapping Objects',
          emoji: '🎁',
          content: "**Wrapping** means storing an object inside another object as a field. When an object is wrapped, it disappears from the global object pool — it no longer has an independent existence and cannot be accessed directly. It becomes part of the wrapper object.\n\nAn object can only be stored as a field in another struct if it has the `store` ability. When the wrapper is unpacked, the inner object reappears and must be handled (transferred, shared, frozen, or destructured).\n\nWrapping is useful for escrow patterns: wrap an NFT inside an Escrow object, and the NFT is locked until the escrow conditions are met. It is also the foundation of dynamic fields and dynamic object fields, where objects are stored under dynamic keys on a parent.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Wrapping', content: 'Storing an object with store ability as a field in another struct. The inner object loses its independent identity and cannot be accessed directly.' },
                { label: 'Unwrapping', content: 'Destructuring the wrapper to extract the inner object. The inner object regains its independent existence and must be transferred or otherwise handled.' },
                { label: 'Escrow Example', content: 'Wrap Item inside an Escrow { id, item: Item, unlock_time: u64 }. The Item is locked until unlock_time passes, then unwrap to release it.' },
                { label: 'Dynamic Fields', content: 'Dynamic fields use wrapping under the hood. When you add a dynamic field, the value is wrapped inside internal Sui storage keyed by the field name.' },
              ],
            },
          },
        },
        {
          title: 'Putting It All Together: Ownership Design Decisions',
          emoji: '🧭',
          content: "When designing a Sui module, every object needs an ownership strategy. Here is a decision framework:\n\n**Use owned objects** when the state belongs to one user and does not need to be shared. Examples: user profiles, inventory items, personal settings. Benefit: maximum parallelism, no consensus overhead.\n\n**Use shared objects** when multiple parties need to read and write the same state. Examples: AMM pools, auction contracts, game worlds. Cost: consensus ordering for every transaction.\n\n**Use immutable objects** for data that should never change after creation. Examples: published artwork metadata, protocol parameters locked at launch. Benefit: zero-cost reads from any transaction.\n\n**Use wrapping** when an object should be temporarily inaccessible. Examples: escrowed assets, staked tokens, items in a crafting recipe.\n\n**Omit store** when you need to enforce invariants on every transfer. **Include store** when you want maximum composability and permissionless transfers.",
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
      question: 'What is the key difference between transfer::transfer and transfer::public_transfer?',
      options: [
        'transfer::transfer is faster because it skips validation',
        'transfer::public_transfer can only be called by the package publisher',
        'transfer::transfer can only be called within the defining module, while public_transfer can be called from any module but requires the store ability',
        'There is no difference; they are aliases for the same function',
      ],
      correctAnswer: 2,
      explanation: 'transfer::transfer works on objects with the key ability but is restricted to the module that defines the struct. transfer::public_transfer works on objects with both key and store abilities and can be called from any module, including programmable transaction blocks.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Think about what abilities a struct needs and where the transfer call is being made. If it is inside the defining module, transfer works on key-only structs. Outside the module, you need public_transfer which requires store.',
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
      explanation: 'Sharing is a permanent, one-way operation. Once an object is shared, it can never be converted back to an owned object. This is enforced at the protocol level. The shared object can be accessed by any transaction from that point forward.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Remember that sharing is irreversible. Design your module so that objects are only shared when they truly need to be accessed by multiple parties.',
    },
    {
      question: 'Why would you omit the store ability from a struct that represents an NFT?',
      options: [
        'To make the NFT cheaper to store on-chain',
        'To prevent the NFT from being used in dynamic fields',
        'To force all transfers through custom module functions, enabling royalty enforcement or transfer restrictions',
        'The store ability has no effect on transfer behavior',
      ],
      correctAnswer: 2,
      explanation: 'Without store, public_transfer cannot be used, so the only way to transfer the NFT is through functions defined in the module that declares the struct. This lets the module author enforce royalties, allowlists, cooldowns, or any other custom logic on every transfer.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Consider the relationship between store and public_transfer. No store means no permissionless transfers — the module controls every movement of the object.',
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
      explanation: 'Receiving<T> is a ticket that appears in transaction inputs when an object has been transferred to another object (not an address). The parent object\'s owner calls transfer::receive (or public_receive) with a mutable reference to the parent\'s UID and the Receiving ticket to claim the child object by value.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Object-to-object transfers use Receiving<T> as a claim ticket. The parent needs &mut UID to prove ownership when calling receive.',
    },
    {
      question: 'When wrapping an object inside another struct, what happens to the inner object?',
      options: [
        'It remains independently accessible in the global object pool',
        'It is deleted permanently and cannot be recovered',
        'It disappears from the global object pool and becomes part of the wrapper — inaccessible until the wrapper is unpacked',
        'It becomes an immutable object automatically',
      ],
      correctAnswer: 2,
      explanation: 'When an object is wrapped (stored as a field in another struct), it loses its independent existence in the global object pool. It cannot be accessed directly — only through the wrapper. When the wrapper is destructured, the inner object reappears and must be handled.',
      weaknessTopic: 'ownership-transfer',
      practiceHint: 'Wrapping effectively hides an object from the world. It is the basis for escrow, staking, and locking patterns.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module ownership_practice::transfer_patterns {
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // TODO 1: Define a struct 'Artifact' with key and store abilities
    // Fields: id (UID), name (vector<u8>), power (u64)

    // TODO 2: Define a struct 'SoulboundBadge' with key ability ONLY (no store)
    // Fields: id (UID), title (vector<u8>), owner (address)

    // TODO 3: Define a struct 'GlobalRegistry' with key ability
    // Fields: id (UID), total_artifacts (u64)

    // TODO 4: Write an init function that:
    //   - Creates a GlobalRegistry with total_artifacts = 0
    //   - Shares the GlobalRegistry using transfer::share_object

    // TODO 5: Write a public function 'mint_artifact' that:
    //   - Takes registry (&mut GlobalRegistry), name (vector<u8>),
    //     recipient (address), and ctx (&mut TxContext)
    //   - Creates a new Artifact with the given name and power = 100
    //   - Increments registry.total_artifacts
    //   - Uses transfer::public_transfer to send the Artifact to recipient

    // TODO 6: Write a public function 'mint_soulbound_badge' that:
    //   - Takes title (vector<u8>) and ctx (&mut TxContext)
    //   - Creates a SoulboundBadge with the sender's address as owner
    //   - Uses transfer::transfer (NOT public_transfer) to send it to the sender

    // TODO 7: Write a public function 'freeze_artifact' that:
    //   - Takes an Artifact by value
    //   - Freezes it using transfer::public_freeze_object
    //   - (Once frozen, the artifact becomes an immutable reference anyone can read)

    // TODO 8: Write a public function 'transfer_soulbound_with_approval' that:
    //   - Takes badge (SoulboundBadge), new_owner (address), and ctx (&mut TxContext)
    //   - Asserts that the sender is the current badge.owner
    //   - Updates badge.owner to new_owner
    //   - Uses transfer::transfer to send it to new_owner
    //   - (This is a custom transfer policy — only the current owner can transfer)
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
    "Start with the struct definitions. Artifact needs 'has key, store' so it can be publicly transferred. SoulboundBadge needs only 'has key' to restrict transfers to the defining module. GlobalRegistry needs 'has key' since it will be shared.",
    "In the init function, create the GlobalRegistry with object::new(ctx) for the UID and 0 for total_artifacts. Then call transfer::share_object(registry) to make it shared. Remember: init takes only &mut TxContext.",
    "For mint_artifact, use transfer::public_transfer because Artifact has store. For mint_soulbound_badge, use transfer::transfer because SoulboundBadge does NOT have store. Get the sender address with tx_context::sender(ctx).",
    "For the custom transfer policy in transfer_soulbound_with_approval, use assert!(badge.owner == tx_context::sender(ctx), 0) to verify the caller is the current owner. Update badge.owner before calling transfer::transfer.",
  ],
};
