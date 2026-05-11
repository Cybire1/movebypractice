import { LessonContent } from '../types/lesson';

export const predictLesson2: LessonContent = {
  id: 'predict-2',
  title: 'Oracle Architecture & Price Feeds',
  description: 'Deep dive into OracleSVI — how oracles store market state, how Pyth Lazer delivers real-time prices, and how strike grids define valid trading levels.',
  difficulty: 'beginner',
  xpReward: 150,
  order: 2,
  language: 'typescript',
  prerequisiteLessons: ['predict-1'],

  narrative: {
    welcomeMessage: "Every prediction market revolves around an oracle. In this lesson, you'll learn the OracleSVI data structure, how price feeds flow from Pyth Lazer to the blockchain, and how strike grids define the set of valid trading levels.",
    quizTransition: "You've explored oracle architecture in depth. Let's test your understanding of OracleSVI, price feeds, and strike grids.",
    practiceTransition: "Time to code! Build functions that work with oracle data, generate strike grids, and filter oracles by status.",
    celebrationMessage: "Excellent! You now understand how oracles power DeepBook Predict markets — from price feeds to strike grids.",
    nextLessonTease: "Next: the SVI pricing model — how five parameters define a volatility smile and compute binary option fair values.",
  },

  teachingSections: [
    {
      sectionTitle: 'The OracleSVI Object',
      slides: [
        {
          title: 'OracleSVI Data Structure',
          content: 'Each market is represented by an OracleSVI shared object on-chain. It stores everything needed to price and settle a market: the underlying asset, expiry timestamp, price data, SVI volatility parameters, and settlement state.',
          emoji: '📊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface OracleData {
  predict_id: string;         // Parent Predict object
  oracle_id: string;          // This oracle's object ID
  oracle_cap_id: string;      // Operator capability ID
  underlying_asset: string;   // e.g., "SUI/USD", "BTC/USD"
  expiry: number;             // Unix timestamp (seconds)
  min_strike: number;         // Lowest valid strike (FLOAT_SCALING)
  tick_size: number;          // Strike spacing (FLOAT_SCALING)
  status: 'active' | 'settled' | 'inactive' | 'pending_settlement';
  activated_at: number;       // When trading started
  settlement_price: number | null;   // Set only after settlement
  settled_at: number | null;         // Timestamp of settlement
  created_checkpoint: number;        // Sui checkpoint at creation
}`,
              highlights: [
                { line: 5, explanation: 'underlying_asset identifies what this market tracks. Common assets: BTC/USD, ETH/USD, SOL/USD, SUI/USD.' },
                { line: 6, explanation: 'expiry is a Unix timestamp in seconds. After this time, no new mints are allowed and the market enters pending_settlement.' },
                { line: 7, explanation: 'min_strike is the lowest valid strike price, encoded with FLOAT_SCALING. All valid strikes are: min_strike + N * tick_size.' },
                { line: 8, explanation: 'tick_size defines the spacing between valid strikes. Smaller tick_size = more granular strike grid.' },
                { line: 9, explanation: 'status drives what operations are allowed. Only active oracles accept mints. Only settled oracles allow payout redemptions.' },
                { line: 11, explanation: 'settlement_price is null until the oracle operator publishes it. This is the price that determines which positions win.' },
              ],
            },
          },
        },
        {
          title: 'Oracle Lifecycle Transitions',
          content: 'Oracles follow a strict state machine. Understanding transitions is critical — calling mint on a non-active oracle will abort the transaction.',
          emoji: '🔄',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'inactive', label: 'Inactive', emoji: '⏸️' },
                { id: 'active', label: 'Active', emoji: '🟢' },
                { id: 'pending', label: 'Pending Settlement', emoji: '⏳' },
                { id: 'settled', label: 'Settled', emoji: '✅' },
              ],
              targets: [
                { id: 't1', label: 'Created but no price data yet' },
                { id: 't2', label: 'Live trading — mints and redeems allowed' },
                { id: 't3', label: 'Expired — waiting for settlement price' },
                { id: 't4', label: 'Final price frozen — payouts available' },
              ],
              correctPairs: [
                { itemId: 'inactive', targetId: 't1' },
                { itemId: 'active', targetId: 't2' },
                { itemId: 'pending', targetId: 't3' },
                { itemId: 'settled', targetId: 't4' },
              ],
            },
          },
        },
        {
          title: 'Oracle Events for Real-Time Data',
          content: 'Oracles emit on-chain events at every state change. Your dApp can subscribe to these events via Sui checkpoint streaming for low-latency updates, or poll the predict-server REST API.',
          emoji: '📡',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'OracleActivated', content: 'Emitted when an oracle transitions from Inactive to Active. Contains the oracle_id and activation timestamp. Start showing this market to users.' },
                { label: 'OraclePricesUpdated', content: 'Emitted on every spot/forward price update from Pyth Lazer. Contains oracle_id, new spot, new forward, and timestamp. Use for real-time price display.' },
                { label: 'OracleSVIUpdated', content: 'Emitted when the SVI volatility parameters (a, b, rho, m, sigma) are updated. These change the fair prices of all positions on this oracle.' },
                { label: 'OracleSettled', content: 'Emitted when the settlement price is published. Contains the final price. All positions can now be evaluated for payout.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-004',
    },
    {
      sectionTitle: 'Price Feeds & Pyth Lazer',
      slides: [
        {
          title: 'Spot, Forward, and Basis',
          content: 'The oracle tracks three related price concepts. Spot is the current market price. Forward is the expected price at expiry. Basis is the ratio forward/spot — it captures carry cost and expected drift.',
          emoji: '💹',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Spot Price', content: 'The current real-time market price from Pyth Lazer oracles. Updated every few seconds. Used for display purposes but NOT directly for option pricing.' },
                { label: 'Forward Price', content: 'forward = spot × basis. This is the market\'s best estimate of where the price will be at expiry. SVI pricing uses forward (not spot) to compute fair values.' },
                { label: 'Basis', content: 'The ratio forward/spot, stored with FLOAT_SCALING. A basis of 1.002 means the market expects 0.2% upward drift by expiry. Basis accounts for funding rates, carry, and expected drift.' },
                { label: 'Staleness', content: 'Prices have staleness thresholds (configured per asset). If a price update is too old, operations may be restricted. This prevents trading on stale data.' },
              ],
            },
          },
        },
        {
          title: 'SVI Parameters',
          content: 'The SVI (Stochastic Volatility Inspired) model uses five parameters to define an implied volatility smile. These are published by Block Scholes (an institutional options analytics firm) and stored directly on the oracle.',
          emoji: '📐',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface SviParams {
  a: number;      // Base variance level (FLOAT_SCALING)
  b: number;      // Slope of the volatility wings (FLOAT_SCALING)
  rho: number;    // Skew — tilts the smile left/right (FLOAT_SCALING, signed)
  m: number;      // Mean offset — shifts smile along moneyness (FLOAT_SCALING, signed)
  sigma: number;  // Smoothing — controls ATM curvature (FLOAT_SCALING)
}

interface SviData {
  oracle_id: string;
  params: SviParams;
  timestamp: number;  // When these params were last updated
}

// On-chain, rho and m use signed i64 (can be negative)
// In TypeScript, they are regular numbers after decoding`,
              highlights: [
                { line: 2, explanation: 'a: the minimum variance. Higher a = higher implied volatility for ALL strikes. Like a floor for the smile.' },
                { line: 3, explanation: 'b: how steeply the wings rise. Higher b = more expensive far out-of-the-money options.' },
                { line: 4, explanation: 'rho: skew in [-1, 1]. Negative rho means downside protection is more expensive (put skew). Common in equity/crypto.' },
                { line: 5, explanation: 'm: shifts the smile minimum. The vol smile is lowest near moneyness k = m.' },
                { line: 6, explanation: 'sigma: prevents a sharp kink at k = m. Larger sigma = smoother smile. Controls ATM curvature.' },
              ],
            },
          },
        },
        {
          title: 'Three-Tier Data Access',
          content: 'A production dApp uses three tiers for data access: the predict-server REST API for market data, Sui event subscriptions for real-time updates, and direct on-chain reads for transaction confirmation.',
          emoji: '🗂️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'api', label: 'Predict Server API', emoji: '🌐' },
                { id: 'events', label: 'Event Subscriptions', emoji: '📡' },
                { id: 'onchain', label: 'On-Chain Reads', emoji: '⛓️' },
              ],
              targets: [
                { id: 't1', label: 'Market lists, vault summaries, trade history' },
                { id: 't2', label: 'Low-latency price & SVI updates' },
                { id: 't3', label: 'Pre/post transaction state verification' },
              ],
              correctPairs: [
                { itemId: 'api', targetId: 't1' },
                { itemId: 'events', targetId: 't2' },
                { itemId: 'onchain', targetId: 't3' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-005',
    },
    {
      sectionTitle: 'Strike Grids',
      slides: [
        {
          title: 'How Strike Grids Work',
          content: 'Each oracle defines a grid of valid strikes starting at min_strike and spaced by tick_size. You can only trade at these discrete price levels — they ensure orderly markets and efficient exposure tracking.',
          emoji: '📏',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Generate the valid strike grid for an oracle
function generateStrikeGrid(
  minStrike: number,   // e.g., 40_000_000_000_000 ($40,000)
  tickSize: number,    // e.g., 1_000_000_000_000  ($1,000)
  numTicks: number = 50
): number[] {
  const strikes: number[] = [];
  for (let i = 0; i < numTicks; i++) {
    strikes.push(minStrike + tickSize * i);
  }
  return strikes;
}

// Example: BTC/USD oracle
// minStrike = 40_000_000_000_000  ($40,000)
// tickSize  = 1_000_000_000_000  ($1,000)
// Grid: [$40K, $41K, $42K, ..., $89K]

// Find the nearest valid strike to a price
function nearestStrike(price: number, minStrike: number, tickSize: number): number {
  const ticks = Math.round((price - minStrike) / tickSize);
  return minStrike + ticks * tickSize;
}`,
              highlights: [
                { line: 3, explanation: 'minStrike is FLOAT_SCALING-encoded. $40,000 becomes 40_000 * 1e9 = 40_000_000_000_000.' },
                { line: 4, explanation: 'tickSize defines the gap between valid strikes. $1,000 tick → you can trade at $40K, $41K, $42K, etc.' },
                { line: 9, explanation: 'Each strike = minStrike + i * tickSize. This generates a uniform grid of valid price levels.' },
                { line: 20, explanation: 'nearestStrike snaps any price to the closest valid grid level. Essential for UI strike selectors.' },
              ],
            },
          },
        },
        {
          title: 'Strike Selection UI Pattern',
          content: 'In a trading dApp, users select strikes from the grid. You typically show strikes around the current spot price, with the at-the-money (ATM) strike highlighted. The fair price varies by strike — further from forward = cheaper.',
          emoji: '🎛️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'ATM Strike', content: 'The strike closest to the current forward price. ATM binary options are priced near 0.50 (50% probability). This is where Bernoulli fee is highest.' },
                { label: 'OTM Strike', content: 'Out-of-the-money — far from forward. UP positions at high strikes or DOWN positions at low strikes. Cheaper (low probability) but higher potential return.' },
                { label: 'ITM Strike', content: 'In-the-money — already favorable. UP at strikes below forward. More expensive (high probability) but lower return per unit.' },
                { label: 'Strike Count', content: 'Most UIs show 10-20 strikes centered around ATM. Too many overwhelms users; too few limits trading strategies.' },
              ],
            },
          },
        },
        {
          title: 'The Predict Server API',
          content: 'The predict-server provides indexed, queryable market data. It runs alongside the Sui blockchain and serves REST endpoints for oracle discovery, price history, position tracking, and vault analytics.',
          emoji: '🌐',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const PREDICT_SERVER = 'https://predict-server.testnet.mystenlabs.com';

// Key API endpoints
GET /oracles                          // List all oracles
GET /oracles/:id/state                // Oracle + latest price + SVI
GET /oracles/:id/prices/latest        // Current spot & forward
GET /oracles/:id/svi/latest           // Latest SVI params

GET /managers?owner=:address          // Find user's manager
GET /managers/:id/positions           // Open positions
GET /managers/:id/summary             // Balance, P&L, counts

GET /predicts/:id/vault/summary       // TVL, share price, utilization
GET /trades/:oracleId                 // Trade history`,
              highlights: [
                { line: 4, explanation: '/oracles returns all oracle markets — active, settled, and pending. Filter client-side by status.' },
                { line: 5, explanation: '/oracles/:id/state is the most useful endpoint — returns oracle data, latest price, AND latest SVI all in one call.' },
                { line: 9, explanation: '/managers?owner=address finds the PredictManager for a wallet. Returns null if the user hasn\'t created one yet.' },
                { line: 12, explanation: '/predicts/:id/vault/summary gives vault metrics: TVL, PLP share price, utilization ratio — essential for LP interfaces.' },
              ],
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'What is the relationship between spot and forward price?',
      options: ['They are always identical', 'forward = spot × basis', 'forward = spot - fees', 'forward = spot / FLOAT_SCALING'],
      correctAnswer: 1,
      explanation: 'Forward = spot × basis. The basis captures expected price drift to expiry (carry cost, funding rates). SVI pricing uses forward — not spot — because we care about where price will be at expiry.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'How are valid strikes determined for an oracle?',
      options: ['Any price can be a strike', 'strike = min_strike + N × tick_size (for integer N)', 'Strikes are set by the user', 'Only the forward price is a valid strike'],
      correctAnswer: 1,
      explanation: 'Valid strikes form a grid: strike_N = min_strike + N × tick_size. This ensures orderly markets and enables efficient exposure tracking in the vault\'s strike matrix.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'Which SVI parameter controls the skew of the volatility smile?',
      options: ['a (base variance)', 'b (wing slope)', 'rho (skew)', 'sigma (smoothing)'],
      correctAnswer: 2,
      explanation: 'rho (rho) controls the skew — it tilts the smile left or right. Negative rho means puts are more expensive than calls at the same distance from ATM, which is typical in crypto markets.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What happens if you try to mint a position on a "pending_settlement" oracle?',
      options: ['The transaction succeeds at the last known price', 'The transaction aborts — only active oracles accept mints', 'It creates a pending position', 'The position is queued for the next oracle'],
      correctAnswer: 1,
      explanation: 'Only oracles with status "active" accept new mints. Once expiry passes, the oracle moves to pending_settlement and then settled. Attempting to mint will abort the transaction.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'Which data tier should you use for real-time price updates?',
      options: ['Direct on-chain reads (too slow)', 'Predict Server API (polling)', 'Sui event subscriptions (lowest latency)', 'Manual user input'],
      correctAnswer: 2,
      explanation: 'Sui event subscriptions (checkpoint/event streaming) provide the lowest latency for price updates. The predict-server API is great for market lists and history, but events give real-time OraclePricesUpdated and OracleSVIUpdated notifications.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Oracle Architecture Practice
// Complete the functions for working with oracle data.

const FLOAT_SCALING = 1_000_000_000;

interface OracleData {
  oracle_id: string;
  underlying_asset: string;
  expiry: number;
  min_strike: number;
  tick_size: number;
  status: 'active' | 'settled' | 'inactive' | 'pending_settlement';
  settlement_price: number | null;
}

// TODO 1: Generate the strike grid for an oracle.
// Return an array of valid strikes from min_strike, spaced by tick_size.
function generateStrikeGrid(
  minStrike: number, tickSize: number, numTicks: number
): number[] {
  // Your code here
}

// TODO 2: Find the nearest valid strike to a given price.
function nearestStrike(
  price: number, minStrike: number, tickSize: number
): number {
  // Your code here
}

// TODO 3: Filter oracles by status.
// Return only oracles matching the given status.
function filterOraclesByStatus(
  oracles: OracleData[], status: OracleData['status']
): OracleData[] {
  // Your code here
}

// TODO 4: Check if a strike is valid for an oracle.
// A strike is valid if it's >= min_strike and (strike - min_strike) is divisible by tick_size.
function isValidStrike(
  strike: number, minStrike: number, tickSize: number
): boolean {
  // Your code here
}`,

  solution: `const FLOAT_SCALING = 1_000_000_000;

interface OracleData {
  oracle_id: string;
  underlying_asset: string;
  expiry: number;
  min_strike: number;
  tick_size: number;
  status: 'active' | 'settled' | 'inactive' | 'pending_settlement';
  settlement_price: number | null;
}

function generateStrikeGrid(
  minStrike: number, tickSize: number, numTicks: number
): number[] {
  const strikes: number[] = [];
  for (let i = 0; i < numTicks; i++) {
    strikes.push(minStrike + tickSize * i);
  }
  return strikes;
}

function nearestStrike(
  price: number, minStrike: number, tickSize: number
): number {
  const ticks = Math.round((price - minStrike) / tickSize);
  return minStrike + Math.max(0, ticks) * tickSize;
}

function filterOraclesByStatus(
  oracles: OracleData[], status: OracleData['status']
): OracleData[] {
  return oracles.filter(o => o.status === status);
}

function isValidStrike(
  strike: number, minStrike: number, tickSize: number
): boolean {
  if (strike < minStrike) return false;
  return (strike - minStrike) % tickSize === 0;
}`,

  hints: [
    'generateStrikeGrid: loop from 0 to numTicks, pushing minStrike + i * tickSize each iteration.',
    'nearestStrike: compute ticks = Math.round((price - minStrike) / tickSize), then return minStrike + ticks * tickSize.',
    'filterOraclesByStatus: use Array.filter() with a status comparison.',
    'isValidStrike: check strike >= minStrike AND (strike - minStrike) % tickSize === 0.',
  ],
};
