import { LessonContent } from '../types/lesson';

export const predictLesson4: LessonContent = {
  id: 'predict-4',
  title: 'Fee Structure & Economics',
  description: 'Understand how DeepBook Predict computes trading fees — the Bernoulli fee for uncertainty, the utilization fee for vault protection, how they combine into ask price, and how fee revenue is distributed across LPs, protocol, and insurance.',
  difficulty: 'intermediate',
  xpReward: 250,
  order: 4,
  language: 'typescript',
  prerequisiteLessons: ['predict-3'],

  narrative: {
    welcomeMessage: "Every trade on DeepBook Predict carries a fee. These fees aren't arbitrary — they are mathematically derived from the probability of an outcome and the current risk load on the vault. In this lesson, you'll learn exactly how fees are computed, combined, and distributed.",
    quizTransition: "You've explored the fee structure from Bernoulli uncertainty to utilization scaling to protocol economics. Let's see how well you understand the cost of trading.",
    practiceTransition: "Time to implement fee calculations yourself. You'll build the full fee breakdown pipeline, check reasonableness, and compute break-even prices.",
    celebrationMessage: "Excellent work! You now understand the complete fee structure — from probability-based Bernoulli fees to quadratic utilization scaling to the LP/protocol/insurance split.",
    nextLessonTease: "Next: position management — minting, redeeming, and tracking positions through their lifecycle on-chain.",
  },

  teachingSections: [
    {
      sectionTitle: 'Fee Components',
      slides: [
        {
          title: 'Why Fees Exist',
          content: 'The vault takes the opposite side of every trade a user makes. When you buy a binary UP position, the vault is effectively selling it to you. Fees compensate the vault (and its LPs) for bearing this risk. The fee structure is designed to be fair — fees scale with the uncertainty of the outcome and the current load on the vault.',
          emoji: '💰',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Vault as Counterparty', content: 'The vault takes the opposite side of every trade. If you buy UP at strike $100, the vault is short that position. Fees compensate the vault for accepting this directional risk.' },
                { label: 'Probability-Based Pricing', content: 'Fee structure is designed to be fair based on probability and uncertainty. A position near 50/50 probability carries more uncertainty, so it costs more in fees. Near-certain outcomes have minimal fees.' },
                { label: 'Fee Split', content: 'Fees are split between three buckets: LP share (~60%) stays in vault NAV rewarding liquidity providers, protocol share (~20%) is reserved for the protocol, and insurance share (~20%) is reserved as a safety buffer.' },
                { label: 'Incentive Alignment', content: 'This structure aligns incentives: LPs earn yield for providing capital, the protocol funds development, and insurance protects against tail risk events where the vault faces large payouts.' },
              ],
            },
          },
        },
        {
          title: 'Bernoulli Fee',
          content: 'The Bernoulli fee captures the uncertainty of a binary outcome. It is derived from the standard deviation of a Bernoulli random variable. When probability p is near 0.5, uncertainty is maximized and the fee peaks. When p is near 0 or 1, the outcome is nearly certain and the fee approaches zero.',
          emoji: '🎲',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Bernoulli fee: scales with outcome uncertainty
// p = fair probability of the position paying out

const baseFee = 0.02; // Default ~2% base fee rate

function bernoulliFee(p: number, baseFee: number): number {
  // sqrt(p * (1 - p)) is the std dev of a Bernoulli variable
  // Peaks at p = 0.5 where sqrt(0.25) = 0.5
  // Approaches 0 as p -> 0 or p -> 1
  return baseFee * Math.sqrt(p * (1 - p));
}

// Examples:
// p = 0.50 -> bernoulliFee = 0.02 * 0.500 = 0.0100 (1.00%)
// p = 0.30 -> bernoulliFee = 0.02 * 0.458 = 0.0092 (0.92%)
// p = 0.05 -> bernoulliFee = 0.02 * 0.218 = 0.0044 (0.44%)
// p = 0.95 -> bernoulliFee = 0.02 * 0.218 = 0.0044 (0.44%)`,
              highlights: [
                { line: 4, explanation: 'baseFee is the fee rate parameter, typically ~2%. It scales the entire Bernoulli component.' },
                { line: 7, explanation: 'sqrt(p * (1-p)) is the standard deviation of a Bernoulli distribution. This is the mathematical heart of the fee.' },
                { line: 8, explanation: 'At p = 0.5 (ATM), sqrt(0.25) = 0.5 — maximum uncertainty. The fee is 0.02 * 0.5 = 1% of notional.' },
                { line: 9, explanation: 'As p approaches 0 or 1, the outcome is nearly certain. The fee shrinks toward zero because the vault takes minimal risk.' },
              ],
            },
          },
        },
        {
          title: 'Utilization Fee',
          content: 'The utilization fee protects the vault from concentrated risk. As the vault\'s liability grows relative to its balance, the utilization fee increases quadratically. This discourages traders from piling into one side and ensures the vault maintains a healthy reserve ratio.',
          emoji: '📈',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Utilization fee: protects vault from concentrated exposure
// liability = total potential payout the vault owes
// balance   = total capital in the vault

const utilMultiplier = 2.0; // Default ~2x multiplier
const baseFee = 0.02;

function utilizationFee(
  liability: number, balance: number, baseFee: number, utilMultiplier: number
): number {
  const ratio = liability / balance; // utilization ratio
  // Grows QUADRATICALLY — doubles ratio = 4x the fee
  return baseFee * utilMultiplier * Math.pow(ratio, 2);
}

// Examples (baseFee=0.02, utilMultiplier=2):
// ratio = 0.10 -> utilFee = 0.02 * 2 * 0.01  = 0.0004 (0.04%)
// ratio = 0.50 -> utilFee = 0.02 * 2 * 0.25  = 0.0100 (1.00%)
// ratio = 0.80 -> utilFee = 0.02 * 2 * 0.64  = 0.0256 (2.56%)
// ratio = 1.00 -> utilFee = 0.02 * 2 * 1.00  = 0.0400 (4.00%)`,
              highlights: [
                { line: 5, explanation: 'utilMultiplier (default ~2x) amplifies the utilization component. Higher multiplier = stronger discouragement of high utilization.' },
                { line: 11, explanation: 'The utilization ratio = liability / balance. When the vault owes a lot relative to its capital, this ratio is high.' },
                { line: 13, explanation: 'Quadratic scaling (ratio^2) is crucial: doubling the utilization ratio quadruples the fee. This makes extreme utilization very expensive.' },
                { line: 18, explanation: 'At 50% utilization, the fee is 1% — noticeable but not prohibitive. At 100% utilization, it jumps to 4% — strongly discouraging further exposure.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-007',
    },
    {
      sectionTitle: 'Total Cost Calculation',
      slides: [
        {
          title: 'Combining Fees',
          content: 'The total fee is the sum of the Bernoulli fee (floored by minFee) and the utilization fee. The total cost per unit is the fair price plus the total fee. The minFee floor ensures the vault always earns a baseline spread, even on near-certain outcomes.',
          emoji: '🧮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Total fee = max(bernoulliFee, minFee) + utilizationFee
// Total cost per unit = fairPrice + totalFee

const minFee = 0.005; // Default ~0.5% floor

function computeTotalFee(
  bernoulliFee: number,
  utilizationFee: number,
  minFee: number
): number {
  // Floor the Bernoulli component at minFee
  const floored = Math.max(bernoulliFee, minFee);
  return floored + utilizationFee;
}

function computeTotalCostPerUnit(
  fairPrice: number, totalFee: number
): number {
  // The ask price = fair value + fee markup
  return fairPrice + totalFee;
}

// Example: fairPrice = 0.50, bernoulliFee = 0.01, utilFee = 0.005
// totalFee = max(0.01, 0.005) + 0.005 = 0.015
// totalCostPerUnit = 0.50 + 0.015 = 0.515`,
              highlights: [
                { line: 4, explanation: 'minFee (default ~0.5%) is a floor on the Bernoulli component. Even if sqrt(p*(1-p)) is tiny, the vault still earns at least 0.5%.' },
                { line: 12, explanation: 'Math.max(bernoulliFee, minFee) ensures the Bernoulli component never drops below the floor. This protects the vault on near-certain outcomes.' },
                { line: 13, explanation: 'The utilization fee is always added on top — it is never floored. It can be zero if the vault has very low utilization.' },
                { line: 20, explanation: 'totalCostPerUnit is what the trader actually pays per unit. It is the fair price plus the fee — this is the ask price.' },
              ],
            },
          },
        },
        {
          title: 'FeeBreakdown Interface',
          content: 'A well-structured fee breakdown helps traders understand exactly what they are paying and why. The computeFeeBreakdown function packages all fee components into a single object for display and decision-making.',
          emoji: '📋',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface FeeBreakdown {
  fairPrice: number;       // SVI-derived probability (0 to 1)
  bernoulliFee: number;    // baseFee * sqrt(p * (1-p))
  utilizationFee: number;  // baseFee * utilMult * (liab/bal)^2
  totalFee: number;        // max(bernoulli, minFee) + utilization
  totalCostPerUnit: number; // fairPrice + totalFee
}

function computeFeeBreakdown(
  fairPrice: number,
  liability: number,
  balance: number,
  baseFee: number = 0.02,
  minFee: number = 0.005,
  utilMultiplier: number = 2.0
): FeeBreakdown {
  const bFee = baseFee * Math.sqrt(fairPrice * (1 - fairPrice));
  const ratio = liability / balance;
  const uFee = baseFee * utilMultiplier * Math.pow(ratio, 2);
  const total = Math.max(bFee, minFee) + uFee;
  return {
    fairPrice,
    bernoulliFee: bFee,
    utilizationFee: uFee,
    totalFee: total,
    totalCostPerUnit: fairPrice + total,
  };
}`,
              highlights: [
                { line: 1, explanation: 'FeeBreakdown gives the trader full transparency: every component is visible so they can understand the cost structure.' },
                { line: 5, explanation: 'totalFee is the combined fee after applying the minFee floor. This is the spread the vault earns on the trade.' },
                { line: 6, explanation: 'totalCostPerUnit is the actual price the trader pays. In a UI, this is the "ask price" shown on the order form.' },
                { line: 17, explanation: 'fairPrice is used as p in the Bernoulli formula. This is why SVI pricing must happen before fee computation.' },
              ],
            },
          },
        },
        {
          title: 'When Are Fees High vs Low?',
          content: 'Understanding fee dynamics helps traders pick optimal entry points. Fees depend on two independent axes: probability (Bernoulli) and vault load (utilization). Match each scenario to its fee impact.',
          emoji: '⚖️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'atm', label: 'ATM position (p=0.5)', emoji: '🎯' },
                { id: 'otm', label: 'Deep OTM (p=0.05)', emoji: '🔭' },
                { id: 'high-util', label: 'High utilization (80%)', emoji: '🔴' },
                { id: 'low-util', label: 'Low utilization (10%)', emoji: '🟢' },
              ],
              targets: [
                { id: 't1', label: 'High Bernoulli fee (max uncertainty)' },
                { id: 't2', label: 'Low Bernoulli fee (near certain)' },
                { id: 't3', label: 'High utilization fee (vault stressed)' },
                { id: 't4', label: 'Low utilization fee (vault healthy)' },
              ],
              correctPairs: [
                { itemId: 'atm', targetId: 't1' },
                { itemId: 'otm', targetId: 't2' },
                { itemId: 'high-util', targetId: 't3' },
                { itemId: 'low-util', targetId: 't4' },
              ],
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Fee Split & Protocol Economics',
      slides: [
        {
          title: 'Fee Distribution',
          content: 'Every fee collected is split across three buckets. This split ensures LPs are rewarded for providing capital, the protocol has revenue for development, and an insurance fund exists for extreme scenarios.',
          emoji: '🏦',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'LP Share (~60%)', content: 'The largest portion (~60%) stays in the vault, increasing NAV (Net Asset Value). This directly boosts PLP share price, rewarding liquidity providers with yield from trading activity.' },
                { label: 'Protocol Share (~20%)', content: 'Reserved for the protocol treasury (~20%). Funds ongoing development, oracle infrastructure, and operational costs. Managed by the protocol\'s governance or admin.' },
                { label: 'Insurance Share (~20%)', content: 'Reserved as an insurance buffer (~20%). Protects against tail risk events where the vault faces unusually large payouts. Acts as a safety net for LPs beyond the vault\'s normal reserves.' },
                { label: 'FeeReserve Tracking', content: 'On-chain, a FeeReserve object tracks accumulated protocol and insurance fees. These can be withdrawn by authorized parties. LP fees are implicit — they stay in the vault balance and are reflected in PLP share price.' },
              ],
            },
          },
        },
        {
          title: 'FLOAT_SCALING Encoding',
          content: 'All fractional values on-chain are stored as integers scaled by FLOAT_SCALING (1e9). This avoids floating-point precision issues in the Move virtual machine. You must encode values before sending transactions and decode them when reading on-chain state.',
          emoji: '🔢',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const FLOAT_SCALING = 1_000_000_000; // 1e9

// Encoding: multiply by FLOAT_SCALING
// 0.5       -> 500_000_000
// 0.02      -> 20_000_000   (baseFee)
// 0.005     -> 5_000_000    (minFee)
// 2.0       -> 2_000_000_000 (utilMultiplier)

// Decoding: divide by FLOAT_SCALING
function decodeFloat(onChainValue: number): number {
  return onChainValue / FLOAT_SCALING;
}

function encodeFloat(displayValue: number): number {
  return Math.round(displayValue * FLOAT_SCALING);
}

// Example: reading baseFee from chain
const rawBaseFee = 20_000_000;  // from on-chain
const baseFee = decodeFloat(rawBaseFee); // 0.02

// Example: sending a price to chain
const price = 0.515;
const encoded = encodeFloat(price); // 515_000_000`,
              highlights: [
                { line: 1, explanation: 'FLOAT_SCALING = 1e9 is the universal scaling factor in DeepBook Predict. Every probability, fee rate, and price uses this encoding on-chain.' },
                { line: 4, explanation: '0.5 (50% probability) becomes 500_000_000 on-chain. This is a u64 integer — no floating point involved.' },
                { line: 5, explanation: 'baseFee of 2% = 0.02 becomes 20_000_000. Always verify your encoding before submitting transactions.' },
                { line: 11, explanation: 'decodeFloat divides by 1e9 to get the human-readable value. Use this when displaying on-chain data in your UI.' },
              ],
            },
          },
        },
        {
          title: 'Ask Price Bounds',
          content: 'The protocol enforces minimum and maximum ask price bounds to prevent abuse at probability extremes. These bounds ensure orderly markets and protect both traders and the vault from degenerate pricing.',
          emoji: '🛡️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Minimum Ask (~1%)', content: 'No position can be sold for less than ~1% (0.01). This prevents near-free lottery tickets that could destabilize the vault. Even a very unlikely outcome has a minimum cost.' },
                { label: 'Maximum Ask (~99%)', content: 'No position can cost more than ~99% (0.99). This prevents traders from overpaying for near-certain outcomes and ensures there is always some potential return.' },
                { label: 'Preventing Abuse', content: 'Without bounds, a p=0.001 position could cost nearly zero, letting attackers flood the vault with cheap positions that occasionally win big. The 1% floor prevents this lottery attack.' },
                { label: 'Ensuring Orderly Markets', content: 'Bounds keep the market within reasonable ranges. Combined with the minFee floor, they ensure the vault always earns a meaningful spread and that traders always have a path to profit.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-predict-003',
    },
  ],

  quiz: [
    {
      question: 'What two components make up the total trading fee in DeepBook Predict?',
      options: [
        'Maker fee and taker fee',
        'Bernoulli fee and utilization fee',
        'Gas fee and protocol fee',
        'Spread fee and slippage fee',
      ],
      correctAnswer: 1,
      explanation: 'The total fee has two components: the Bernoulli fee (based on outcome uncertainty via sqrt(p*(1-p))) and the utilization fee (based on vault load via (liability/balance)^2). These are mathematically derived, not arbitrary.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'When is the Bernoulli fee at its highest?',
      options: [
        'When p is near 0 (very unlikely outcome)',
        'When p is near 1 (very likely outcome)',
        'When p is at 0.5 (maximum uncertainty)',
        'When the vault utilization is high',
      ],
      correctAnswer: 2,
      explanation: 'The Bernoulli fee = baseFee * sqrt(p * (1-p)). The function sqrt(p*(1-p)) peaks at p = 0.5 where it equals 0.5. This is the point of maximum uncertainty — a coin flip — so the vault charges the most for bearing this risk.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What does the minFee floor ensure?',
      options: [
        'That the gas cost is always covered',
        'That the vault always earns a baseline spread even on near-certain outcomes',
        'That traders cannot buy more than a fixed quantity',
        'That the protocol share is at least 20%',
      ],
      correctAnswer: 1,
      explanation: 'The minFee floor (default ~0.5%) ensures that even when the Bernoulli fee is tiny (p near 0 or 1), the vault still earns a baseline spread. Without it, near-certain positions would have almost zero fee, giving the vault no compensation.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'How does the utilization fee scale with the liability-to-balance ratio?',
      options: [
        'Linearly — double the ratio means double the fee',
        'Logarithmically — diminishing returns at high ratios',
        'Quadratically — double the ratio means 4x the fee',
        'It is a fixed percentage regardless of ratio',
      ],
      correctAnswer: 2,
      explanation: 'The utilization fee = baseFee * utilMultiplier * (liability/balance)^2. The quadratic (squared) scaling means doubling the utilization ratio quadruples the fee. This aggressively discourages concentrated risk in the vault.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What percentage of trading fees goes to LPs (liquidity providers)?',
      options: [
        '100% — LPs receive all fees',
        '~40% — split evenly with protocol and insurance',
        '~60% — stays in vault NAV, boosting PLP share price',
        '~20% — most goes to the protocol treasury',
      ],
      correctAnswer: 2,
      explanation: 'Approximately 60% of fees stay in the vault, directly increasing the NAV and thus the PLP share price. This rewards LPs for providing capital. The remaining ~20% goes to the protocol and ~20% to insurance reserves.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Fee Structure & Economics Practice
// Implement the fee calculation pipeline for DeepBook Predict.

const FLOAT_SCALING = 1_000_000_000;

interface FeeBreakdown {
  fairPrice: number;        // SVI-derived probability (0 to 1)
  bernoulliFee: number;     // baseFee * sqrt(p * (1-p))
  utilizationFee: number;   // baseFee * utilMult * (liab/bal)^2
  totalFee: number;         // max(bernoulli, minFee) + utilization
  totalCostPerUnit: number; // fairPrice + totalFee
}

// TODO 1: Compute the full fee breakdown.
// - Decode baseFee, minFee, utilMultiplier from FLOAT_SCALING integers.
// - Compute bernoulliFee = decodedBaseFee * sqrt(fairPrice * (1 - fairPrice))
// - Compute utilizationFee = decodedBaseFee * decodedUtilMult * (liability / balance)^2
// - totalFee = max(bernoulliFee, decodedMinFee) + utilizationFee
// - totalCostPerUnit = fairPrice + totalFee
function computeFeeBreakdown(
  fairPrice: number,
  liability: number,
  balance: number,
  rawBaseFee: number,    // FLOAT_SCALING encoded, e.g., 20_000_000
  rawMinFee: number,     // FLOAT_SCALING encoded, e.g., 5_000_000
  rawUtilMultiplier: number // FLOAT_SCALING encoded, e.g., 2_000_000_000
): FeeBreakdown {
  // Your code here
}

// TODO 2: Compute the total cost for a given quantity.
// totalCost = quantity * totalCostPerUnit
// Return the result in micro-DUSDC (multiply by 1_000_000).
function computeTotalCost(
  quantity: number,
  totalCostPerUnit: number
): number {
  // Your code here
}

// TODO 3: Check if the fee is reasonable.
// A fee is reasonable if totalFee < 10% of fairPrice.
// Return true if reasonable, false if too expensive.
function isFeeReasonable(
  totalFee: number,
  fairPrice: number
): boolean {
  // Your code here
}

// TODO 4: Estimate the break-even price.
// The position pays out 1.0 if it wins. The trader paid totalCostPerUnit.
// Break-even = the price threshold where expected value equals cost.
// For a binary option: breakeven probability = totalCostPerUnit
// (since payout is 1.0, you need P(win) >= cost to break even)
// Return totalCostPerUnit as the break-even probability.
function estimateBreakeven(
  fairPrice: number,
  totalFee: number
): number {
  // Your code here
}`,

  solution: `const FLOAT_SCALING = 1_000_000_000;

interface FeeBreakdown {
  fairPrice: number;
  bernoulliFee: number;
  utilizationFee: number;
  totalFee: number;
  totalCostPerUnit: number;
}

function computeFeeBreakdown(
  fairPrice: number,
  liability: number,
  balance: number,
  rawBaseFee: number,
  rawMinFee: number,
  rawUtilMultiplier: number
): FeeBreakdown {
  const baseFee = rawBaseFee / FLOAT_SCALING;
  const minFee = rawMinFee / FLOAT_SCALING;
  const utilMultiplier = rawUtilMultiplier / FLOAT_SCALING;

  const bernoulliFee = baseFee * Math.sqrt(fairPrice * (1 - fairPrice));
  const ratio = liability / balance;
  const utilizationFee = baseFee * utilMultiplier * Math.pow(ratio, 2);
  const totalFee = Math.max(bernoulliFee, minFee) + utilizationFee;

  return {
    fairPrice,
    bernoulliFee,
    utilizationFee,
    totalFee,
    totalCostPerUnit: fairPrice + totalFee,
  };
}

function computeTotalCost(
  quantity: number,
  totalCostPerUnit: number
): number {
  return quantity * totalCostPerUnit * 1_000_000;
}

function isFeeReasonable(
  totalFee: number,
  fairPrice: number
): boolean {
  return totalFee < 0.1 * fairPrice;
}

function estimateBreakeven(
  fairPrice: number,
  totalFee: number
): number {
  return fairPrice + totalFee;
}`,

  hints: [
    'computeFeeBreakdown: First decode all three FLOAT_SCALING values by dividing by 1_000_000_000. Then apply the formulas: bernoulliFee = baseFee * sqrt(p * (1-p)), utilizationFee = baseFee * utilMult * (liability/balance)^2.',
    'computeTotalCost: Multiply quantity by totalCostPerUnit to get the cost in DUSDC, then multiply by 1_000_000 to convert to micro-DUSDC.',
    'isFeeReasonable: Compare totalFee against 0.1 * fairPrice. If the fee is less than 10% of the fair price, it is considered reasonable.',
    'estimateBreakeven: For a binary option that pays 1.0 on win, the break-even probability equals the cost. Return fairPrice + totalFee (which is totalCostPerUnit).',
  ],
};
