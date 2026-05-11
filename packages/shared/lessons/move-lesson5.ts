import { LessonContent } from '../types/lesson';

export const moveLesson5: LessonContent = {
  id: 'move-5',
  title: 'Collections & Dynamic Fields',
  description: 'Learn how to manage groups of data in Sui Move using vectors, Tables, ObjectTables, dynamic fields, and dynamic object fields. Understand when to use each collection type for efficient on-chain storage.',
  difficulty: 'intermediate',
  xpReward: 300,
  order: 5,
  language: 'move',
  prerequisiteLessons: ['move-4'],

  narrative: {
    welcomeMessage: "Real applications need to store collections of data -- inventories, member lists, configuration maps, and more. Sui Move offers several powerful collection primitives, each with different trade-offs. In this lesson you will master vectors for ordered sequences, Tables for key-value mappings, and dynamic fields for extensible objects.",
    quizTransition: "You have explored vectors, Tables, dynamic fields, and dynamic object fields. Time to test your knowledge with a quiz...",
    practiceTransition: "Excellent quiz results! Now let's put these collection types to work by building a real on-chain inventory system.",
    celebrationMessage: "Fantastic work! You can now use vectors, Tables, and dynamic fields to build complex on-chain data structures. Your Sui Move toolkit is growing rapidly!",
    nextLessonTease: "Next up: Ownership & Transfer Patterns. You will dive deeper into how objects move between addresses, how to wrap and unwrap objects, and advanced transfer policies.",
  },

  teachingSections: [
    {
      sectionTitle: 'Vectors: Ordered Sequences',
      slides: [
        {
          title: 'Introduction to Vectors',
          emoji: '📚',
          content: "A vector is Move's built-in generic collection type for storing an ordered sequence of elements of the same type. Vectors are denoted as `vector<T>` where T is any type with the appropriate abilities.\n\nVectors live in memory or inside structs -- they are not standalone on-chain objects. They are ideal for small, bounded collections like a list of tags, a set of scores, or an array of addresses.\n\nThe `vector` module from the standard library provides all the operations you need: creating, pushing, popping, borrowing, searching, and removing elements.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::inventory {\n    use std::vector;\n\n    /// Create an empty vector and add elements\n    public fun demo_vector(): vector<u64> {\n        let mut v = vector::empty<u64>();\n\n        vector::push_back(&mut v, 10);\n        vector::push_back(&mut v, 20);\n        vector::push_back(&mut v, 30);\n\n        let length = vector::length(&v);  // 3\n\n        let first = *vector::borrow(&v, 0);  // 10\n        let last = vector::pop_back(&mut v); // 30\n\n        v  // returns [10, 20]\n    }\n}`,
              highlights: [
                { line: 6, explanation: "vector::empty<T>() creates a new empty vector. The 'mut' keyword makes it mutable so we can push elements." },
                { line: 8, explanation: "push_back appends an element to the end. It takes a mutable reference to the vector." },
                { line: 12, explanation: "length returns the number of elements. It takes an immutable reference." },
                { line: 14, explanation: "borrow returns an immutable reference to the element at the given index. Dereference with * to copy." },
                { line: 15, explanation: "pop_back removes and returns the last element. The vector must be mutable." },
              ],
            },
          },
        },
        {
          title: 'Vector Operations Deep Dive',
          emoji: '🔧',
          content: "The vector module provides a rich set of operations:\n\n- `vector::empty<T>()` -- Create an empty vector\n- `vector::push_back(&mut v, elem)` -- Append to end\n- `vector::pop_back(&mut v)` -- Remove and return last element\n- `vector::length(&v)` -- Get the number of elements\n- `vector::borrow(&v, index)` -- Immutable reference to element at index\n- `vector::borrow_mut(&mut v, index)` -- Mutable reference to element at index\n- `vector::contains(&v, &elem)` -- Check if element exists\n- `vector::index_of(&v, &elem)` -- Find index of element (returns (bool, u64))\n- `vector::remove(&mut v, index)` -- Remove at index, shifting remaining elements left\n- `vector::swap_remove(&mut v, index)` -- Remove at index by swapping with last element (O(1) but changes order)\n\nUse `remove` when order matters and `swap_remove` when it does not (swap_remove is much cheaper for large vectors).",
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
          title: 'Vector Literals and Convenience Syntax',
          emoji: '💡',
          content: "Move provides a convenient literal syntax for creating vectors with initial values: `vector[1, 2, 3]`. This is equivalent to creating an empty vector and pushing each element.\n\nYou can also create a vector with a single element using `vector::singleton(elem)`.\n\nVectors can be used in struct fields. For example, a Player struct might contain a `badges: vector<String>` field. When the struct has the `store` ability, vectors inside it are stored on-chain as part of the object.\n\nImportant caveat: vectors are stored entirely in a single object. If a vector grows very large (thousands of entries), accessing and modifying the parent object becomes expensive. For large collections, use Table or dynamic fields instead.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::player {\n    use std::string::String;\n    use std::vector;\n\n    public struct Player has key, store {\n        id: UID,\n        name: String,\n        badges: vector<String>,   // Small bounded collection\n        scores: vector<u64>,\n    }\n\n    /// Using vector literal syntax\n    public fun create_defaults(): vector<u64> {\n        vector[100, 200, 300]\n    }\n\n    /// Searching in a vector\n    public fun has_badge(player: &Player, badge: &String): bool {\n        vector::contains(&player.badges, badge)\n    }\n\n    /// Remove a specific badge by value\n    public fun remove_badge(player: &mut Player, badge: &String) {\n        let (found, index) = vector::index_of(&player.badges, badge);\n        if (found) {\n            vector::remove(&mut player.badges, index);\n        };\n    }\n}`,
              highlights: [
                { line: 8, explanation: "Vectors in struct fields are stored on-chain as part of the object. Keep them small and bounded." },
                { line: 14, explanation: "vector[100, 200, 300] is syntactic sugar for creating and populating a vector in one expression." },
                { line: 19, explanation: "vector::contains checks if an element exists. It takes references to both the vector and the element." },
                { line: 24, explanation: "index_of returns a tuple (bool, u64): whether the element was found and its index." },
                { line: 26, explanation: "vector::remove shifts all elements after the index left by one. Use swap_remove for O(1) if order doesn't matter." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-005a',
    },
    {
      sectionTitle: 'Table and ObjectTable',
      slides: [
        {
          title: 'Table: Efficient Key-Value Storage',
          emoji: '🗂',
          content: "When your collection can grow to an unbounded or very large size, vectors become impractical because the entire vector must be loaded into memory for every access. Sui provides `Table<K, V>` from the `sui::table` module as a scalable key-value store.\n\nA Table is itself a Sui object (it has a UID internally). Each entry is stored as a separate dynamic field on that object, meaning only the accessed entries are loaded during a transaction -- not the entire collection.\n\nTable keys must have `copy + drop + store` abilities. Table values must have `store`. Tables themselves have `key + store`, so they can be top-level objects or nested inside other objects.\n\nUse Table when you need a map-like structure with potentially many entries (hundreds or thousands).",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::registry {\n    use sui::table::{Self, Table};\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    public struct Registry has key {\n        id: UID,\n        /// Maps user address to username\n        users: Table<address, String>,\n    }\n\n    public fun create_registry(ctx: &mut TxContext): Registry {\n        Registry {\n            id: object::new(ctx),\n            users: table::new<address, String>(ctx),\n        }\n    }\n\n    public fun register(reg: &mut Registry, addr: address, name: String) {\n        table::add(&mut reg.users, addr, name);\n    }\n\n    public fun lookup(reg: &Registry, addr: address): &String {\n        table::borrow(&reg.users, addr)\n    }\n\n    public fun is_registered(reg: &Registry, addr: address): bool {\n        table::contains(&reg.users, addr)\n    }\n}`,
              highlights: [
                { line: 10, explanation: "Table<address, String> maps addresses to usernames. Keys need copy+drop+store; values need store." },
                { line: 16, explanation: "table::new creates a new empty Table. It needs TxContext because Table uses a UID internally." },
                { line: 21, explanation: "table::add inserts a key-value pair. Aborts if the key already exists -- check with contains first." },
                { line: 25, explanation: "table::borrow returns an immutable reference to the value. Aborts if the key is not present." },
                { line: 29, explanation: "table::contains checks if a key exists without aborting. Always use this before borrow if unsure." },
              ],
            },
          },
        },
        {
          title: 'ObjectTable and Table Operations',
          emoji: '📊',
          content: "Sui also provides `ObjectTable<K, V>` where the values must be Sui objects (have the `key + store` abilities). ObjectTable makes child objects visible to Sui explorers and indexers, whereas regular Table entries are hidden.\n\nBoth Table and ObjectTable share the same API:\n\n- `table::new(ctx)` / `object_table::new(ctx)` -- Create empty collection\n- `table::add(&mut t, key, value)` -- Insert a key-value pair (aborts if key exists)\n- `table::borrow(&t, key)` -- Immutable reference to value\n- `table::borrow_mut(&mut t, key)` -- Mutable reference to value\n- `table::remove(&mut t, key)` -- Remove and return the value\n- `table::contains(&t, key)` -- Check if key exists\n- `table::length(&t)` -- Number of entries\n- `table::is_empty(&t)` -- Check if table is empty\n\nUse ObjectTable when you want child objects to be discoverable on-chain. Use Table for non-object values or when you want entries to be private.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Table vs ObjectTable', content: 'Table<K,V> stores any value with store ability. ObjectTable<K,V> requires values to have key+store (be Sui objects). ObjectTable entries are visible to explorers; Table entries are hidden.' },
                { label: 'Table vs vector', content: 'Vectors load entirely into memory on every access. Tables load only the accessed entry. Use vectors for small bounded lists (<100 items) and Tables for large or unbounded collections.' },
                { label: 'Table key requirements', content: 'Table keys must have copy + drop + store. Common key types: address, u64, u128, String, ID. Custom structs work too if they have all three abilities.' },
                { label: 'Destroying a Table', content: 'A non-empty Table cannot be destroyed. You must remove all entries first with table::remove, then call table::destroy_empty. This prevents accidental data loss.' },
              ],
            },
          },
        },
        {
          title: 'Choosing Between Collection Types',
          emoji: '🤔',
          content: "Sui Move offers several collection types. Choosing the right one depends on your use case:\n\n**vector<T>** -- Best for small, bounded, ordered sequences. All elements are loaded together. Cheap to iterate. Expensive if the list is large.\n\n**Table<K, V>** -- Best for large or unbounded key-value maps. Only accessed entries are loaded. Cannot be iterated on-chain (no for-each). Entries are not visible to explorers.\n\n**ObjectTable<K, V>** -- Same as Table but values must be Sui objects. Entries are visible to explorers and indexers. Use when you want child objects to be discoverable.\n\n**Dynamic Fields** -- The most flexible option. Attach arbitrary typed fields to any Sui object at runtime. Tables are actually built on top of dynamic fields. Use dynamic fields directly when you need maximum control or heterogeneous fields.",
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
          title: 'Dynamic Fields: Extensible Objects',
          emoji: '🔗',
          content: "Dynamic fields let you attach arbitrary key-value pairs to any Sui object at runtime, even after the module is published. Unlike struct fields that are fixed at compile time, dynamic fields can be added and removed dynamically.\n\nThe `sui::dynamic_field` module provides the API:\n\n- `field::add<Name, Value>(&mut obj_uid, name, value)` -- Attach a new field\n- `field::borrow<Name, Value>(&obj_uid, name)` -- Immutable reference to the field value\n- `field::borrow_mut<Name, Value>(&mut obj_uid, name)` -- Mutable reference to the field value\n- `field::remove<Name, Value>(&mut obj_uid, name)` -- Remove and return the field value\n- `field::exists_<Name>(&obj_uid, name)` -- Check if a field with the given name exists\n\nThe Name type must have `copy + drop + store`. The Value type must have `store`. Each name is unique per object -- adding a duplicate name aborts.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::extensible {\n    use sui::dynamic_field as field;\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    public struct Character has key {\n        id: UID,\n        name: String,\n    }\n\n    /// Add a dynamic 'level' field to a Character\n    public fun set_level(character: &mut Character, level: u64) {\n        if (field::exists_<String>(&character.id, string::utf8(b"level"))) {\n            let lvl = field::borrow_mut<String, u64>(\n                &mut character.id, string::utf8(b"level")\n            );\n            *lvl = level;\n        } else {\n            field::add<String, u64>(\n                &mut character.id, string::utf8(b"level"), level\n            );\n        };\n    }\n\n    /// Read the dynamic 'level' field\n    public fun get_level(character: &Character): u64 {\n        *field::borrow<String, u64>(\n            &character.id, string::utf8(b"level")\n        )\n    }\n\n    /// Remove the dynamic 'level' field\n    public fun remove_level(character: &mut Character): u64 {\n        field::remove<String, u64>(\n            &mut character.id, string::utf8(b"level")\n        )\n    }\n}`,
              highlights: [
                { line: 2, explanation: "Import dynamic_field as 'field' for convenience. All dynamic field operations go through this module." },
                { line: 14, explanation: "field::exists_ checks whether a field with the given name (type Name) already exists on the object." },
                { line: 15, explanation: "field::borrow_mut returns a mutable reference to the value, letting you modify it in place." },
                { line: 20, explanation: "field::add attaches a new field. It aborts if a field with that name already exists -- always check with exists_ first." },
                { line: 35, explanation: "field::remove detaches the field and returns the value. The field no longer exists on the object afterward." },
              ],
            },
          },
        },
        {
          title: 'Dynamic Object Fields',
          emoji: '🏷',
          content: "Dynamic object fields are a variant of dynamic fields where the value must be a Sui object (has `key + store`). They use the `sui::dynamic_object_field` module.\n\nThe key difference: objects stored as dynamic object fields remain accessible to Sui's object runtime, block explorers, and indexers. Objects stored as regular dynamic fields are wrapped and become invisible to the outside world.\n\nThe API mirrors dynamic_field:\n- `ofield::add<Name, Value>(&mut uid, name, value)` -- Attach a child object\n- `ofield::borrow<Name, Value>(&uid, name)` -- Immutable reference\n- `ofield::borrow_mut<Name, Value>(&mut uid, name)` -- Mutable reference\n- `ofield::remove<Name, Value>(&mut uid, name)` -- Detach and return the child object\n- `ofield::exists_<Name>(&uid, name)` -- Check existence\n\nUse dynamic object fields when you want child objects to be discoverable and independently queryable on-chain.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'dynamic_field vs dynamic_object_field', content: 'dynamic_field wraps values so they become invisible to explorers. dynamic_object_field keeps child objects visible and queryable. Use ofield when discoverability matters.' },
                { label: 'When to use dynamic object fields', content: 'Use them when child objects need to be found by ID, listed in explorers, or queried by external tools. Example: NFTs inside a collection, items in a marketplace listing.' },
                { label: 'Name types for dynamic fields', content: 'The name (key) can be any type with copy+drop+store. Common choices: u64 for numeric IDs, String for named fields, or custom structs for type-safe namespacing.' },
                { label: 'Heterogeneous storage', content: 'Unlike Table (homogeneous K/V types), dynamic fields let you attach fields of different value types to the same object. You can have a u64 field and a String field on the same UID using different name values.' },
              ],
            },
          },
        },
        {
          title: 'Building with Dynamic Fields: Patterns',
          emoji: '🏗',
          content: "Dynamic fields unlock powerful design patterns in Sui Move:\n\n**Extension Pattern**: Add new features to an object without upgrading the module. Ship a base object, then attach new fields in subsequent module upgrades.\n\n**Heterogeneous Map**: Store different value types on the same object by using different name types or name values. Unlike Table which requires a single V type.\n\n**Namespace Pattern**: Use a custom struct as the Name type to namespace your dynamic fields and prevent collisions between modules.\n\n**Lazy Initialization**: Only attach fields when needed, saving gas for objects that may not use every optional feature.\n\nRemember: Tables are built on top of dynamic fields. When you call `table::add`, it internally calls `field::add`. Tables simply provide a cleaner API for the common case of a homogeneous map.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module examples::equipment {\n    use sui::dynamic_object_field as ofield;\n    use sui::object::{Self, UID};\n    use sui::tx_context::TxContext;\n    use std::string::String;\n\n    /// A namespace key to avoid collisions\n    public struct EquipSlot has copy, drop, store {\n        slot_name: String,\n    }\n\n    public struct Character has key {\n        id: UID,\n        name: String,\n    }\n\n    public struct Weapon has key, store {\n        id: UID,\n        damage: u64,\n    }\n\n    /// Equip a weapon to a named slot using dynamic object fields\n    public fun equip(\n        character: &mut Character,\n        slot: String,\n        weapon: Weapon,\n    ) {\n        let key = EquipSlot { slot_name: slot };\n        ofield::add(&mut character.id, key, weapon);\n    }\n\n    /// Unequip and return the weapon from a slot\n    public fun unequip(\n        character: &mut Character,\n        slot: String,\n    ): Weapon {\n        let key = EquipSlot { slot_name: slot };\n        ofield::remove<EquipSlot, Weapon>(&mut character.id, key)\n    }\n\n    /// Check if a slot has a weapon equipped\n    public fun has_equipped(\n        character: &Character,\n        slot: String,\n    ): bool {\n        let key = EquipSlot { slot_name: slot };\n        ofield::exists_<EquipSlot>(&character.id, key)\n    }\n}`,
              highlights: [
                { line: 8, explanation: "A custom struct as the Name type creates a namespace. Only code with EquipSlot can access these fields, preventing collisions." },
                { line: 17, explanation: "Weapon has key+store so it can be stored as a dynamic object field and remain visible to explorers." },
                { line: 29, explanation: "ofield::add attaches the Weapon as a child object of the Character. The weapon is now discoverable by its own ID." },
                { line: 38, explanation: "ofield::remove detaches and returns the Weapon. It becomes an independent object again and can be transferred." },
                { line: 47, explanation: "ofield::exists_ checks if a field with the given Name type and value exists on the object." },
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
      question: 'Which function removes an element from a vector in O(1) time but does NOT preserve order?',
      options: [
        'vector::remove',
        'vector::pop_back',
        'vector::swap_remove',
        'vector::borrow_mut',
      ],
      correctAnswer: 2,
      explanation: "vector::swap_remove swaps the element at the given index with the last element and then pops the last element. This is O(1) because it avoids shifting all subsequent elements, but it changes the order of the remaining elements. vector::remove preserves order but is O(n).",
      weaknessTopic: 'collections',
      practiceHint: "Think about which removal strategy swaps with the last element instead of shifting.",
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
      explanation: "The key advantage of Table over vector for large collections is that each Table entry is stored as a separate dynamic field. Only the entries you actually access in a transaction are loaded and cost gas. A vector, on the other hand, is loaded entirely into memory whenever the parent object is accessed, making it expensive for large datasets.",
      weaknessTopic: 'collections',
      practiceHint: "Consider what happens when you access a parent object -- does the entire collection load or just the entry you need?",
    },
    {
      question: 'What is the difference between dynamic_field and dynamic_object_field?',
      options: [
        'dynamic_field is faster; dynamic_object_field is slower',
        'dynamic_field only works with primitive types; dynamic_object_field works with structs',
        'dynamic_object_field keeps child objects visible to explorers; dynamic_field wraps them and hides them',
        'dynamic_field requires a TxContext; dynamic_object_field does not',
      ],
      correctAnswer: 2,
      explanation: "The critical difference is visibility. dynamic_object_field stores child objects in a way that preserves their on-chain identity -- they remain queryable by ID and visible in block explorers. dynamic_field wraps values (including objects) so they become invisible to the outside world. Use dynamic_object_field when you need child objects to be discoverable.",
      weaknessTopic: 'collections',
      practiceHint: "Think about what happens to an object's on-chain visibility when it is stored as a field.",
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
      explanation: "field::add aborts if a field with the given name already exists on the object. Each name must be unique per object. To update an existing field, use field::borrow_mut to get a mutable reference and modify it in place, or use field::remove followed by field::add.",
      weaknessTopic: 'collections',
      practiceHint: "Dynamic field names must be unique per object. What happens when you violate this constraint?",
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
      explanation: "For small bounded collections (up to around 100 items), vector<T> is the simplest and most efficient choice. The entire vector is loaded with the parent object, which is fine when the list is small. Table and dynamic fields add overhead that is unnecessary for small lists. String does not have the key ability so ObjectTable would not work here anyway.",
      weaknessTopic: 'collections',
      practiceHint: "Consider the overhead of each collection type. Which is simplest for a small, bounded list?",
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

    // TODO 1: Define a struct 'Item' with abilities 'store' (not a top-level object).
    //         Fields: name (String), quantity (u64)


    // TODO 2: Define a struct 'Inventory' as a Sui object (key ability).
    //         Fields: id (UID), item_names (vector<String>) to track which items exist


    // TODO 3: Write a public entry function 'create_inventory' that:
    //         - Takes ctx: &mut TxContext
    //         - Creates a new Inventory with an empty item_names vector
    //         - Transfers it to the sender


    // TODO 4: Write a public entry function 'add_item' that:
    //         - Takes inventory: &mut Inventory, name: String, quantity: u64
    //         - Creates a new Item struct
    //         - Adds it as a dynamic field on the inventory using the name as key
    //         - Pushes the name to the item_names vector
    //         Hint: Use field::add(&mut inventory.id, name, item)
    //         Note: Use a copy of the name for the vector push since String has copy


    // TODO 5: Write a public fun 'get_item_quantity' that:
    //         - Takes inventory: &Inventory, name: String
    //         - Returns the quantity (u64) of the item with the given name
    //         Hint: Use field::borrow and access the quantity field

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
    "Item needs only the 'store' ability (no key) because it will live inside an Inventory as a dynamic field, not as a standalone object.",
    "Inventory has 'key' ability and needs 'id: UID' as the first field. The item_names vector tracks which dynamic field keys exist.",
    "Use transfer::transfer (not public_transfer) for Inventory since it has key but not store. Create the vector with vector::empty<String>().",
    "In add_item, use 'copy name' to get a copy of the String for the Item and vector, then pass the original name to field::add. Use field::borrow<String, Item> in get_item_quantity to access the dynamic field.",
  ],
};
