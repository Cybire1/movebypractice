import { LessonContent } from '@/app/types/lesson';

export const hashiLesson2: LessonContent = {
  id: 'hashi-2',
  title: 'Building on Hashi',
  description: 'Wire @mysten/hashi into a real app — construct the client, derive a deposit address, watch the Bitcoin chain yourself, submit and track a deposit, then burn hBTC back into native BTC.',
  difficulty: 'intermediate',
  xpReward: 200,
  order: 2,
  language: 'typescript',
  prerequisiteLessons: ['hashi-1'],

  narrative: {
    welcomeMessage: "You know what Hashi is. Now you're going to build on it. This lesson walks the full integration surface of `@mysten/hashi` — client setup, deposit-address derivation, the Bitcoin-watching job the SDK deliberately leaves to you, the three-step deposit lifecycle, and the withdrawal path back to native BTC.",
    quizTransition: "You've walked deposit and withdrawal end to end. Let's check the details that break integrations — byte order, who watches Bitcoin, and when cancel is still legal.",
    practiceTransition: "Time to write the glue. Build the three helpers every Hashi app needs before it can call `deposit()` — parameter shaping, funding-output lookup, and a mint-time estimate.",
    celebrationMessage: "That's a working deposit path. You can shape SDK params, pick the right vout out of a funding transaction, and tell a user how long the wait actually is.",
    nextLessonTease: "Next: composing hBTC — what to do with native Bitcoin once it lands on Sui, and why an idle bridged token is a failed integration.",
  },

  teachingSections: [
    {
      sectionTitle: 'Setting Up the Client',
      slides: [
        {
          title: 'Install and Extend',
          content: 'Hashi ships as `@mysten/hashi` with `@mysten/sui` as a peer dependency. You never construct a Hashi client directly — you build a normal Sui client and `$extend` it with `hashi()`. Every method then lives under `client.hashi.*`. The Bitcoin network is derived from the Sui client, not passed in: testnet and devnet both map to Bitcoin **signet**. Mainnet is not deployed, so `hashi()` throws there.',
          emoji: '🔌',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// pnpm add @mysten/hashi @mysten/sui
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { hashi } from '@mysten/hashi';

const client = new SuiGrpcClient({
  network: 'testnet',
  baseUrl: 'https://fullnode.testnet.sui.io:443',
}).$extend(hashi());

// Every Hashi method now hangs off client.hashi.*
const snap = await client.hashi.view.all();
snap.paused;                        // false
snap.bitcoinDepositMinimum;         // 30000n sats
snap.bitcoinConfirmationThreshold;  // 6n
snap.bitcoinDepositTimeDelayMs;     // 600000n`,
              highlights: [
                { line: 3, explanation: 'The `hashi()` factory returns a registration object. It attaches to any Sui core client and namespaces itself under `client.hashi`.' },
                { line: 6, explanation: 'The Sui network drives everything. Testnet and devnet resolve to hardcoded Hashi object and package ids, and both sit on Bitcoin signet. Mainnet has no entry, so construction throws.' },
                { line: 8, explanation: '`$extend` is the wiring point. Pass options here — `btcRpcUrl`, `guardianUrl`, or explicit `hashiObjectId`/`packageId` for an unconfigured deployment.' },
                { line: 11, explanation: '`view.all()` is one round trip that returns the whole governance config snapshot. Prefer it over the individual getters whenever you need two or more values.' },
                { line: 13, explanation: 'All satoshi amounts are `bigint`. The deposit minimum is 30,000 sats on testnet, and it is a governance parameter — read it, do not hardcode it.' },
              ],
              explanation: 'Client construction for @mysten/hashi: the SDK is an extension over a Sui client, the Bitcoin network is inferred from the Sui network, and view.all() gives a single-round-trip config snapshot with bigint satoshi amounts.',
            },
          },
        },
        {
          title: 'Deriving the Deposit Address',
          content: 'Each Sui address maps to exactly one Bitcoin deposit address. `generateDepositAddress({ suiAddress })` derives a **P2TR** taproot address (bech32m, `tb1p...` on signet) from the on-chain MPC master key and the guardian key. It is deterministic — regenerate it whenever you need it instead of storing it. There is no registration step and no per-user setup transaction.',
          emoji: '🧬',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'One address per Sui address', content: 'The derivation is `child = mpc_master + HKDF(mpc_key, sui_address)`, so the address is a pure function of your Sui address and the committee key. No state, no lookup table — the same input always yields the same `tb1p...` string.' },
                { label: 'Two script leaves', content: 'The taproot output has an immediate 2-of-2 leaf requiring both the validator-committee MPC child key and the independent guardian key, plus a delayed MPC-only recovery leaf behind a 60-day relative timelock.' },
                { label: 'It can throw', content: '`generateDepositAddress` raises `HashiConfigError` if the deployment has not published `guardian_btc_public_key`, or if the committee DKG has not produced an MPC key yet. It refuses to fall back to a single-key address the validators would reject.' },
                { label: 'Network is load-bearing', content: 'The bech32m HRP encodes the Bitcoin network. Sending real mainnet BTC to a `tb1p...` signet address is unrecoverable, and signet coins only come from third-party faucets Mysten does not operate.' },
              ],
              explanation: 'Deposit addresses are deterministic per-Sui-address P2TR taproot addresses with a 2-of-2 MPC-plus-guardian leaf and a 60-day MPC-only recovery leaf. Derivation throws if the guardian key or MPC key is missing.',
            },
          },
        },
        {
          title: 'The Read Layer',
          content: 'Before you write a transaction, read. The `view.*` namespace covers everything an integration needs: the governance snapshot, hBTC balances, per-digest status, gas and fee estimates, and a merged transaction history. Balances come back as `bigint` satoshis — hBTC has **8 decimals**, matching Bitcoin exactly, so one satoshi of hBTC is one satoshi of BTC.',
          emoji: '🔍',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'all', label: 'view.all()', emoji: '⚙️' },
                { id: 'balance', label: 'view.balance(addr)', emoji: '💰' },
                { id: 'gas', label: 'view.depositGasEstimate(addr)', emoji: '⛽' },
                { id: 'fees', label: 'view.withdrawalFees(addr)', emoji: '🧾' },
              ],
              targets: [
                { id: 't-all', label: 'One-round-trip governance config snapshot' },
                { id: 't-balance', label: 'totalBalance in sats plus coinObjectCount' },
                { id: 't-gas', label: 'gasEstimateMist from a dry run of the deposit tx' },
                { id: 't-fees', label: 'worstCaseNetworkFeeSats and withdrawalMinimumSats' },
              ],
              correctPairs: [
                { itemId: 'all', targetId: 't-all' },
                { itemId: 'balance', targetId: 't-balance' },
                { itemId: 'gas', targetId: 't-gas' },
                { itemId: 'fees', targetId: 't-fees' },
              ],
              explanation: 'The view namespace: all() for the config snapshot, balance() for hBTC in bigint satoshis plus coin object count, depositGasEstimate() for a dry-run MIST estimate, withdrawalFees() for the worst-case Bitcoin network fee and the on-chain minimum.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The Deposit Flow, End to End',
      slides: [
        {
          title: 'You Watch Bitcoin, Not the SDK',
          content: 'This is the single biggest surprise for integrators: `@mysten/hashi` does **not** scan the Bitcoin chain. `deposit()` demands the funding `txid`, `vout`, and `amountSats` as inputs. Finding them is your job — mempool.space, an Esplora instance, or your own node. The bundled `bitcoin.*` helpers only work if you construct the client with a `btcRpcUrl` pointing at a verbose Bitcoin Core JSON-RPC node.',
          emoji: '🛰️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What you must supply', content: '`txid` as 0x-prefixed 32-byte hex, a `vout` index, and `amountSats` as a bigint. A single funding transaction can pay the deposit address on several outputs — pass them all in `utxos` and the SDK batches them into one atomic PTB.' },
                { label: 'Display byte order', content: 'Every user-facing txid is display order — the form mempool.space and `bitcoin-cli` print. The SDK reverses it to Bitcoin-internal order at the chain boundary. Pass display order in, and you get display order back out of every reader.' },
                { label: 'The bitcoin.* namespace', content: '`bitcoin.lookupVout(txid, address)`, `lookupAllVouts`, and `confirmations(txid)` read the chain for you, but only with a `btcRpcUrl` set. They speak raw Bitcoin Core JSON-RPC and need a txindex-enabled node — there is no mempool.space or Esplora support built in.' },
                { label: 'Guard against replays', content: '`view.findUsedUtxos([{ txid, vout }])` tells you whether an outpoint is already in the active or spent pool. It fails closed — an RPC error propagates rather than silently reporting the UTXO as unused.' },
              ],
              explanation: 'The SDK does not auto-detect incoming BTC. The integrating app must watch the Bitcoin chain via mempool.space, Esplora, or a Bitcoin Core node to discover txid, vout, and amountSats, and must pass txids in display byte order.',
            },
          },
        },
        {
          title: 'Submitting the Deposit',
          content: 'With the funding output in hand, `deposit()` records the UTXO on Sui. It runs three preflight checks before it signs anything — structural validation, a pause check, and the per-UTXO minimum — then executes. Note the shape of the call: `recipient` is a separate field from `signer`, which means a relayer can pay the Sui gas while hBTC mints to a user who holds no SUI at all.',
          emoji: '📥',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const recipient = signer.toSuiAddress();
const btcAddress = await client.hashi.generateDepositAddress({
  suiAddress: recipient,
});

// You find the funding tx yourself. The SDK never scans Bitcoin.
const funding = await lookupOnMempoolSpace(btcAddress);

const result = await client.hashi.deposit({
  signer,
  txid: funding.txid,        // 0x + 64 hex, display byte order
  utxos: [{ vout: funding.vout, amountSats: 100_000n }],
  recipient,                 // does not have to equal the signer
});

if (result.$kind !== 'Transaction') throw new Error('deposit failed');
const digest = result.Transaction.digest;`,
              highlights: [
                { line: 2, explanation: 'Derive first, then show the user this address. They send native BTC to it from any wallet or exchange that supports Taproot sends.' },
                { line: 7, explanation: 'This is the piece you build. The SDK has no watcher — you poll an Esplora or mempool.space API for outputs paying `btcAddress`, and read confirmations there too.' },
                { line: 11, explanation: 'Display byte order, 0x-prefixed. Get this wrong and the committee never finds the transaction. Bad hex throws `InvalidParamsError` before signing.' },
                { line: 13, explanation: 'The recipient becomes each UTXO derivation path and is the mint target. Decoupling it from the signer is what makes relaying and gas sponsorship possible.' },
                { line: 17, explanation: 'Keep the digest. It is the handle for `view.depositStatus` and `waitForDeposit` — there is no other way to track this request.' },
              ],
              explanation: 'A deposit call: derive the address, discover the funding output off-chain, then submit txid plus utxos plus recipient. The recipient field is independent of the signer, enabling relayed and gas-sponsored deposits.',
            },
          },
        },
        {
          title: 'Tracking to Mint',
          content: 'The Sui `deposit` call only registers the UTXO. Minting takes two more transactions and roughly **70 minutes**: six Bitcoin confirmations at about ten minutes each, then a committee BLS approval carrying over two-thirds of stake, then a 10-minute delay window before `confirm_deposit` becomes callable. `depositStatus(digest).confirmableAtMs` gives you the exact earliest mint time.',
          emoji: '⏳',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'dep', label: 'deposit', emoji: '📝' },
                { id: 'approve', label: 'approve_deposit', emoji: '✅' },
                { id: 'confirm', label: 'confirm_deposit', emoji: '🪙' },
                { id: 'wait', label: 'waitForDeposit(digest)', emoji: '🔁' },
              ],
              targets: [
                { id: 't-dep', label: 'Permissionless — records the UTXO and emits DepositRequested' },
                { id: 't-approve', label: 'Committee BLS certificate over more than 2/3 of stake' },
                { id: 't-confirm', label: 'Permissionless mint, callable only after the 10-minute delay' },
                { id: 't-wait', label: 'Client-side poll until status is confirmed or expired' },
              ],
              correctPairs: [
                { itemId: 'dep', targetId: 't-dep' },
                { itemId: 'approve', targetId: 't-approve' },
                { itemId: 'confirm', targetId: 't-confirm' },
                { itemId: 'wait', targetId: 't-wait' },
              ],
              explanation: 'The deposit lifecycle on Sui is deposit (permissionless registration), approve_deposit (committee certificate), confirm_deposit (permissionless mint after bitcoin_deposit_time_delay_ms). waitForDeposit polls depositStatus client-side until a terminal state.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Redeeming Native Bitcoin',
      slides: [
        {
          title: 'Requesting a Withdrawal',
          content: '`requestWithdrawal` escrows the hBTC on-chain and enqueues a request for the committee. The destination must be a bech32 P2WPKH or bech32m P2TR address whose HRP matches the configured network — it is decoded client-side, so a wrong-network address throws `InvalidBitcoinAddressError` before you spend gas. The minimum out is the same 30,000 sats as the minimum in.',
          emoji: '📤',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `const result = await client.hashi.requestWithdrawal({
  signer,
  amountSats: 50_000n,          // must be >= 30,000 sats
  bitcoinAddress: 'tb1q...',    // P2WPKH, or tb1p... for P2TR
});

// The request id you need for cancel lives in the event.
const evt = result.Transaction.events?.find((e) =>
  e.eventType.endsWith('::withdrawal_queue::WithdrawalRequested'),
);
const requestId = evt?.json?.request_id;

// Owner only, after a 1-hour cooldown, never once Processing.
await client.hashi.cancelWithdrawal({ signer, requestId });`,
              highlights: [
                { line: 1, explanation: 'This burns nothing yet. The hBTC is escrowed inside the WithdrawalRequest object, which is why cancelling can still return it to you.' },
                { line: 3, explanation: 'Satoshis as bigint, at or above `bitcoinWithdrawalMinimum`. Below it, the SDK throws `AmountBelowMinimumError` client-side and the Move code aborts anyway.' },
                { line: 4, explanation: 'Only bech32 P2WPKH (20-byte program) and bech32m P2TR (32-byte program) are accepted. Legacy base58 and P2WSH are rejected outright.' },
                { line: 9, explanation: 'Parse the WithdrawalRequested event to get `request_id`. Without it you cannot call `cancelWithdrawal` later — capture it at request time.' },
                { line: 14, explanation: 'Cancel takes the request id, not the digest. The signer must be the original requester, and the escrowed hBTC returns to them.' },
              ],
              explanation: 'requestWithdrawal escrows hBTC and enqueues a committee request. The Bitcoin address is decoded client-side and must match the network. The request_id comes from the WithdrawalRequested event and is required for cancellation.',
            },
          },
        },
        {
          title: 'The Path Back to Bitcoin',
          content: 'After the request, the committee drives four more steps. Approval carries a certificate. The commit step selects UTXOs, burns the escrowed hBTC, and locks the inputs. Then MPC signatures are recorded per input, the guardian co-signs at finalize, and confirmation marks the inputs spent. Every status is readable from `view.withdrawalStatus(digest)`.',
          emoji: '🔀',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'requested', label: 'Requested', emoji: '🕐' },
                { id: 'processing', label: 'Processing', emoji: '🔥' },
                { id: 'signed', label: 'Signed', emoji: '✍️' },
                { id: 'confirmed', label: 'Confirmed', emoji: '🏁' },
              ],
              targets: [
                { id: 't-req', label: 'hBTC escrowed, waiting on the committee' },
                { id: 't-proc', label: 'Committed and burned — cancel is now impossible' },
                { id: 't-sign', label: 'MPC and guardian signatures attached to the Bitcoin tx' },
                { id: 't-conf', label: 'Bitcoin tx settled, input UTXOs marked spent' },
              ],
              correctPairs: [
                { itemId: 'requested', targetId: 't-req' },
                { itemId: 'processing', targetId: 't-proc' },
                { itemId: 'signed', targetId: 't-sign' },
                { itemId: 'confirmed', targetId: 't-conf' },
              ],
              explanation: 'Withdrawal statuses in order: Requested (escrowed), Approved, Processing (hBTC burned at commit, cancel impossible), Signed (MPC plus guardian 2-of-2 witness complete), Confirmed (Bitcoin tx settled, inputs marked spent).',
            },
          },
        },
        {
          title: 'Cancel Windows and Fees',
          content: 'Two things decide whether a user can back out, and one thing you can never paper over. Cancellation is owner-only, blocked until a 1-hour cooldown elapses, and impossible once the request reaches Processing. And the Bitcoin miner fee is deducted from the withdrawal output in BTC — no amount of Sui gas sponsorship touches it.',
          emoji: '⚖️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'The 1-hour cooldown', content: '`withdrawal_cancellation_cooldown_ms` defaults to 3,600,000. Cancel before it elapses and Move aborts. It is a floor, not a deadline — after the hour you can cancel any time the request is still Requested or Approved.' },
                { label: 'Processing is the point of no return', content: 'At commit the escrowed hBTC is burned and the input UTXOs are locked to a Bitcoin transaction. From that moment `cancel_withdrawal` aborts with `ECannotCancelProcessingWithdrawal`. Design your UI to say so before the user asks.' },
                { label: 'No protocol fee, anywhere', content: 'Hashi charges no deposit fee and no withdrawal service fee. Deposits mint the full UTXO amount. The only economic deduction is the Bitcoin miner fee, split evenly across the requests batched into one withdrawal transaction.' },
                { label: 'What you cannot sponsor', content: 'You can gas-sponsor every Sui-side transaction. You cannot sponsor the Bitcoin L1 miner fee on the way in or the way out — it is paid in BTC on Bitcoin. Say this plainly in your UI rather than surprising the user with a smaller payout.' },
              ],
              explanation: 'Cancellation rules: owner-only, 1-hour cooldown floor, impossible once Processing. Fee model: no protocol fee on either side, only the Bitcoin miner fee, which is paid in BTC and can never be gas-sponsored.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'How does the Hashi SDK know which Bitcoin network to use?',
      options: [
        'You pass `bitcoinNetwork` to every method call',
        'It is derived from the network of the Sui client you extend',
        'It reads the network from the user\'s Bitcoin wallet',
        'It always defaults to Bitcoin mainnet',
      ],
      correctAnswer: 1,
      explanation: 'The network comes from the underlying Sui client you call `$extend(hashi())` on. Sui testnet and devnet both map to Bitcoin signet. Mainnet has no config entry, so `hashi()` throws there until it is deployed.',
      weaknessTopic: 'hashi-integration',
    },
    {
      question: 'Where does `deposit()` get the funding txid, vout, and amountSats?',
      options: [
        'The SDK scans the Bitcoin chain and finds them automatically',
        'The committee pushes them to the client over websocket',
        'You supply them — the app must watch Bitcoin itself',
        'They are read from the Sui shared object at deposit time',
      ],
      correctAnswer: 2,
      explanation: 'The SDK never scans Bitcoin. Your app finds the funding output via mempool.space, Esplora, or a Bitcoin node and passes txid, vout, and amountSats into `deposit()`. The optional `bitcoin.*` helpers exist but require a `btcRpcUrl` pointing at a Bitcoin Core node.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'What does `depositStatus(digest).confirmableAtMs` tell you?',
      options: [
        'When the Bitcoin transaction entered the mempool',
        'The earliest time hBTC can be minted: committee approval plus the 10-minute delay',
        'The deadline after which the deposit expires and is garbage collected',
        'When the sixth Bitcoin confirmation is expected to land',
      ],
      correctAnswer: 1,
      explanation: 'It is the approval timestamp plus `bitcoin_deposit_time_delay_ms` (600,000 ms). `confirm_deposit` aborts before that moment and mints after it. The field is null until the committee approves.',
      weaknessTopic: 'hashi-deposit',
    },
    {
      question: 'When can a user still cancel a withdrawal and get their hBTC back?',
      options: [
        'Any time before the Bitcoin transaction confirms',
        'Only within the first hour after requesting',
        'Only the requester, after a 1-hour cooldown, and only before the request reaches Processing',
        'Never — withdrawals are irreversible once submitted',
      ],
      correctAnswer: 2,
      explanation: 'All three conditions are enforced on-chain: `EUnauthorizedCancellation` for a non-owner, `ECooldownNotElapsed` inside the 1-hour window, and `ECannotCancelProcessingWithdrawal` once the committee has committed and burned the hBTC.',
      weaknessTopic: 'hashi-withdrawal',
    },
    {
      question: 'Which cost in a Hashi deposit can never be gas-sponsored by your app?',
      options: [
        'The Sui gas for the `deposit` transaction',
        'The Sui gas for `confirm_deposit`',
        'A protocol deposit fee taken from the minted hBTC',
        'The Bitcoin L1 miner fee on the funding transaction',
      ],
      correctAnswer: 3,
      explanation: 'There is no protocol deposit fee at all — the full UTXO amount is minted. Both Sui-side transactions can be sponsored, and `confirm_deposit` is permissionless so a keeper can call it. The Bitcoin miner fee is paid in BTC on Bitcoin and is outside Sui entirely.',
      weaknessTopic: 'hashi-basics',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Hashi — Deposit Helper Practice
// Build the glue an app needs before it can call client.hashi.deposit().

const DEPOSIT_MINIMUM_SATS = 30_000n;
const CONFIRMATION_THRESHOLD = 6;
const MINUTES_PER_BLOCK = 10;
const DELAY_MINUTES = 10;

// An Esplora / mempool.space output. \`value\` is already in satoshis.
interface EsploraVout {
  n: number;
  value: number;
  scriptpubkey_address: string;
}

// The shape @mysten/hashi expects.
interface DepositParams {
  txid: string;
  utxos: { vout: number; amountSats: bigint }[];
  recipient: string;
}

// TODO 1: Shape one funding output into DepositParams.
// Throw if amountSats is below DEPOSIT_MINIMUM_SATS.
// Prefix txid with '0x' if it is missing (keep display byte order).
function buildDepositParams(
  txid: string,
  vout: number,
  amountSats: bigint,
  recipient: string
): DepositParams {
  // Your code here
}

// TODO 2: Find the output that paid the deposit address.
// Return { vout, amountSats } for the first match, or null if none match.
function findFundingOutput(
  vouts: EsploraVout[],
  depositAddress: string
): { vout: number; amountSats: bigint } | null {
  // Your code here
}

// TODO 3: Minutes remaining before hBTC can be minted.
// 6 confirmations at ~10 minutes each, then a 10-minute delay window.
function estimateMintTime(confirmations: number): number {
  // Your code here
}`,

  solution: `// Hashi — Deposit Helper Practice

const DEPOSIT_MINIMUM_SATS = 30_000n;
const CONFIRMATION_THRESHOLD = 6;
const MINUTES_PER_BLOCK = 10;
const DELAY_MINUTES = 10;

interface EsploraVout {
  n: number;
  value: number;
  scriptpubkey_address: string;
}

interface DepositParams {
  txid: string;
  utxos: { vout: number; amountSats: bigint }[];
  recipient: string;
}

// TODO 1: Shape one funding output into DepositParams
function buildDepositParams(
  txid: string,
  vout: number,
  amountSats: bigint,
  recipient: string
): DepositParams {
  if (amountSats < DEPOSIT_MINIMUM_SATS) {
    throw new Error('amountSats is below the 30,000 sat deposit minimum');
  }
  return {
    txid: txid.startsWith('0x') ? txid : '0x' + txid,
    utxos: [{ vout, amountSats }],
    recipient,
  };
}

// TODO 2: Find the output that paid the deposit address
function findFundingOutput(
  vouts: EsploraVout[],
  depositAddress: string
): { vout: number; amountSats: bigint } | null {
  const match = vouts.find((v) => v.scriptpubkey_address === depositAddress);
  if (!match) return null;
  return { vout: match.n, amountSats: BigInt(match.value) };
}

// TODO 3: Minutes remaining before hBTC can be minted
function estimateMintTime(confirmations: number): number {
  const remaining = Math.max(0, CONFIRMATION_THRESHOLD - confirmations);
  return remaining * MINUTES_PER_BLOCK + DELAY_MINUTES;
}`,

  hints: [
    'TODO 1: guard first. Compare `amountSats < DEPOSIT_MINIMUM_SATS` (both bigints) and throw, then build the object. The SDK wants `utxos` as an array even for a single output.',
    'TODO 1: the txid must be 0x-prefixed 32-byte hex in display byte order. `txid.startsWith(\'0x\') ? txid : \'0x\' + txid` handles both input forms — never reverse the bytes yourself, the SDK does that internally.',
    'TODO 2: use `vouts.find((v) => v.scriptpubkey_address === depositAddress)`. Return `null` when there is no match, and remember the SDK field is `vout` while Esplora calls it `n`.',
    'TODO 2: Esplora reports `value` in satoshis already, so `BigInt(match.value)` is enough — do not multiply by 1e8.',
    'TODO 3: `Math.max(0, CONFIRMATION_THRESHOLD - confirmations)` gives blocks still needed. Multiply by MINUTES_PER_BLOCK and add DELAY_MINUTES — the 10-minute delay applies even at 6 confirmations.',
  ],
};
