import { LessonContent } from '@/app/types/lesson';

export const hashiLesson1: LessonContent = {
  id: 'hashi-1',
  title: 'Introduction to Hashi',
  description: 'Meet Mysten Labs\' native-Bitcoin protocol on Sui — why hBTC is not a wrapped IOU, the 2-of-2 Taproot trust model, and the full BTC round trip.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'typescript',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Welcome to Hashi — Mysten Labs' native-Bitcoin protocol on Sui. Bitcoin is the largest crypto asset in the world and almost all of it sits idle. In this lesson you'll learn how Hashi puts real BTC to work on Sui without a custodian, what hBTC actually is, and every step of the round trip from Bitcoin and back.",
    quizTransition: "You've seen the trust model and the full lifecycle. Let's check what stuck — deposits, withdrawals, and the numbers that gate them.",
    practiceTransition: "Now write code. hBTC uses 8 decimals just like Bitcoin, and every deposit has to clear a 30,000-sat floor. Build the helpers that get that right.",
    celebrationMessage: "Solid. You can convert between sats and BTC without losing precision, and you can reject a deposit before it wastes a Bitcoin miner fee.",
    nextLessonTease: "Next: the deposit flow for real — derive a Taproot address with `@mysten/hashi`, submit the funding UTXO, and track it from `pending` to minted hBTC.",
  },

  teachingSections: [
    {
      sectionTitle: 'Bitcoin Meets Sui',
      slides: [
        {
          title: 'The Idle Bitcoin Problem',
          content: 'Bitcoin holds more value than any other crypto asset, and almost none of it does anything. Bitcoin script cannot express lending, order books, or collateral. So BTC either sits still or leaves for a chain that can — historically through a **custodian** who holds the real coins and issues a receipt. Hashi is Mysten Labs\' answer: put BTC to work on Sui while the coins stay on Bitcoin.',
          emoji: '🟠',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why not just use Bitcoin?', content: 'Bitcoin script is intentionally minimal — no shared state, no general smart contracts. You cannot express "lend this against collateral and liquidate at 80% LTV" on L1. That expressiveness is exactly what Sui Move gives you.' },
                { label: 'What "productive BTC" means', content: 'Collateral for a loan, liquidity in a pool, margin for a position. Hashi\'s day-one mainnet lending partners are Navi, Scallop, Suilend, and AlphaLend — hBTC is meant to be borrowed against, not just held.' },
                { label: 'The custodian tax', content: 'Every wrapped-BTC design so far asks you to trust a company\'s balance sheet. If that company is compromised, halts redemptions, or gets a court order, your claim is paper. Hashi removes the company.' },
                { label: 'Status: testnet', content: 'Hashi is live on Sui testnet against Bitcoin **signet** only. Mainnet is not deployed and there is no announced date. Signet coins have no value and come from third-party faucets. Build now, ship when it lands.' },
              ],
              explanation: 'Frames the motivation: Bitcoin is the largest idle capital pool in crypto, and the only prior route to using it on other chains was a custodial wrapper. Hashi is Mysten Labs\' native alternative on Sui, currently testnet-only against Bitcoin signet.',
            },
          },
        },
        {
          title: 'Wrapped vs Native',
          content: 'wBTC and tBTC are **IOUs** — a custodian or a signer set holds your BTC and mints a token that represents a claim on it. Hashi is different in one decisive way: your BTC never leaves Bitcoin. It sits at a Bitcoin address that only a Sui validator committee plus an independent Guardian can jointly spend, and Sui mints hBTC against it 1:1.',
          emoji: '⚖️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'wbtc', label: 'wBTC', emoji: '🏦' },
                { id: 'hbtc', label: 'hBTC (Hashi)', emoji: '🔗' },
                { id: 'cex', label: 'BTC on an exchange', emoji: '🏛️' },
              ],
              targets: [
                { id: 't-wbtc', label: 'A custodian holds the BTC and issues a token claim' },
                { id: 't-hbtc', label: 'BTC stays on Bitcoin at a 2-of-2 address; Sui mints 1:1' },
                { id: 't-cex', label: 'You hold no coins at all, only a database row' },
              ],
              correctPairs: [
                { itemId: 'wbtc', targetId: 't-wbtc' },
                { itemId: 'hbtc', targetId: 't-hbtc' },
                { itemId: 'cex', targetId: 't-cex' },
              ],
              explanation: 'The core distinction of the lesson. Wrapped BTC is a custodial IOU. Exchange BTC is a ledger entry. Hashi leaves the real BTC on Bitcoin under a 2-of-2 Taproot address controlled by the validator committee plus the Guardian, and mints hBTC on Sui 1:1 against it.',
            },
          },
        },
        {
          title: 'What hBTC Is',
          content: 'hBTC is a normal Sui coin with **8 decimals** — the same precision as Bitcoin, so one unit is one satoshi. Every hBTC in existence is backed by a confirmed Bitcoin UTXO the protocol controls. The SDK speaks in `bigint` satoshis end to end and never in floats, because a rounding error here is lost money.',
          emoji: '🪙',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// hBTC on Sui testnet — one coin type, 8 decimals
const HBTC_TYPE = '0xfcea10cadbb553c4874201584abf6877' +
  '1592678952efd957b2e82c010c7f4360::btc::BTC';

const HBTC_DECIMALS = 8;          // same precision as Bitcoin
const SATS_PER_BTC = 100_000_000; // 1 BTC = 100,000,000 sats

// The SDK talks in bigint satoshis, never floats
const balance = await client.hashi.view.balance(suiAddress);
// balance.totalBalance -> 30000n   (0.0003 BTC)

// 1 sat of hBTC on Sui <=> 1 sat of real BTC locked on Bitcoin`,
              highlights: [
                { line: 3, explanation: 'The testnet hBTC coin type. The package id is the Hashi Move package itself — the coin is defined by the protocol, not by a third party.' },
                { line: 5, explanation: '8 decimals is deliberate: it mirrors Bitcoin exactly, so the smallest unit of hBTC is the smallest unit of BTC. No precision is invented or lost in the mapping.' },
                { line: 9, explanation: 'view.balance(owner) returns { totalBalance: bigint, coinObjectCount: number }. bigint, because 21 million BTC in sats overflows a JS number\'s safe integer range for some arithmetic.' },
                { line: 12, explanation: 'The 1:1 invariant. Supply of hBTC can only grow when a Bitcoin UTXO is confirmed into the pool, and it shrinks when hBTC is burned to release BTC.' },
              ],
              explanation: 'Grounds hBTC as a concrete Sui coin: real testnet type string, 8 decimals matching Bitcoin, bigint satoshi arithmetic in the SDK, and the 1:1 backing invariant.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'How Hashi Secures Bitcoin',
      slides: [
        {
          title: 'Your Own Taproot Address',
          content: 'Hashi does not use one shared vault address. Every Sui address gets its **own** Bitcoin deposit address, derived deterministically from the committee\'s MPC key and the Guardian key. On testnet it is a bech32m Taproot address starting `tb1p`. Derivation is pure math — the SDK computes it locally and it matches what the validators compute.',
          emoji: '📬',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SuiGrpcClient } from '@mysten/sui/grpc';
import { hashi } from '@mysten/hashi';

const client = new SuiGrpcClient({ network: 'testnet' })
  .$extend(hashi());

// One Taproot address, derived for YOUR Sui address only
const btcAddress = await client.hashi.generateDepositAddress({
  suiAddress: '0xabc...',
});
// -> 'tb1p...'  (bech32m P2TR, Bitcoin signet)

// Leaf 1: the committee MPC key, child-derived from your Sui address
// Leaf 2: the Guardian key. Both must sign to move the BTC.`,
              highlights: [
                { line: 4, explanation: '$extend(hashi()) attaches the whole Hashi surface under client.hashi. The Bitcoin network is inferred from the Sui network — testnet Sui means Bitcoin signet.' },
                { line: 8, explanation: 'generateDepositAddress does one on-chain read for the MPC and Guardian keys, then derives the address offline. Same Sui address in, same Bitcoin address out, forever.' },
                { line: 11, explanation: 'tb1p is a bech32m Pay-to-Taproot address. Send mainnet BTC here and it is gone — testnet Hashi is signet only.' },
                { line: 13, explanation: 'The MPC leaf is a child key derived from your Sui address, which is how the protocol knows which deposit belongs to whom without a lookup table.' },
                { line: 14, explanation: 'The Guardian leaf is the second, independent signer. The script path is a genuine 2-of-2 — neither party can move your BTC alone.' },
              ],
              explanation: 'Shows first contact with @mysten/hashi and the per-address Taproot derivation. Key points: $extend wiring, deterministic per-Sui-address derivation, tb1p signet addresses, and the two Taproot leaves that form the 2-of-2.',
            },
          },
        },
        {
          title: 'The Validator Committee',
          content: 'The first signer is not a company — it is the Sui validator set. Validators register into a committee whose voting weight *is* their Sui stake weight, and they act only by aggregate BLS certificate carrying more than **two thirds** of that weight. Approving a deposit or a withdrawal is the same kind of quorum act that finalizes a Sui block.',
          emoji: '🏛️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Who is in it', content: 'Active Sui validators who register. Membership is checked against the live active-validator set, and voting weight equals Sui voting power — so committee security tracks Sui\'s own security, not a separate trusted list.' },
                { label: 'How it acts', content: 'BLS12-381 aggregate signatures over an intent-tagged message. Every certificate must carry at least the >2/3 stake threshold, and each action type has its own intent tag so a signature for one purpose cannot be replayed for another.' },
                { label: 'MPC, not a shared secret', content: 'The committee holds a threshold key through multi-party computation. No single validator ever sees the Bitcoin private key, and signing requires enough of them to cooperate.' },
                { label: 'It rotates', content: 'The committee changes with Sui epochs. A deposit approval from a rotated-out committee will not mint — the certificate is re-verified against the *current* committee at confirmation time.' },
              ],
              explanation: 'Explains layer one of the trust model: the signer set is the Sui validator set, weighted by stake, acting by >2/3 BLS certificate with an MPC-held threshold key that rotates with epochs.',
            },
          },
        },
        {
          title: 'The Guardian, and No Admin Key',
          content: 'The second Taproot leaf belongs to an independent **Guardian** whose Bitcoin key is written on-chain once and is immutable after that. Moving BTC out needs the committee *and* the Guardian: a real 2-of-2, not a rubber stamp. And nowhere in the protocol is there an owner capability — pauses, config changes, even package upgrades all go through committee-weighted voting.',
          emoji: '🛡️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'committee', label: 'Validator committee', emoji: '🏛️' },
                { id: 'guardian', label: 'Guardian', emoji: '🛡️' },
                { id: 'governance', label: 'Committee vote', emoji: '🗳️' },
                { id: 'admin', label: 'Admin key', emoji: '🚫' },
              ],
              targets: [
                { id: 't-committee', label: 'Signs by >2/3 stake certificate; MPC threshold key' },
                { id: 't-guardian', label: 'Independent second signer; BTC key immutable once set' },
                { id: 't-governance', label: 'The only way to pause, reconfigure, or upgrade' },
                { id: 't-admin', label: 'Does not exist anywhere in the protocol' },
              ],
              correctPairs: [
                { itemId: 'committee', targetId: 't-committee' },
                { itemId: 'guardian', targetId: 't-guardian' },
                { itemId: 'governance', targetId: 't-governance' },
                { itemId: 'admin', targetId: 't-admin' },
              ],
              explanation: 'Layer two and three of the trust model. The Guardian is the independent second half of the 2-of-2 with an immutable on-chain BTC key. All privileged action is committee-weighted governance; there is no admin or owner capability. Hashi has been audited by Asymptotic, Certora, and OtterSec.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The Round Trip',
      slides: [
        {
          title: 'Deposit, Approve, Confirm, Mint',
          content: 'Getting hBTC takes four moves. You send BTC to your Taproot address on Bitcoin. Someone records that UTXO on Sui with `deposit` — permissionless, so an app can relay it for you. The committee certifies it with `approve_deposit`. Then `confirm_deposit`, also permissionless, mints hBTC to the recipient. No protocol deposit fee: the full UTXO amount is minted.',
          emoji: '⬇️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'send', label: 'Send BTC', emoji: '₿' },
                { id: 'deposit', label: 'deposit', emoji: '📝' },
                { id: 'approve', label: 'approve_deposit', emoji: '✅' },
                { id: 'confirm', label: 'confirm_deposit', emoji: '🪙' },
              ],
              targets: [
                { id: 't-send', label: 'Bitcoin L1: fund your tb1p address, pay the miner fee' },
                { id: 't-deposit', label: 'Sui: record the txid and vout. Anyone can submit it' },
                { id: 't-approve', label: 'Sui: committee BLS certificate with >2/3 stake' },
                { id: 't-confirm', label: 'Sui: after the delay, mint hBTC to the recipient' },
              ],
              correctPairs: [
                { itemId: 'send', targetId: 't-send' },
                { itemId: 'deposit', targetId: 't-deposit' },
                { itemId: 'approve', targetId: 't-approve' },
                { itemId: 'confirm', targetId: 't-confirm' },
              ],
              explanation: 'The deposit lifecycle in order: Bitcoin funding tx, then three Sui transactions — deposit (permissionless), approve_deposit (committee certificate), confirm_deposit (permissionless, after the delay window) which mints. The deposit signer is decoupled from the recipient, so an app can relay and sponsor the Sui side.',
            },
          },
        },
        {
          title: 'Why You Wait About Seventy Minutes',
          content: 'Two timers gate the mint. Bitcoin must bury the funding transaction under **6 confirmations**, roughly an hour. Then a **10-minute delay window** runs after committee approval before `confirm_deposit` can mint. That window is the fraud-catch: if a bad approval ever landed, there is time to notice and pause before hBTC exists. Roughly seventy minutes end to end.',
          emoji: '⏳',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Deposit timing — testnet defaults, governance-configurable
const cfg = await client.hashi.view.all();

cfg.bitcoinConfirmationThreshold; // 6n   Bitcoin confirmations
cfg.bitcoinDepositTimeDelayMs;    // 600000n = a 10-minute window
cfg.bitcoinDepositMinimum;        // 30000n sats
cfg.paused;                       // false

// Track one deposit end to end, by its Sui tx digest
const info = await client.hashi.view.depositStatus(digest);
info.confirmableAtMs; // earliest millisecond the mint can happen
info.status;          // 'pending' | 'confirmed' | 'expired' | 'unknown'`,
              highlights: [
                { line: 2, explanation: 'view.all() is one read that returns the whole governance config. Prefer it over the per-field getters whenever you need two or more values.' },
                { line: 4, explanation: 'Six Bitcoin confirmations, about ten minutes each. This is the reorg-safety half of the wait and it happens on Bitcoin, not Sui.' },
                { line: 5, explanation: '600000 ms = 10 minutes after approval. The fraud-catch window: an approval is public on Sui before it can mint, so a bad one can be paused first.' },
                { line: 6, explanation: '30,000 sats is the minimum deposit. Below it, the Move call aborts and you have burned a Bitcoin miner fee for nothing.' },
                { line: 11, explanation: 'confirmableAtMs is the exact timestamp the mint unlocks — the number to drive a real progress UI instead of an opaque spinner.' },
              ],
              explanation: 'The two timing gates and how to read them from the SDK. 6 Bitcoin confirmations plus a 10-minute post-approval delay window, roughly 70 minutes total. The delay exists so a fraudulent approval can be caught and paused before hBTC is minted. All values are testnet defaults and governance-configurable.',
            },
          },
        },
        {
          title: 'Burning Back to Bitcoin',
          content: 'The way out mirrors the way in. `request_withdrawal` escrows your hBTC and names a Bitcoin address. The committee approves, the commit step burns the hBTC, MPC and Guardian sign the Bitcoin transaction, and finalize broadcasts it. Same 30,000-sat minimum. You pay no protocol fee, but the Bitcoin miner fee comes out of your output — and that one can never be sponsored.',
          emoji: '⬆️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'requestWithdrawal', content: '`requestWithdrawal({ signer, amountSats, bitcoinAddress })` escrows the hBTC on Sui and queues the request. The address is decoded client-side and must be a P2WPKH or P2TR address on the configured network.' },
                { label: 'The burn happens at commit', content: 'Your hBTC is escrowed at request time, not destroyed. It is burned when the committee commits the Bitcoin transaction that spends the pool UTXOs — the burn and the send are bound together.' },
                { label: 'Cancelling', content: '`cancelWithdrawal({ signer, requestId })` returns the escrowed hBTC. Owner only, and only after a 1-hour cooldown. Once the request is Processing the Bitcoin transaction is already committed and cancelling is impossible.' },
                { label: 'Who pays what', content: 'No protocol deposit fee and no withdrawal service fee. Sui transactions cost SUI gas, which an app can sponsor. The Bitcoin L1 miner fee is paid in BTC on Bitcoin and is never sponsorable — deducted from your withdrawal output on the way out.' },
              ],
              explanation: 'Closes the round trip: request_withdrawal escrows, committee approves, commit burns the hBTC, MPC plus Guardian sign, finalize broadcasts. Covers the owner-only 1-hour-cooldown cancel window and the honest fee picture — no protocol fee, SUI gas is sponsorable, the Bitcoin miner fee never is.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'What makes hBTC different from wBTC?',
      options: [
        'hBTC has more decimals, so it tracks the price more precisely',
        'The real BTC stays on Bitcoin under a 2-of-2 address instead of with a custodian',
        'hBTC is minted by a company that publishes monthly attestations',
        'hBTC is an algorithmic token that tracks the BTC price without backing',
      ],
      correctAnswer: 1,
      explanation: 'wBTC is a custodial IOU — a company holds the coins. Hashi leaves your BTC on Bitcoin at a Taproot address that requires both the Sui validator committee and an independent Guardian to spend, and mints hBTC on Sui 1:1 against it. Both use 8 decimals.',
      weaknessTopic: 'hashi-basics',
    },
    {
      question: 'What is the correct order of the deposit lifecycle on Sui?',
      options: [
        'approve_deposit -> deposit -> confirm_deposit',
        'deposit -> confirm_deposit -> approve_deposit',
        'deposit -> approve_deposit -> confirm_deposit',
        'confirm_deposit -> approve_deposit -> deposit',
      ],
      correctAnswer: 2,
      explanation: '`deposit` records the Bitcoin UTXO on Sui and is permissionless. `approve_deposit` requires a committee BLS certificate carrying more than 2/3 of stake weight. `confirm_deposit` is permissionless again and mints hBTC, but only after the delay window has elapsed.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'Why does Hashi wait 10 minutes after committee approval before minting?',
      options: [
        'To let the Bitcoin transaction reach 6 confirmations',
        'To give the Guardian time to derive the deposit address',
        'It is a fraud-catch window — a bad approval is public on Sui and can be paused before hBTC exists',
        'To batch multiple deposits into a single mint transaction',
      ],
      correctAnswer: 2,
      explanation: 'The 6 confirmations are a separate, earlier gate on Bitcoin. The 600,000 ms delay after approval exists so that an approval is visible on Sui before it can mint — leaving time to notice a fraudulent one and pause the protocol. Together they add up to roughly 70 minutes.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'You requested a withdrawal 5 minutes ago and want your hBTC back. What happens?',
      options: [
        'It works — cancellation is instant for the original requester',
        'It aborts — cancellation requires a 1-hour cooldown to elapse first',
        'It works, but the Guardian must co-sign the cancellation',
        'It aborts — withdrawals can never be cancelled once requested',
      ],
      correctAnswer: 1,
      explanation: 'Cancellation is owner-only and gated by a 1-hour cooldown. After that it stays available until the committee commits the Bitcoin transaction — at that point the hBTC is already burned and cancelling is impossible.',
      weaknessTopic: 'hashi-withdrawal',
    },
    {
      question: 'Your app calls `generateDepositAddress` and the user sends BTC. What must your app do next?',
      options: [
        'Nothing — the SDK detects the incoming BTC and submits the deposit automatically',
        'Find the funding txid, vout, and amountSats yourself, then pass them to `deposit`',
        'Ask the Guardian to relay the UTXO on the user\'s behalf',
        'Wait for `waitForDeposit` to discover the transaction on the Bitcoin chain',
      ],
      correctAnswer: 1,
      explanation: 'The SDK does not scan Bitcoin. Your app has to find the funding output itself — via mempool.space, an Esplora instance, or a Bitcoin node — and hand `deposit` the txid, vout, and amountSats. `waitForDeposit` polls a Sui transaction digest, so it only helps after the deposit is already recorded.',
      weaknessTopic: 'hashi-integration',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Hashi — hBTC Amount Handling
// hBTC uses 8 decimals, exactly like Bitcoin: 1 unit = 1 satoshi.

const HBTC_DECIMALS = 8;
const SATS_PER_BTC = 100_000_000;
const DEPOSIT_MINIMUM_SATS = 30_000;

interface DepositCheck {
  ok: boolean;
  reason?: string;
}

// TODO 1: Convert satoshis to a BTC amount.
// Example: 30000 -> 0.0003
function satsToBtc(sats: number): number {
  // Your code here
}

// TODO 2: Convert a BTC amount to whole satoshis.
// Bitcoin has no fractional sats, so round to an integer.
// Example: 0.0003 -> 30000
function btcToSats(btc: number): number {
  // Your code here
}

// TODO 3: Validate a deposit amount before it costs a miner fee.
// Reject anything that is not a positive whole number of sats.
// Reject anything below DEPOSIT_MINIMUM_SATS.
// Otherwise return { ok: true }.
function validateDepositAmount(sats: number): DepositCheck {
  // Your code here
}`,

  solution: `// Hashi — hBTC Amount Handling
// hBTC uses 8 decimals, exactly like Bitcoin: 1 unit = 1 satoshi.

const HBTC_DECIMALS = 8;
const SATS_PER_BTC = 100_000_000;
const DEPOSIT_MINIMUM_SATS = 30_000;

interface DepositCheck {
  ok: boolean;
  reason?: string;
}

// TODO 1: Convert satoshis to a BTC amount.
function satsToBtc(sats: number): number {
  return sats / SATS_PER_BTC;
}

// TODO 2: Convert a BTC amount to whole satoshis.
function btcToSats(btc: number): number {
  return Math.round(btc * SATS_PER_BTC);
}

// TODO 3: Validate a deposit amount before it costs a miner fee.
function validateDepositAmount(sats: number): DepositCheck {
  if (!Number.isInteger(sats) || sats <= 0) {
    return { ok: false, reason: 'Deposit must be a positive whole number of satoshis' };
  }
  if (sats < DEPOSIT_MINIMUM_SATS) {
    return {
      ok: false,
      reason: \`Below the \${DEPOSIT_MINIMUM_SATS} sat minimum deposit\`,
    };
  }
  return { ok: true };
}`,

  hints: [
    'TODO 1: one satoshi is 1e-8 BTC, so satsToBtc just divides by SATS_PER_BTC (100_000_000). HBTC_DECIMALS = 8 is where that number comes from.',
    'TODO 2: multiply by SATS_PER_BTC, then wrap it in Math.round(). Floating-point multiplication can leave you with 29999.999999999996, and Bitcoin has no fractional satoshis.',
    'TODO 3: check the shape first. Number.isInteger(sats) rejects fractional sats, and sats <= 0 rejects zero and negatives. Return { ok: false, reason: ... } for each.',
    'TODO 3: then compare against DEPOSIT_MINIMUM_SATS (30_000). Below it the Move call aborts on-chain — and by then the user has already paid a Bitcoin miner fee, so catching it client-side matters.',
    'Every failure branch returns an object with ok: false and a reason string; the success branch returns { ok: true } with no reason.',
  ],
};
