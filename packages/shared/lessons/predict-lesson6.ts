import { LessonContent } from '../types/lesson';

export const predictLesson6: LessonContent = {
  id: 'predict-6',
  title: 'LP Vault Management',
  description: 'Master the DeepBook Predict vault architecture — understand how LPs supply liquidity via PLP tokens, how vault value and exposure are tracked, and how to compute share prices, utilization, and mint amounts for LP operations.',
  difficulty: 'advanced',
  xpReward: 300,
  order: 6,
  language: 'typescript',
  prerequisiteLessons: ['predict-5'],

  narrative: {
    welcomeMessage: "You've built trading transactions. Now let's look at the other side of every trade — the LP vault. When a trader mints a position, the vault takes the opposite side. Understanding vault mechanics is essential for building LP interfaces and risk dashboards.",
    quizTransition: "You've explored vault architecture, PLP tokens, and risk management. Let's test your understanding of how the vault operates and how LPs interact with it.",
    practiceTransition: "Time to implement the core vault math! You'll compute share prices, vault values, utilization ratios, and PLP mint amounts — the calculations that power every LP dashboard.",
    celebrationMessage: "Excellent work! You now understand the full LP lifecycle — from supplying DUSDC and receiving PLP tokens, to tracking vault exposure, to computing the exact share price and mint amounts.",
    nextLessonTease: "Next: integrating everything into a complete trading flow with wallet connection, real-time data, and end-to-end transaction execution.",
  },

  teachingSections: [
    {
      sectionTitle: 'Vault Architecture',
      slides: [
        {
          title: 'How the Vault Works',
          content: 'The DeepBook Predict vault is the counterparty to every trade. When a trader mints a position, the vault collects the premium. When a position settles in-the-money, the vault pays out. Understanding this architecture is key to building LP interfaces.',
          emoji: '🏦',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Vault Holds DUSDC', content: 'The vault holds DUSDC supplied by LPs. This pool of capital is the backing for all open positions. When traders pay premiums, DUSDC flows into the vault. When positions settle ITM, DUSDC flows out.' },
                { label: 'Takes Other Side of Every Trade', content: 'The vault is the automatic market maker — it takes the opposite side of every trader\'s position. If a trader goes UP, the vault is effectively short. This is how the protocol provides instant liquidity without an order book.' },
                { label: 'Strike Matrix Tracking', content: 'The vault tracks exposure via strike matrices — one per oracle. Each matrix records how many position units exist at each strike/direction combination. This allows precise calculation of worst-case payouts and mark-to-market values.' },
                { label: 'Vault Value Formula', content: 'Vault value = balance - totalMTM. The balance is total DUSDC held. The totalMTM (mark-to-market) is the fair value of all open liabilities. When MTM rises, vault value drops — meaning open positions are more likely to pay out.' },
              ],
            },
          },
        },
        {
          title: 'VaultStats Interface',
          content: 'The VaultStats interface captures the real-time state of the vault. Every field serves a purpose — from tracking total deposits to computing fee adjustments based on utilization.',
          emoji: '📊',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface VaultStats {
  balance: number;                // Total DUSDC held in the vault
  totalMtm: number;              // Mark-to-market of all open liabilities
  vaultValue: number;            // balance - totalMtm (net value to LPs)
  maxPayout: number;             // Worst-case total payout if all positions win
  totalPlpSupply: number;        // Total PLP tokens in circulation
  availableForWithdraw: number;  // DUSDC LPs can withdraw right now
  baseFee: number;               // Base trading fee percentage
  minFee: number;                // Minimum fee floor
  utilizationMultiplier: number; // Fee multiplier based on utilization
}`,
              highlights: [
                { line: 2, explanation: 'balance: The raw DUSDC amount in the vault. Increases with LP deposits and trader premiums. Decreases with LP withdrawals and position payouts.' },
                { line: 3, explanation: 'totalMtm: The aggregate fair value of all open positions from the vault\'s perspective. Computed from SVI pricing across all active oracles and strikes.' },
                { line: 4, explanation: 'vaultValue: The net value belonging to LPs. This is what determines PLP share price. If totalMtm increases (positions more likely to pay out), vaultValue decreases.' },
                { line: 5, explanation: 'maxPayout: The absolute worst case — if every single open position settled in-the-money. Used to compute utilization = maxPayout / balance.' },
                { line: 6, explanation: 'totalPlpSupply: Total PLP receipt tokens outstanding. Share price = vaultValue / totalPlpSupply.' },
                { line: 7, explanation: 'availableForWithdraw: May be less than vaultValue due to the withdrawal limiter, which gates LP exits to protect the vault during high utilization.' },
                { line: 9, explanation: 'utilizationMultiplier: When utilization is high, fees increase to compensate LPs for higher risk. This multiplier scales the baseFee.' },
              ],
            },
          },
        },
        {
          title: 'Vault Components',
          content: 'The vault is built from several interconnected components. Each one plays a specific role in tracking the vault\'s financial state.',
          emoji: '🧩',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'balance', label: 'Balance', emoji: '💰' },
                { id: 'mtm', label: 'MTM', emoji: '📈' },
                { id: 'max-payout', label: 'Max Payout', emoji: '⚠️' },
                { id: 'utilization', label: 'Utilization', emoji: '📏' },
              ],
              targets: [
                { id: 'desc-balance', label: 'Total DUSDC held in the vault' },
                { id: 'desc-mtm', label: 'Fair value of open liability' },
                { id: 'desc-max-payout', label: 'Worst-case total payout' },
                { id: 'desc-utilization', label: 'maxPayout / balance ratio' },
              ],
              correctPairs: [
                { itemId: 'balance', targetId: 'desc-balance' },
                { itemId: 'mtm', targetId: 'desc-mtm' },
                { itemId: 'max-payout', targetId: 'desc-max-payout' },
                { itemId: 'utilization', targetId: 'desc-utilization' },
              ],
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'PLP Token & LP Operations',
      slides: [
        {
          title: 'PLP: LP Receipt Token',
          content: 'PLP (Predict Liquidity Provider) tokens represent your share of the vault. They are minted when you supply DUSDC and burned when you withdraw. The share price changes over time as the vault earns fees or pays out positions.',
          emoji: '🪙',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Minted on Supply', content: 'When an LP deposits DUSDC into the vault, PLP tokens are minted proportional to their deposit relative to the current vault value. The number of PLP received = depositAmount * totalPlpSupply / vaultValue.' },
                { label: 'Burned on Withdraw', content: 'When an LP withdraws, they send PLP tokens back. The vault burns them and returns the proportional share of DUSDC. The DUSDC received = plpAmount * vaultValue / totalPlpSupply.' },
                { label: 'Share Price', content: 'Share price = vaultValue / totalPlpSupply. This rises when the vault earns net fees (trader losses > payouts) and falls when the vault pays out more than it collects. First deposit is always 1:1 (1 DUSDC = 1 PLP).' },
                { label: 'Proportional Accounting', content: 'After the first deposit, all subsequent deposits and withdrawals are proportional. If the share price is 1.05, depositing 100 DUSDC gives you ~95.24 PLP. If you withdraw those 95.24 PLP later at share price 1.10, you get ~104.76 DUSDC.' },
              ],
            },
          },
        },
        {
          title: 'Supply Transaction',
          content: 'The supplyLpTx function builds a PTB that deposits DUSDC into the vault and mints PLP tokens to the sender. It handles coin merging, splitting, and the predict::supply call.',
          emoji: '📥',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const DUSDC_TYPE = '0xe950...::dusdc::DUSDC';

function supplyLpTx(
  predictId: string,
  coinIds: string[],
  amount: number,
  sender: string
): Transaction {
  const tx = new Transaction();

  // Step 1: Merge all DUSDC coins into one
  const primaryCoin = tx.object(coinIds[0]);
  if (coinIds.length > 1) {
    tx.mergeCoins(
      primaryCoin,
      coinIds.slice(1).map(id => tx.object(id))
    );
  }

  // Step 2: Split exact supply amount
  const [supplyCoin] = tx.splitCoins(primaryCoin, [amount]);

  // Step 3: Call predict::supply — returns PLP coin
  const plpCoin = tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::supply\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(predictId),
      supplyCoin,
      tx.object(CLOCK_ID),
    ],
  });

  // Step 4: Transfer PLP to sender
  tx.transferObjects([plpCoin], sender);

  return tx;
}`,
              highlights: [
                { line: 3, explanation: 'supplyLpTx builds the complete LP deposit transaction. It takes the Predict object ID, the user\'s DUSDC coin IDs, the amount, and the sender address.' },
                { line: 12, explanation: 'Merge all DUSDC coins first. LPs may have many small coin objects from various sources.' },
                { line: 21, explanation: 'Split exactly the amount to supply. The remainder stays in the primary coin.' },
                { line: 24, explanation: 'predict::supply takes a Coin<DUSDC> and returns a Coin<PLP>. The vault mints PLP proportional to vaultValue.' },
                { line: 30, explanation: 'The Clock is needed to verify oracle freshness — the vault checks that MTM values are recent before accepting deposits.' },
                { line: 35, explanation: 'The PLP coin must be explicitly transferred to the sender. Move\'s linear type system requires all created objects to be consumed.' },
              ],
            },
          },
        },
        {
          title: 'Withdraw Transaction',
          content: 'The withdrawLpTx function builds a PTB that burns PLP tokens and returns DUSDC to the LP. Withdrawals may be limited by the withdrawal limiter during high-utilization periods.',
          emoji: '📤',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `function withdrawLpTx(
  predictId: string,
  plpCoinId: string,
  sender: string
): Transaction {
  const tx = new Transaction();

  // Call predict::withdraw — burns PLP, returns DUSDC
  const dusdcCoin = tx.moveCall({
    target: \`\${PACKAGE_ID}::predict::withdraw\`,
    typeArguments: [DUSDC_TYPE],
    arguments: [
      tx.object(predictId),
      tx.object(plpCoinId),   // PLP coin to burn
      tx.object(CLOCK_ID),
    ],
  });

  // Transfer received DUSDC to sender
  tx.transferObjects([dusdcCoin], sender);

  return tx;
}

// Note: The withdrawal limiter may restrict how much
// DUSDC is returned. If utilization is high, the vault
// may only allow partial withdrawals to maintain
// sufficient collateral for open positions.`,
              highlights: [
                { line: 1, explanation: 'withdrawLpTx is simpler than supply — no merging or splitting needed. The LP provides a PLP coin and receives DUSDC back.' },
                { line: 9, explanation: 'predict::withdraw burns the provided PLP coin and returns a Coin<DUSDC> proportional to the current share price.' },
                { line: 14, explanation: 'The PLP coin object is passed directly. Its full balance is burned — to withdraw a partial amount, split the PLP coin first.' },
                { line: 15, explanation: 'Clock is checked to ensure MTM freshness. Withdrawals require up-to-date mark-to-market values to compute fair share price.' },
                { line: 20, explanation: 'The DUSDC coin must be transferred to the sender. The amount received = plpAmount * vaultValue / totalPlpSupply.' },
                { line: 27, explanation: 'Withdrawal limiter: a safety mechanism that restricts LP exits when utilization is high, preventing a "bank run" scenario.' },
              ],
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Risk Management',
      slides: [
        {
          title: 'Exposure Limits',
          content: 'The vault has multiple risk controls to protect LPs. These limits prevent the vault from taking on too much exposure and ensure orderly withdrawals even under stress.',
          emoji: '🛡️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'max_total_exposure_pct', content: 'Default: 80%. The vault will not accept new trades if maxPayout / balance would exceed this threshold. This ensures at least 20% of the vault is always uncommitted, providing a safety buffer.' },
                { label: 'MTM Freshness (10s)', content: 'Mark-to-market values must be updated within the last 10 seconds for supply/withdraw operations. Stale MTM could allow LPs to enter or exit at mispriced share prices, extracting value from other LPs.' },
                { label: 'Withdrawal Limiter', content: 'The withdrawal limiter gates LP exits during high-utilization periods. It prevents a scenario where LPs rush to withdraw after a large adverse move, leaving insufficient collateral for open positions.' },
                { label: 'Strike Matrix per Oracle', content: 'Each oracle maintains a strike matrix tracking positions at every strike/direction. This granular tracking enables precise maxPayout calculation and allows the vault to assess concentration risk at specific price levels.' },
              ],
            },
          },
        },
        {
          title: 'VaultSummaryData from API',
          content: 'The API provides a VaultSummaryData object with comprehensive vault statistics. This is the data source for LP dashboards, showing everything from TVL to share price.',
          emoji: '🔌',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface VaultSummaryData {
  predict_id: string;        // Predict shared object ID
  tvl: number;               // Total Value Locked (same as balance)
  plp_share_price: number;   // Current PLP share price
  utilization: number;       // maxPayout / balance (0 to 1)
  total_supplied: number;    // Cumulative DUSDC ever deposited by LPs
  total_withdrawn: number;   // Cumulative DUSDC ever withdrawn by LPs
  net_deposits: number;      // total_supplied - total_withdrawn
  balance: number;           // Current DUSDC in vault
  total_mtm: number;         // Current mark-to-market liability
  max_payout: number;        // Worst-case payout
  total_plp_supply: number;  // PLP tokens outstanding
}`,
              highlights: [
                { line: 2, explanation: 'predict_id identifies the Predict shared object. Use this as the first argument to supply and withdraw transactions.' },
                { line: 3, explanation: 'tvl (Total Value Locked): The raw DUSDC balance. This is the headline number for LP dashboards.' },
                { line: 4, explanation: 'plp_share_price: Precomputed share price = vaultValue / totalPlpSupply. Use this to display LP returns.' },
                { line: 5, explanation: 'utilization: How much of the vault is committed. 0.0 = no exposure, 1.0 = fully utilized. Higher utilization means higher fees but more risk.' },
                { line: 6, explanation: 'total_supplied vs total_withdrawn: Cumulative lifetime flows. net_deposits = total_supplied - total_withdrawn shows overall LP capital commitment.' },
                { line: 9, explanation: 'balance, total_mtm, max_payout: The three core vault metrics. balance - total_mtm = vaultValue. max_payout / balance = utilization.' },
                { line: 12, explanation: 'total_plp_supply: Needed to compute how many PLP tokens a new deposit would receive.' },
              ],
            },
          },
        },
        {
          title: 'LP Risk/Reward',
          content: 'LP returns depend on the balance between fees earned and positions paid out. Understanding these scenarios helps LPs make informed decisions about when and how much to supply.',
          emoji: '⚖️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'high-util', label: 'High Utilization', emoji: '🔴' },
                { id: 'low-util', label: 'Low Utilization', emoji: '🟢' },
                { id: 'settled', label: 'Many Settled Positions', emoji: '✅' },
                { id: 'vault-up', label: 'Vault Value Increases', emoji: '📈' },
              ],
              targets: [
                { id: 'outcome-high', label: 'Higher fees earned but more risk' },
                { id: 'outcome-low', label: 'Lower fees but safer' },
                { id: 'outcome-settled', label: 'MTM reduces as positions settle' },
                { id: 'outcome-price', label: 'PLP share price rises' },
              ],
              correctPairs: [
                { itemId: 'high-util', targetId: 'outcome-high' },
                { itemId: 'low-util', targetId: 'outcome-low' },
                { itemId: 'settled', targetId: 'outcome-settled' },
                { itemId: 'vault-up', targetId: 'outcome-price' },
              ],
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'How is vault value calculated?',
      options: [
        'balance + totalMtm',
        'balance - totalMtm',
        'maxPayout - totalMtm',
        'totalPlpSupply * sharePrice + totalMtm',
      ],
      correctAnswer: 1,
      explanation: 'Vault value = balance - totalMtm. The balance is all DUSDC held in the vault, and totalMtm is the fair value of all open liabilities. Subtracting MTM gives the net value belonging to LPs.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'How is PLP share price computed?',
      options: [
        'balance / totalPlpSupply',
        'totalPlpSupply / vaultValue',
        'vaultValue / totalPlpSupply',
        'maxPayout / totalPlpSupply',
      ],
      correctAnswer: 2,
      explanation: 'Share price = vaultValue / totalPlpSupply. Since vaultValue = balance - totalMtm, the share price reflects the net value per PLP token after accounting for open liabilities.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What does max_total_exposure_pct (default 80%) control?',
      options: [
        'The maximum percentage of PLP that can be burned per day',
        'The maximum percentage of vault balance that maxPayout can reach',
        'The maximum fee a trader can be charged',
        'The maximum number of oracles the vault can support',
      ],
      correctAnswer: 1,
      explanation: 'max_total_exposure_pct caps the ratio of maxPayout to balance. At 80%, the vault refuses new trades if they would push maxPayout above 80% of balance, ensuring at least 20% remains as a safety buffer.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'What is the purpose of the withdrawal limiter?',
      options: [
        'To limit how much DUSDC traders can deposit',
        'To prevent LPs from withdrawing during high utilization, protecting vault solvency',
        'To limit the number of PLP tokens that can be minted',
        'To cap the share price to prevent manipulation',
      ],
      correctAnswer: 1,
      explanation: 'The withdrawal limiter gates LP exits during high-utilization periods. Without it, LPs could rush to withdraw after adverse moves, leaving insufficient collateral for open positions and potentially making the vault insolvent.',
      weaknessTopic: 'deepbook-predict',
    },
    {
      question: 'If an LP deposits 500 DUSDC when vaultValue is 10,000 and totalPlpSupply is 9,500, how many PLP tokens do they receive?',
      options: [
        '500 PLP',
        '475 PLP',
        '526.32 PLP',
        '950 PLP',
      ],
      correctAnswer: 1,
      explanation: 'PLP minted = depositAmount * totalPlpSupply / vaultValue = 500 * 9500 / 10000 = 475 PLP. The share price is 10000/9500 = ~1.0526, so 500 DUSDC buys fewer than 500 PLP because each PLP is worth more than 1 DUSDC.',
      weaknessTopic: 'deepbook-predict',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// LP Vault Management — Practice
// Implement the core vault math used in LP dashboards.

// ─── TODO 1: Compute Share Price ───
// Calculate the PLP share price given vault value and total PLP supply.
// Formula: vaultValue / totalPlpSupply
// Edge case: if totalPlpSupply is 0, return 1 (first deposit is 1:1).
function computeSharePrice(
  vaultValue: number,
  totalPlpSupply: number
): number {
  // Your code here
}

// ─── TODO 2: Compute Vault Value ───
// Calculate the vault value from balance and total MTM.
// Formula: balance - totalMtm
function computeVaultValue(
  balance: number,
  totalMtm: number
): number {
  // Your code here
}

// ─── TODO 3: Compute Utilization ───
// Calculate the utilization ratio: maxPayout / balance.
// Cap the result at 1.0 (utilization cannot exceed 100%).
// Edge case: if balance is 0, return 0.
function computeUtilization(
  maxPayout: number,
  balance: number
): number {
  // Your code here
}

// ─── TODO 4: Compute PLP Mint Amount ───
// For a given DUSDC deposit, calculate how many PLP tokens to mint.
// Formula: depositAmount * totalPlpSupply / vaultValue
// Edge case: if vaultValue is 0 or totalPlpSupply is 0,
//   return depositAmount (first deposit is 1:1).
function computePLPMintAmount(
  depositAmount: number,
  vaultValue: number,
  totalPlpSupply: number
): number {
  // Your code here
}`,

  solution: `// LP Vault Management — Solution

// TODO 1: Compute Share Price
function computeSharePrice(
  vaultValue: number,
  totalPlpSupply: number
): number {
  if (totalPlpSupply === 0) {
    return 1;
  }
  return vaultValue / totalPlpSupply;
}

// TODO 2: Compute Vault Value
function computeVaultValue(
  balance: number,
  totalMtm: number
): number {
  return balance - totalMtm;
}

// TODO 3: Compute Utilization
function computeUtilization(
  maxPayout: number,
  balance: number
): number {
  if (balance === 0) {
    return 0;
  }
  return Math.min(maxPayout / balance, 1.0);
}

// TODO 4: Compute PLP Mint Amount
function computePLPMintAmount(
  depositAmount: number,
  vaultValue: number,
  totalPlpSupply: number
): number {
  if (vaultValue === 0 || totalPlpSupply === 0) {
    return depositAmount;
  }
  return depositAmount * totalPlpSupply / vaultValue;
}`,

  hints: [
    'For computeSharePrice: check if totalPlpSupply is 0 first — if so, return 1 (the initial 1:1 ratio). Otherwise, divide vaultValue by totalPlpSupply.',
    'For computeVaultValue: this is a simple subtraction — balance minus totalMtm. The vault value is what remains after accounting for open liabilities.',
    'For computeUtilization: guard against division by zero (balance === 0 returns 0). Then compute maxPayout / balance and use Math.min(..., 1.0) to cap at 100%.',
    'For computePLPMintAmount: handle the first-deposit edge case where vaultValue or totalPlpSupply is 0 — return depositAmount directly. Otherwise, apply the formula: depositAmount * totalPlpSupply / vaultValue.',
  ],
};
