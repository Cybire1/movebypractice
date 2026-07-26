import { LessonContent } from '@/app/types/lesson';

export const hashiLesson3: LessonContent = {
  id: 'hashi-3',
  title: 'Advanced Hashi',
  description: 'Compose hBTC into a real product — PTB integration, relayed and gas-sponsored deposits, keeper-driven confirmation, and the production realities of shipping a Bitcoin on-ramp.',
  difficulty: 'advanced',
  xpReward: 300,
  order: 3,
  language: 'typescript',
  prerequisiteLessons: ['hashi-2'],

  narrative: {
    welcomeMessage: "You can move BTC to Sui and back. Now make it worth doing. This lesson is about hBTC as a building block — composing it inside a PTB, relaying the Sui side so the user never needs SUI, and being honest about the friction you cannot engineer away.",
    quizTransition: "You've seen how hBTC composes and what it costs to run in production. Let's check the details that bite integrators.",
    practiceTransition: "Time to write the helpers a real integration needs — deposit progress, withdrawal validation, and satoshi formatting.",
    celebrationMessage: "That's the full picture. You can compose hBTC, sponsor the Sui side, drive the wait with a keeper, and name the friction honestly.",
    nextLessonTease: "Next: pick a destination and ship it — wire the on-ramp into a real app so hBTC goes to work the moment it mints.",
  },

  teachingSections: [
    {
      sectionTitle: 'Composing hBTC in a PTB',
      slides: [
        {
          title: 'hBTC Is an Ordinary Coin',
          content: 'Hashi mints `hBTC` as a plain Sui coin — 8 decimals, `Coin<BTC>` and `Balance<BTC>` like any other asset. Your Move code needs no Hashi-specific interface, no allow-list, no registration. That is the whole composability story: the bridge stops mattering the moment the coin exists, and everything you already know about moving coins on Sui applies unchanged.',
          emoji: '🪙',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'The type string', content: 'On testnet, hBTC is 0xfcea10cadbb553c4874201584abf68771592678952efd957b2e82c010c7f4360::btc::BTC. The SDK builds it as `{packageId}::btc::BTC`, so derive it from the resolved package id rather than pasting a literal.' },
                { label: '8 decimals', content: '1 hBTC = 100,000,000 sats. The SDK speaks bigint satoshis end to end — amounts, minimums, balances. Keep sats internally and format only at the display edge, never earlier.' },
                { label: 'Backed 1:1, natively', content: 'Real BTC stays on Bitcoin in a 2-of-2 taproot output. hBTC is minted against one specific UTXO, for the full amount, with no protocol deposit fee. There is no custodian issuing an IOU you have to trust separately.' },
                { label: 'Nothing to integrate', content: 'A Move function that takes `Balance<BTC>` or `Coin<BTC>` already accepts hBTC. Hashi does not need to know your package exists, and your package does not need to import Hashi.' },
              ],
              explanation: 'hBTC composes because it is an ordinary Sui coin with 8 decimals, not because of any integration surface. Amounts are bigint satoshis throughout the SDK.',
            },
          },
        },
        {
          title: 'Use It in the Same Block',
          content: 'Once hBTC sits in the user\'s wallet, one programmable transaction block can source it and hand it straight to your protocol. `tx.balance({ type, balance })` selects and merges the sender\'s hBTC coins at execution — the same helper the SDK uses to fund a withdrawal. The user signs once, and the balance never sits idle between transactions.',
          emoji: '⛓️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { Transaction } from '@mysten/sui/transactions';

const HBTC = \`\${PACKAGE_ID}::btc::BTC\`;

// hBTC just landed in the user's wallet. Don't leave it idle.
const tx = new Transaction();

// Source an exact sat amount from the user's hBTC coins
const collateral = tx.balance({ type: HBTC, balance: 50_000n });

tx.moveCall({
  target: \`\${MY_PACKAGE}::vault::deposit_collateral\`,
  arguments: [tx.object(VAULT_ID), collateral],
});

// One signature: bridge asset in, position open, same block.
await client.signAndExecuteTransaction({ signer, transaction: tx });`,
              highlights: [
                { line: 3, explanation: 'The coin type is derived from the resolved Hashi package id. Same shape as any other Sui coin type — module `btc`, struct `BTC`.' },
                { line: 9, explanation: '`tx.balance` produces a `Balance<BTC>` by auto-selecting and merging the sender\'s hBTC coins at execution time. The SDK uses this exact helper inside `tx.requestWithdrawal`.' },
                { line: 13, explanation: 'Your Move function receives a `Balance<BTC>` like any other asset. No Hashi import, no registration, no special casing.' },
                { line: 17, explanation: 'One signature covers the whole chain of commands. If any command aborts, none of it happened — the user is never left holding a half-finished state.' },
              ],
              explanation: 'A PTB can source hBTC with tx.balance and pass it directly into your own Move call, so the bridged asset is put to work in the same signed transaction.',
            },
          },
        },
        {
          title: 'Custody Is Enforced, Not Promised',
          content: 'hBTC mints to the `recipient` address as an owned coin. Your app can move it only inside a transaction the user signs. Hashi itself has no admin cap anywhere — minting needs a committee BLS certificate over the specific UTXO, and moving real BTC out needs both the MPC committee and the independent guardian. Custody is a property of the chain, not a line in your marketing copy.',
          emoji: '🔐',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'recipient', label: 'recipient field', emoji: '📮' },
                { id: 'no-cap', label: 'No admin cap', emoji: '🚫' },
                { id: 'guardian', label: 'Guardian leaf', emoji: '🛡️' },
                { id: 'ptb', label: 'Your PTB', emoji: '✍️' },
              ],
              targets: [
                { id: 't-recipient', label: 'hBTC mints here as an owned coin' },
                { id: 't-nocap', label: 'No single key can mint, burn, or pause alone' },
                { id: 't-guardian', label: 'Second signer required to move BTC on Bitcoin' },
                { id: 't-ptb', label: 'Moves the coin only because the user signed' },
              ],
              correctPairs: [
                { itemId: 'recipient', targetId: 't-recipient' },
                { itemId: 'no-cap', targetId: 't-nocap' },
                { itemId: 'guardian', targetId: 't-guardian' },
                { itemId: 'ptb', targetId: 't-ptb' },
              ],
              explanation: 'Custody is enforced by ownership plus the 2-of-2 committee/guardian split, not by app-level promises. There is no admin capability in the Hashi package.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Gasless and Human-Friendly',
      slides: [
        {
          title: 'The Signer Is Not the Recipient',
          content: '`deposit({ signer, txid, utxos, recipient })` keeps those two fields independent. Your relayer signs the Sui transaction and pays its gas; `recipient` becomes the UTXO\'s `derivation_path`, so hBTC mints straight to the user. They can arrive holding zero SUI and still end up with a coin. This is the single most valuable seam the SDK leaves open.',
          emoji: '🎫',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// The relayer signs and pays. The user receives.
await client.hashi.deposit({
  signer: relayerKeypair,       // pays the Sui gas
  txid: '0x9f2c...',            // display byte order
  utxos: [{ vout: 0, amountSats: 100_000n }],
  recipient: userSuiAddress,    // hBTC mints here
});

// recipient becomes the UTXO's derivation_path on-chain, and
// confirm_deposit mints straight to it. The relayer never
// touches the coin. The user never needs a single MIST of SUI.`,
              highlights: [
                { line: 3, explanation: 'The signer pays Sui gas for the registration transaction. Nothing about this address ends up owning the minted hBTC.' },
                { line: 4, explanation: 'txid is 0x-prefixed and in display byte order — exactly what mempool.space shows you. The SDK reverses it to Bitcoin internal order at the chain boundary.' },
                { line: 5, explanation: 'One entry per output paying the deposit address, batched into a single PTB. Amounts are bigint sats and each must clear the 30,000-sat minimum on its own.' },
                { line: 6, explanation: 'recipient is a completely independent field. This is what makes relayed, gas-sponsored onboarding possible without any protocol change.' },
                { line: 10, explanation: '`confirm_deposit` mints to the derivation_path recorded on the UTXO. The relayer is never in the custody path at any point.' },
              ],
              explanation: 'The deposit signer is decoupled from the mint recipient, so an app can relay and sponsor the Sui side while hBTC lands directly in the user wallet.',
            },
          },
        },
        {
          title: 'Let a Keeper Own the Clock',
          content: '`deposit` and `confirm_deposit` are both permissionless — only `approve_deposit` needs the committee certificate. So a keeper can watch `confirmableAtMs` from `view.depositStatus(digest)` and fire `confirm_deposit` the millisecond the 10-minute delay elapses. The user\'s last action becomes the Bitcoin send itself. Everything after that happens whether or not they keep the tab open.',
          emoji: '⏱️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Who can call what', content: '`deposit` (records the UTXO) and `confirm_deposit` (mints) are permissionless — anyone can submit them. Only `approve_deposit` requires a committee BLS certificate carrying more than two-thirds of stake.' },
                { label: 'The only gate', content: '`confirm_deposit` aborts until `approved_timestamp_ms + bitcoin_deposit_time_delay_ms <= now`. That delay is 600,000 ms today. It exists so a fraudulent approval can be caught and paused before anything mints.' },
                { label: 'confirmableAtMs', content: '`view.depositStatus(digest)` returns the exact millisecond your keeper is allowed to call. Schedule against it instead of polling blind, and you turn a wait into a timer.' },
                { label: 'What this buys you', content: 'The user signs nothing on Sui and holds no SUI. They send BTC, close the tab, and get a push notification when hBTC lands. That is the difference between a bridge and a product.' },
              ],
              explanation: 'Because deposit and confirm_deposit are permissionless, an app keeper can drive the whole Sui side on the user behalf once the time delay elapses.',
            },
          },
        },
        {
          title: 'Render the Seventy Minutes',
          content: 'Six Bitcoin confirmations plus a 10-minute delay is roughly 70 minutes of apparent nothing. `waitForDeposit(digest)` polls every 15 seconds, and `view.depositStatus` gives you status, `approvalTimestampMs`, and `confirmableAtMs`. What it will not give you is Bitcoin confirmations — the SDK never scans that chain. You supply those from mempool.space, an Esplora instance, or your own node.',
          emoji: '📊',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'confs', label: '6 confirmations', emoji: '⛏️' },
                { id: 'approval', label: 'Committee approval', emoji: '✅' },
                { id: 'delay', label: '10-minute delay', emoji: '⏳' },
                { id: 'balance', label: 'hBTC landed', emoji: '🪙' },
              ],
              targets: [
                { id: 't-confs', label: 'mempool.space, Esplora, or your Bitcoin node' },
                { id: 't-approval', label: 'depositStatus().approvalTimestampMs' },
                { id: 't-delay', label: 'depositStatus().confirmableAtMs' },
                { id: 't-balance', label: 'view.balance(owner).totalBalance' },
              ],
              correctPairs: [
                { itemId: 'confs', targetId: 't-confs' },
                { itemId: 'approval', targetId: 't-approval' },
                { itemId: 'delay', targetId: 't-delay' },
                { itemId: 'balance', targetId: 't-balance' },
              ],
              explanation: 'A real progress UI stitches Bitcoin confirmations from your own watcher together with the Sui-side timestamps the SDK exposes. The SDK does not scan Bitcoin for you.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Production Realities',
      slides: [
        {
          title: 'Give hBTC Somewhere To Go',
          content: 'A bridge token with no destination is churn: the user paid a miner fee, waited an hour, and got a balance that does nothing. Navi, Scallop, Suilend, and AlphaLend are day-one mainnet lending partners, so borrowing a stablecoin against BTC without selling it is the obvious first use. Decide the destination before you build the on-ramp, not after.',
          emoji: '🎯',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Collateral', content: 'Navi, Scallop, Suilend, and AlphaLend are named day-one mainnet lending partners. Borrowing a stablecoin against BTC is the canonical reason a BTC holder tolerates a bridge at all — they keep the exposure and get spendable liquidity.' },
                { label: 'Any coin-shaped venue', content: 'Vaults, LP positions, margin. None of these had to integrate Hashi specifically; they accept a `Coin<T>` and hBTC is a `Coin<T>`. Breadth comes free from the coin standard.' },
                { label: 'Your own product', content: 'The strongest destination is the one inside your app, because you control the moment. Route the coin into its use in the same PTB and the user never sees an idle balance at all.' },
                { label: 'The failure mode', content: 'Idle hBTC. The cost was real BTC and 70 minutes; the payoff was a number on a screen. If you cannot name what the user does in the next 30 seconds, the on-ramp is not finished.' },
              ],
              explanation: 'hBTC has no native yield or utility. The integrator supplies the destination, most commonly BTC-backed stablecoin borrowing on Sui lending markets.',
            },
          },
        },
        {
          title: 'The Friction You Cannot Remove',
          content: 'Be honest about the floor. The user must already hold BTC. The Bitcoin miner fee is paid in BTC on L1 and can never be sponsored. Both minimums sit at 30,000 sats. A withdrawal can be cancelled only by its owner, only after a one-hour cooldown, and never once it reaches processing — by then the hBTC is already burned.',
          emoji: '🧱',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'miner', label: 'Bitcoin miner fee', emoji: '⛏️' },
                { id: 'floor', label: '30,000-sat floor', emoji: '📉' },
                { id: 'signet', label: 'Signet BTC', emoji: '🚰' },
                { id: 'gas', label: 'Sui gas', emoji: '⛽' },
              ],
              targets: [
                { id: 't-miner', label: 'Paid in BTC on L1 — can never be sponsored' },
                { id: 't-floor', label: 'Enforced on-chain both ways — block it in your UI first' },
                { id: 't-signet', label: 'Play money from third-party faucets you do not run' },
                { id: 't-gas', label: 'Sponsorable — your relayer can pay all of it' },
              ],
              correctPairs: [
                { itemId: 'miner', targetId: 't-miner' },
                { itemId: 'floor', targetId: 't-floor' },
                { itemId: 'signet', targetId: 't-signet' },
                { itemId: 'gas', targetId: 't-gas' },
              ],
              explanation: 'Sui gas is the only cost an app can absorb. The Bitcoin miner fee, the 30,000-sat minimums, and the need to already hold BTC are all outside app control.',
            },
          },
        },
        {
          title: 'Testnet Today, Mainnet Later',
          content: 'Hashi runs on Sui testnet against Bitcoin signet, and signet coins come from third-party faucets nobody on the team operates. Mainnet is not deployed and has no announced date; the SDK throws on a network it has no ids for. The contracts are audited by Asymptotic, Certora, and OtterSec. Read every limit at runtime — all of them are governance parameters.',
          emoji: '🧪',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// These are governance parameters. Read them, don't hardcode.
const cfg = await client.hashi.view.all();

cfg.paused;                           // false = the bridge is open
cfg.bitcoinDepositMinimum;            // 30_000n sats today
cfg.bitcoinWithdrawalMinimum;         // 30_000n sats today
cfg.bitcoinConfirmationThreshold;     // 6
cfg.bitcoinDepositTimeDelayMs;        // 600_000 = the 10-minute window
cfg.withdrawalCancellationCooldownMs; // 3_600_000 = 1 hour

// Sui testnet <-> Bitcoin signet. Mainnet ids are not deployed,
// so hashi() throws on a network it has no config for.`,
              highlights: [
                { line: 2, explanation: '`view.all()` is one fetch that parses the whole config map. Every per-field getter delegates to it, so call it once when you need two or more values.' },
                { line: 4, explanation: 'Pause is a real state, reachable by a low-quorum committee vote. Surface it — a paused bridge should not show a deposit button.' },
                { line: 5, explanation: 'The minimum is a bigint, floored on-chain at the 546-sat dust value. 30,000 is today\'s configured number, not a constant of the universe.' },
                { line: 8, explanation: 'This is the safety window between committee approval and mint. Combined with 6 confirmations it produces the roughly 70-minute end-to-end wait.' },
                { line: 11, explanation: 'Testnet only. The SDK ships hardcoded ids for devnet and testnet, both pointing at Bitcoin signet; anything else needs explicit hashiObjectId and packageId.' },
              ],
              explanation: 'All Hashi limits are on-chain governance parameters read through view.all(). The deployment is testnet-only against Bitcoin signet, with no mainnet ids in the SDK.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'Why can hBTC be used inside the same PTB as your own Move call?',
      options: [
        'Hashi exposes a special composition module you import',
        'It is an ordinary Sui coin, so any function taking Coin<T> or Balance<T> accepts it',
        'The committee co-signs your transaction',
        'PTBs bypass the deposit time delay',
      ],
      correctAnswer: 1,
      explanation: 'hBTC is a plain Sui coin with 8 decimals. `tx.balance({ type, balance })` sources it and hands it to any Move function taking Balance<BTC>. There is no Hashi-specific interface to implement.',
      weaknessTopic: 'hashi-integration',
    },
    {
      question: 'In `deposit({ signer, txid, utxos, recipient })`, what makes relayed, gas-sponsored onboarding possible?',
      options: [
        'The SDK ships a built-in gas station',
        'recipient is independent of signer, so a relayer pays Sui gas while hBTC mints to the user',
        'Hashi refunds the signer after minting',
        'The committee pays gas for all deposits',
      ],
      correctAnswer: 1,
      explanation: 'recipient becomes the UTXO\'s derivation_path and is the mint target. The signer only pays for the registration transaction, so a relayer can cover the Sui side and the user needs no SUI at all.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'Which deposit step can a keeper call permissionlessly once the delay elapses?',
      options: ['approve_deposit', 'confirm_deposit', 'request_withdrawal', 'delete_expired_deposit only'],
      correctAnswer: 1,
      explanation: '`deposit` and `confirm_deposit` are both permissionless. Only `approve_deposit` needs a committee BLS certificate with more than two-thirds of stake. `view.depositStatus` gives the confirmableAtMs your keeper should schedule against.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'Which cost of a Hashi deposit can an application never sponsor?',
      options: [
        'The Sui gas for the deposit transaction',
        'The protocol deposit fee',
        'The Bitcoin L1 miner fee on the funding transaction',
        'The gas for confirm_deposit',
      ],
      correctAnswer: 2,
      explanation: 'The funding transaction is an ordinary Bitcoin transaction, so its miner fee is paid in BTC on Bitcoin and is outside any Sui sponsorship. There is no protocol deposit fee at all — the full UTXO amount is minted. Both Sui-side transactions can be sponsored.',
      weaknessTopic: 'hashi-basics',
    },
    {
      question: 'When can a user no longer cancel a withdrawal request?',
      options: [
        'Once the one-hour cooldown has elapsed',
        'Once the request reaches processing, because the hBTC is already burned',
        'As soon as the committee approves it',
        'Never — cancel is always available to the owner',
      ],
      correctAnswer: 1,
      explanation: 'Cancel is owner-only and requires the one-hour cooldown to have passed, but it becomes impossible once the request is committed into a withdrawal transaction and moves to processing, because the escrowed hBTC has been burned by then.',
      weaknessTopic: 'hashi-withdrawal',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Hashi — Production Helpers
// Complete the three functions below.

const CONFIRMATION_THRESHOLD = 6;          // bitcoin_confirmation_threshold
const WITHDRAWAL_MINIMUM_SATS = 30_000n;   // bitcoin_withdrawal_minimum
const SATS_PER_BTC = 100_000_000n;         // hBTC has 8 decimals
const BTC_DECIMALS = 8;

interface DepositView {
  status: 'pending' | 'confirmed' | 'expired' | 'unknown';
  confirmations: number;          // from your own Bitcoin watcher
  confirmableAtMs: number | null; // from view.depositStatus, null until approved
}

// TODO 1: Map a deposit to a UI step label and a percentage.
// - status 'confirmed'  -> { step: 'hBTC minted', percent: 100 }
// - status 'expired'    -> { step: 'Deposit expired', percent: 0 }
// - fewer than CONFIRMATION_THRESHOLD confirmations ->
//     step 'Confirming on Bitcoin (n/6)', percent = round(confs / 6 * 70)
// - confirmableAtMs null -> { step: 'Waiting for committee approval', percent: 80 }
// - nowMs before confirmableAtMs -> { step: 'Safety delay', percent: 90 }
// - otherwise -> { step: 'Ready to mint', percent: 95 }
function depositProgress(
  deposit: DepositView,
  nowMs: number
): { step: string; percent: number } {
  // Your code here
}

// TODO 2: Guard a withdrawal before you ever build the transaction.
// Reject below WITHDRAWAL_MINIMUM_SATS, reject more than the balance,
// otherwise return { ok: true }.
function canWithdraw(
  balanceSats: bigint,
  amountSats: bigint
): { ok: boolean; reason?: string } {
  // Your code here
}

// TODO 3: Render satoshis as a human hBTC string.
// Example: 30_000n -> "0.00030000 hBTC"
function formatBtcDisplay(sats: bigint): string {
  // Your code here
}`,

  solution: `// Hashi — Production Helpers

const CONFIRMATION_THRESHOLD = 6;          // bitcoin_confirmation_threshold
const WITHDRAWAL_MINIMUM_SATS = 30_000n;   // bitcoin_withdrawal_minimum
const SATS_PER_BTC = 100_000_000n;         // hBTC has 8 decimals
const BTC_DECIMALS = 8;

interface DepositView {
  status: 'pending' | 'confirmed' | 'expired' | 'unknown';
  confirmations: number;          // from your own Bitcoin watcher
  confirmableAtMs: number | null; // from view.depositStatus, null until approved
}

// TODO 1: Map a deposit to a UI step label and a percentage
function depositProgress(
  deposit: DepositView,
  nowMs: number
): { step: string; percent: number } {
  if (deposit.status === 'confirmed') {
    return { step: 'hBTC minted', percent: 100 };
  }
  if (deposit.status === 'expired') {
    return { step: 'Deposit expired', percent: 0 };
  }
  if (deposit.confirmations < CONFIRMATION_THRESHOLD) {
    const percent = Math.round((deposit.confirmations / CONFIRMATION_THRESHOLD) * 70);
    return {
      step: \`Confirming on Bitcoin (\${deposit.confirmations}/\${CONFIRMATION_THRESHOLD})\`,
      percent,
    };
  }
  if (deposit.confirmableAtMs === null) {
    return { step: 'Waiting for committee approval', percent: 80 };
  }
  if (nowMs < deposit.confirmableAtMs) {
    return { step: 'Safety delay', percent: 90 };
  }
  return { step: 'Ready to mint', percent: 95 };
}

// TODO 2: Guard a withdrawal before you ever build the transaction
function canWithdraw(
  balanceSats: bigint,
  amountSats: bigint
): { ok: boolean; reason?: string } {
  if (amountSats < WITHDRAWAL_MINIMUM_SATS) {
    return { ok: false, reason: \`Minimum withdrawal is \${WITHDRAWAL_MINIMUM_SATS} sats\` };
  }
  if (amountSats > balanceSats) {
    return { ok: false, reason: 'Not enough hBTC' };
  }
  return { ok: true };
}

// TODO 3: Render satoshis as a human hBTC string
function formatBtcDisplay(sats: bigint): string {
  const whole = sats / SATS_PER_BTC;
  const frac = sats % SATS_PER_BTC;
  return \`\${whole}.\${frac.toString().padStart(BTC_DECIMALS, '0')} hBTC\`;
}`,

  hints: [
    'TODO 1: handle the terminal states first — \'confirmed\' is 100 and \'expired\' is 0 — then fall through the in-flight cases in order: confirmations, then approval, then the delay.',
    'TODO 1: the Bitcoin phase owns the first 70% of the bar, so percent = Math.round((confirmations / CONFIRMATION_THRESHOLD) * 70). confirmableAtMs stays null until the committee approves.',
    'TODO 2: check the minimum before the balance so the user gets the more useful message. Both operands are bigint, so compare them directly — never mix in a number.',
    'TODO 3: bigint division truncates, which is exactly what you want. whole = sats / SATS_PER_BTC and frac = sats % SATS_PER_BTC.',
    'TODO 3: pad the fractional part to BTC_DECIMALS with frac.toString().padStart(8, \'0\') so 30_000n renders as "0.00030000 hBTC".',
  ],
};
