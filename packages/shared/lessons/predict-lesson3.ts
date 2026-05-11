import { LessonContent } from '../types/lesson';

export const predictLesson3: LessonContent = {
  id: 'predict-3',
  title: 'SVI Pricing Model',
  description: 'Master the SVI volatility smile — understand the five parameters, compute implied variance, derive binary option prices via d2 and the normal CDF, and implement range and directional pricing.',
  difficulty: 'intermediate',
  xpReward: 200,
  order: 3,
  language: 'typescript',
  prerequisiteLessons: ['predict-2'],

  narrative: {
    welcomeMessage: "The SVI pricing model is the engine behind every binary option price on DeepBook Predict. In this lesson, you'll learn how five parameters define a volatility smile, how to compute implied variance for any strike, and how to turn that into a fair binary option price using d2 and the normal CDF.",
    quizTransition: "You've explored the full SVI pricing pipeline — from parameters to variance to binary prices. Let's test your understanding of the math that powers DeepBook Predict.",
    practiceTransition: "Time to implement the pricing engine yourself! Build computeSviPrice, range pricing, down pricing, and ATM strike detection from scratch.",
    celebrationMessage: "Outstanding! You can now compute binary option prices from raw SVI parameters — the core skill for building any DeepBook Predict integration.",
    nextLessonTease: "Next: building transactions — construct mint and redeem PTBs, handle fees, and submit trades to the Sui network.",
  },

  teachingSections: [
    {
      sectionTitle: 'Understanding the Volatility Smile',
      slides: [
        {
          title: 'What is Implied Volatility?',
          content: 'Implied volatility (IV) measures how much the market expects an asset\'s price to move before expiry. It is not a single number — IV varies by strike price, forming a curve called the "volatility smile." Strikes far from the forward price (deep ITM or OTM) tend to have higher IV, creating the characteristic U-shape. For binary options, IV at each strike determines the fair price: higher IV means more uncertainty, which pushes prices closer to 0.50.',
          emoji: '📈',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Implied Volatility', content: 'IV is the market\'s consensus forecast of future price movement. It is "implied" because it is backed out from observed option prices using a model (like Black-Scholes). Higher IV = bigger expected moves = more expensive options.' },
                { label: 'The Smile Shape', content: 'When you plot IV against strike price, you get a curve that dips near the forward (ATM) and rises on both sides — resembling a smile. In crypto, the left side (downside protection) is often steeper, creating a "smirk."' },
                { label: 'Moneyness', content: 'Moneyness measures how far a strike is from the forward price. It is defined as k = ln(strike / forward). k = 0 means ATM, k > 0 means OTM for UP (strike above forward), k < 0 means ITM for UP. The SVI model parameterizes IV as a function of k.' },
                { label: 'Why It Matters for Binary Options', content: 'A binary option price is essentially the risk-neutral probability of finishing in-the-money. This probability depends on the IV at that strike. The SVI model gives us a smooth, arbitrage-free IV surface to compute fair prices across all strikes.' },
              ],
            },
          },
        },
        {
          title: 'The SVI Parameterization',
          content: 'The SVI (Stochastic Volatility Inspired) model defines implied total variance as a function of log-moneyness k using five parameters. These parameters are calibrated by Block Scholes and published on-chain via the OracleSVI object. All values are encoded with FLOAT_SCALING (1e9).',
          emoji: '📐',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface SviParams {
  a: number;      // Base variance level (FLOAT_SCALING)
  b: number;      // Wing slope — steepness of tails (FLOAT_SCALING)
  rho: number;    // Skew — tilts smile left or right (FLOAT_SCALING, signed)
  m: number;      // Moneyness offset — shifts smile center (FLOAT_SCALING, signed)
  sigma: number;  // ATM smoothing — rounds the kink at k=m (FLOAT_SCALING)
}

// On-chain encoding example:
// a     =   50_000_000  → 0.05  (5% base variance)
// b     =  200_000_000  → 0.20  (wing slope)
// rho   = -300_000_000  → -0.30 (left skew)
// m     =  100_000_000  → 0.10  (smile centered at k=0.1)
// sigma =  150_000_000  → 0.15  (ATM smoothing width)`,
              highlights: [
                { line: 2, explanation: 'a: the overall variance level. Increasing a shifts the entire smile upward — all strikes get higher IV. Must satisfy a >= 0 for no-arbitrage.' },
                { line: 3, explanation: 'b: controls how steeply IV rises in the wings (far OTM/ITM). Higher b = more expensive tail strikes. Must satisfy b >= 0.' },
                { line: 4, explanation: 'rho: the skew parameter in [-1, 1]. Negative rho tilts the smile so that lower strikes (puts) have higher IV — typical in crypto/equity markets.' },
                { line: 5, explanation: 'm: shifts the smile minimum along the moneyness axis. The lowest point of the smile occurs near k = m, not necessarily at k = 0 (ATM).' },
                { line: 6, explanation: 'sigma: prevents a sharp V-shape at k = m by smoothing the kink. Larger sigma = rounder bottom. Must satisfy sigma > 0.' },
              ],
            },
          },
        },
        {
          title: 'Parameter Effects on the Smile',
          content: 'Each SVI parameter has a distinct visual effect on the volatility smile curve. Understanding these effects helps you interpret oracle data and debug pricing issues.',
          emoji: '🎛️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'a', label: 'a (base variance)', emoji: '📊' },
                { id: 'b', label: 'b (wing slope)', emoji: '📈' },
                { id: 'rho', label: 'rho (skew)', emoji: '↗️' },
                { id: 'sigma', label: 'sigma (smoothing)', emoji: '〰️' },
              ],
              targets: [
                { id: 'effect-a', label: 'Shifts the entire smile up or down' },
                { id: 'effect-b', label: 'Steepens or flattens the wings' },
                { id: 'effect-rho', label: 'Tilts the smile left or right' },
                { id: 'effect-sigma', label: 'Smooths the kink at the ATM region' },
              ],
              correctPairs: [
                { itemId: 'a', targetId: 'effect-a' },
                { itemId: 'b', targetId: 'effect-b' },
                { itemId: 'rho', targetId: 'effect-rho' },
                { itemId: 'sigma', targetId: 'effect-sigma' },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-predict-006',
    },
    {
      sectionTitle: 'Computing Binary Option Prices',
      slides: [
        {
          title: 'The SVI Variance Function',
          content: 'The core SVI formula computes total implied variance w(k) from log-moneyness k. This is the heart of the pricing model — every binary option price starts here.',
          emoji: '🧮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Step 1: Compute log-moneyness
const k = Math.log(strike / forward);

// Step 2: Shift by the mean offset m
const km = k - m;

// Step 3: SVI total variance formula
const w = a + b * (rho * km + Math.sqrt(km * km + sigma * sigma));

// Example with decoded params:
// strike = 4600, forward = 4500
// k  = ln(4600/4500) = 0.022
// km = 0.022 - 0.10 = -0.078
// w  = 0.05 + 0.20 * (-0.30 * -0.078 + sqrt(0.078^2 + 0.15^2))
// w  = 0.05 + 0.20 * (0.0234 + 0.1691)
// w  = 0.05 + 0.0385 = 0.0885`,
              highlights: [
                { line: 2, explanation: 'k = ln(strike/forward) is the log-moneyness. k = 0 when strike equals forward (ATM). k > 0 for strikes above forward.' },
                { line: 5, explanation: 'km = k - m shifts the moneyness by the mean offset. The smile is symmetric (in the no-skew case) around km = 0, i.e., k = m.' },
                { line: 8, explanation: 'The SVI formula: w = a + b * (rho*km + sqrt(km^2 + sigma^2)). The sqrt term creates the smile shape; rho*km adds the tilt.' },
                { line: 14, explanation: 'For this OTM strike (above forward), w = 0.0885. This total variance will be used to compute d2 and the binary price.' },
              ],
            },
          },
        },
        {
          title: 'From Variance to Price: d2 and N(d2)',
          content: 'Once we have total variance w(k), the binary option price comes from the Black-Scholes framework. The key quantity is d2 — a standardized measure of how likely the asset is to finish above the strike. The price is simply the normal CDF evaluated at d2.',
          emoji: '📉',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Step 4: Compute d2 from total variance
// d2 measures "standard deviations from threshold"
const d2 = -(k + w / 2) / Math.sqrt(w);

// Step 5: Binary UP price = N(d2) = normalCDF(d2)
// This is the risk-neutral probability of settlement >= strike
const price = normalCDF(d2);

// Connection to Black-Scholes:
// In B-S, a cash-or-nothing call pays 1 if S(T) >= K
// Its price = e^(-rT) * N(d2)
// DeepBook assumes zero interest rate (crypto), so price = N(d2)
// d2 = (ln(F/K) - w/2) / sqrt(w) = -(k + w/2) / sqrt(w)

// Example continuing from above:
// k = 0.022, w = 0.0885
// d2 = -(0.022 + 0.0885/2) / sqrt(0.0885)
// d2 = -(0.022 + 0.04425) / 0.2975
// d2 = -0.06625 / 0.2975 = -0.2227
// price = N(-0.2227) ≈ 0.4119 (41.2% probability)`,
              highlights: [
                { line: 3, explanation: 'd2 = -(k + w/2) / sqrt(w). Positive d2 means the strike is likely to be exceeded (ITM); negative d2 means OTM. The magnitude indicates confidence.' },
                { line: 7, explanation: 'normalCDF(d2) maps d2 to a probability [0, 1]. This IS the binary option price — no further discounting needed at zero interest rate.' },
                { line: 12, explanation: 'The formula is equivalent to Black-Scholes d2 = (ln(F/K) - w/2) / sqrt(w), rearranged using k = ln(K/F) = -ln(F/K).' },
                { line: 20, explanation: 'Price = 0.4119 means the market assigns a 41.2% probability that SUI will be at or above $4,600 at expiry. The UP binary costs $0.41.' },
              ],
            },
          },
        },
        {
          title: 'Normal CDF Approximation',
          content: 'Since there is no closed-form for the normal CDF, DeepBook uses the Abramowitz & Stegun approximation of the error function (erf). This polynomial approximation is accurate to ~1e-7 and efficient to compute both on-chain and off-chain.',
          emoji: '🔢',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function normalCDF(x: number): number {
  // N(x) = (1 + erf(x / sqrt(2))) / 2
  return (1 + erf(x / Math.SQRT2)) / 2;
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);

  // Abramowitz & Stegun coefficients (formula 7.1.26)
  const p  = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * ax);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const result = 1 - poly * Math.exp(-ax * ax);

  return sign * result;
}`,
              highlights: [
                { line: 3, explanation: 'normalCDF(x) = (1 + erf(x/sqrt(2))) / 2. This identity connects the standard normal CDF to the error function.' },
                { line: 11, explanation: 'p = 0.3275911 is the scaling constant. It defines t = 1/(1 + p*|x|), which compresses the input for polynomial evaluation.' },
                { line: 12, explanation: 'a1 through a5 are the Abramowitz & Stegun polynomial coefficients for formula 7.1.26. They give ~7 decimal digits of accuracy.' },
                { line: 19, explanation: 'The polynomial is evaluated in Horner form for numerical stability: ((((a5*t + a4)*t + a3)*t + a2)*t + a1)*t.' },
                { line: 20, explanation: 'Multiply by exp(-x^2) and subtract from 1. The sign variable handles the erf symmetry: erf(-x) = -erf(x).' },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-predict-002',
    },
    {
      sectionTitle: 'Price Interpretation',
      slides: [
        {
          title: 'Binary Price as Probability',
          content: 'A binary option price is a direct probability estimate. Understanding how to interpret prices — and how UP, DOWN, and RANGE prices relate to each other — is essential for building trading interfaces and risk displays.',
          emoji: '🎯',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Price Range 0 to 1', content: 'A binary option price always falls between 0 and 1. A price of 0.65 means the market assigns a 65% probability that the condition will be met at expiry. You pay $0.65 to potentially receive $1.00.' },
                { label: 'ITM / OTM / ATM', content: 'ITM (in-the-money): strike is already favorable, price > 0.50. OTM (out-of-the-money): strike is unfavorable, price < 0.50. ATM (at-the-money): strike near forward, price ≈ 0.50. The further OTM, the cheaper the option.' },
                { label: 'DOWN = 1 - UP', content: 'For the same strike, the DOWN binary price equals 1 minus the UP binary price. If UP costs 0.60, DOWN costs 0.40. This is because exactly one of them pays out — the settlement is either above or below the strike.' },
                { label: 'Range Price', content: 'A RANGE binary pays if settlement is between lower and higher strikes. Its price = P(above lower) - P(above higher) = computeSviPrice(lower) - computeSviPrice(higher). The wider the range, the more expensive.' },
              ],
            },
          },
        },
        {
          title: 'Full computeSviPrice Implementation',
          content: 'Here is the complete computeSviPrice function that the YOSUKU codebase uses. It takes SVI parameters (already decoded from FLOAT_SCALING), a strike, and a forward price, and returns the binary UP price as a number between 0 and 1.',
          emoji: '⚡',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function computeSviPrice(
  a: number, b: number, rho: number,
  m: number, sigma: number,
  strike: number, forward: number
): number {
  // 1. Log-moneyness
  const k = Math.log(strike / forward);

  // 2. Shifted moneyness
  const km = k - m;

  // 3. SVI total variance
  const w = a + b * (rho * km + Math.sqrt(km * km + sigma * sigma));

  // 4. Guard: variance must be positive
  if (w <= 0) return strike <= forward ? 1 : 0;

  // 5. d2 statistic
  const sqrtW = Math.sqrt(w);
  const d2 = -(k + w / 2) / sqrtW;

  // 6. Binary price = N(d2)
  return normalCDF(d2);
}`,
              highlights: [
                { line: 7, explanation: 'Step 1: k = ln(strike/forward). All SVI math operates in log-moneyness space, not raw price space.' },
                { line: 10, explanation: 'Step 2: km = k - m. The parameter m shifts where the smile minimum sits along the moneyness axis.' },
                { line: 13, explanation: 'Step 3: The core SVI formula. The rho*km term adds skew; the sqrt term creates the smile wings.' },
                { line: 16, explanation: 'Guard clause: if SVI params produce w <= 0 (degenerate case), return a trivial price — 1 if strike is below forward, 0 otherwise.' },
                { line: 20, explanation: 'Step 5: d2 = -(k + w/2) / sqrt(w). This is the standardized distance that feeds into the normal CDF.' },
                { line: 23, explanation: 'Step 6: normalCDF(d2) gives the risk-neutral probability of settlement >= strike. This IS the binary UP price.' },
              ],
            },
          },
        },
        {
          title: 'Range Price Calculation',
          content: 'A RANGE binary option pays 1 if the settlement price falls between a lower and higher strike. Its price is computed by subtracting two UP prices — the probability of being above the lower strike minus the probability of being above the higher strike.',
          emoji: '📊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function computeRangePrice(
  a: number, b: number, rho: number,
  m: number, sigma: number,
  lowerStrike: number, higherStrike: number,
  forward: number
): number {
  // P(settlement >= lower)
  const pAboveLower = computeSviPrice(
    a, b, rho, m, sigma, lowerStrike, forward
  );

  // P(settlement >= higher)
  const pAboveHigher = computeSviPrice(
    a, b, rho, m, sigma, higherStrike, forward
  );

  // P(lower < settlement <= higher) = P(above lower) - P(above higher)
  return Math.max(0, pAboveLower - pAboveHigher);
}

