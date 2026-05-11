import { LessonContent } from '@/app/types/lesson';

export const moveLesson3: LessonContent = {
  id: 'move-3',
  title: 'Making Decisions in Code',
  description: 'Teach your smart contracts to think! Learn how to make decisions with if/else, repeat actions with loops, handle errors gracefully, and keep your variables organized — all in beginner-friendly steps.',
  difficulty: 'beginner',
  xpReward: 200,
  order: 3,
  language: 'move',
  prerequisiteLessons: ['move-2'],

  narrative: {
    welcomeMessage: "Hey! You've already got modules, functions, and types under your belt — nice work. Now it's time for the really fun part: making your contracts actually think. Right now, your code runs straight from top to bottom like a recipe. But real programs need to make decisions (\"is this person allowed to do this?\"), repeat actions (\"process every item in this list\"), and handle things that go wrong (\"stop everything if the balance is too low\"). That's what control flow is all about, and by the end of this lesson, your contracts will be way more powerful.",
    quizTransition: "You've explored all the ways Move can make decisions and repeat actions. Let's do a quick knowledge check to make sure it all clicked...",
    practiceTransition: "Alright, time to build something real! You're going to create a voting system that uses if/else, loops, assert!, and more. Don't worry — the hints will walk you through it step by step.",
    celebrationMessage: "You nailed it! Your contracts can now make decisions, loop through data, validate inputs, and handle errors like a pro. That's a massive upgrade from straight-line code.",
    nextLessonTease: "Next up: Structs and Objects! You'll learn how to define complex data types and create on-chain Sui objects — the building blocks of everything on Sui.",
  },

  teachingSections: [
    {
      sectionTitle: 'Conditionals: if/else',
      slides: [
        {
          title: 'if/else as Expressions',
          emoji: '\u{1F500}',
          content: "Your code needs to make decisions, just like you do every day — \"If it's raining, bring an umbrella, else wear sunglasses.\" That's exactly what `if/else` does in Move. But here's a cool twist that's different from many other languages: in Move, `if/else` is an expression, which means it produces a value. Think of it like a question that gives you an answer: \"If this condition is true, the answer is X, otherwise it's Y.\" You can assign that answer directly to a variable! The only rule is that both branches need to give back the same type (you can't have one branch return a number and the other return text). The condition inside the parentheses must be a `bool` (true or false). If you write an `if` without an `else`, the if block can't return a value — it just does something and moves on.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun classify_age(age: u8): vector<u8> {\n    // if/else as an expression that returns a value\n    let category = if (age < 13) {\n        b"child"\n    } else if (age < 18) {\n        b"teenager"\n    } else if (age < 65) {\n        b"adult"\n    } else {\n        b"senior"\n    };\n\n    category\n}\n\nfun max(a: u64, b: u64): u64 {\n    // Concise expression form\n    if (a > b) a else b\n}\n\nfun maybe_double(value: u64, should_double: bool): u64 {\n    if (should_double) {\n        value * 2\n    } else {\n        value\n    }\n}`,
              highlights: [
                { line: 3, explanation: "See what's happening here? The entire if/else chain is being assigned to `category` — like asking \"which age group is this?\" and storing the answer. Both branches must return the same type (`vector<u8>` in this case)." },
                { line: 5, explanation: "You can chain `else if` for multiple conditions. Move checks them top-to-bottom and takes the first one that matches — just like reading a list of rules in order." },
                { line: 11, explanation: "Don't miss this semicolon! It ends the `let` statement. The whole if/else chain is the value being assigned to `category`." },
                { line: 18, explanation: "For simple either/or choices, you can skip the curly braces entirely. Clean and easy to read — like a quick yes/no question." },
              ],
            },
          },
        },
        {
          title: 'Boolean Operators & Conditions',
          emoji: '\u{1F9EE}',
          content: "Before you can make decisions, you need to ask questions — and that's what comparison operators do. You've got the usual suspects: `==` (are these equal?), `!=` (are these different?), `<`, `>`, `<=`, `>=`. But sometimes one question isn't enough. That's where logical operators come in. These are basically the words AND, OR, and NOT — just written as symbols: `&&` (and), `||` (or), `!` (not). For example, \"is the user the owner AND is the account active?\" becomes `is_owner && is_active`. One handy detail: Move uses short-circuit evaluation. In `a && b`, if `a` is already false, Move doesn't even bother checking `b` (because the whole thing can't be true anyway). Same idea with `||` — if `a` is true, `b` gets skipped. This isn't just a performance trick — it can actually prevent errors when `b` might cause an abort.",
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
          content: "In real Sui contracts, if/else is your go-to tool for access control, input validation, and conditional business logic. A super common pattern is the \"guard clause\" — you check your preconditions at the top of the function and bail out immediately if something's wrong. Think of it like a bouncer checking IDs at the door before letting anyone into the club. This is way cleaner than wrapping your entire function in a big nested if/else. When you do need nested conditions, try to keep the nesting shallow (2-3 levels max). If you find yourself going deeper, it's a sign you should extract some logic into a helper function.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `public entry fun transfer_if_eligible(\n    item: Item,\n    recipient: address,\n    ctx: &mut TxContext,\n) {\n    let sender = tx_context::sender(ctx);\n\n    // Guard: only the owner can transfer\n    if (sender != item.owner) {\n        abort ENotOwner\n    };\n\n    // Guard: item must be transferable\n    if (!item.transferable) {\n        abort ENotTransferable\n    };\n\n    // Conditional fee logic\n    let fee = if (item.premium) {\n        PREMIUM_FEE\n    } else if (item.value > HIGH_VALUE_THRESHOLD) {\n        STANDARD_FEE\n    } else {\n        0\n    };\n\n    // Proceed with transfer\n    process_transfer(item, recipient, fee);\n}`,
              highlights: [
                { line: 9, explanation: "This is the guard pattern in action — like a bouncer at the door. Check a condition, and if it fails, stop everything right here. No need to nest the rest of the function inside an else block." },
                { line: 10, explanation: "`abort ENotOwner` immediately stops the entire transaction and reverts any changes. The error code tells the outside world what went wrong." },
                { line: 19, explanation: "Once the guards pass (we know the caller is the owner and the item is transferable), we use if/else as an expression to figure out the fee. Clean separation: validation first, then business logic." },
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
          content: "Sometimes you need your code to do something over and over — like washing dishes. You keep going while there are dirty dishes left, and you stop when the sink is empty. That's a `while` loop! In Move, `while` repeats a block of code as long as a condition stays true. It checks the condition before each round, so if the condition is false from the start, the code inside never runs at all. The most common use in Move is looping through a vector (a list) by index — you start at 0, process each item, and stop when you've reached the end. One important warning: if the condition never becomes false, the loop runs forever, eats all the gas, and your transaction fails. Always make sure your loop has a clear exit plan!",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun sum_vector(v: &vector<u64>): u64 {\n    let mut total: u64 = 0;\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n\n    while (i < len) {\n        total = total + *vector::borrow(v, i);\n        i = i + 1;\n    };\n\n    total\n}\n\nfun find_first_even(v: &vector<u64>): u64 {\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n    let mut result: u64 = 0;\n\n    while (i < len) {\n        let val = *vector::borrow(v, i);\n        if (val % 2 == 0) {\n            result = val;\n            break  // Exit the loop early\n        };\n        i = i + 1;\n    };\n\n    result\n}`,
              highlights: [
                { line: 6, explanation: "Here's the while loop in action: \"keep going while i is less than the length of the vector.\" Each time around, we check this condition. Once i reaches len, the party's over." },
                { line: 7, explanation: "`vector::borrow(v, i)` grabs a reference to the element at position i. The `*` at the front dereferences it — meaning \"give me the actual value, not just a pointer to it.\"" },
                { line: 8, explanation: "This is critical: always increment your counter inside the loop! Forgetting `i = i + 1` is one of the most common beginner mistakes — it creates an infinite loop that burns through all your gas." },
                { line: 23, explanation: "`break` is your emergency exit — it immediately jumps out of the loop. Here we use it because once we find the first even number, there's no point checking the rest." },
              ],
            },
          },
        },
        {
          title: 'loop with break & continue',
          emoji: '\u{267E}\u{FE0F}',
          content: "An infinite loop is like walking on a treadmill — you need to decide when to step off. The `loop` keyword creates a loop that runs forever until you explicitly say `break`. Why would you want this? Sometimes the exit condition is complicated, or you want to break from the middle of the loop body rather than checking at the top like `while` does. `break` is your \"I'm done\" signal — it exits the loop. `continue` is different — it says \"skip the rest of this round and start the next one.\" And here's something neat: in Move, `loop` can be an expression! You can write `break some_value` to return a value from the loop, just like if/else returns a value.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun countdown(): u64 {\n    let mut count: u64 = 10;\n\n    loop {\n        if (count == 0) {\n            break  // Exit when we reach zero\n        };\n        count = count - 1;\n    };\n\n    count  // Returns 0\n}\n\n// loop can return a value via break!\nfun find_threshold(v: &vector<u64>, threshold: u64): u64 {\n    let mut i: u64 = 0;\n    let len = vector::length(v);\n\n    let result = loop {\n        if (i >= len) {\n            break 0  // Not found, return 0\n        };\n        let val = *vector::borrow(v, i);\n        if (val >= threshold) {\n            break val  // Found! Return the value\n        };\n        i = i + 1;\n    };\n\n    result\n}`,
              highlights: [
                { line: 4, explanation: "`loop` starts an infinite loop — it will run forever unless you break out. You MUST have a `break` somewhere inside, or the transaction runs out of gas and fails." },
                { line: 6, explanation: "`break` by itself exits the loop and returns nothing (unit `()`). Think of it as stepping off the treadmill." },
                { line: 19, explanation: "Here's the cool part: `loop` can be an expression! The value you pass to `break` becomes the value of the entire loop. It's like a search that gives you an answer when it finds what it's looking for." },
                { line: 21, explanation: "`break 0` exits the loop AND returns 0. This is the \"not found\" case. Both break paths must return the same type (both u64 here)." },
                { line: 25, explanation: "`break val` exits and returns the found value. The loop expression evaluates to whatever value you hand to `break`." },
              ],
            },
          },
        },
        {
          title: 'Practical Loop Patterns',
          emoji: '\u{1F527}',
          content: "In real Sui contracts, you'll use loops all the time — iterating over a list of items, distributing rewards to multiple addresses, or searching for a specific element. Think of loops as your assembly line: each item comes through, you do something with it, and move on to the next. But here's something important to keep in mind: every trip through the loop costs gas (the fee for running code on the blockchain). If you're looping over a really long list, you could hit the gas limit and your transaction fails. For large collections, smart developers use a \"pagination\" pattern — process a batch at a time across multiple transactions, like reading a book chapter by chapter instead of all at once.",
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
          content: "What happens when something goes wrong in your contract? Maybe someone tries to withdraw more money than they have, or a non-owner tries to modify something they shouldn't. You need a way to say \"Nope, not happening\" and stop everything. That's where `abort` and `assert!` come in. Think of them like a bouncer at a club — if you don't meet the rules, you're not getting in. `abort error_code` immediately stops the transaction and undoes everything that happened in it. `assert!(condition, error_code)` is the shorthand version: \"if this condition is false, abort with this error code.\" Most developers use `assert!` because it reads like plain English: \"assert that the sender is the owner, otherwise error.\" Pro tip: always give your error codes descriptive constant names (like `ENotAuthorized` instead of just `1`) so that when something fails, you can actually figure out why.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `module my_package::vault {\n    const ENotOwner: u64 = 0;\n    const EInsufficientBalance: u64 = 1;\n    const EAmountTooLarge: u64 = 2;\n    const EVaultLocked: u64 = 3;\n\n    public entry fun withdraw(\n        vault: &mut Vault,\n        amount: u64,\n        ctx: &mut TxContext,\n    ) {\n        // assert! checks a condition and aborts if false\n        assert!(tx_context::sender(ctx) == vault.owner, ENotOwner);\n        assert!(vault.balance >= amount, EInsufficientBalance);\n        assert!(amount <= MAX_WITHDRAW, EAmountTooLarge);\n\n        // Equivalent to assert! using if + abort\n        if (vault.locked) {\n            abort EVaultLocked\n        };\n\n        // All checks passed - proceed with withdrawal\n        vault.balance = vault.balance - amount;\n    }\n}`,
              highlights: [
                { line: 2, explanation: "Error constants are defined at the module level. Each one gets a unique number so you can tell different errors apart. The `E` prefix is a Move convention — it stands for \"Error.\"" },
                { line: 13, explanation: "`assert!(condition, code)` reads like: \"make sure the sender is the owner — if not, abort with ENotOwner.\" Since the sender isn't the owner, the transaction stops and all changes are rolled back." },
                { line: 14, explanation: "You can stack multiple assert! calls to validate everything up front. Think of it as a checklist: the first check that fails stops everything." },
                { line: 18, explanation: "`if (condition) { abort code }` does the same thing as `assert!(!condition, code)`. Some people find this more readable for certain checks — use whichever feels more natural to you." },
                { line: 23, explanation: "This line only runs if ALL the assertions above passed. If any of them failed, we never get here — that's the whole point of validation guards." },
              ],
            },
          },
        },
        {
          title: 'return and Early Exit',
          emoji: '\u{23CF}\u{FE0F}',
          content: "Remember how in Move the last expression in a function (without a semicolon) is automatically the return value? That works great most of the time. But sometimes you want to bail out of a function early — like saying \"if there's nothing to process, just give back zero and don't bother with the rest.\" That's what the `return` keyword is for. You only need explicit `return` when you want to exit before reaching the end of the function. It's called the \"guard clause\" pattern, and it keeps your code flat and readable instead of nesting everything inside if/else blocks. At the end of a function, just write the value without a semicolon — no `return` needed.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `fun process_payment(amount: u64, discount_code: u8): u64 {\n    // Early return for zero amount\n    if (amount == 0) {\n        return 0\n    };\n\n    // Early return for full discount\n    if (discount_code == 255) {\n        return 0\n    };\n\n    // Calculate discounted amount\n    let discount = if (discount_code == 1) {\n        10  // 10% off\n    } else if (discount_code == 2) {\n        25  // 25% off\n    } else {\n        0   // no discount\n    };\n\n    let discount_amount = amount * discount / 100;\n\n    // Implicit return (no return keyword, no semicolon)\n    amount - discount_amount\n}`,
              highlights: [
                { line: 3, explanation: "Guard clause: if the amount is zero, there's nothing to calculate. Just return 0 and skip all the work below. This keeps the main logic un-nested and easy to read." },
                { line: 4, explanation: "Explicit `return 0` exits the function immediately and gives back 0. The return type must match what the function promises (u64 here)." },
                { line: 24, explanation: "At the end of the function, you don't need `return` — just write the expression without a semicolon. This is the idiomatic Move style, and you'll see it everywhere." },
              ],
            },
          },
        },
        {
          title: 'Scopes, Blocks & Shadowing',
          emoji: '\u{1F4E6}',
          content: "Variables live inside their curly braces — like how conversations at a dinner table stay at that table. When someone leaves the table (the closing `}` brace), whatever was said there is gone. In Move, `{ }` creates a new scope. Any variable you declare inside a scope disappears when the scope ends. But here's something useful: a block can also produce a value! The last expression inside the block (without a semicolon) becomes the block's result. This lets you do temporary calculations without cluttering up your outer code with variables you only need briefly. Move also supports \"shadowing\" — you can declare a new variable with the same name as an existing one, and the new one takes over. The old one isn't changed or destroyed; it's just hidden until the shadow goes away.",
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
      explanation: 'Remember, if/else in Move is an expression — it gives you a value! Since the condition is `true`, Move takes the first branch and the whole thing evaluates to 10. It\'s like asking "if yes, give me 10, otherwise 20" — and the answer is yes, so you get 10. Both branches must return the same type.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Think of if/else as a question that gives you an answer. The condition here is literally `true` — so which branch does Move take?',
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
      explanation: 'Think of assert! as a bouncer: "You must be at least this tall to ride." Here the question is "is 50 >= 100?" — nope! So the bouncer kicks you out. The transaction aborts immediately with the error code `EInsufficientFunds`, and all changes are rolled back as if nothing happened. There\'s no "warning" or "try again" — it\'s a hard stop.',
      weaknessTopic: 'control-flow',
      practiceHint: 'assert! checks a condition. If the condition is FALSE, the whole transaction stops. So ask yourself: is 50 >= 100 true or false?',
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
      explanation: 'A `loop` is like a treadmill — it keeps going forever until you decide to step off. The `break` keyword is how you step off. Without it, the loop runs until the transaction burns through all its gas and fails. Bonus: you can even hand a value to `break` (like `break 42`) to make the loop return that value, which is pretty handy for search operations.',
      weaknessTopic: 'control-flow',
      practiceHint: 'A `loop` runs forever by design. There\'s a specific keyword that tells it to stop — which one is it?',
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
      explanation: 'They do exactly the same thing! Both give a value back from the function. The difference is style and placement: the last expression without a semicolon is the idiomatic Move way to return at the end. Explicit `return` is only needed when you want to bail out early (like in a guard clause). Think of `return` as an emergency exit and the last expression as the normal front door — both get you out of the building.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Think about it this way: do you NEED the `return` keyword at the very end of a function, or is it only useful for leaving early?',
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
      explanation: 'This is shadowing in action! Inside the block, `let x = x + 10` creates a brand new variable called `x` that equals 15 (5 + 10). It doesn\'t touch the outer `x` — it just hides it temporarily. Then `x * 2` = 30 becomes the block\'s value, which gets assigned to `result`. Once the block ends, the shadow disappears, and the original `x` is back — still 5, completely untouched. It\'s like having two different people with the same name at different tables.',
      weaknessTopic: 'control-flow',
      practiceHint: 'Shadowing creates a completely NEW variable that happens to have the same name. The original variable is hidden but not changed. What does the inner x equal, and what happens to the outer x?',
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
    //
    // This function creates a new poll. Here's your step-by-step plan:
    //
    // Step 1: Get the number of options with vector::length(&options)
    //         and store it in a variable called num_options
    //
    // Step 2: Use assert! to validate that num_options > 1 AND num_options <= MAX_OPTIONS
    //         If it fails, use the EInvalidOption error code
    //         Hint: assert!(num_options > 1 && num_options <= MAX_OPTIONS, EInvalidOption);
    //
    // Step 3: Create an empty votes vector: let mut votes = vector::empty<u64>();
    //         Then use a while loop to push a 0 for each option:
    //           let mut i: u64 = 0;
    //           while (i < num_options) {
    //               vector::push_back(&mut votes, 0u64);
    //               i = i + 1;
    //           };
    //
    // Step 4: Create a Poll struct and transfer it to the sender
    //         Hint: Poll { id: object::new(ctx), question, options, votes, voters: vector::empty(), is_open: true }
    //         Hint: transfer::transfer(poll, tx_context::sender(ctx));


    // TODO 2: Write a private function called \`has_voted\`
    // Parameters: voters: &vector<address>, voter: address
    // Returns: bool
    //
    // This function checks if an address has already voted. Here's how:
    //
    // Step 1: Set up a counter: let mut i: u64 = 0;
    //         Get the length: let len = vector::length(voters);
    //
    // Step 2: Write a while loop: while (i < len) { ... }
    //
    // Step 3: Inside the loop, compare each voter:
    //         if (*vector::borrow(voters, i) == voter) { return true };
    //         Don't forget: i = i + 1;
    //
    // Step 4: After the loop, return false (no match found)


    // TODO 3: Write a public entry function called \`cast_vote\`
    // Parameters: poll: &mut Poll, option_index: u64, ctx: &mut TxContext
    //
    // This function records a vote. Here's the plan:
    //
    // Step 1: Get the sender: let sender = tx_context::sender(ctx);
    //
    // Step 2: Three validation checks (the bouncers at the door!):
    //         assert!(poll.is_open, EVotingClosed);
    //         assert!(option_index < vector::length(&poll.options), EInvalidOption);
    //         assert!(!has_voted(&poll.voters, sender), EAlreadyVoted);
    //
    // Step 3: Increment the vote count at option_index:
    //         let current_votes = vector::borrow_mut(&mut poll.votes, option_index);
    //         *current_votes = *current_votes + 1;
    //
    // Step 4: Record the voter: vector::push_back(&mut poll.voters, sender);


    // TODO 4: Write a public fun called \`get_winner\`
    // Parameters: poll: &Poll
    // Returns: u64 (the index of the option with the most votes)
    //
    // This function finds which option got the most votes. Here's how:
    //
    // Step 1: Set up tracking variables:
    //         let mut best_index: u64 = 0;
    //         let mut best_votes: u64 = 0;
    //         let mut i: u64 = 0;
    //         let len = vector::length(&poll.votes);
    //
    // Step 2: Loop through all votes: while (i < len) { ... }
    //
    // Step 3: Inside the loop, get the count and compare:
    //         let count = *vector::borrow(&poll.votes, i);
    //         if (count > best_votes) { best_votes = count; best_index = i; };
    //         Don't forget: i = i + 1;
    //
    // Step 4: After the loop, return best_index (no semicolon!)

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
    'Let\'s start with create_poll. First, grab the number of options with `vector::length(&options)`. Then use `assert!` to make sure there are at least 2 options and no more than MAX_OPTIONS. Next, build the votes vector: create an empty one with `vector::empty<u64>()` and use a while loop to push a 0 for each option. Finally, create the Poll struct and transfer it to the sender.',
    'For has_voted, you\'re doing a simple search. Set up a counter `i` at 0 and loop while `i < vector::length(voters)`. Inside the loop, compare each address with `*vector::borrow(voters, i) == voter`. If you find a match, `return true` right away. If the loop finishes without finding anything, return `false` at the end.',
    'For cast_vote, start by getting the sender with `tx_context::sender(ctx)`. Then add three assert! guards — think of them as three bouncers: (1) is the poll open? (2) is the option_index valid? (3) has this person NOT voted yet? After the guards pass, use `vector::borrow_mut` to get a mutable reference to the vote count and increment it with `*current_votes = *current_votes + 1`. Don\'t forget to add the sender to the voters list!',
    'For get_winner, you need to track two things: the best index so far and the highest vote count so far. Start both at 0. Loop through all the votes, and whenever you find a count higher than your current best, update both tracking variables. After the loop, return best_index (no semicolon — it\'s the last expression!).',
  ],
};
