import { LessonContent } from '@/app/types/lesson';

export const predictLesson5: LessonContent = {
  id: 'predict-5',
  title: 'Building Trading Transactions',
  description: 'Learn to construct Sui Programmable Transaction Blocks (PTBs) for DeepBook Predict — create managers, deposit DUSDC, build RangeKeys, and mint binary positions in atomic operations.',
  difficulty: 'intermediate',
  xpReward: 300,
  order: 5,
  language: 'typescript',
  prerequisiteLessons: ['predict-4'],

  narrative: {
    welcomeMessage: "You've mastered pricing theory. Now it's time to turn knowledge into action — building the actual Sui transactions that create managers, deposit funds, and mint binary positions on DeepBook Predict. Every trade starts with a Programmable Transaction Block (PTB).",
    quizTransition: "You've seen how to construct each transaction type. Let's test your understanding of manager creation, deposits, RangeKeys, and atomic PTB composition.",
    practiceTransition: "Time to build real transactions! Implement the four core transaction builders: createManager, deposit, buildRangeKey, and mintPosition.",
    celebrationMessage: "Outstanding! You can now construct every transaction needed to trade on DeepBook Predict — from manager setup to atomic deposit-and-mint operations.",
    nextLessonTease: "Next: executing transactions, handling responses, and building a complete trading flow with wallet integration.",
  },

  teachingSections: [
    {
      sectionTitle: 'PredictManager Setup',
      slides: [
        {
          title: 'Creating a PredictManager',
          content: 'Before trading, every user needs a PredictManager — a shared object that stores your DUSDC balance and tracks position quantities. You create one by calling registry::create_and_share_manager with the Registry object ID. This is a one-time operation per wallet.',
          emoji: '🏗️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { Transaction } from '@mysten/sui/transactions';

// Constants
const PACKAGE_ID  = '0xf5ea2b...5138';
const REGISTRY_ID = '0x43af14...e64';

function createManagerTx(): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: \`\${PACKAGE_ID}::registry::create_and_share_manager\`,
    arguments: [
      tx.object(REGISTRY_ID),
    ],
  });

  return tx;
}`,
              highlights: [
                { line: 1, explanation: 'Transaction is the PTB builder from the Sui TypeScript SDK. Each Transaction can contain multiple operations that execute atomically.' },
                { line: 7, explanation: 'createManagerTx returns a Transaction object ready to be signed and submitted. The manager is created and shared in one step.' },
                { line: 10, explanation: 'tx.moveCall invokes an on-chain Move function. The target format is packageId::module::function.' },
                { line: 11, explanation: 'registry::create_and_share_manager is the entry function in the registry module that creates a new PredictManager and shares it.' },
                { line: 13, explanation: 'REGISTRY_ID is the shared Registry object. It tracks all managers and ensures one-per-wallet uniqueness.' },
              ],
            },
          },
        },
        {
          title: 'Depositing DUSDC',
          content: 'After creating a manager, you deposit DUSDC into it. The deposit transaction uses splitCoins to extract an exact amount from your coin, then calls predict_manager::deposit with the DUSDC type argument.',
          emoji: '💰',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const DUSDC_TYPE = '0xe950...::dusdc::DUSDC';

function depositTx(
  managerId: string,
  coinId: string,
  amount: number
): Transaction {
  const tx = new Transaction();

  // Split exact amount from the source coin
  const [depositCoin] = tx.splitCoins(
    tx.object(coinId),
    [amount]
  );

  // Deposit the split coin into the manager
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(managerId),
      depositCoin,
    ],
  });

  return tx;
}`,
              highlights: [
                { line: 1, explanation: 'DUSDC_TYPE is the full type string for the DUSDC coin. It must match the coin type the manager accepts.' },
                { line: 11, explanation: 'splitCoins creates a new coin with exactly the specified amount, leaving the remainder in the source coin.' },
                { line: 12, explanation: 'tx.object(coinId) references the user\'s existing DUSDC coin object on-chain.' },
                { line: 18, explanation: 'predict_manager::deposit takes a Coin<DUSDC> and adds it to the manager\'s internal BalanceManager.' },
                { line: 19, explanation: 'typeArguments specifies the coin type. This is a Move generic — the deposit function works with any coin type.' },
              ],
            },
          },
        },
        {
          title: 'Manager Lifecycle',
          content: 'A PredictManager is designed to be long-lived. You create it once and reuse it across all trading sessions. Understanding its lifecycle helps you build efficient dApps.',
          emoji: '♻️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'One-Time Creation', content: 'You only call create_and_share_manager once per wallet. The manager is a shared object — its ID is stable and can be stored client-side (e.g., localStorage) for future sessions.' },
                { label: 'Persistent Across Sessions', content: 'The manager lives on-chain as a shared object. Between trading sessions, your balance and positions remain intact. Reconnecting a wallet just requires knowing the manager ID.' },
                { label: 'Stores Balance + Positions', content: 'The manager\'s internal table tracks two things: your DUSDC balance (available for new trades) and your position quantities (how many units of each RangeKey you hold).' },
                { label: 'Wraps BalanceManager', content: 'Under the hood, PredictManager wraps a DeepBook BalanceManager. This means it inherits the battle-tested balance accounting from DeepBook\'s CLOB infrastructure.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-008',
    },
    {
      sectionTitle: 'Minting Binary Positions',
      slides: [
        {
          title: 'Building the RangeKey',
          content: 'Every position is identified by a RangeKey — a combination of oracle, expiry, and strike bounds. For binary UP/DOWN positions, you use sentinel values to encode the direction. The RangeKey is constructed on-chain via range_key::new.',
          emoji: '🔑',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const NEG_INF = '0';
const POS_INF = '18446744073709551615';  // 2^64 - 1

// Assign sentinel bounds based on direction
// DOWN: pays if settlement < strike
//   lower = NEG_INF, higher = strike
// UP: pays if settlement >= strike
//   lower = strike,  higher = POS_INF

let lower: string;
let higher: string;

if (direction === 'DOWN') {
  lower  = NEG_INF;
  higher = strike;
} else {
  // UP
  lower  = strike;
  higher = POS_INF;
}

// Build the RangeKey on-chain
const rangeKey = tx.moveCall({
  target: \`\${PACKAGE_ID}::range_key::new\`,
  arguments: [
    tx.object(oracleId),       // OracleSVI object
    tx.pure.u64(expiry),       // Expiry timestamp
    tx.pure.u128(lower),       // Lower strike bound
    tx.pure.u128(higher),      // Higher strike bound
  ],
});`,
              highlights: [
                { line: 1, explanation: 'NEG_INF = 0 is the sentinel for "no lower bound." Used as the lower strike for DOWN positions.' },
                { line: 2, explanation: 'POS_INF = 2^64-1 is the sentinel for "no upper bound." Used as the higher strike for UP positions.' },
                { line: 13, explanation: 'DOWN positions: lower = NEG_INF (negative infinity), higher = strike. Pays out when settlement < strike.' },
                { line: 18, explanation: 'UP positions: lower = strike, higher = POS_INF (positive infinity). Pays out when settlement >= strike.' },
                { line: 24, explanation: 'range_key::new creates the RangeKey object on-chain. The return value is a transaction result that can be passed to subsequent calls.' },
                { line: 27, explanation: 'The oracleId links this RangeKey to a specific market. Expiry must match the oracle\'s expiry.' },
              ],
            },
          },
        },
        {
          title: 'The Mint Transaction',
          content: 'The predict::mint function takes six arguments and one type parameter. It mints new binary position units into your manager, debiting the cost from your deposited DUSDC balance.',
          emoji: '🪙',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const PREDICT_ID = '0xc87362...028a';
const CLOCK_ID   = '0x6';

tx.moveCall({
  target: \`\${PACKAGE_ID}::predict::mint\`,
  typeArguments: [DUSDC_TYPE],
  arguments: [
    tx.object(PREDICT_ID),     // Predict shared object (vault + configs)
    tx.object(managerId),      // Your PredictManager
    tx.object(oracleId),       // The oracle for this market
    rangeKey,                  // RangeKey built in previous step
    tx.pure.u64(quantity),     // Number of position units to mint
    tx.object(CLOCK_ID),       // Sui system clock (0x6)
  ],
});`,
              highlights: [
                { line: 5, explanation: 'predict::mint is the core trading function. It prices the position using SVI, debits DUSDC, and credits position units.' },
                { line: 6, explanation: 'typeArguments: [DUSDC_TYPE] tells the generic function which coin type to use for payment.' },
                { line: 8, explanation: 'PREDICT_ID: the main protocol object. Contains the vault that takes the other side of the trade and the pricing/risk configs.' },
                { line: 9, explanation: 'managerId: your PredictManager. The cost is debited from its DUSDC balance and position units are credited to its table.' },
                { line: 10, explanation: 'oracleId: identifies which market. Must have status "active" or the transaction aborts.' },
                { line: 11, explanation: 'rangeKey: the position identifier built with range_key::new. Encodes oracle + expiry + direction + strike.' },
                { line: 12, explanation: 'quantity: how many units to mint. Each unit costs the SVI fair price (0 to 1 DUSDC) plus fees.' },
                { line: 13, explanation: 'CLOCK_ID (0x6): Sui system clock. Used to verify the oracle hasn\'t expired — mint fails if current time > expiry.' },
              ],
            },
          },
        },
        {
          title: 'Complete mintPositionTx Function',
          content: 'Here is the full function that combines RangeKey creation and mint into a single Programmable Transaction Block. Both operations execute atomically — if either fails, the entire transaction reverts.',
          emoji: '📦',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function mintPositionTx(
  managerId: string,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  const tx = new Transaction();

  // Step 1: Determine sentinel bounds
  const lower  = direction === 'DOWN' ? NEG_INF : strike;
  const higher = direction === 'DOWN' ? strike  : POS_INF;

  // Step 2: Build the RangeKey on-chain
  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId),
      tx.pure.u64(expiry),
      tx.pure.u128(lower),
      tx.pure.u128(higher),
    ],
  });

  // Step 3: Mint the position
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::mint\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID),
      tx.object(managerId),
      tx.object(oracleId),
      rangeKey,
      tx.pure.u64(quantity),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}`,
              highlights: [
                { line: 1, explanation: 'The function accepts all parameters needed to fully describe a trade: manager, oracle, direction, strike, and quantity.' },
                { line: 12, explanation: 'Sentinel assignment in one line: DOWN uses NEG_INF as lower, UP uses the strike as lower.' },
                { line: 16, explanation: 'RangeKey is created first. Its return value (rangeKey) is a transaction result reference — not yet executed.' },
                { line: 27, explanation: 'The mint call references rangeKey from step 2. In a PTB, results from earlier calls can be passed to later calls.' },
                { line: 39, explanation: 'The returned Transaction contains both calls. When signed and submitted, they execute atomically in order.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-predict-002',
    },
    {
      sectionTitle: 'Atomic Operations',
      slides: [
        {
          title: 'Deposit + Mint in One PTB',
          content: 'The real power of Sui PTBs is composability. You can merge multiple DUSDC coin objects, split an exact deposit amount, deposit into your manager, build a RangeKey, and mint a position — all in one atomic transaction.',
          emoji: '🔗',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function depositAndMintTx(
  managerId: string,
  coinIds: string[],       // User may have multiple DUSDC objects
  depositAmount: number,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  const tx = new Transaction();

  // Step 1: Merge all DUSDC coin objects into one
  const primaryCoin = tx.object(coinIds[0]);
  if (coinIds.length > 1) {
    tx.mergeCoins(
      primaryCoin,
      coinIds.slice(1).map(id => tx.object(id))
    );
  }

  // Step 2: Split exact deposit amount
  const [depositCoin] = tx.splitCoins(primaryCoin, [depositAmount]);

  // Step 3: Deposit into manager
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [tx.object(managerId), depositCoin],
  });

  // Step 4: Build RangeKey
  const lower  = direction === 'DOWN' ? NEG_INF : strike;
  const higher = direction === 'DOWN' ? strike  : POS_INF;
  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId), tx.pure.u64(expiry),
      tx.pure.u128(lower), tx.pure.u128(higher),
    ],
  });

  // Step 5: Mint position
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::mint\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID), tx.object(managerId),
      tx.object(oracleId), rangeKey,
      tx.pure.u64(quantity), tx.object(CLOCK_ID),
    ],
  });

  return tx;
}`,
              highlights: [
                { line: 3, explanation: 'Users often have multiple DUSDC coin objects from different transfers. We must merge them before splitting.' },
                { line: 16, explanation: 'mergeCoins combines all coin objects into the primary coin. After this, primaryCoin holds the total balance.' },
                { line: 23, explanation: 'splitCoins extracts exactly depositAmount from the merged coin. The remainder stays in primaryCoin.' },
                { line: 26, explanation: 'All five steps execute atomically: if the mint fails (e.g., insufficient balance), the deposit also reverts.' },
                { line: 53, explanation: 'One transaction, one signature, one gas payment. This is significantly cheaper than separate transactions.' },
              ],
            },
          },
        },
        {
          title: 'Coin Management Patterns',
          content: 'Handling coin objects correctly is one of the most important patterns in Sui development. PTBs give you powerful primitives for managing coins within a single atomic operation.',
          emoji: '🪙',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'mergeCoins', content: 'Combines multiple coin objects of the same type into one. Essential because users accumulate many small coin objects from transfers, airdrops, and change. Always merge before splitting to ensure sufficient balance.' },
                { label: 'splitCoins', content: 'Creates a new coin with an exact amount from a larger coin. The original coin retains the remainder. Use this to prepare exact payment amounts for deposits and direct transfers.' },
                { label: 'Atomic PTB Operations', content: 'Sui PTBs execute all operations atomically — either all succeed or all revert. This means deposit + mint in one PTB is safer than two separate transactions. No risk of depositing but failing to mint.' },
                { label: 'Gas Optimization', content: 'Fewer transactions = less gas. A combined deposit+mint PTB costs less than separate deposit and mint transactions because you pay the base transaction fee only once.' },
              ],
            },
          },
        },
        {
          title: 'Redeeming Positions',
          content: 'After an oracle settles, winning positions can be redeemed for 1 DUSDC each. The redeem transaction follows the same pattern as mint. For settled oracles, anyone can trigger redemption using redeem_permissionless.',
          emoji: '💸',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function redeemPositionTx(
  managerId: string,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  const tx = new Transaction();

  // Build the RangeKey (same as mint)
  const lower  = direction === 'DOWN' ? NEG_INF : strike;
  const higher = direction === 'DOWN' ? strike  : POS_INF;
  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId), tx.pure.u64(expiry),
      tx.pure.u128(lower), tx.pure.u128(higher),
    ],
  });

  // Redeem: credits DUSDC back to manager if in-the-money
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::redeem\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID),
      tx.object(managerId),
      tx.object(oracleId),
      rangeKey,
      tx.pure.u64(quantity),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}