// Example:
// forward = 4500, lower = 4400, higher = 4600
// pAboveLower  = computeSviPrice(..., 4400, 4500) = 0.62
// pAboveHigher = computeSviPrice(..., 4600, 4500) = 0.41
// rangePrice   = max(0, 0.62 - 0.41) = 0.21
// 21% probability settlement lands in [4400, 4600]`,
              highlights: [
                { line: 8, explanation: 'pAboveLower is the UP price at the lower strike — the probability that settlement will be at or above lowerStrike.' },
                { line: 13, explanation: 'pAboveHigher is the UP price at the higher strike — the probability that settlement will be at or above higherStrike.' },
                { line: 18, explanation: 'The range probability = pAboveLower - pAboveHigher. We use Math.max(0, ...) to guard against numerical edge cases.' },
                { line: 25, explanation: 'With a $200 range around the forward ($4400-$4600), the range price is 0.21 — a 21% probability. Wider ranges cost more.' },
              ],
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'What does the log-moneyness k represent in the SVI model?',
      options: [
        'k = strike - forward',
        'k = ln(strike / forward)',
        'k = strike / forward',
        'k = forward / strike',
      ],
      correctAnswer: 1,
      explanation: 'Log-moneyness is defined as k = ln(strike / forward). It measures how far the strike is from the forward price in log space. k = 0 at the money, k > 0 for OTM UP strikes, k < 0 for ITM UP strikes.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What does the SVI parameter rho control?',
      options: [
        'The overall level of variance across all strikes',
        'The smoothness of the smile at ATM',
        'The skew (tilt) of the volatility smile',
        'The number of valid strikes in the grid',
      ],
      correctAnswer: 2,
      explanation: 'rho controls the skew of the volatility smile. Negative rho tilts the smile so that lower strikes have higher IV (put skew), which is typical in crypto and equity markets. rho ranges from -1 to 1.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What is the binary UP option price in terms of d2?',
      options: [
        'd2 / sqrt(2*pi)',
        'exp(-d2^2 / 2)',
        'normalCDF(d2)',
        '1 - normalCDF(d2)',
      ],
      correctAnswer: 2,
      explanation: 'The binary UP option price is normalCDF(d2), where d2 = -(k + w/2) / sqrt(w). This comes from Black-Scholes: a cash-or-nothing call price equals N(d2) when the interest rate is zero.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'If an UP binary option at a given strike costs 0.52, what does a DOWN binary at the same strike cost?',
      options: [
        '0.52 (same price)',
        '0.50 (always half)',
        '0.48 (since DOWN = 1 - UP)',
        'Cannot be determined without SVI params',
      ],
      correctAnswer: 2,
      explanation: 'For the same strike, DOWN price = 1 - UP price. Since exactly one outcome occurs (settlement is either above or below the strike), the two prices must sum to 1. So DOWN = 1 - 0.52 = 0.48.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What happens to w(k) when the strike equals the forward price (k = 0)?',
      options: [
        'w = 0 (no variance at the money)',
        'w = a + b * sigma (simplified since rho term vanishes)',
        'w = a + b * (rho * (-m) + sqrt(m^2 + sigma^2))',
        'w = 1 (normalized at ATM)',
      ],
      correctAnswer: 2,
      explanation: 'When k = 0, km = 0 - m = -m. Substituting into the SVI formula: w = a + b * (rho * (-m) + sqrt((-m)^2 + sigma^2)) = a + b * (rho * (-m) + sqrt(m^2 + sigma^2)). The result depends on m — the smile is not necessarily minimized at ATM.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// SVI Pricing Model — Practice
