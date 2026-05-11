import { LessonContent } from '@/app/types/lesson';

export const moveLesson5: LessonContent = {
  id: 'move-5',
  title: 'Collections & Dynamic Fields',
  description: 'Time to learn how to manage groups of data in Sui Move — lists, key-value maps, and fields you can add on the fly. No prior experience with data structures needed — we\'ll explain everything from scratch.',
  difficulty: 'intermediate',
  xpReward: 300,
  order: 5,
  language: 'move',
  prerequisiteLessons: ['move-4'],

  narrative: {
    welcomeMessage: "Hey! So far you've been working with individual pieces of data — a single number here, a string there. But real apps need to manage *groups* of things: a player's inventory, a list of members, a leaderboard of scores. That's exactly what this lesson is about. We'll start with the simplest collection (a list called a vector), then level up to more powerful tools like Tables and dynamic fields. Don't worry — we'll take it step by step and explain every concept with real-world analogies.",
    quizTransition: "Nice work! You've explored vectors, Tables, dynamic fields, and dynamic object fields. Let's do a quick quiz to make sure the key ideas stuck...",
    practiceTransition: "Great quiz results! Now let's put all of this together by building a real on-chain inventory system. You'll use dynamic fields and vectors — the exact tools you just learned about.",
    celebrationMessage: "You did it! You can now use vectors, Tables, and dynamic fields to build complex on-chain data structures. That's a seriously powerful toolkit — most real Sui apps are built on exactly these patterns.",
    nextLessonTease: "Next up: Ownership & Transfer Patterns. You'll dive deeper into how objects move between addresses, how to wrap and unwrap objects, and advanced transfer policies.",
  },

  teachingSections: [
    {
      sectionTitle: 'Vectors: Your First Collection Type',
      slides: [
        {
          title: 'Introduction to Vectors',
          emoji: '📚',
          content: "A vector is just a list — like a shopping list or a playlist. You can add items, remove items, and check what's in it. In Move, a vector is written as `vector<T>` where T is the type of thing in the list. So `vector<u64>` is a list of numbers, and `vector<String>` is a list of text.\n\nHere's the thing: vectors live inside your objects — they're not standalone things on the blockchain. They're perfect for small, bounded collections, like a list of tags (maybe 5-10 items), a set of high scores (top 10), or a short list of wallet addresses.\n\nThe `vector` module from the standard library gives you all the tools you need to create lists, add items, remove items, peek at items, and search through them. Let's see it in action:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::inventory {\n    use std::vector;\n\n    /// Create an empty vector and add elements\n    public fun demo_vector(): vector<u64> {\n        let mut v = vector::empty<u64>();\n\n        vector::push_back(&mut v, 10);\n        vector::push_back(&mut v, 20);\n        vector::push_back(&mut v, 30);\n\n        let length = vector::length(&v);  // 3\n\n        let first = *vector::borrow(&v, 0);  // 10\n        let last = vector::pop_back(&mut v); // 30\n\n        v  // returns [10, 20]\n    }\n}`,
              highlights: [
                { line: 6, explanation: "vector::empty<T>() creates a brand new empty list. The 'mut' keyword makes it mutable (changeable) — without mut, you couldn't add items to it." },
                { line: 8, explanation: "push_back is like appending to a list — it adds the item to the end. Think of it like adding a song to the end of your playlist." },
                { line: 12, explanation: "length tells you how many items are in the list. It just peeks (immutable reference) — it doesn't change anything." },
                { line: 14, explanation: "borrow lets you look at an item at a specific position without removing it. The * at the front copies the value out. Position 0 is the first item." },
                { line: 15, explanation: "pop_back removes the last item from the list and gives it back to you. Like taking the last book off a stack." },
              ],
            },
          },
        },
        {
          title: 'Vector Operations: Your List Toolbox',
          emoji: '🔧',
          content: "Here's your toolbox for working with lists — push to add, pop to remove from the end, borrow to peek at an item. Let's go through every operation you'll use:\n\n- `vector::empty<T>()` -- Create a brand new empty list\n- `vector::push_back(&mut v, elem)` -- Add an item to the end of the list\n- `vector::pop_back(&mut v)` -- Remove and return the last item\n- `vector::length(&v)` -- How many items are in the list?\n- `vector::borrow(&v, index)` -- Peek at the item at position `index` (read-only)\n- `vector::borrow_mut(&mut v, index)` -- Get a mutable reference to change the item at position `index`\n- `vector::contains(&v, &elem)` -- Is this item in the list? (returns true/false)\n- `vector::index_of(&v, &elem)` -- Where is this item? (returns (found: bool, position: u64))\n- `vector::remove(&mut v, index)` -- Remove at position, sliding everything after it left (keeps order)\n- `vector::swap_remove(&mut v, index)` -- Remove by swapping with the last item, then popping (faster but scrambles order)\n\nHere's a common beginner question: \"When should I use `remove` vs `swap_remove`?\" Use `remove` when the order of your list matters (like a leaderboard). Use `swap_remove` when it doesn't (like a bag of items) — it's much faster for large lists because it doesn't need to shift everything around.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'remove', label: 'vector::remove', emoji: '✂' },
                { id: 'swap_remove', label: 'vector::swap_remove', emoji: '🔄' },
                { id: 'borrow', label: 'vector::borrow', emoji: '👁' },
                { id: 'borrow_mut', label: 'vector::borrow_mut', emoji: '✏' },
              ],
              targets: [
                { id: 'order-preserve', label: 'Remove element, preserve order (O(n))' },
                { id: 'order-break', label: 'Remove element, swap with last (O(1))' },
                { id: 'read-only', label: 'Get immutable reference to element' },
                { id: 'read-write', label: 'Get mutable reference to modify element' },
              ],
              correctPairs: [
                { itemId: 'remove', targetId: 'order-preserve' },
                { itemId: 'swap_remove', targetId: 'order-break' },
                { itemId: 'borrow', targetId: 'read-only' },
                { itemId: 'borrow_mut', targetId: 'read-write' },
              ],
            },
          },
        },
        {
          title: 'Vector Literals and Using Vectors in Structs',
          emoji: '💡',
          content: "Good news — Move gives you a shortcut for creating vectors with values already in them: just write `vector[1, 2, 3]`. No need to create an empty vector and push items one by one.\n\nYou can also put vectors inside your structs. For example, a Player object might have a `badges: vector<String>` field to track their achievements. When the struct is stored on-chain, the vector goes with it — it's all bundled together as one object.\n\nHere's a really important thing to keep in mind: because the vector lives inside the object, the *entire* vector gets loaded every time you access that object. For a list of 5 badges? No problem. For a list of 10,000 items? That's going to be slow and expensive. If your list might grow really large, you'll want to use a Table instead (we'll cover that next).\n\nA good rule of thumb: vectors are great for lists under ~100 items. Above that, reach for a Table.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::player {\n    use std::string::String;\n    use std::vector;\n\n    public struct Player has key, store {\n        id: UID,\n        name: String,\n        badges: vector<String>,   // Small bounded collection\n        scores: vector<u64>,\n    }\n\n    /// Using vector literal syntax\n    public fun create_defaults(): vector<u64> {\n        vector[100, 200, 300]\n    }\n\n    /// Searching in a vector\n    public fun has_badge(player: &Player, badge: &String): bool {\n        vector::contains(&player.badges, badge)\n    }\n\n    /// Remove a specific badge by value\n    public fun remove_badge(player: &mut Player, badge: &String) {\n        let (found, index) = vector::index_of(&player.badges, badge);\n        if (found) {\n            vector::remove(&mut player.badges, index);\n        };\n    }\n}`,
              highlights: [
                { line: 8, explanation: "Vectors inside structs get stored on-chain as part of the object. This is convenient, but keep them small — the whole vector loads every time you touch the object." },
                { line: 14, explanation: "vector[100, 200, 300] is the shortcut syntax. It's the same as creating an empty vector and pushing three items, just cleaner." },
                { line: 19, explanation: "vector::contains checks if an item exists in the list. It takes references to both the vector and the item you're looking for." },
                { line: 24, explanation: "index_of returns a tuple (bool, u64): whether the item was found, and where it is. Always check the bool before using the index!" },
                { line: 26, explanation: "vector::remove slides everything after the removed item left by one. If order doesn't matter, swap_remove would be faster here." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-005a',
    },
    {
      sectionTitle: 'Table and ObjectTable: Scaling Up',
      slides: [
        {
          title: 'Table: Your Filing Cabinet for Large Collections',
          emoji: '🗂',
          content: "When your list gets huge — thousands of items — a vector gets slow because it loads everything at once. A Table is like a filing cabinet: you only pull out the folder you need.\n\nMore precisely, `Table<K, V>` from the `sui::table` module is a key-value store. You look things up by key (like an address or a name) and get back the associated value. Under the hood, each entry is stored separately on the blockchain, so accessing one entry doesn't load all the others.\n\nA few things to know about Table keys and values:\n- Keys must have `copy + drop + store` abilities (common types like `address`, `u64`, and `String` all work)\n- Values must have the `store` ability\n- Tables themselves have `key + store`, so they can live inside other objects\n\nUse a Table when you need a map-like structure that could grow to hundreds or thousands of entries — like a registry of usernames, a token balance ledger, or a list of game scores.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::registry {\n    use sui::table::{Self, Table};\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    public struct Registry has key {\n        id: UID,\n        /// Maps user address to username\n        users: Table<address, String>,\n    }\n\n    public fun create_registry(ctx: &mut TxContext): Registry {\n        Registry {\n            id: object::new(ctx),\n            users: table::new<address, String>(ctx),\n        }\n    }\n\n    public fun register(reg: &mut Registry, addr: address, name: String) {\n        table::add(&mut reg.users, addr, name);\n    }\n\n    public fun lookup(reg: &Registry, addr: address): &String {\n        table::borrow(&reg.users, addr)\n    }\n\n    public fun is_registered(reg: &Registry, addr: address): bool {\n        table::contains(&reg.users, addr)\n    }\n}`,
              highlights: [
                { line: 10, explanation: "Table<address, String> maps wallet addresses to usernames. Think of it like a phone book: look up someone's address, get their name." },
                { line: 16, explanation: "table::new creates a new empty Table. It needs TxContext because a Table uses a UID internally — it's actually a Sui object under the hood." },
                { line: 21, explanation: "table::add inserts a key-value pair. Watch out: it will crash (abort) if the key already exists! Always check with contains first if you're not sure." },
                { line: 25, explanation: "table::borrow returns a read-only reference to the value. It also aborts if the key doesn't exist — so check with contains first." },
                { line: 29, explanation: "table::contains is your safety check — it returns true/false without crashing. Always use this before borrow if you're not 100% sure the key is there." },
              ],
            },
          },
        },
        {
          title: 'ObjectTable and the Full Table API',
          emoji: '📊',
          content: "Sui also has `ObjectTable<K, V>` — same as a Table, but the things you store stay visible to blockchain explorers. Think of it as a glass display case vs an opaque storage box. With a regular Table, stored items are hidden from the outside world. With an ObjectTable, they remain visible and queryable.\n\nThe catch: ObjectTable values must be Sui objects (they need `key + store` abilities). Regular Table values just need `store`.\n\nBoth Table and ObjectTable share the exact same API:\n\n- `table::new(ctx)` / `object_table::new(ctx)` -- Create an empty collection\n- `table::add(&mut t, key, value)` -- Insert a pair (crashes if key already exists!)\n- `table::borrow(&t, key)` -- Peek at the value (read-only)\n- `table::borrow_mut(&mut t, key)` -- Get a mutable reference to change the value\n- `table::remove(&mut t, key)` -- Remove and return the value\n- `table::contains(&t, key)` -- Does this key exist? (safe check)\n- `table::length(&t)` -- How many entries?\n- `table::is_empty(&t)` -- Any entries at all?\n\nSo when do you pick which? Use ObjectTable when you want stored objects to show up in block explorers (like NFTs in a marketplace). Use Table when you want entries to be private, or when your values aren't Sui objects.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Table vs ObjectTable', content: 'Table<K,V> stores any value with the store ability — numbers, strings, structs, whatever. ObjectTable<K,V> requires values to have key+store (meaning they\'re full Sui objects). The big difference: ObjectTable entries stay visible to explorers and indexers, while Table entries are hidden away.' },
                { label: 'Table vs vector', content: 'Think of it this way: a vector is like a notebook — you have to flip through the whole thing every time. A Table is like a filing cabinet — you go straight to the drawer you need. Vectors load entirely into memory on every access. Tables load only the entry you asked for. Use vectors for small lists (<100 items) and Tables for large or unbounded collections.' },
                { label: 'Table key requirements', content: 'Table keys must have copy + drop + store abilities. The common types all work: address, u64, u128, String, ID. You can even use custom structs as keys, as long as they have all three abilities.' },
                { label: 'Destroying a Table', content: 'You can\'t just throw away a non-empty Table — that would be like losing data. You must remove all entries first with table::remove, then call table::destroy_empty. This safety check prevents accidental data loss.' },
              ],
            },
          },
        },
        {
          title: 'Choosing the Right Collection Type',
          emoji: '🤔',
          content: "Let's see — you now know about vectors, Tables, and ObjectTables. How do you decide which one to use? Here's a practical guide:\n\n**vector<T>** -- Your go-to for small, bounded lists. Like a player's top 10 scores, a list of badge names, or a short array of config values. Everything loads together, which is fine when the list is small. You can iterate through it on-chain.\n\n**Table<K, V>** -- Reach for this when your collection could grow large or you're not sure how big it'll get. It's a key-value map where you look things up by key. Only the entries you access cost gas. The downside: you can't iterate through all entries on-chain, and entries are hidden from explorers.\n\n**ObjectTable<K, V>** -- Same performance as Table, but the objects you store remain visible to explorers and indexers. Use this when discoverability matters — like a marketplace of NFTs or a registry of game characters.\n\n**Dynamic Fields** -- The most flexible option of all. We'll cover these next! They let you attach arbitrary data to any object at runtime. Tables are actually built on top of dynamic fields under the hood.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'vec', label: 'vector<T>', emoji: '📚' },
                { id: 'table', label: 'Table<K,V>', emoji: '🗂' },
                { id: 'otable', label: 'ObjectTable<K,V>', emoji: '📊' },
                { id: 'dfield', label: 'Dynamic Fields', emoji: '🔗' },
              ],
              targets: [
                { id: 'small', label: 'Small bounded list of scores or tags (< 100 items)' },
                { id: 'large-map', label: 'Large key-value map (1000+ entries, hidden from explorers)' },
                { id: 'obj-children', label: 'Map of child objects visible to block explorers' },
                { id: 'heterogeneous', label: 'Attach fields of different types to an object at runtime' },
              ],
              correctPairs: [
                { itemId: 'vec', targetId: 'small' },
                { itemId: 'table', targetId: 'large-map' },
                { itemId: 'otable', targetId: 'obj-children' },
                { itemId: 'dfield', targetId: 'heterogeneous' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-005b',
    },
    {
      sectionTitle: 'Dynamic Fields and Dynamic Object Fields',
      slides: [
        {
          title: 'Dynamic Fields: Adding Pockets to a Backpack',
          emoji: '🔗',
          content: "Imagine you could add new pockets to a backpack whenever you want. Dynamic fields let you attach new data to any object at any time — even after you've published your code.\n\nHere's why that's powerful: normally, when you define a struct, its fields are locked in at compile time. A `Character` has a `name` and `health` and that's it. But with dynamic fields, you can bolt on new fields later — a \"level\" field, an \"inventory\" field, a \"guild_name\" field — without changing the original struct definition.\n\nThe `sui::dynamic_field` module (usually imported as `field`) gives you these tools:\n\n- `field::add<Name, Value>(&mut obj_uid, name, value)` -- Attach a new field\n- `field::borrow<Name, Value>(&obj_uid, name)` -- Peek at the field value (read-only)\n- `field::borrow_mut<Name, Value>(&mut obj_uid, name)` -- Get a mutable reference to change it\n- `field::remove<Name, Value>(&mut obj_uid, name)` -- Remove the field and get the value back\n- `field::exists_<Name>(&obj_uid, name)` -- Does this field exist?\n\nThe Name type (the key) needs `copy + drop + store`. The Value type needs `store`. And every name must be unique on an object — trying to add a duplicate name will crash your transaction.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::extensible {\n    use sui::dynamic_field as field;\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    public struct Character has key {\n        id: UID,\n        name: String,\n    }\n\n    /// Add a dynamic 'level' field to a Character\n    public fun set_level(character: &mut Character, level: u64) {\n        if (field::exists_<String>(&character.id, string::utf8(b"level"))) {\n            let lvl = field::borrow_mut<String, u64>(\n                &mut character.id, string::utf8(b"level")\n            );\n            *lvl = level;\n        } else {\n            field::add<String, u64>(\n                &mut character.id, string::utf8(b"level"), level\n            );\n        };\n    }\n\n    /// Read the dynamic 'level' field\n    public fun get_level(character: &Character): u64 {\n        *field::borrow<String, u64>(\n            &character.id, string::utf8(b"level")\n        )\n    }\n\n    /// Remove the dynamic 'level' field\n    public fun remove_level(character: &mut Character): u64 {\n        field::remove<String, u64>(\n            &mut character.id, string::utf8(b"level")\n        )\n    }\n}`,
              highlights: [
                { line: 2, explanation: "We import dynamic_field as 'field' for convenience. This is the module that makes all the magic happen — adding, reading, and removing dynamic fields." },
                { line: 14, explanation: "Always check with field::exists_ before adding! If the field already exists, we update it with borrow_mut. If it doesn't, we add it fresh. Skipping this check is a common beginner mistake that causes crashes." },
                { line: 15, explanation: "field::borrow_mut gives you a mutable reference — meaning you can change the value in place with *lvl = level. No need to remove and re-add." },
                { line: 20, explanation: "field::add attaches a brand new field to the object. It will crash (abort) if a field with that name already exists — that's why we checked with exists_ first!" },
                { line: 35, explanation: "field::remove detaches the field and returns the value to you. After this, the field is gone — calling borrow on it would crash." },
              ],
            },
          },
        },
        {
          title: 'Dynamic Object Fields: Visible Attachments',
          emoji: '🏷',
          content: "Same idea as dynamic fields, but the objects you attach keep their identity — they're still findable and browsable, not hidden away.\n\nLet's unpack that. When you store an object using regular `dynamic_field`, the object gets \"wrapped\" — it disappears from block explorers and can't be found by its ID anymore. It's like putting something in a sealed box. With `dynamic_object_field` (imported as `ofield`), the attached object stays visible — like putting it in a glass display case.\n\nThe trade-off: dynamic_object_field values *must* be Sui objects (they need `key + store`). Regular dynamic fields can store any value with `store`.\n\nThe API is identical to dynamic_field:\n- `ofield::add<Name, Value>(&mut uid, name, value)` -- Attach a child object (stays visible)\n- `ofield::borrow<Name, Value>(&uid, name)` -- Peek at it (read-only)\n- `ofield::borrow_mut<Name, Value>(&mut uid, name)` -- Get a mutable reference\n- `ofield::remove<Name, Value>(&mut uid, name)` -- Detach and return the child object\n- `ofield::exists_<Name>(&uid, name)` -- Does this child exist?\n\nUse dynamic object fields when you want child objects to be discoverable — like NFTs inside a collection, or items in a marketplace listing.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'dynamic_field vs dynamic_object_field', content: 'Think of dynamic_field as putting something in an opaque box — it\'s there, but nobody outside can see it. dynamic_object_field is like a glass case — the object is still visible, queryable by its ID, and shows up in block explorers. Use ofield when discoverability matters.' },
                { label: 'When to use dynamic object fields', content: 'Whenever you need child objects to be independently findable. Real examples: NFTs inside a collection (users want to browse them), game items in a marketplace listing (explorers need to index them), or equipment attached to a character (wallets want to display them).' },
                { label: 'Name types for dynamic fields', content: 'The name (key) can be any type with copy+drop+store. Common choices: u64 for numeric IDs (like slot numbers), String for named fields (like "weapon" or "armor"), or custom structs for type-safe namespacing (more on this in a moment).' },
                { label: 'Heterogeneous storage', content: 'Here\'s something cool: unlike Table (where all keys and values must be the same types), dynamic fields let you attach fields of *different* value types to the same object. You could have a u64 field called "level" and a String field called "guild" on the same UID. That\'s the flexibility superpower.' },
              ],
            },
          },
        },
        {
          title: 'Building with Dynamic Fields: Real Patterns',
          emoji: '🏗',
          content: "Now that you understand the building blocks, let's see the patterns that real Sui developers use with dynamic fields:\n\n**Extension Pattern**: Ship a basic object now, then add new features later without rewriting your module. Published a Character with just a name? Add a \"level\" field in your next upgrade. Your users' existing Characters get the new field without migration.\n\n**Heterogeneous Map**: Store different types of data on the same object. A Table forces all values to be the same type — dynamic fields don't. Mix numbers, strings, and custom structs freely.\n\n**Namespace Pattern**: Use a custom struct as the Name type to prevent collisions. If two modules both try to add a field called \"level\" to the same object, they'd clash. But if each module uses its own struct type as the key, they can't interfere with each other.\n\n**Lazy Initialization**: Only attach fields when they're actually needed. Why create empty \"guild\" and \"inventory\" fields for every Character when most players might never use them? Add them on demand and save gas.\n\nFun fact: Tables are actually built on top of dynamic fields! When you call `table::add`, it internally calls `field::add`. Tables just give you a cleaner API for the common case of a uniform key-value map.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::equipment {\n    use sui::dynamic_object_field as ofield;\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    /// A namespace key to avoid collisions\n    public struct EquipSlot has copy, drop, store {\n        slot_name: String,\n    }\n\n    public struct Character has key {\n        id: UID,\n        name: String,\n    }\n\n    public struct Weapon has key, store {\n        id: UID,\n        damage: u64,\n    }\n\n    /// Equip a weapon to a named slot using dynamic object fields\n    public fun equip(\n        character: &mut Character,\n        slot: String,\n        weapon: Weapon,\n    ) {\n        let key = EquipSlot { slot_name: slot };\n        ofield::add(&mut character.id, key, weapon);\n    }\n\n    /// Unequip and return the weapon from a slot\n    public fun unequip(\n        character: &mut Character,\n        slot: String,\n    ): Weapon {\n        let key = EquipSlot { slot_name: slot };\n        ofield::remove<EquipSlot, Weapon>(&mut character.id, key)\n    }\n\n    /// Check if a slot has a weapon equipped\n    public fun has_equipped(\n        character: &Character,\n        slot: String,\n    ): bool {\n        let key = EquipSlot { slot_name: slot };\n        ofield::exists_<EquipSlot>(&character.id, key)\n    }\n}`,
              highlights: [
                { line: 8, explanation: "This is the Namespace Pattern in action! EquipSlot is a custom struct used as the field key. Only code that has access to EquipSlot can read or write these fields — no collisions with other modules." },
                { line: 17, explanation: "Weapon has key+store, which means it can be stored as a dynamic object field and stays visible in explorers. Users can browse equipped weapons!" },
                { line: 29, explanation: "ofield::add attaches the Weapon as a child of the Character. The weapon is now 'inside' the character but still discoverable by its own ID." },
                { line: 38, explanation: "ofield::remove detaches and returns the Weapon. It becomes an independent object again — you could transfer it to someone else or equip it elsewhere." },
                { line: 47, explanation: "ofield::exists_ is your safety check — always use it before trying to remove or borrow a field you're not sure about." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-005c',
    },
  ],

  quiz: [
    {
      question: 'Which function removes an element from a vector in O(1) time but does NOT preserve the order of the remaining elements?',
      options: [
        'vector::remove',
        'vector::pop_back',
        'vector::swap_remove',
        'vector::borrow_mut',
      ],
      correctAnswer: 2,
      explanation: "swap_remove is the speed trick: it swaps the element you want to remove with the last element, then pops off the end. That's instant (O(1)) because it doesn't need to shift anything. The trade-off? The remaining items might be in a different order than before. If order matters (like a leaderboard), use remove instead — it preserves order but is slower (O(n)) because it shifts everything left.",
      weaknessTopic: 'collections',
      practiceHint: "Think about which removal strategy swaps with the last element instead of shifting everything over.",
    },
    {
      question: 'Why should you use Table<K, V> instead of vector<V> for a large collection?',
      options: [
        'Table supports more element types than vector',
        'Table entries are loaded individually, so only accessed entries cost gas',
        'Table provides faster iteration than vector',
        'Table is the only collection type that supports removal',
      ],
      correctAnswer: 1,
      explanation: "Here's the key insight: a vector is like a notebook — every time you open the object, you flip through the entire notebook even if you only need one page. A Table is like a filing cabinet — you pull out just the folder you need. Each Table entry is stored separately on the blockchain, so you only pay gas for the entries you actually touch. For a collection with thousands of items, this difference is huge.",
      weaknessTopic: 'collections',
      practiceHint: "Think about what happens when you access the parent object. Does the entire collection load into memory, or just the entry you need?",
    },
    {
      question: 'What is the key difference between dynamic_field and dynamic_object_field?',
      options: [
        'dynamic_field is faster; dynamic_object_field is slower',
        'dynamic_field only works with primitive types; dynamic_object_field works with structs',
        'dynamic_object_field keeps child objects visible to explorers; dynamic_field wraps them and hides them',
        'dynamic_field requires a TxContext; dynamic_object_field does not',
      ],
      correctAnswer: 2,
      explanation: "It all comes down to visibility. dynamic_object_field is like a glass display case — the objects you attach keep their on-chain identity, show up in block explorers, and can be found by their ID. dynamic_field is like an opaque box — the values are there but hidden from the outside world. Use dynamic_object_field when you want users (or apps) to be able to browse the attached objects.",
      weaknessTopic: 'collections',
      practiceHint: "Think about what happens to an object's visibility when you store it. Can external tools still see it?",
    },
    {
      question: 'What happens if you call field::add with a name that already exists on the object?',
      options: [
        'The existing value is silently overwritten with the new value',
        'The transaction aborts with an error',
        'A second field with the same name is created',
        'The new value is appended to a vector at that name',
      ],
      correctAnswer: 1,
      explanation: "This is a common gotcha! field::add will crash (abort the transaction) if a field with that name already exists. It won't silently overwrite — Move is strict about this to prevent accidental data loss. To update an existing field, use field::borrow_mut to get a mutable reference and change it in place. Or use field::remove first, then field::add with the new value.",
      weaknessTopic: 'collections',
      practiceHint: "Dynamic field names must be unique per object. Think about what Move does when you break this rule — does it silently fix things, or does it stop you?",
    },
    {
      question: 'Which collection type should you use to store a small list of up to 10 badge names on a player object?',
      options: [
        'Table<u64, String> because it scales better',
        'dynamic_object_field for each badge',
        'vector<String> because it is simple and efficient for small bounded lists',
        'ObjectTable<u64, String> for explorer visibility',
      ],
      correctAnswer: 2,
      explanation: "For a small list like 10 badge names, vector<String> is the clear winner. It's simple, efficient, and you can iterate through it on-chain. Table and dynamic fields add overhead (each entry creates a separate on-chain record) that just isn't worth it for a tiny list. Also, String doesn't have the `key` ability, so ObjectTable wouldn't even work here — it requires values to be full Sui objects.",
      weaknessTopic: 'collections',
      practiceHint: "For a small, bounded list, which option gives you the least overhead and the simplest code?",
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module lesson5::inventory {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::dynamic_field as field;
    use std::string::{Self, String};
    use std::vector;

    // TODO 1: Define a struct called 'Item' with the ability 'store'.
    //         This struct will NOT be a standalone on-chain object — it will
    //         live inside an Inventory as a dynamic field.
    //
    //         It needs two fields:
    //           - name: String     (the item's name, like "Sword" or "Potion")
    //           - quantity: u64    (how many of this item we have)
    //
    //         Hint: public struct Item has store { ... }
    //         Note: No 'key' ability needed — Items aren't independent objects.


    // TODO 2: Define a struct called 'Inventory' as a Sui object.
    //         This IS a standalone on-chain object, so it needs 'key'.
    //
    //         It needs two fields:
    //           - id: UID                    (every Sui object needs this as the first field)
    //           - item_names: vector<String>  (a list to track which item names we've added)
    //
    //         Hint: public struct Inventory has key { ... }
    //         Why item_names? Dynamic fields don't give you a way to list all
    //         field names, so we keep our own list!


    // TODO 3: Write a public entry function called 'create_inventory' that:
    //         Step 1: Takes ctx: &mut TxContext as its only parameter
    //         Step 2: Creates a new Inventory with:
    //                 - id: object::new(ctx)             -- gives it a unique blockchain ID
    //                 - item_names: vector::empty<String>() -- starts with no items
    //         Step 3: Transfers it to the sender using:
    //                 transfer::transfer(inventory, tx_context::sender(ctx))
    //
    //         Hint: public entry fun create_inventory(ctx: &mut TxContext) { ... }


    // TODO 4: Write a public entry function called 'add_item' that:
    //         Step 1: Takes three parameters:
    //                 - inventory: &mut Inventory  (the inventory to add to)
    //                 - name: String               (the item name)
    //                 - quantity: u64              (how many)
    //         Step 2: Create an Item struct with the name and quantity
    //                 - Use 'copy name' for the Item's name field (we need the
    //                   original name later for the dynamic field key)
    //         Step 3: Push a copy of the name to the item_names vector:
    //                 vector::push_back(&mut inventory.item_names, copy name)
    //         Step 4: Add the Item as a dynamic field on the inventory:
    //                 field::add(&mut inventory.id, name, item)
    //                 The name is the key, and the item is the value.
    //
    //         Hint: You need 'copy name' because String has the copy ability,
    //               and we use the name in multiple places.


    // TODO 5: Write a public fun (not entry) called 'get_item_quantity' that:
    //         Step 1: Takes two parameters:
    //                 - inventory: &Inventory  (read-only reference)
    //                 - name: String           (which item to look up)
    //         Step 2: Returns u64 (the quantity)
    //         Step 3: Use field::borrow to get a reference to the Item:
    //                 let item = field::borrow<String, Item>(&inventory.id, name)
    //         Step 4: Return item.quantity
    //
    //         Hint: field::borrow<String, Item> tells Move "the key is a String
    //               and the value is an Item."

}`,

  solution: `module lesson5::inventory {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::dynamic_field as field;
    use std::string::{Self, String};
    use std::vector;

    // TODO 1: Define a struct 'Item' with abilities 'store'
    public struct Item has store {
        name: String,
        quantity: u64,
    }

    // TODO 2: Define a struct 'Inventory' as a Sui object
    public struct Inventory has key {
        id: UID,
        item_names: vector<String>,
    }

    // TODO 3: Write a public entry function 'create_inventory'
    public entry fun create_inventory(ctx: &mut TxContext) {
        let inventory = Inventory {
            id: object::new(ctx),
            item_names: vector::empty<String>(),
        };
        transfer::transfer(inventory, tx_context::sender(ctx));
    }

    // TODO 4: Write a public entry function 'add_item'
    public entry fun add_item(
        inventory: &mut Inventory,
        name: String,
        quantity: u64,
    ) {
        let item = Item {
            name: copy name,
            quantity,
        };
        vector::push_back(&mut inventory.item_names, copy name);
        field::add(&mut inventory.id, name, item);
    }

    // TODO 5: Write a public fun 'get_item_quantity'
    public fun get_item_quantity(inventory: &Inventory, name: String): u64 {
        let item = field::borrow<String, Item>(&inventory.id, name);
        item.quantity
    }
}`,

  hints: [
    "Item needs only the 'store' ability — no 'key'. Why? Because it won't be a standalone object on the blockchain. It's going to live inside an Inventory as a dynamic field. Think of it as a thing that goes inside a container, not the container itself.",
    "Inventory needs the 'key' ability and must have 'id: UID' as its very first field — that's how Sui knows it's a real on-chain object. The item_names vector is our personal index: since dynamic fields don't let you list all their keys, we keep track ourselves.",
    "For create_inventory: use transfer::transfer (not public_transfer) because Inventory has 'key' but not 'store'. Create the empty names list with vector::empty<String>(). Don't forget to send it to the sender!",
    "For add_item: you need 'copy name' because you use the name string in three places — the Item struct, the vector push, and the field::add key. For get_item_quantity: use field::borrow<String, Item> to tell Move what types the key and value are, then just return item.quantity.",
  ],
};
