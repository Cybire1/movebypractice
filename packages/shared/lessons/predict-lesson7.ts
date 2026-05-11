import { LessonContent } from '../types/lesson';

export const predictLesson7: LessonContent = {
  id: 'predict-7',
  title: 'Portfolio & P&L',
  description: 'Master position tracking, unrealized and realized P&L calculation, settlement outcomes, and redemption mechanics on DeepBook Predict. Build functions that decode positions, compute profit and loss, determine settlement payouts, and summarize portfolio state.',
  difficulty: 'advanced',
  xpReward: 350,
  order: 7,
  language: 'typescript',
  prerequisiteLessons: ['predict-6'],

  narrative: {
    welcomeMessage: "You can build transactions and price options. But trading is only half the story -- you need to know whether you're winning or losing. In this lesson you'll learn to track positions, calculate P&L in real time, and understand exactly what happens when an oracle settles.",
    quizTransition: "You've seen how positions flow from active to settled, how unrealized and realized P&L are computed, and how settlement determines payouts. Let's test your understanding.",
    practiceTransition: "Time to implement the core portfolio engine. You'll build four functions: computing unrealized P&L from live positions, checking in-the-money status at settlement, calculating settlement payouts, and aggregating realized P&L from trade history.",
    celebrationMessage: "Excellent work! You now have a complete portfolio engine -- position tracking, real-time P&L, settlement logic, and trade history aggregation. These are the building blocks of any serious trading dashboard.",
    nextLessonTease: "Next: integrating everything into a live trading UI with wallet connection, real-time price feeds, and transaction execution.",
  },

  teachingSections: [
    {
      sectionTitle: 'Position Tracking',
      slides: [
        {
          title: 'PositionData Interface',
          content: 'Every open position on DeepBook Predict is represented by a PositionData object. It stores the oracle it belongs to, the expiry timestamp, the lower and higher strike bounds (which encode direction via sentinel values), the quantity in micro-DUSDC units, and the entry price scaled by FLOAT_SCALING.',
          emoji: '📊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// FLOAT_SCALING = 1_000_000_000 (1e9)
// Sentinel values for direction encoding
const NEG_INF = '0';
const POS_INF = '18446744073709551615'; // 2^64 - 1

interface PositionData {
  oracle_id: string;       // ID of the OracleSVI this position belongs to
  expiry: number;          // Unix timestamp (ms) when the oracle expires
  lower_strike: string;    // Lower bound — NEG_INF for DOWN, strike for UP
  higher_strike: string;   // Upper bound — strike for DOWN, POS_INF for UP
  quantity: string;        // Position size in micro-DUSDC (string to handle u64)
  entry_price: number;     // Price paid per unit, scaled by FLOAT_SCALING (1e9)
}

// Example DOWN position at strike 60000:
// lower_strike = '0' (NEG_INF), higher_strike = '60000000000000'
// Example UP position at strike 60000:
// lower_strike = '60000000000000', higher_strike = '18446744073709551615' (POS_INF)`,
              highlights: [
                { line: 1, explanation: 'FLOAT_SCALING (1e9) converts between human-readable prices (0.0 to 1.0) and on-chain integer representation. An entry_price of 500_000_000 means 0.50 DUSDC.' },
                { line: 7, explanation: 'oracle_id links the position to a specific market (e.g., BTC-30MAY25). All positions on the same oracle share the same settlement price.' },
                { line: 8, explanation: 'expiry is the Unix timestamp when this oracle stops accepting new trades. After expiry, the oracle enters settlement.' },
                { line: 9, explanation: 'lower_strike: if this is NEG_INF (0), the position is a DOWN bet. If it holds the actual strike value, the position is UP.' },
                { line: 10, explanation: 'higher_strike: if this is POS_INF (2^64-1), the position is an UP bet. If it holds the actual strike value, the position is DOWN.' },
                { line: 11, explanation: 'quantity is a string because it represents a u64 on-chain. Parse it with BigInt or parseInt for calculations.' },
                { line: 12, explanation: 'entry_price is the SVI fair price at the time of minting, scaled by 1e9. Divide by FLOAT_SCALING to get the 0-to-1 price.' },
              ],
            },
          },
        },
        {
          title: 'Position Lifecycle',
          content: 'A position moves through distinct lifecycle stages from the moment it is minted until the user claims their payout. Understanding this lifecycle is essential for building accurate portfolio views.',
          emoji: '🔄',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Active', content: 'The position is live and the oracle has not expired. The holder can call redeem_live to exit early at the current SVI price (minus a fee). Unrealized P&L fluctuates with the SVI curve.' },
                { label: 'Pending Settlement', content: 'The oracle has expired but has not yet been settled by the operator. No new trades can be made. Positions cannot be redeemed until settlement occurs. The final settlement price is not yet known.' },
                { label: 'Settled', content: 'The operator has published the settlement price. Each position now has a deterministic payout: 1 DUSDC per unit if in-the-money, 0 if not. Anyone can call redeem_permissionless to trigger the payout.' },
                { label: 'Expired / Claimed', content: 'The position has been redeemed. The DUSDC payout (if any) has been credited back to the manager\'s trading balance. The position quantity drops to zero and can be cleaned up.' },
              ],
            },
          },
        },
        {
          title: 'Direction Detection',
          content: 'Since direction is encoded via sentinel values in lower_strike and higher_strike, you need utility functions to decode it. getPositionDirection checks which bound is a sentinel. getPositionStrike extracts the meaningful strike value from the non-sentinel bound.',
          emoji: '🧭',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const NEG_INF = '0';
const POS_INF = '18446744073709551615';

type Direction = 'UP' | 'DOWN' | 'RANGE';

function getPositionDirection(
  lower_strike: string,
  higher_strike: string
): Direction {
  if (lower_strike === NEG_INF && higher_strike !== POS_INF) {
    return 'DOWN';
  }
  if (higher_strike === POS_INF && lower_strike !== NEG_INF) {
    return 'UP';
  }
  // Both bounds are real values — this is a RANGE position
  return 'RANGE';
}

function getPositionStrike(
  lower_strike: string,
  higher_strike: string
): string {
  const direction = getPositionDirection(lower_strike, higher_strike);
  if (direction === 'DOWN') {
    // For DOWN, higher_strike IS the strike price
    return higher_strike;
  }
  if (direction === 'UP') {
    // For UP, lower_strike IS the strike price
    return lower_strike;
  }
  // For RANGE, return both bounds formatted
  return \`\${lower_strike}-\${higher_strike}\`;
}`,
              highlights: [
                { line: 6, explanation: 'getPositionDirection examines the sentinel values. DOWN has NEG_INF as lower, UP has POS_INF as higher.' },
                { line: 10, explanation: 'DOWN check: lower is NEG_INF (0) and higher is a real value (the strike). This means "pays if settlement < strike."' },
                { line: 13, explanation: 'UP check: higher is POS_INF and lower is a real value (the strike). This means "pays if settlement >= strike."' },
                { line: 17, explanation: 'RANGE: neither bound is a sentinel. The position pays if settlement falls within [lower, higher). This is a band bet.' },
                { line: 26, explanation: 'For DOWN, the meaningful strike is in higher_strike — the ceiling below which the position is in-the-money.' },
                { line: 30, explanation: 'For UP, the meaningful strike is in lower_strike — the floor above which the position is in-the-money.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'op-predict-001',
    },
    {
      sectionTitle: 'P&L Calculation',
      slides: [
        {
          title: 'Unrealized P&L',
          content: 'Unrealized P&L tells a trader how much they would gain or lose if they exited their position right now. For a live position, you decode the direction and strike, look up the current SVI price for that strike, invert for DOWN positions (price = 1 - sviPrice), and compute (currentPrice - entryPrice) * quantity.',
          emoji: '📈',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const FLOAT_SCALING = 1_000_000_000; // 1e9

function computePositionPnL(
  position: PositionData,
  currentSviPrice: number // raw SVI price for this strike (0 to FLOAT_SCALING)
): PositionPnL {
  const direction = getPositionDirection(
    position.lower_strike,
    position.higher_strike
  );
  const strike = getPositionStrike(
    position.lower_strike,
    position.higher_strike
  );

  // For DOWN positions, invert the SVI price
  // SVI gives the UP price; DOWN price = 1 - UP price
  let currentPrice = currentSviPrice;
  if (direction === 'DOWN') {
    currentPrice = FLOAT_SCALING - currentSviPrice;
  }

  const entryPrice = position.entry_price;
  const quantity = parseInt(position.quantity);

  // Unrealized P&L = (currentPrice - entryPrice) * quantity / FLOAT_SCALING
  const unrealizedPnL =
    ((currentPrice - entryPrice) * quantity) / FLOAT_SCALING;

  const unrealizedPnLPct =
    entryPrice > 0
      ? ((currentPrice - entryPrice) / entryPrice) * 100
      : 0;

  return {
    oracleId: position.oracle_id,
    direction,
    strike,
    quantity,
    entryPrice: entryPrice / FLOAT_SCALING,
    currentPrice: currentPrice / FLOAT_SCALING,
    unrealizedPnL,
    unrealizedPnLPct,
  };
}`,
              highlights: [
                { line: 3, explanation: 'computePositionPnL takes a PositionData and the current SVI price for this strike. It returns a fully decoded PositionPnL object.' },
                { line: 5, explanation: 'currentSviPrice is the raw SVI output (0 to 1e9). This is the UP probability. It must be inverted for DOWN positions.' },
                { line: 19, explanation: 'Key insight: SVI always outputs the UP price. For a DOWN position, the fair price is (1 - sviPrice) because DOWN and UP are complementary bets.' },
                { line: 27, explanation: 'Unrealized P&L formula: (currentPrice - entryPrice) * quantity, divided by FLOAT_SCALING to convert from scaled integers to DUSDC.' },
                { line: 30, explanation: 'Percentage P&L: ((current - entry) / entry) * 100. Guard against division by zero when entryPrice is 0.' },
              ],
            },
          },
        },
        {
          title: 'PositionPnL Interface',
          content: 'The PositionPnL interface provides a fully decoded, human-readable view of a position\'s profit and loss. It converts all on-chain scaled values to standard numbers and includes both absolute and percentage P&L.',
          emoji: '📋',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface PositionPnL {
  oracleId: string;        // Which oracle/market
  direction: Direction;    // 'UP' | 'DOWN' | 'RANGE'
  strike: string;          // Decoded strike price
  quantity: number;        // Number of position units
  entryPrice: number;      // Price paid (0.0 to 1.0, already divided by FLOAT_SCALING)
  currentPrice: number;    // Current fair value (0.0 to 1.0)
  unrealizedPnL: number;   // Absolute P&L in DUSDC
  unrealizedPnLPct: number;// Percentage gain/loss
}

// Example:
// Bought 100 UP units at entry 0.40, current SVI says 0.65
// unrealizedPnL  = (0.65 - 0.40) * 100 = 25 DUSDC
// unrealizedPnLPct = ((0.65 - 0.40) / 0.40) * 100 = 62.5%

// Bought 50 DOWN units at entry 0.35, current SVI (UP) = 0.70
// DOWN currentPrice = 1 - 0.70 = 0.30
// unrealizedPnL  = (0.30 - 0.35) * 50 = -2.5 DUSDC
// unrealizedPnLPct = ((0.30 - 0.35) / 0.35) * 100 = -14.29%`,
              highlights: [
                { line: 1, explanation: 'PositionPnL is the output of computePositionPnL. It bundles everything a dashboard needs to display a position row.' },
                { line: 6, explanation: 'entryPrice is already converted to the 0-1 range. No need to divide by FLOAT_SCALING again in the UI.' },
                { line: 7, explanation: 'currentPrice is the current fair value. For UP it comes directly from SVI. For DOWN it is 1 - sviPrice.' },
                { line: 8, explanation: 'unrealizedPnL is in DUSDC units. Positive means profit, negative means loss. This is what you would realize by exiting now.' },
                { line: 14, explanation: 'Example: 100 UP units bought at 0.40, now worth 0.65 each. Unrealized gain of 25 DUSDC total (62.5% return).' },
                { line: 18, explanation: 'DOWN example: SVI says UP = 0.70, so DOWN = 0.30. Entry was 0.35, so position is underwater by 2.5 DUSDC (-14.29%).' },
              ],
            },
          },
        },
        {
          title: 'Realized P&L from Trades',
          content: 'Realized P&L comes from completed round trips: you minted (bought) at one price and redeemed (sold) at another. The TradeData interface captures each side of the trade, and realized P&L is the sum of (redeem_price - mint_price) * quantity across all matched pairs.',
          emoji: '💰',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface TradeData {
  oracle_id: string;       // Which market
  manager_id: string;      // Which manager executed the trade
  side: 'mint' | 'redeem'; // Mint = buy, Redeem = sell/settle
  lower_strike: string;    // RangeKey lower bound
  higher_strike: string;   // RangeKey upper bound
  quantity: string;         // Units traded (string for u64)
  price: number;           // Execution price (FLOAT_SCALING)
  timestamp: number;       // When the trade occurred (Unix ms)
}

// Realized P&L from a matched pair:
// realized = (redeem_price - mint_price) * quantity / FLOAT_SCALING
//
// Example: minted 100 units at price 0.40, redeemed at 0.75
// realized = (0.75 - 0.40) * 100 = 35 DUSDC profit
//
// Example: minted 50 units at price 0.60, redeemed at 0.20
// realized = (0.20 - 0.60) * 50 = -20 DUSDC loss

function computeRealizedPnL(trades: TradeData[]): number {
  const mints = trades.filter(t => t.side === 'mint');
  const redeems = trades.filter(t => t.side === 'redeem');

  let realizedPnL = 0;
  for (const redeem of redeems) {
    // Find matching mint (same oracle, same strikes)
    const mint = mints.find(m =>
      m.oracle_id === redeem.oracle_id &&
      m.lower_strike === redeem.lower_strike &&
      m.higher_strike === redeem.higher_strike
    );
    if (mint) {
      const qty = parseInt(redeem.quantity);
      realizedPnL +=
        ((redeem.price - mint.price) * qty) / FLOAT_SCALING;
    }
  }
  return realizedPnL;
}`,
              highlights: [
                { line: 1, explanation: 'TradeData records a single trade event. Every mint or redeem produces one TradeData entry in the trade history.' },
                { line: 4, explanation: 'side indicates whether this was a mint (buying a position) or a redeem (selling/settling). Realized P&L requires both sides.' },
                { line: 8, explanation: 'price is the execution price scaled by FLOAT_SCALING. For mints this is the SVI price; for redeems it is the exit or settlement price.' },
                { line: 13, explanation: 'Realized P&L formula: (redeem_price - mint_price) * quantity / FLOAT_SCALING. Positive = profit, negative = loss.' },
                { line: 21, explanation: 'computeRealizedPnL separates trades into mints and redeems, then matches them by oracle_id and strike bounds.' },
                { line: 28, explanation: 'Matching logic: a redeem is paired with a mint on the same oracle with the same lower_strike and higher_strike.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-predict-004',
    },
    {
      sectionTitle: 'Settlement & Redemption',
      slides: [
        {
          title: 'Settlement Outcomes',
          content: 'When an oracle settles, each position type resolves to either 1 DUSDC (in-the-money) or 0 DUSDC (out-of-the-money). The outcome depends on the direction and whether the settlement price meets the strike condition.',
          emoji: '🎯',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'up-above', label: 'UP, settlement >= strike', emoji: '📈' },
                { id: 'up-below', label: 'UP, settlement < strike', emoji: '📉' },
                { id: 'down-above', label: 'DOWN, settlement >= strike', emoji: '📈' },
                { id: 'down-below', label: 'DOWN, settlement < strike', emoji: '📉' },
                { id: 'range-in', label: 'RANGE, settlement in [lower, higher)', emoji: '🎯' },
                { id: 'range-out', label: 'RANGE, settlement outside band', emoji: '❌' },
              ],
              targets: [
                { id: 'payout-1', label: '1 DUSDC per unit (in-the-money)' },
                { id: 'payout-0', label: '0 DUSDC per unit (out-of-the-money)' },
              ],
              correctPairs: [
                { itemId: 'up-above', targetId: 'payout-1' },
                { itemId: 'up-below', targetId: 'payout-0' },
                { itemId: 'down-above', targetId: 'payout-0' },
                { itemId: 'down-below', targetId: 'payout-1' },
                { itemId: 'range-in', targetId: 'payout-1' },
                { itemId: 'range-out', targetId: 'payout-0' },
              ],
            },
          },
        },
        {
          title: 'Redeem Transactions',
          content: 'There are two redemption paths: redeem_live for active positions (early exit at the current SVI price minus a fee) and redeem_permissionless for settled positions (anyone can trigger, zero fee, deterministic 0-or-1 payout).',
          emoji: '💸',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// ─── Live Redemption (early exit) ───
// Position is active, oracle not yet expired.
// Payout = current SVI price * quantity (minus protocol fee)
function redeemPositionTx(
  managerId: string, oracleId: string,
  expiry: number, direction: 'UP' | 'DOWN',
  strike: string, quantity: number
): Transaction {
  const tx = new Transaction();
  const { lower, higher } = buildRangeKeyArgs(direction, strike);
  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId), tx.pure.u64(expiry),
      tx.pure.u128(lower), tx.pure.u128(higher),
    ],
  });
  // redeem_live: exits at current SVI fair value, fee deducted
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::redeem_live\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(PREDICT_ID), tx.object(managerId),
      tx.object(oracleId), rangeKey,
      tx.pure.u64(quantity), tx.object(CLOCK_ID),
    ],
  });
  return tx;
}

// ─── Permissionless Redemption (post-settlement) ───
// Oracle has been settled. Payout is deterministic.
// Anyone can call this — no capability or owner check.
function redeemPermissionlessTx(
  managerId: string, oracleId: string,
  expiry: number, direction: 'UP' | 'DOWN',
  strike: string, quantity: number
): Transaction {
  const tx = new Transaction();
  const { lower, higher } = buildRangeKeyArgs(direction, strike);
  const rangeKey = tx.moveCall({
    target: \`\${PACKAGE_ID}::range_key::new\`,
    arguments: [
      tx.object(oracleId), tx.pure.u64(expiry),
      tx.pure.u128(lower), tx.pure.u128(higher),
    ],
  });
  // redeem_permissionless: no fee, no owner check, deterministic payout
  tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::redeem_permissionless\`,
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
                { line: 4, explanation: 'redeemPositionTx builds a live redemption (early exit). The position must still be active (oracle not expired).' },
                { line: 18, explanation: 'redeem_live exits at the current SVI fair value minus a protocol fee. This is how traders take profit or cut losses before expiry.' },
                { line: 34, explanation: 'redeemPermissionlessTx works only after the oracle has been settled. The payout is fixed: 1 if in-the-money, 0 otherwise.' },
                { line: 48, explanation: 'redeem_permissionless has no fee and no owner check. Anyone can trigger settlement redemption for any manager, enabling automated settlement bots.' },
              ],
            },
          },
        },
        {
          title: 'Portfolio Summary',
          content: 'The ManagerSummaryData interface aggregates all of a manager\'s financial data into a single object: trading balance, realized and unrealized P&L, total account value, and count of open positions. This is the data model behind every portfolio dashboard.',
          emoji: '📊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface ManagerSummaryData {
  manager_id: string;      // On-chain PredictManager object ID
  owner: string;           // Wallet address of the manager owner
  trading_balance: number; // Available DUSDC (not locked in positions)
  realized_pnl: number;    // Sum of all closed-trade P&L
  unrealized_pnl: number;  // Sum of all open-position P&L
  account_value: number;   // trading_balance + unrealized_pnl
  open_positions: number;  // Count of active position entries
}

// Account Value formula:
// account_value = trading_balance + sum(position_value for each open position)
// where position_value = currentPrice * quantity / FLOAT_SCALING

// Example:
// trading_balance  = 500 DUSDC
// 3 open positions worth 120, 85, 45 DUSDC respectively
// unrealized_pnl   = (120 + 85 + 45) - (cost basis) = ...
// account_value    = 500 + 120 + 85 + 45 = 750 DUSDC
// open_positions   = 3`,
              highlights: [
                { line: 1, explanation: 'ManagerSummaryData is the top-level portfolio view. It provides everything needed to render a portfolio dashboard header.' },
                { line: 4, explanation: 'trading_balance is the liquid DUSDC in the manager, available for new trades. It increases on deposits and winning redemptions.' },
                { line: 5, explanation: 'realized_pnl is the cumulative profit/loss from all completed round trips (mint then redeem). It only changes when positions are closed.' },
                { line: 6, explanation: 'unrealized_pnl is the paper profit/loss across all open positions. It fluctuates with SVI prices every time you refresh.' },
                { line: 7, explanation: 'account_value = trading_balance + total unrealized position value. This is the "net liquidation value" of the entire manager.' },
                { line: 8, explanation: 'open_positions: the number of distinct RangeKey entries with non-zero quantity. Used to display position count in the UI.' },
              ],
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'What is the difference between unrealized and realized P&L?',
      options: [
        'Unrealized P&L is for UP positions, realized is for DOWN positions',
        'Unrealized P&L is paper profit/loss on open positions; realized P&L is from completed round trips (mint then redeem)',
        'Unrealized P&L includes fees, realized P&L does not',
        'There is no difference -- they are calculated the same way',
      ],
      correctAnswer: 1,
      explanation: 'Unrealized P&L reflects the current mark-to-market value of open positions relative to their entry price. It fluctuates in real time. Realized P&L is locked in when a position is closed (redeemed): it equals (redeem_price - mint_price) * quantity and never changes after that.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'A DOWN position with strike 60,000 settles and the settlement price is 62,000. What is the payout per unit?',
      options: [
        '1 DUSDC (in-the-money)',
        '0 DUSDC (out-of-the-money)',
        '0.5 DUSDC (partial payout)',
        'The payout depends on the SVI curve at settlement',
      ],
      correctAnswer: 1,
      explanation: 'A DOWN position pays 1 DUSDC when settlement < strike. Here settlement (62,000) >= strike (60,000), so the DOWN position is out-of-the-money and pays 0 DUSDC per unit.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'Why is the SVI price inverted for DOWN positions when computing unrealized P&L?',
      options: [
        'Because DOWN positions have negative quantity',
        'Because SVI outputs the UP probability, and DOWN = 1 - UP since they are complementary binary outcomes',
        'Because DOWN positions use a different pricing model',
        'The inversion is optional -- it only affects the display',
      ],
      correctAnswer: 1,
      explanation: 'The SVI curve always outputs the probability (price) for the UP side of a binary bet. Since UP and DOWN are complementary -- exactly one pays out -- the DOWN price is simply 1 - sviPrice. This inversion is essential for correct P&L calculation.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What is special about redeem_permissionless compared to redeem_live?',
      options: [
        'It can only be called by the manager owner',
        'It charges a higher fee for the convenience',
        'It works only after settlement, has no fee, and anyone can trigger it (no owner check)',
        'It requires operator approval before execution',
      ],
      correctAnswer: 2,
      explanation: 'redeem_permissionless is designed for post-settlement cleanup. Once an oracle is settled, payouts are deterministic (0 or 1), so there is no fee and no owner check -- anyone (including bots) can trigger redemption for any manager. This enables automated settlement.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'In the position lifecycle, when is a position in the "Pending Settlement" state?',
      options: [
        'Immediately after minting, before the first price update',
        'After the oracle expires but before the operator publishes the settlement price',
        'After redemption, while DUSDC is being transferred',
        'When the position has zero quantity remaining',
      ],
      correctAnswer: 1,
      explanation: 'Pending Settlement occurs in the window between oracle expiry and operator settlement. The oracle has stopped accepting trades (expired), but the final settlement price has not yet been published. Positions are frozen -- they cannot be redeemed until the operator settles the oracle.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Portfolio & P&L — Practice
// Implement position tracking, P&L calculation, and settlement logic.

// ─── Constants & Types ───
const FLOAT_SCALING = 1_000_000_000; // 1e9
const NEG_INF = '0';
const POS_INF = '18446744073709551615'; // 2^64 - 1

type Direction = 'UP' | 'DOWN' | 'RANGE';

interface PositionData {
  oracle_id: string;
  expiry: number;
  lower_strike: string;
  higher_strike: string;
  quantity: string;
  entry_price: number;
}

interface PositionPnL {
  oracleId: string;
  direction: Direction;
  strike: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

interface TradeData {
  oracle_id: string;
  manager_id: string;
  side: 'mint' | 'redeem';
  lower_strike: string;
  higher_strike: string;
  quantity: string;
  price: number;
  timestamp: number;
}

// ─── Provided helpers (already implemented) ───
function getPositionDirection(lower: string, higher: string): Direction {
  if (lower === NEG_INF && higher !== POS_INF) return 'DOWN';
  if (higher === POS_INF && lower !== NEG_INF) return 'UP';
  return 'RANGE';
}

function getPositionStrike(lower: string, higher: string): string {
  const dir = getPositionDirection(lower, higher);
  if (dir === 'DOWN') return higher;
  if (dir === 'UP') return lower;
  return \`\${lower}-\${higher}\`;
}

// ─── TODO 1: Compute Unrealized P&L ───
// Given a position and the current SVI price (raw, 0 to FLOAT_SCALING):
// 1. Determine direction using getPositionDirection
// 2. Get strike using getPositionStrike
// 3. For DOWN positions, invert: currentPrice = FLOAT_SCALING - currentSviPrice
//    For UP/RANGE, currentPrice = currentSviPrice
// 4. Parse quantity from string to number
// 5. Compute unrealizedPnL = (currentPrice - entryPrice) * quantity / FLOAT_SCALING
// 6. Compute unrealizedPnLPct = ((currentPrice - entryPrice) / entryPrice) * 100
//    (return 0 if entryPrice is 0)
// 7. Return a PositionPnL object with all values converted (prices divided by FLOAT_SCALING)
function computePositionPnL(
  position: PositionData,
  currentSviPrice: number
): PositionPnL {
  // Your code here
}

// ─── TODO 2: Is Position In The Money ───
// Given a settlement price and position strike bounds, determine
// if the position is in-the-money:
//   UP:    settlementPrice >= strike (lower_strike)
//   DOWN:  settlementPrice < strike (higher_strike)
//   RANGE: lower_strike <= settlementPrice < higher_strike
// All prices are strings representing u128 values — use BigInt for comparison.
function isPositionInTheMoney(
  settlementPrice: string,
  lower_strike: string,
  higher_strike: string
): boolean {
  // Your code here
}

// ─── TODO 3: Compute Settlement Payout ───
// Given a settlement price, position data, return the payout in DUSDC:
//   - If in-the-money: payout = parseInt(position.quantity) (1 DUSDC per unit)
//   - If out-of-the-money: payout = 0
// Use isPositionInTheMoney to determine the outcome.
function computeSettlementPayout(
  settlementPrice: string,
  position: PositionData
): number {
  // Your code here
}

// ─── TODO 4: Compute Realized P&L from Trades ───
// Given an array of TradeData, compute total realized P&L:
// 1. Separate trades into mints and redeems
// 2. For each redeem, find a matching mint with the same
//    oracle_id, lower_strike, and higher_strike
// 3. realized += (redeem.price - mint.price) * parseInt(redeem.quantity) / FLOAT_SCALING
// 4. Return the total realized P&L
function computeRealizedPnL(trades: TradeData[]): number {
  // Your code here
}`,

  solution: `// Portfolio & P&L — Solution

const FLOAT_SCALING = 1_000_000_000;
const NEG_INF = '0';
const POS_INF = '18446744073709551615';

type Direction = 'UP' | 'DOWN' | 'RANGE';

interface PositionData {
  oracle_id: string;
  expiry: number;
  lower_strike: string;
  higher_strike: string;
  quantity: string;
  entry_price: number;
}

interface PositionPnL {
  oracleId: string;
  direction: Direction;
  strike: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

interface TradeData {
  oracle_id: string;
  manager_id: string;
  side: 'mint' | 'redeem';
  lower_strike: string;
  higher_strike: string;
  quantity: string;
  price: number;
  timestamp: number;
}

function getPositionDirection(lower: string, higher: string): Direction {
  if (lower === NEG_INF && higher !== POS_INF) return 'DOWN';
  if (higher === POS_INF && lower !== NEG_INF) return 'UP';
  return 'RANGE';
}

function getPositionStrike(lower: string, higher: string): string {
  const dir = getPositionDirection(lower, higher);
  if (dir === 'DOWN') return higher;
  if (dir === 'UP') return lower;
  return \`\${lower}-\${higher}\`;
}

// TODO 1: Compute Unrealized P&L
function computePositionPnL(
  position: PositionData,
  currentSviPrice: number
): PositionPnL {
  const direction = getPositionDirection(
    position.lower_strike,
    position.higher_strike
  );
  const strike = getPositionStrike(
    position.lower_strike,
    position.higher_strike
  );

  // Invert for DOWN: SVI gives UP price, DOWN = 1 - UP
  let currentPrice = currentSviPrice;
  if (direction === 'DOWN') {
    currentPrice = FLOAT_SCALING - currentSviPrice;
  }

  const entryPrice = position.entry_price;
  const quantity = parseInt(position.quantity);

  // Unrealized P&L in DUSDC
  const unrealizedPnL =
    ((currentPrice - entryPrice) * quantity) / FLOAT_SCALING;

  // Percentage P&L (guard against zero entry)
  const unrealizedPnLPct =
    entryPrice > 0
      ? ((currentPrice - entryPrice) / entryPrice) * 100
      : 0;

  return {
    oracleId: position.oracle_id,
    direction,
    strike,
    quantity,
    entryPrice: entryPrice / FLOAT_SCALING,
    currentPrice: currentPrice / FLOAT_SCALING,
    unrealizedPnL,
    unrealizedPnLPct,
  };
}

// TODO 2: Is Position In The Money
function isPositionInTheMoney(
  settlementPrice: string,
  lower_strike: string,
  higher_strike: string
): boolean {
  const direction = getPositionDirection(lower_strike, higher_strike);
  const settlement = BigInt(settlementPrice);

  if (direction === 'UP') {
    const strike = BigInt(lower_strike);
    return settlement >= strike;
  }

  if (direction === 'DOWN') {
    const strike = BigInt(higher_strike);
    return settlement < strike;
  }

  // RANGE: in-the-money if lower <= settlement < higher
  const lower = BigInt(lower_strike);
  const higher = BigInt(higher_strike);
  return settlement >= lower && settlement < higher;
}

// TODO 3: Compute Settlement Payout
function computeSettlementPayout(
  settlementPrice: string,
  position: PositionData
): number {
  const inTheMoney = isPositionInTheMoney(
    settlementPrice,
    position.lower_strike,
    position.higher_strike
  );

  if (inTheMoney) {
    return parseInt(position.quantity); // 1 DUSDC per unit
  }

  return 0;
}

// TODO 4: Compute Realized P&L from Trades
function computeRealizedPnL(trades: TradeData[]): number {
  const mints = trades.filter(t => t.side === 'mint');
  const redeems = trades.filter(t => t.side === 'redeem');

  let realizedPnL = 0;

  for (const redeem of redeems) {
    const mint = mints.find(m =>
      m.oracle_id === redeem.oracle_id &&
      m.lower_strike === redeem.lower_strike &&
      m.higher_strike === redeem.higher_strike
    );

    if (mint) {
      const qty = parseInt(redeem.quantity);
      realizedPnL +=
        ((redeem.price - mint.price) * qty) / FLOAT_SCALING;
    }
  }

  return realizedPnL;
}`,

  hints: [
    'For computePositionPnL: use getPositionDirection and getPositionStrike to decode the position. If direction is DOWN, set currentPrice = FLOAT_SCALING - currentSviPrice. Then compute unrealizedPnL = (currentPrice - entryPrice) * quantity / FLOAT_SCALING. Divide entryPrice and currentPrice by FLOAT_SCALING for the returned PositionPnL object.',
    'For isPositionInTheMoney: use BigInt to compare string values. UP is in-the-money when settlement >= lower_strike. DOWN is in-the-money when settlement < higher_strike. RANGE is in-the-money when lower <= settlement < higher.',
    'For computeSettlementPayout: call isPositionInTheMoney with the settlement price and the position\'s strike bounds. If true, return parseInt(position.quantity). If false, return 0.',
    'For computeRealizedPnL: filter trades into mints and redeems. For each redeem, find a matching mint with the same oracle_id, lower_strike, and higher_strike. Compute (redeem.price - mint.price) * parseInt(redeem.quantity) / FLOAT_SCALING and add to the running total.',
  ],
};