// Implement the binary option pricing engine from scratch.

const FLOAT_SCALING = 1_000_000_000;

// --- Given: Normal CDF (do NOT modify) ---
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const p  = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const t = 1 / (1 + p * ax);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return sign * (1 - poly * Math.exp(-ax * ax));
}

function normalCDF(x: number): number {
  return (1 + erf(x / Math.SQRT2)) / 2;
}
// --- End given functions ---

interface SviParams {
  a: number;   // FLOAT_SCALING encoded
  b: number;
  rho: number;
  m: number;
  sigma: number;
}

// TODO 1: Compute the binary UP option price using the SVI model.
// Steps:
//   - Decode all SVI params by dividing by FLOAT_SCALING
//   - Compute k = ln(strike / forward)
//   - Compute km = k - decodedM
//   - Compute w = decodedA + decodedB * (decodedRho * km + sqrt(km^2 + decodedSigma^2))
//   - If w <= 0, return strike <= forward ? 1 : 0
//   - Compute d2 = -(k + w/2) / sqrt(w)
//   - Return normalCDF(d2)
function computeSviPrice(
  params: SviParams,
  strike: number,
  forward: number
): number {
  // Your code here
}

// TODO 2: Compute the RANGE binary option price.
// A range option pays 1 if settlement is between lowerStrike and higherStrike.
// rangePrice = computeSviPrice(lower) - computeSviPrice(higher)
// Clamp to 0 if negative.
function computeRangePrice(
  params: SviParams,
  lowerStrike: number,
  higherStrike: number,
  forward: number
): number {
  // Your code here
}

