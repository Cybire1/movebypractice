import { LessonContent } from '../types/lesson';

export const predictLesson1: LessonContent = {
  id: 'predict-1',
  title: 'What is DeepBook Predict?',
  description: 'Discover binary options on Sui — learn what prediction markets are, how positions work, and the four core on-chain objects that power DeepBook Predict.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'typescript',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Welcome to DeepBook Predict — the binary options protocol built natively into Sui's on-chain order book. In this lesson, you'll learn what binary options are, how UP/DOWN/RANGE positions work, and the architecture that makes sub-second settlement possible.",
    quizTransition: "You've explored the fundamentals of DeepBook Predict. Let's test your understanding of binary positions and protocol architecture.",
    practiceTransition: "Time to write code! Implement helper functions that detect position directions and format on-chain values.",
    celebrationMessage: "Great start! You now understand binary options, sentinel encoding, and the four core objects in DeepBook Predict.",
    nextLessonTease: "Next: deep dive into oracle architecture — how OracleSVI works, price feeds, and strike grid generation.",
  },

  teachingSections: [
    {
      sectionTitle: 'Binary Options Basics',
      slides: [
        {
          title: 'What Are Binary Options?',
          content: 'A binary option is a financial contract that pays a fixed amount (1 DUSDC) if a condition is true at expiry, or nothing (0 DUSDC) if false. "Binary" means two outcomes — win or lose, all or nothing. DeepBook Predict brings this on-chain with sub-second settlement on Sui.',
          emoji: '🎯',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Binary Payout', content: 'Unlike traditional options with variable payouts, binary options pay exactly 1 DUSDC per unit if in-the-money, or 0 if out-of-the-money. The price you pay (0 to 1) represents the market-implied probability.' },
                { label: 'Strike Price', content: 'The threshold that determines the outcome. Example: "SUI above $4.50 at 3pm" has strike = $4.50. If SUI settles at $4.60, UP wins. If $4.40, DOWN wins.' },
                { label: 'Expiry', content: 'The Unix timestamp when the market settles. After expiry, the oracle publishes a settlement price and positions can be redeemed. No new positions can be minted after expiry.' },
                { label: 'DUSDC', content: 'DeepBook\'s test USDC stablecoin with 6 decimals. 1 DUSDC = 1,000,000 micro-DUSDC. All trading, fees, and payouts are denominated in DUSDC.' },
              ],
            },
          },
        },
        {
          title: 'Position Types: UP, DOWN, RANGE',
          content: 'Every position is a bet on where the settlement price will land. UP bets the price will be at or above the strike. DOWN bets below. RANGE bets within a band. Positions are encoded using sentinel values for the lower and higher strike bounds.',
          emoji: '📈',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'up', label: 'UP position', emoji: '🟢' },
                { id: 'down', label: 'DOWN position', emoji: '🔴' },
                { id: 'range', label: 'RANGE position', emoji: '🟡' },
              ],
              targets: [
                { id: 'up-desc', label: 'Pays 1 if settlement >= strike' },
                { id: 'down-desc', label: 'Pays 1 if settlement < strike' },
                { id: 'range-desc', label: 'Pays 1 if lower < settlement <= higher' },
              ],
              correctPairs: [
                { itemId: 'up', targetId: 'up-desc' },
                { itemId: 'down', targetId: 'down-desc' },
                { itemId: 'range', targetId: 'range-desc' },
              ],
            },
          },
        },
        {
          title: 'Sentinel Encoding',
          content: 'On-chain, every position is stored as a RangeKey with lower_strike and higher_strike. Special sentinel values represent infinity: NEG_INF = 0 means negative infinity, POS_INF = 2^64-1 means positive infinity. This elegantly encodes all three position types.',
          emoji: '🔑',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Sentinel values for position encoding
const NEG_INF = '0';                        // Represents -infinity
const POS_INF = '18446744073709551615';     // 2^64 - 1 = +infinity

// UP position:   settlement >= strike
// lower = strike,   higher = POS_INF
{ lower_strike: '45000000000000', higher_strike: POS_INF }

// DOWN position: settlement < strike
// lower = NEG_INF,  higher = strike
{ lower_strike: NEG_INF, higher_strike: '45000000000000' }

// RANGE position: lower < settlement <= higher
// lower = strikeA,  higher = strikeB
{ lower_strike: '40000000000000', higher_strike: '50000000000000' }`,
              highlights: [
                { line: 2, explanation: 'NEG_INF = 0 is the sentinel for "no lower bound" — used as lower_strike for DOWN positions.' },
                { line: 3, explanation: 'POS_INF = u64::MAX is the sentinel for "no upper bound" — used as higher_strike for UP positions.' },
                { line: 6, explanation: 'UP: the strike IS the lower bound. Pays out for any settlement at or above it, up to infinity.' },
                { line: 10, explanation: 'DOWN: the strike IS the upper bound. Pays out for any settlement below it, down to negative infinity.' },
                { line: 14, explanation: 'RANGE: both bounds are real strike values. Pays out only if settlement falls in (lower, higher].' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-001',
    },
    {
      sectionTitle: 'Protocol Architecture',
      slides: [
        {
          title: 'Four Core On-Chain Objects',
          content: 'DeepBook Predict is built on four shared objects that live on the Sui blockchain. Each has a distinct responsibility — understanding them is essential for building any Predict integration.',
          emoji: '🏗️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Predict', content: 'The top-level shared object. Holds the vault (balances + exposure tracking), pricing config (fees), risk config (exposure limits), oracle config (strike grids), and the PLP treasury cap. Think of it as the protocol singleton.' },
                { label: 'PredictManager', content: 'A per-user shared object that wraps a DeepBook BalanceManager. Stores the trader\'s DUSDC balance and tracks position quantities in an internal table. Each wallet creates one manager to trade.' },
                { label: 'OracleSVI', content: 'The market state for one underlying asset and expiry. Stores spot price, forward price, SVI volatility parameters, activation status, and settlement price. One oracle per market.' },
                { label: 'Vault', content: 'The shared liquidity pool that takes the other side of every trade. Tracks accepted quote assets, mark-to-market liability, max payout, and manages PLP (LP token) supply/withdrawal.' },
              ],
            },
          },
        },
        {
          title: 'Key Constants & Addresses',
          content: 'Every Predict integration uses a fixed set of contract addresses and constants. These identify the protocol objects on-chain and define the numerical encoding used for all prices and fees.',
          emoji: '📋',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Contract addresses (Sui Testnet)
const PACKAGE_ID  = '0xf5ea2b...5138';   // Published package
const REGISTRY_ID = '0x43af14...e64';    // Registry shared object
const PREDICT_ID  = '0xc87362...028a';   // Main Predict object

// Token types
const DUSDC_TYPE = '0xe950...::dusdc::DUSDC';  // Quote currency
const PLP_TYPE   = PACKAGE_ID + '::plp::PLP';  // LP token

// Numerical encoding
const FLOAT_SCALING = 1_000_000_000;  // 1e9 — all prices, fees, SVI params
const DUSDC_DECIMALS = 6;             // 1 DUSDC = 1,000,000 micro
const CLOCK_ID = '0x6';               // Sui system clock`,
              highlights: [
                { line: 2, explanation: 'PACKAGE_ID is the published Move package containing all Predict modules (predict, registry, oracle, etc.).' },
                { line: 4, explanation: 'PREDICT_ID is the shared Predict object holding vault, configs, and oracle references.' },
                { line: 7, explanation: 'DUSDC is the stablecoin used for all trading. Its type string includes the package that defines it.' },
                { line: 11, explanation: 'FLOAT_SCALING = 1e9. A price of 0.5 is stored as 500_000_000. This avoids floating-point on-chain.' },
                { line: 13, explanation: 'CLOCK_ID = 0x6 is Sui\'s immutable system clock, used for expiry checks in mint transactions.' },
              ],
            },
          },
        },
        {
          title: 'Module Responsibilities',
          content: 'The Predict package is organized into modules, each with a specific job. Knowing which module does what is critical when building transaction calls — you need the right target path.',
          emoji: '📦',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'predict', label: 'predict', emoji: '⚡' },
                { id: 'registry', label: 'registry', emoji: '📝' },
                { id: 'predict_manager', label: 'predict_manager', emoji: '👤' },
                { id: 'range_key', label: 'range_key', emoji: '🔑' },
              ],
              targets: [
                { id: 'mint-redeem', label: 'mint() and redeem() entry functions' },
                { id: 'create-manager', label: 'create_and_share_manager()' },
                { id: 'deposit-withdraw', label: 'deposit() and withdraw() for DUSDC' },
                { id: 'new-key', label: 'new() to build position identifiers' },
              ],
              correctPairs: [
                { itemId: 'predict', targetId: 'mint-redeem' },
                { itemId: 'registry', targetId: 'create-manager' },
                { itemId: 'predict_manager', targetId: 'deposit-withdraw' },
                { itemId: 'range_key', targetId: 'new-key' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-002',
    },
    {
      sectionTitle: 'Market Lifecycle',
      slides: [
        {
          title: 'Oracle State Machine',
          content: 'Every market (oracle) progresses through four states. Understanding these states tells you what operations are allowed at each phase — you can only mint on active oracles and redeem settled ones for payout.',
          emoji: '🔄',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Inactive', content: 'Initial state after creation. The oracle exists but has no price data. An operator must activate it before trading begins.' },
                { label: 'Active', content: 'The oracle is live — spot prices, forward prices, and SVI params are being updated. Traders can mint and redeem_live (early exit) positions.' },
                { label: 'Pending Settlement', content: 'Expiry has passed. No new mints allowed. The oracle is waiting for the operator to publish the settlement price.' },
                { label: 'Settled', content: 'Settlement price is frozen. Positions can be redeemed for payout (1 if in-the-money, 0 if out). Redemption is permissionless — anyone can trigger it.' },
              ],
            },
          },
        },
        {
          title: 'Price Data on an Oracle',
          content: 'Active oracles receive continuous price updates from Pyth Lazer (high-frequency price feeds). The oracle stores both spot (current market price) and forward (expected price at expiry), which is derived from spot plus a basis adjustment.',
          emoji: '💹',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface PriceData {
  oracle_id: string;
  spot: number;       // Current market price (FLOAT_SCALING)
  forward: number;    // Expected price at expiry (FLOAT_SCALING)
  timestamp: number;  // When this price was recorded
}

// Example: SUI/USD oracle
// spot    = 4_500_000_000_000  → $4,500 (÷ 1e9)
// forward = 4_510_000_000_000  → $4,510 (÷ 1e9)
// The forward includes a basis premium for time value

// Binary option price depends on forward, not spot
// because we care about where price will be at expiry`,
              highlights: [
                { line: 3, explanation: 'Spot is the current real-time price from Pyth Lazer oracles, encoded with FLOAT_SCALING (1e9).' },
                { line: 4, explanation: 'Forward = spot × basis. The basis accounts for expected price drift until expiry. SVI pricing uses forward, not spot.' },
                { line: 9, explanation: 'To get human-readable price: divide by FLOAT_SCALING. 4_500_000_000_000 / 1e9 = $4,500.' },
                { line: 13, explanation: 'Key insight: binary option pricing uses the forward price because it represents the market\'s best estimate at expiry.' },
              ],
            },
          },
        },
        {
          title: 'Trading Flow Overview',
          content: 'A complete trade goes through several steps: discover markets, select a position, compute the price, build a transaction, and submit it to the Sui network. After expiry, winning positions are redeemed for 1 DUSDC each.',
          emoji: '🔁',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'step1', label: '1. Fetch oracles', emoji: '📡' },
                { id: 'step2', label: '2. Compute SVI price', emoji: '🧮' },
                { id: 'step3', label: '3. Build PTB & sign', emoji: '🔨' },
                { id: 'step4', label: '4. Redeem at settlement', emoji: '💰' },
              ],
              targets: [
                { id: 't1', label: 'Query predict-server for active markets' },
                { id: 't2', label: 'Use SVI params + forward to get fair value' },
                { id: 't3', label: 'Create mint transaction, wallet signs' },
                { id: 't4', label: 'After expiry, claim 1 DUSDC if in-the-money' },
              ],
              correctPairs: [
                { itemId: 'step1', targetId: 't1' },
                { itemId: 'step2', targetId: 't2' },
                { itemId: 'step3', targetId: 't3' },
                { itemId: 'step4', targetId: 't4' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-003',
    },
  ],

  quiz: [
    {
      question: 'What does a binary option pay if the condition is met at expiry?',
      options: ['The difference between spot and strike', 'Exactly 1 DUSDC per unit', 'Variable based on how far in-the-money', 'Nothing — the profit is from selling early'],
      correctAnswer: 1,
      explanation: 'Binary options have a fixed payout of exactly 1 DUSDC per unit if the condition is met (in-the-money), or 0 if not. This is why they are called "binary" — two outcomes only.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'How is an UP position encoded on-chain?',
      options: [
        'lower_strike = NEG_INF, higher_strike = strike',
        'lower_strike = strike, higher_strike = POS_INF',
        'lower_strike = strike, higher_strike = strike',
        'lower_strike = POS_INF, higher_strike = NEG_INF',
      ],
      correctAnswer: 1,
      explanation: 'UP means "settlement >= strike", so lower_strike = strike (the threshold) and higher_strike = POS_INF (no upper bound). DOWN is the opposite: lower = NEG_INF, higher = strike.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What is the role of the PredictManager object?',
      options: ['It holds the vault\'s liquidity', 'It stores per-user DUSDC balance and position quantities', 'It publishes price feeds', 'It computes SVI parameters'],
      correctAnswer: 1,
      explanation: 'PredictManager is a per-user shared object that wraps a BalanceManager. It stores the trader\'s deposited DUSDC and tracks their position quantities in an internal table.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What does FLOAT_SCALING (1e9) represent?',
      options: ['Gas budget for transactions', 'A fixed-point multiplier for encoding fractional values as integers', 'The number of DUSDC decimals', 'Maximum position quantity'],
      correctAnswer: 1,
      explanation: 'FLOAT_SCALING = 1,000,000,000. All prices, fees, and SVI params are stored as integers multiplied by 1e9. A probability of 0.5 is stored as 500,000,000.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'In what order does an oracle transition through states?',
      options: [
        'Active → Settled → Pending → Inactive',
        'Inactive → Active → Pending Settlement → Settled',
        'Settled → Active → Inactive → Pending',
        'Active → Inactive → Settled → Pending',
      ],
      correctAnswer: 1,
      explanation: 'Oracles follow: Inactive (created) → Active (trading live) → Pending Settlement (expired, awaiting price) → Settled (settlement price frozen, payouts available).',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// DeepBook Predict — Fundamentals Practice
// Complete the helper functions below.

const FLOAT_SCALING = 1_000_000_000;
const NEG_INF = '0';
const POS_INF = '18446744073709551615';
const DUSDC_DECIMALS = 6;
const DUSDC_MULTIPLIER = 1_000_000;

// TODO 1: Determine position direction from sentinel strikes.
// Return 'DOWN' if lowerStrike is NEG_INF
// Return 'UP' if higherStrike is POS_INF
// Otherwise return 'RANGE'
function getPositionDirection(
  lowerStrike: string,
  higherStrike: string
): 'UP' | 'DOWN' | 'RANGE' {
  // Your code here
}

// TODO 2: Convert a FLOAT_SCALING-encoded value to a display number.
// Example: 4_500_000_000_000 → 4500
function fromFloatScaling(value: number): number {
  // Your code here
}

// TODO 3: Convert a display number to FLOAT_SCALING encoding.
// Example: 4500 → 4_500_000_000_000
function toFloatScaling(value: number): number {
  // Your code here
}

// TODO 4: Format a micro-DUSDC amount to a display string.
// Example: 1_500_000 → "1.50"
function formatDUSDC(microAmount: number): string {
  // Your code here
}`,

  solution: `// DeepBook Predict — Fundamentals Practice

const FLOAT_SCALING = 1_000_000_000;
const NEG_INF = '0';
const POS_INF = '18446744073709551615';
const DUSDC_DECIMALS = 6;
const DUSDC_MULTIPLIER = 1_000_000;

// TODO 1: Determine position direction from sentinel strikes
function getPositionDirection(
  lowerStrike: string,
  higherStrike: string
): 'UP' | 'DOWN' | 'RANGE' {
  if (lowerStrike === NEG_INF || lowerStrike === '0') return 'DOWN';
  if (higherStrike === POS_INF || higherStrike === '18446744073709551615') return 'UP';
  return 'RANGE';
}

// TODO 2: Convert FLOAT_SCALING to display
function fromFloatScaling(value: number): number {
  return value / FLOAT_SCALING;
}

// TODO 3: Convert display to FLOAT_SCALING
function toFloatScaling(value: number): number {
  return value * FLOAT_SCALING;
}

// TODO 4: Format micro-DUSDC to display string
function formatDUSDC(microAmount: number): string {
  return (microAmount / DUSDC_MULTIPLIER).toFixed(2);
}`,

  hints: [
    'For getPositionDirection: check if lowerStrike equals NEG_INF (the string "0") for DOWN, or higherStrike equals POS_INF for UP.',
    'fromFloatScaling simply divides by FLOAT_SCALING (1e9). toFloatScaling multiplies by it.',
    'For formatDUSDC: divide by DUSDC_MULTIPLIER (1e6) and use .toFixed(2) for 2 decimal places.',
  ],
};
