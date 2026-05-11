import { LessonContent } from '../types/lesson';

export const moveLesson3: LessonContent = {
  id: 'move-3',
  title: 'Control Flow & Logic',
  description: 'Master Move\'s control flow: if/else expressions, while loops, loop with break, abort, assert!, return, scopes, and logical operators.',
  difficulty: 'beginner',
  xpReward: 200,
  order: 3,
  language: 'move',
  prerequisiteLessons: ['move-2'],

  narrative: {
    welcomeMessage: "You know modules, functions, and types. Now it's time to make your contracts dynamic with control flow. Move's control flow is expression-based, meaning if/else and blocks can return values. You'll learn loops, early exits, error handling with abort/assert!, and how scoping works.",
    quizTransition: "You've explored all of Move's control flow constructs. Let's see if you can navigate the logic...",
    practiceTransition: "Time to write a contract that uses if/else, loops, assert!, and more. Fill in the blanks to build a working voting system!",
    celebrationMessage: "Excellent! You've mastered Move's control flow. Your contracts can now handle complex logic, validation, and iteration.",
    nextLessonTease: "Next up: Structs and Objects! You'll learn how to define complex data types and create on-chain Sui objects.",
  },

  teachingSections: [
    {
      sectionTitle: 'Conditionals: if/else',
      slides: [
        {
          title: 'if/else as Expressions',
          emoji: '\u{1F500}',
          content: "In Move, `if/else` is an expression, not just a statement. This means it can return a value! When both branches return the same type, you can use the entire if/else as a value. This is similar to the ternary operator in other languages but more readable. The condition must be a `bool` value. If you only have an `if` without an `else`, the if block must not return a value (it must have unit type `()`).",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun classify_age(age: u8): vector<u8> {\n    // if/else as an expression that returns a value\n    let category = if (age < 13) {\n        b"child"\n    } else if (age < 18) {\n        b"teenager"\n    } else if (age < 65) {\n        b"adult"\n    } else {\n        b"senior"\n    };\n\n    category\n}\n\nfun max(a: u64, b: u64): u64 {\n    // Concise expression form\n    if (a > b) a else b\n}\n\nfun maybe_double(value: u64, should_double: bool): u64 {\n    if (should_double) {\n        value * 2\n    } else {\n        value\n    }\n}`,
              highlights: [
                { line: 3, explanation: "The entire if/else chain is assigned to `category`. Both branches must return the same type (`vector<u8>`)." },
                { line: 5, explanation: "Chained `else if` for multiple conditions. Move evaluates them top-to-bottom and takes the first match." },
                { line: 11, explanation: "The semicolon after the closing brace ends the `let` statement. The if/else is the value being assigned." },
                { line: 18, explanation: "Single-line if/else without braces works for simple expressions. Clean and readable for binary choices." },
              ],
            },
          },
        },
        {
          title: 'Boolean Operators & Conditions',
          emoji: '\u{1F9EE}',
          content: "Conditions in Move use standard comparison operators: `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`. You combine conditions with logical operators: `&&` (and), `||` (or), `!` (not). Move uses short-circuit evaluation: in `a && b`, if `a` is false, `b` is never evaluated. In `a || b`, if `a` is true, `b` is never evaluated. This is important when `b` might abort; short-circuiting can prevent that abort.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'and', label: '&&', emoji: '\u{1F91D}' },
                { id: 'or', label: '||', emoji: '\u{1F500}' },
                { id: 'not', label: '!', emoji: '\u{26D4}' },
                { id: 'eq', label: '==', emoji: '\u{2696}\u{FE0F}' },
              ],
              targets: [
                { id: 'both', label: 'True only if BOTH conditions are true' },
                { id: 'either', label: 'True if EITHER condition is true' },
                { id: 'negate', label: 'Flips true to false and vice versa' },
                { id: 'compare', label: 'Tests if two values are equal' },
              ],
              correctPairs: [
                { itemId: 'and', targetId: 'both' },
                { itemId: 'or', targetId: 'either' },
                { itemId: 'not', targetId: 'negate' },
                { itemId: 'eq', targetId: 'compare' },
              ],
            },
          },
        },
        {
          title: 'Nested Conditions & Guards',
          emoji: '\u{1F6E1}\u{FE0F}',
          content: "In real Sui contracts, you'll often use if/else for access control guards, state validation, and conditional logic. A common pattern is to check preconditions at the top of a function and abort early if they fail. You can nest if/else for complex decision trees, but keep nesting shallow for readability. When you find yourself nesting more than 2-3 levels deep, consider extracting helper functions.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `public entry fun transfer_if_eligible(\n    item: Item,\n    recipient: address,\n    ctx: &mut TxContext,\n) {\n    let sender = tx_context::sender(ctx);\n\n    // Guard: only the owner can transfer\n    if (sender != item.owner) {\n        abort ENotOwner\n    };\n\n    // Guard: item must be transferable\n    if (!item.transferable) {\n        abort ENotTransferable\n    };\n\n    // Conditional fee logic\n    let fee = if (item.premium) {\n        PREMIUM_FEE\n    } else if (item.value > HIGH_VALUE_THRESHOLD) {\n        STANDARD_FEE\n    } else {\n        0\n    };\n\n    // Proceed with transfer\n    process_transfer(item, recipient, fee);\n}`,
              highlights: [
                { line: 9, explanation: "Guard pattern: check a condition and abort with an error code if it fails. This is cleaner than nested if/else." },
                { line: 10, explanation: "`abort ENotOwner` immediately stops execution and reverts the transaction with the error code." },
                { line: 19, explanation: "After guards pass, use if/else expressions for conditional business logic. Here the fee depends on the item properties." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-007',
    },
    {
      sectionTitle: 'Loops & Iteration',
      slides: [
        {
          title: 'while Loops',
          emoji: '\u{1F501}',
          content: "The `while` loop repeats a block as long as a condition is true. It's the most common loop in Move and is typically used to iterate over vectors by index. The condition is checked before each iteration, so if it's false initially, the body never executes. Be careful with while loops: if the condition never becomes false, the transaction will consume all gas and abort. Always ensure your loop has a clear termination condition.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun sum_vector(v: &vector<u64>): u64 {\n    let mut total: u64 = 0;\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n\n    while (i < len) {\n        total = total + *vector::borrow(v, i);\n        i = i + 1;\n    };\n\n    total\n}\n\nfun find_first_even(v: &vector<u64>): u64 {\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n    let mut result: u64 = 0;\n\n    while (i < len) {\n        let val = *vector::borrow(v, i);\n        if (val % 2 == 0) {\n            result = val;\n            break  // Exit the loop early\n        };\n        i = i + 1;\n    };\n\n    result\n}`,
              highlights: [
                { line: 6, explanation: "The while condition `i < len` is checked before each iteration. When i reaches len, the loop stops." },
                { line: 7, explanation: "`vector::borrow(v, i)` gets a reference to element at index i. The `*` dereferences it to copy the value." },
                { line: 8, explanation: "Always increment the counter inside the loop body. Forgetting this creates an infinite loop." },
                { line: 23, explanation: "`break` exits the while loop immediately. Control continues after the closing brace of the while." },
              ],
            },
          },
        },
        {
          title: 'loop with break & continue',
          emoji: '\u{267E}\u{FE0F}',
          content: "The `loop` keyword creates an infinite loop that runs forever until you explicitly `break` out of it. This is useful when the exit condition is complex or when you want to break from the middle of the loop body rather than checking at the top. `break` exits the loop, and `continue` skips the rest of the current iteration and jumps back to the top. A `loop` with `break` is functionally equivalent to a `while(true)` loop, but the intent is clearer.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun countdown(): u64 {\n    let mut count: u64 = 10;\n\n    loop {\n        if (count == 0) {\n            break  // Exit when we reach zero\n        };\n        count = count - 1;\n    };\n\n    count  // Returns 0\n}\n\n// loop can return a value via break!\nfun find_threshold(v: &vector<u64>, threshold: u64): u64 {\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n\n    let result = loop {\n        if (i >= len) {\n            break 0  // Not found, return 0\n        };\n        let val = *vector::borrow(v, i);\n        if (val >= threshold) {\n            break val  // Found! Return the value\n        };\n        i = i + 1;\n    };\n\n    result\n}`,
              highlights: [
                { line: 4, explanation: "`loop` runs indefinitely. You MUST have a `break` somewhere inside, or the transaction runs out of gas." },
                { line: 6, explanation: "`break` exits the loop. Without a value, it returns unit `()`." },
                { line: 19, explanation: "Advanced: `loop` can be an expression! `break value` returns that value from the loop." },
                { line: 21, explanation: "`break 0` returns 0 from the loop. Both break paths must return the same type." },
                { line: 25, explanation: "`break val` returns the found value. The loop expression evaluates to whatever `break` provides." },
              ],
            },
          },
        },
        {
          title: 'Practical Loop Patterns',
          emoji: '\u{1F527}',
          content: "In Sui Move contracts, loops are most commonly used to iterate over vectors (processing a list of items), to perform repeated operations (like distributing rewards to multiple addresses), and for search operations (finding a specific element). Always be mindful of gas costs: iterating over very large vectors in a single transaction can exceed gas limits. For large collections, consider pagination patterns where the function processes a batch at a time.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Vector Iteration', content: 'The most common pattern: `let mut i = 0; while (i < vector::length(&v)) { /* process v[i] */ i = i + 1; };`. Always use an index counter.' },
                { label: 'Reverse Iteration', content: 'Start from the end: `let mut i = vector::length(&v); while (i > 0) { i = i - 1; /* process v[i] */ };`. Useful for removing elements without shifting.' },
                { label: 'Accumulator Pattern', content: 'Declare a `mut` accumulator before the loop, update it inside, and return it after: `let mut sum = 0; while (...) { sum = sum + val; }; sum`.' },
                { label: 'Gas Awareness', content: 'Each loop iteration costs gas. For vectors with potentially thousands of elements, add a max_iterations parameter or process in batches across multiple transactions.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-008',
    },
    {
      sectionTitle: 'Error Handling & Scopes',
      slides: [
        {
          title: 'abort and assert!',
          emoji: '\u{1F6D1}',
          content: "Move has two mechanisms for stopping execution when something goes wrong: `abort` and `assert!`. `abort error_code` immediately halts the transaction and reverts all changes, returning the error code. `assert!(condition, error_code)` is syntactic sugar: if the condition is false, it aborts with the given error code. If the condition is true, execution continues normally. Always use descriptive constant names for error codes (like `ENotAuthorized`) so that off-chain tools can decode what went wrong.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::vault {\n    const ENotOwner: u64 = 0;\n    const EInsufficientBalance: u64 = 1;\n    const EAmountTooLarge: u64 = 2;\n    const EVaultLocked: u64 = 3;\n\n    public entry fun withdraw(\n        vault: &mut Vault,\n        amount: u64,\n        ctx: &mut TxContext,\n    ) {\n        // assert! checks a condition and aborts if false\n        assert!(tx_context::sender(ctx) == vault.owner, ENotOwner);\n        assert!(vault.balance >= amount, EInsufficientBalance);\n        assert!(amount <= MAX_WITHDRAW, EAmountTooLarge);\n\n        // Equivalent to assert! using if + abort\n        if (vault.locked) {\n            abort EVaultLocked\n        };\n\n        // All checks passed - proceed with withdrawal\n        vault.balance = vault.balance - amount;\n    }\n}`,
              highlights: [
                { line: 2, explanation: "Error constants defined at module level. Each gets a unique u64 value for identification." },
                { line: 13, explanation: "`assert!(condition, code)` - if the sender is NOT the owner, the transaction aborts with error 0." },
                { line: 14, explanation: "Multiple assert! calls create a chain of validations. The first failure stops execution." },
                { line: 18, explanation: "`if (condition) { abort code }` is equivalent to `assert!(!condition, code)`. Choose whichever reads more naturally." },
                { line: 23, explanation: "After all assertions pass, the actual logic runs. If any assert failed, we never reach this line." },
              ],
            },
          },
        },
        {
          title: 'return and Early Exit',
          emoji: '\u{23CF}\u{FE0F}',
          content: "The `return` keyword exits a function early with a value. In Move, the last expression in a function (without a semicolon) is the implicit return value, so explicit `return` is only needed for early exits. This is commonly used after validation checks: if a condition means there's nothing to do, return early rather than wrapping the entire function body in an if block. Think of it as the 'guard clause' pattern.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun process_payment(amount: u64, discount_code: u8): u64 {\n    // Early return for zero amount\n    if (amount == 0) {\n        return 0\n    };\n\n    // Early return for full discount\n    if (discount_code == 255) {\n        return 0\n    };\n\n    // Calculate discounted amount\n    let discount = if (discount_code == 1) {\n        10  // 10% off\n    } else if (discount_code == 2) {\n        25  // 25% off\n    } else {\n        0   // no discount\n    };\n\n    let discount_amount = amount * discount / 100;\n\n    // Implicit return (no return keyword, no semicolon)\n    amount - discount_amount\n}`,
              highlights: [
                { line: 3, explanation: "Guard clause: if amount is 0, there's nothing to process. Return 0 immediately." },
                { line: 4, explanation: "Explicit `return 0` exits the function and returns 0. The return type must match (u64)." },
                { line: 24, explanation: "The last expression without a semicolon is the implicit return. No `return` keyword needed here." },
              ],
            },
          },
        },
        {
          title: 'Scopes, Blocks & Shadowing',
          emoji: '\u{1F4E6}',
          content: "In Move, curly braces `{ }` create a new scope. Variables declared inside a scope are not accessible outside it. A block can also be an expression: the last expression in the block (without a semicolon) becomes the block's value. This lets you create temporary variables for intermediate computations without polluting the outer scope. Move also supports variable shadowing: you can declare a new `let x` in an inner scope or even in the same scope, and the new binding takes precedence.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Block as Expression', content: '`let result = { let a = 5; let b = 10; a + b };` - The block evaluates to 15. The variables `a` and `b` are not visible outside the block.' },
                { label: 'Variable Shadowing', content: '`let x = 5; let x = x + 1;` - The second `let x` creates a new binding that shadows the first. The value of x is now 6. The original 5 is no longer accessible.' },
                { label: 'Scope Lifetime', content: 'Variables are destroyed when their scope ends. This is critical for Move resources: if a struct with the `drop` ability goes out of scope, it is dropped. Without `drop`, the compiler forces you to explicitly transfer or destroy it.' },
                { label: 'Nested Scopes', content: 'Inner scopes can read outer variables, but outer scopes cannot read inner variables. This enforces clean data flow and prevents accidental access to temporary values.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-move-009',
    },
  ],

  quiz: [
    {
      question: 'What value does this expression return: `let x = if (true) { 10 } else { 20 };`?',
      options: [
        'true',
        '10',
        '20',
        'Compilation error: if/else cannot be used as an expression',
      ],
      correctAnswer: 1,
      explanation: 'In Move, if/else is an expression that returns a value. Since the condition is `true`, the first branch executes and the entire expression evaluates to 10. Both branches must return the same type.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Remember: if/else in Move is an expression, not just a statement. The condition is true here.',
    },
    {
      question: 'What does `assert!(balance >= amount, EInsufficientFunds)` do when balance is 50 and amount is 100?',
      options: [
        'Sets balance to 0 and continues',
        'Returns EInsufficientFunds as a value',
        'Aborts the transaction with error code EInsufficientFunds',
        'Logs a warning and continues execution',
      ],
      correctAnswer: 2,
      explanation: '`assert!(condition, error_code)` checks the condition. Since 50 >= 100 is false, the assertion fails and the transaction aborts immediately with the error code `EInsufficientFunds`. All state changes in the transaction are reverted.',
      weaknessTopic: 'control-flow',
      practiceHint: 'assert! aborts when the condition is FALSE. Is 50 >= 100 true or false?',
    },
    {
      question: 'How do you exit a `loop` in Move?',
      options: [
        'The loop exits automatically after one iteration',
        'Use the `break` keyword inside the loop body',
        'Use `exit()` function call',
        'Set a global flag to false',
      ],
      correctAnswer: 1,
      explanation: 'The `loop` keyword creates an infinite loop that only stops when a `break` statement is reached. Without `break`, the loop runs until the transaction runs out of gas. `break` can optionally carry a value: `break value` to make the loop an expression.',
      weaknessTopic: 'control-flow',
      practiceHint: 'A `loop` runs forever. What keyword explicitly exits it?',
    },
    {
      question: 'What is the difference between `return value` and just writing `value` (without semicolon) at the end of a function?',
      options: [
        '`return` is for public functions, no-return syntax is for private functions',
        'There is no difference in behavior; both return the value from the function',
        '`return` aborts the transaction, while the expression form returns normally',
        '`return` can only return integers, while the expression form works for any type',
      ],
      correctAnswer: 1,
      explanation: 'Both achieve the same result: returning a value from the function. The last expression without a semicolon is the implicit return. Explicit `return` is only needed for early exits (returning from the middle of a function). Idiomatic Move prefers the implicit form at the end.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Think about when you NEED `return` vs when the last expression suffices.',
    },
    {
      question: 'What does this code print/return?\n```\nlet x = 5;\nlet result = {\n    let x = x + 10;\n    x * 2\n};\n// What is `result`? What is `x` here?\n```',
      options: [
        'result = 30, x = 15 (x was modified)',
        'result = 30, x = 5 (inner x is a shadow, outer x unchanged)',
        'result = 10, x = 5',
        'Compilation error: cannot redeclare x',
      ],
      correctAnswer: 1,
      explanation: 'The inner block creates a new `x` that shadows the outer `x`. Inner x = 5 + 10 = 15, then 15 * 2 = 30 becomes the block\'s value (assigned to `result`). The outer `x` is unchanged at 5 because shadowing creates a new variable; it does not modify the original.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Shadowing creates a NEW variable with the same name. Does it modify the original?',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `module control_flow::voting {
    use std::vector;

    const EAlreadyVoted: u64 = 0;
    const EVotingClosed: u64 = 1;
    const EInvalidOption: u64 = 2;
    const MAX_OPTIONS: u64 = 10;

    public struct Poll has key, store {
        id: UID,
        question: vector<u8>,
        options: vector<vector<u8>>,
        votes: vector<u64>,
        voters: vector<address>,
        is_open: bool,
    }

    // TODO 1: Write a public entry function called \`create_poll\`
    // Parameters: question: vector<u8>, options: vector<vector<u8>>, ctx: &mut TxContext
    // It should:
    //   - Assert the number of options is > 1 and <= MAX_OPTIONS using EInvalidOption
    //   - Create a votes vector with the same length as options, all zeros
    //     (use a while loop to push_back 0u64 for each option)
    //   - Create and transfer a Poll to the sender


    // TODO 2: Write a private function called \`has_voted\`
    // Parameters: voters: &vector<address>, voter: address
    // Returns: bool
    // It should loop through voters and return true if the address is found
    // Use a while loop with an index variable


    // TODO 3: Write a public entry function called \`cast_vote\`
    // Parameters: poll: &mut Poll, option_index: u64, ctx: &mut TxContext
    // It should:
    //   - Assert the poll is_open using EVotingClosed
    //   - Assert option_index < vector::length(&poll.options) using EInvalidOption
    //   - Assert !has_voted(&poll.voters, sender) using EAlreadyVoted
    //   - Increment the vote count at option_index in poll.votes
    //   - Add the sender to poll.voters


    // TODO 4: Write a public fun called \`get_winner\`
    // Parameters: poll: &Poll
    // Returns: u64 (the index of the option with the most votes)
    // Use a while loop to find the index with the highest vote count
    // If there's a tie, return the first one found

}`,

  solution: `module control_flow::voting {
    use std::vector;

    const EAlreadyVoted: u64 = 0;
    const EVotingClosed: u64 = 1;
    const EInvalidOption: u64 = 2;
    const MAX_OPTIONS: u64 = 10;

    public struct Poll has key, store {
        id: UID,
        question: vector<u8>,
        options: vector<vector<u8>>,
        votes: vector<u64>,
        voters: vector<address>,
        is_open: bool,
    }

    // TODO 1: Write a public entry function called \`create_poll\`
    // Parameters: question: vector<u8>, options: vector<vector<u8>>, ctx: &mut TxContext
    // It should:
    //   - Assert the number of options is > 1 and <= MAX_OPTIONS using EInvalidOption
    //   - Create a votes vector with the same length as options, all zeros
    //     (use a while loop to push_back 0u64 for each option)
    //   - Create and transfer a Poll to the sender
    public entry fun create_poll(
        question: vector<u8>,
        options: vector<vector<u8>>,
        ctx: &mut TxContext,
    ) {
        let num_options = vector::length(&options);
        assert!(num_options > 1 && num_options <= MAX_OPTIONS, EInvalidOption);

        let mut votes = vector::empty<u64>();
        let mut i: u64 = 0;
        while (i < num_options) {
            vector::push_back(&mut votes, 0u64);
            i = i + 1;
        };

        let poll = Poll {
            id: object::new(ctx),
            question,
            options,
            votes,
            voters: vector::empty(),
            is_open: true,
        };
        transfer::transfer(poll, tx_context::sender(ctx));
    }

    // TODO 2: Write a private function called \`has_voted\`
    // Parameters: voters: &vector<address>, voter: address
    // Returns: bool
    // It should loop through voters and return true if the address is found
    // Use a while loop with an index variable
    fun has_voted(voters: &vector<address>, voter: address): bool {
        let mut i: u64 = 0;
        let len = vector::length(voters);
        while (i < len) {
            if (*vector::borrow(voters, i) == voter) {
                return true
            };
            i = i + 1;
        };
        false
    }

    // TODO 3: Write a public entry function called \`cast_vote\`
    // Parameters: poll: &mut Poll, option_index: u64, ctx: &mut TxContext
    // It should:
    //   - Assert the poll is_open using EVotingClosed
    //   - Assert option_index < vector::length(&poll.options) using EInvalidOption
    //   - Assert !has_voted(&poll.voters, sender) using EAlreadyVoted
    //   - Increment the vote count at option_index in poll.votes
    //   - Add the sender to poll.voters
    public entry fun cast_vote(
        poll: &mut Poll,
        option_index: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(poll.is_open, EVotingClosed);
        assert!(option_index < vector::length(&poll.options), EInvalidOption);
        assert!(!has_voted(&poll.voters, sender), EAlreadyVoted);

        let current_votes = vector::borrow_mut(&mut poll.votes, option_index);
        *current_votes = *current_votes + 1;
        vector::push_back(&mut poll.voters, sender);
    }

    // TODO 4: Write a public fun called \`get_winner\`
    // Parameters: poll: &Poll
    // Returns: u64 (the index of the option with the most votes)
    // Use a while loop to find the index with the highest vote count
    // If there's a tie, return the first one found
    public fun get_winner(poll: &Poll): u64 {
        let mut best_index: u64 = 0;
        let mut best_votes: u64 = 0;
        let mut i: u64 = 0;
        let len = vector::length(&poll.votes);

        while (i < len) {
            let count = *vector::borrow(&poll.votes, i);
            if (count > best_votes) {
                best_votes = count;
                best_index = i;
            };
            i = i + 1;
        };

        best_index
    }
}`,

  hints: [
    'For create_poll: use `vector::length(&options)` to get the count, then a while loop from 0 to num_options calling `vector::push_back(&mut votes, 0u64)` each iteration.',
    'For has_voted: iterate with a while loop using an index. Use `*vector::borrow(voters, i) == voter` to compare. Use `return true` for early exit when found. Return `false` after the loop.',
    'For cast_vote: get the sender first with `tx_context::sender(ctx)`. Use three assert! calls for validation. Modify votes using `vector::borrow_mut` and the dereference `*` operator.',
    'For get_winner: track `best_index` and `best_votes` as mutable variables. Loop through all votes, updating the best whenever you find a higher count.',
  ],
};