// For settled oracles, anyone can trigger redemption
// No operator capability needed
function redeemPermissionlessTx(
  managerId: string,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  const tx = new Transaction();
  // ... same RangeKey construction ...
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::redeem_permissionless\`,
    // Same typeArguments and arguments as redeem
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID), tx.object(managerId),
      tx.object(oracleId), /* rangeKey */, tx.pure.u64(quantity),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
}`,
              highlights: [
                { line: 11, explanation: 'RangeKey construction is identical for redeem and mint — you need to identify which position to redeem.' },
                { line: 23, explanation: 'predict::redeem can be called on active oracles for early exit (redeem_live) or on settled oracles for payout.' },
                { line: 31, explanation: 'quantity is how many position units to redeem. In-the-money positions credit 1 DUSDC per unit to the manager.' },
                { line: 41, explanation: 'redeem_permissionless works only on settled oracles. It does not require operator approval — anyone can trigger it.' },
                { line: 50, explanation: 'redeem_permissionless has the same arguments as redeem. The difference is authorization: no capability check needed post-settlement.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-predict-003',
    },
  ],

  quiz: [
    {
      question: 'Which module\'s function creates a PredictManager?',
      options: [
        'predict::create_manager',
        'predict_manager::new',
        'registry::create_and_share_manager',
        'range_key::create_manager',
      ],
      correctAnswer: 2,
      explanation: 'The registry module provides create_and_share_manager. This function creates a new PredictManager (wrapping a BalanceManager) and shares it as a shared object. It is called via the Registry shared object.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What does splitCoins do in a deposit transaction?',
      options: [
        'Splits a coin into random-sized pieces',
        'Creates a new coin with exact amount from a larger coin',
        'Destroys the coin and creates two new ones',
        'Transfers half the coin to the manager',
      ],
      correctAnswer: 1,
      explanation: 'splitCoins creates a new coin object with an exact specified amount, deducted from the source coin. The source retains the remainder. This is essential for preparing precise deposit amounts.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What is the CLOCK_ID (0x6) used for in the mint transaction?',
      options: [
        'Setting the transaction timestamp',
        'Measuring gas consumption time',
        'Verifying the oracle hasn\'t expired',
        'Scheduling future redemptions',
      ],
      correctAnswer: 2,
      explanation: 'CLOCK_ID (0x6) is Sui\'s immutable system clock. In the mint transaction, it is used to check that the current time has not passed the oracle\'s expiry. If the oracle is expired, the mint transaction aborts.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'Why merge coins before depositing?',
      options: [
        'To reduce the number of objects in the transaction',
        'Merging is required by the Move type system',
        'User may have multiple DUSDC coin objects that need combining',
        'To convert between different coin types',
      ],
      correctAnswer: 2,
      explanation: 'Users often accumulate multiple coin objects of the same type from transfers, airdrops, and change. Merging combines them into one object so you can split the exact deposit amount from the full balance.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What\'s the advantage of deposit + mint in one PTB?',
      options: [
        'It\'s the only way Sui allows deposits',
        'Atomic execution — both succeed or both fail, and it saves gas',
        'It bypasses oracle expiry checks',
        'It gives a better price on the mint',
      ],
      correctAnswer: 1,
      explanation: 'A single PTB with deposit + mint is atomic: if the mint fails, the deposit also reverts, so your funds are never stuck in the manager without a position. It also saves gas by paying the base transaction fee only once.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Building Trading Transactions — Practice
// Construct Sui PTBs for DeepBook Predict operations.

// ─── Stub: Minimal Transaction class for practice ───
class Transaction {
  private calls: { target: string; typeArgs?: string[]; args: unknown[] }[] = [];
  private splits: { coin: unknown; amount: unknown }[] = [];
  private merges: { dest: unknown; sources: unknown[] }[] = [];

  object(id: string) { return { kind: 'object', id }; }
  pure = {
    u64: (v: number | string) => ({ kind: 'pure', type: 'u64', value: v }),
    u128: (v: string) => ({ kind: 'pure', type: 'u128', value: v }),
  };

  moveCall(params: {
    target: string;
    typeArguments?: string[];
    arguments?: unknown[];
  }) {
    this.calls.push({
      target: params.target,
      typeArgs: params.typeArguments,
      args: params.arguments || [],
    });
    return { kind: 'result', index: this.calls.length - 1 };
  }

  splitCoins(coin: unknown, amounts: unknown[]) {
    this.splits.push({ coin, amount: amounts[0] });
    return [{ kind: 'split-result', index: this.splits.length - 1 }];
  }

  mergeCoins(dest: unknown, sources: unknown[]) {
    this.merges.push({ dest, sources });
  }

  getCalls() { return this.calls; }
  getSplits() { return this.splits; }
  getMerges() { return this.merges; }
}

// ─── Constants ───
const PACKAGE_ID  = '0xf5ea2b_EXAMPLE_5138';
const REGISTRY_ID = '0x43af14_EXAMPLE_e64';
const PREDICT_ID  = '0xc87362_EXAMPLE_028a';
const DUSDC_TYPE  = '0xe950_EXAMPLE::dusdc::DUSDC';
const CLOCK_ID    = '0x6';
const NEG_INF     = '0';
const POS_INF     = '18446744073709551615';

// ─── TODO 1: Create Manager Transaction ───
// Build a PTB that calls registry::create_and_share_manager
// with the REGISTRY_ID as the only argument.
function createManagerTx(): Transaction {
  // Your code here
}

// ─── TODO 2: Deposit DUSDC Transaction ───
// Build a PTB that:
//   1. Splits exact 'amount' from the coin at 'coinId'
//   2. Calls predict_manager::deposit with DUSDC_TYPE as typeArgument
//      passing managerId and the split coin as arguments
function depositTx(
  managerId: string,
  coinId: string,
  amount: number
): Transaction {
  // Your code here
}

// ─── TODO 3: Build Range Key Arguments ───
// Given a direction ('UP' or 'DOWN') and a strike price string,
// return an object { lower: string, higher: string } with the
// correct sentinel values.
// DOWN → lower = NEG_INF, higher = strike
// UP   → lower = strike,  higher = POS_INF
function buildRangeKeyArgs(
  direction: 'UP' | 'DOWN',
  strike: string
): { lower: string; higher: string } {
  // Your code here
}

// ─── TODO 4: Mint Position Transaction ───
// Build a PTB that:
//   1. Uses buildRangeKeyArgs to get lower/higher
//   2. Calls range_key::new with oracleId, expiry, lower, higher
//   3. Calls predict::mint with PREDICT_ID, managerId, oracleId,
//      the rangeKey result, quantity, and CLOCK_ID
//      (typeArguments: [DUSDC_TYPE])
function mintPositionTx(
  managerId: string,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  // Your code here
}`,

  solution: `// Building Trading Transactions — Solution

class Transaction {
  private calls: { target: string; typeArgs?: string[]; args: unknown[] }[] = [];
  private splits: { coin: unknown; amount: unknown }[] = [];
  private merges: { dest: unknown; sources: unknown[] }[] = [];

  object(id: string) { return { kind: 'object', id }; }
  pure = {
    u64: (v: number | string) => ({ kind: 'pure', type: 'u64', value: v }),
    u128: (v: string) => ({ kind: 'pure', type: 'u128', value: v }),
  };

  moveCall(params: {
    target: string;
    typeArguments?: string[];
    arguments?: unknown[];
  }) {
    this.calls.push({
      target: params.target,
      typeArgs: params.typeArguments,
      args: params.arguments || [],
    });
    return { kind: 'result', index: this.calls.length - 1 };
  }

  splitCoins(coin: unknown, amounts: unknown[]) {
    this.splits.push({ coin, amount: amounts[0] });
    return [{ kind: 'split-result', index: this.splits.length - 1 }];
  }

  mergeCoins(dest: unknown, sources: unknown[]) {
    this.merges.push({ dest, sources });
  }

  getCalls() { return this.calls; }
  getSplits() { return this.splits; }
  getMerges() { return this.merges; }
}

const PACKAGE_ID  = '0xf5ea2b_EXAMPLE_5138';
const REGISTRY_ID = '0x43af14_EXAMPLE_e64';
const PREDICT_ID  = '0xc87362_EXAMPLE_028a';
const DUSDC_TYPE  = '0xe950_EXAMPLE::dusdc::DUSDC';
const CLOCK_ID    = '0x6';
const NEG_INF     = '0';
const POS_INF     = '18446744073709551615';

// TODO 1: Create Manager Transaction
function createManagerTx(): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: \`\${PACKAGE_ID}::registry::create_and_share_manager\`,
    arguments: [
      tx.object(REGISTRY_ID),
    ],
  });

  return tx;
}

// TODO 2: Deposit DUSDC Transaction
function depositTx(
  managerId: string,
  coinId: string,
  amount: number
): Transaction {
  const tx = new Transaction();

  const [depositCoin] = tx.splitCoins(
    tx.object(coinId),
    [amount]
  );

  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict_manager::deposit\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(managerId),
      depositCoin,
    ],
  });

  return tx;
}

// TODO 3: Build Range Key Arguments
function buildRangeKeyArgs(
  direction: 'UP' | 'DOWN',
  strike: string
): { lower: string; higher: string } {
  if (direction === 'DOWN') {
    return { lower: NEG_INF, higher: strike };
  }
  return { lower: strike, higher: POS_INF };
}

// TODO 4: Mint Position Transaction
function mintPositionTx(
  managerId: string,
  oracleId: string,
  expiry: number,
  direction: 'UP' | 'DOWN',
  strike: string,
  quantity: number
): Transaction {
  const tx = new Transaction();

  const { lower, higher } = buildRangeKeyArgs(direction, strike);

  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId),
      tx.pure.u64(expiry),
      tx.pure.u128(lower),
      tx.pure.u128(higher),
    ],
  });

  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::mint\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID),
      tx.object(managerId),
      tx.object(oracleId),
      rangeKey,
      tx.pure.u64(quantity),
      tx.object(CLOCK_ID),
    ],
  });

  return tx;
}`,

  hints: [
    'For createManagerTx: create a new Transaction, call tx.moveCall with target `${PACKAGE_ID}::registry::create_and_share_manager` and pass tx.object(REGISTRY_ID) as the single argument.',
    'For depositTx: use tx.splitCoins(tx.object(coinId), [amount]) to get a depositCoin, then tx.moveCall predict_manager::deposit with typeArguments [DUSDC_TYPE] and arguments [tx.object(managerId), depositCoin].',
    'For buildRangeKeyArgs: if direction is DOWN, return { lower: NEG_INF, higher: strike }. If UP, return { lower: strike, higher: POS_INF }.',
    'For mintPositionTx: call buildRangeKeyArgs first, then tx.moveCall range_key::new to create the rangeKey, then tx.moveCall predict::mint passing [PREDICT_ID, managerId, oracleId, rangeKey, quantity, CLOCK_ID].',
  ],
};