// TODO 3: Compute the DOWN binary option price.
// A DOWN binary pays 1 if settlement < strike.
// downPrice = 1 - computeSviPrice(strike)
function computeDownPrice(
  params: SviParams,
  strike: number,
  forward: number
): number {
  // Your code here
}

// TODO 4: Find the ATM (at-the-money) strike.
// Given an array of valid strikes, return the one closest to the forward price.
// If two strikes are equidistant, return the lower one.
function findATMStrike(
  strikes: number[],
  forward: number
): number {
  // Your code here
}`,

  solution: `// SVI Pricing Model — Practice (Solution)

const FLOAT_SCALING = 1_000_000_000;

// --- Given: Normal CDF ---
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const p  = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const t = 1 / (1 + p * ax);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return sign * (1 - poly * Math.exp(-ax * ax));
}

function normalCDF(x: number): number {
  return (1 + erf(x / Math.SQRT2)) / 2;
}
// --- End given functions ---

interface SviParams {
  a: number;
  b: number;
  rho: number;
  m: number;
  sigma: number;
}

// TODO 1: Compute binary UP price using SVI model
function computeSviPrice(
  params: SviParams,
  strike: number,
  forward: number
): number {
  // Decode SVI params from FLOAT_SCALING
  const a = params.a / FLOAT_SCALING;
  const b = params.b / FLOAT_SCALING;
  const rho = params.rho / FLOAT_SCALING;
  const m = params.m / FLOAT_SCALING;
  const sigma = params.sigma / FLOAT_SCALING;

  // Log-moneyness
  const k = Math.log(strike / forward);

  // Shifted moneyness
  const km = k - m;

  // SVI total variance
  const w = a + b * (rho * km + Math.sqrt(km * km + sigma * sigma));

  // Guard: variance must be positive
  if (w <= 0) return strike <= forward ? 1 : 0;

  // d2 statistic
  const sqrtW = Math.sqrt(w);
  const d2 = -(k + w / 2) / sqrtW;

  // Binary price = N(d2)
  return normalCDF(d2);
}

// TODO 2: Compute RANGE binary price
function computeRangePrice(
  params: SviParams,
  lowerStrike: number,
  higherStrike: number,
  forward: number
): number {
  const pAboveLower = computeSviPrice(params, lowerStrike, forward);
  const pAboveHigher = computeSviPrice(params, higherStrike, forward);
  return Math.max(0, pAboveLower - pAboveHigher);
}

// TODO 3: Compute DOWN binary price
function computeDownPrice(
  params: SviParams,
  strike: number,
  forward: number
): number {
  return 1 - computeSviPrice(params, strike, forward);
}

// TODO 4: Find ATM strike (closest to forward)
function findATMStrike(
  strikes: number[],
  forward: number
): number {
  let closest = strikes[0];
  let minDist = Math.abs(strikes[0] - forward);

  for (let i = 1; i < strikes.length; i++) {
    const dist = Math.abs(strikes[i] - forward);
    if (dist < minDist) {
      minDist = dist;
      closest = strikes[i];
    }
  }

  return closest;
}`,

  hints: [
    'computeSviPrice: First decode all 5 params by dividing by FLOAT_SCALING. Then compute k = Math.log(strike / forward), km = k - m, and w using the SVI formula. Finally compute d2 = -(k + w/2) / sqrt(w) and return normalCDF(d2).',
    'computeRangePrice: Call computeSviPrice twice — once with lowerStrike and once with higherStrike. The range price is the difference, clamped to 0 with Math.max.',
    'computeDownPrice: A DOWN binary is the complement of UP. Simply return 1 - computeSviPrice(params, strike, forward).',
    'findATMStrike: Loop through the strikes array and track the one with the smallest Math.abs(strike - forward). Return that strike.',
  ],
};
