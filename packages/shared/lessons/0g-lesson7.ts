import { LessonContent } from '../types/lesson';

export const ogLesson7: LessonContent = {
  id: '0g-7',
  title: 'The Direct path: main account, sub-accounts, and the 24-hour lock',
  description:
    'Leave the Router behind and pay providers directly. Learn the two-layer ledger, the 3 0G and 1 0G minimums, why transferFund already acknowledges the provider, why your balance does not move after a request, and why retrieveFund must be called twice.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 7,
  language: 'typescript',
  prerequisiteLessons: ['0g-6'],

  narrative: {
    welcomeMessage:
      "Everything so far went through the Router: one API key, one balance, someone else handling the wallet. Now you take the wheel. The Direct path pays each provider from its own on-chain sub-account, and it behaves in three ways that surprise almost everyone the first time. Your funds appear to vanish, a refund appears to do nothing, and a request appears to be free. None of that is broken. By the end of this lesson you will know exactly what is happening, and you will have the transaction hashes to prove it.",
    quizTransition:
      "You have seen the whole fund lifecycle: wallet, main ledger, sub-account, provider, and back again. Time to check whether the parts that trip people up have actually landed.",
    practiceTransition:
      "Now write it. You will build the ledger lifecycle end to end: guard the minimums, open the ledger, fund one provider, send one chat completion, and start a refund you can watch count down.",
    celebrationMessage:
      "That is the full Direct path. You can open a ledger, fund a provider, bill a request against a sub-account, read a Locked balance without panicking, and start a 24-hour refund on purpose rather than by accident.",
    nextLessonTease:
      "Next: 0G Storage. You upload a file and get back one 32-byte root hash, and that hash is the only key that exists. Lose it and the bytes are gone even though they are still on the network.",
  },

  teachingSections: [
    {
      sectionTitle: 'Two accounts, not one',
      slides: [
        {
          title: 'Why the money lives in two places',
          content:
            'A provider running a GPU cannot trust you to pay after the fact, and you cannot trust a provider with an open claim on your whole wallet. 0G resolves that with two layers. Your main ledger account is a pot you control. A sub-account is a small, per-provider escrow the provider is allowed to draw from. That single design decision explains almost every confusing thing on this page, including the 24-hour lock and the balance that looks like it disappeared.',
          emoji: '🏦',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'Main ledger account',
                  content:
                    'Created once per wallet by addLedger or depositFund. Every deposit lands here first, and every withdrawal back to your wallet leaves from here via refund(amount). No provider can touch it.',
                },
                {
                  label: 'Provider sub-account',
                  content:
                    "Created automatically the first time you call transferFund(provider, 'inference', wei). One per provider, per service type. The provider settles usage against this balance and nothing else, so a hostile provider can never cost you more than what you put in that one sub-account.",
                },
                {
                  label: 'Total vs Locked vs Available',
                  content:
                    'The CLI command 0g-compute-cli get-account renders three numbers. Total is everything you have deposited. Locked is the sum sitting in sub-accounts. Available is what is left in the main account and free to transfer. Money moved into a sub-account is still yours, it is just no longer Available.',
                },
                {
                  label: 'This is not the Router balance',
                  content:
                    'A Router deposit funds a unified balance in the shared 0G Payment Layer contract behind an sk- key. It does not fund any sub-account, and no sub-account backs a Router call. They are separate contracts with separate accounting. Depositing on one side and checking the other is the single most common support question 0G gets.',
                },
              ],
              explanation:
                'The two-layer ledger exists so that neither the user nor the provider has to trust the other with an open-ended claim.',
            },
          },
        },
        {
          title: 'The two minimums that are not suggestions',
          content:
            'Opening the ledger requires at least 3 0G. Each provider sub-account requires at least 1 0G locked before that provider will serve a request. These are contract-level rules, not guidance, so a smaller amount does not get you a smaller service. It gets you a rejected request, often with a message that says nothing about minimums.',
          emoji: '📏',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);

// Step 1: open or top up the MAIN ledger. Minimum 3 0G on creation.
// Note the units: depositFund takes a plain number of 0G, not wei.
await broker.ledger.depositFund(10);

// Step 2: carve a per-provider sub-account. Minimum 1 0G locked.
// Note the units again: transferFund takes WEI, so parseEther is required.
const providerAddress = '0xf07240Efa67755B5311bc75784a061eDB47165Dd';
await broker.ledger.transferFund(
  providerAddress,
  'inference',
  ethers.parseEther('2'),
);

// Step 3: read it back before you trust any of it.
const account = await broker.ledger.getLedger();
console.log(account);`,
              highlights: [
                {
                  line: 4,
                  explanation:
                    'Galileo testnet RPC. The chainId behind it is 16602. If a tutorial hands you 16601, that is the legacy testnet id and it will not match the explorer you verify against.',
                },
                {
                  line: 10,
                  explanation:
                    'depositFund and addLedger take a plain JavaScript number of 0G. Passing 0.01 here is the mistake baked into the official starter kit, and the next slide takes it apart.',
                },
                {
                  line: 17,
                  explanation:
                    "The service type is a literal string, either 'inference' or 'fine-tuning'. Fund the wrong one and your inference sub-account is still empty while your balance is definitely gone.",
                },
                {
                  line: 18,
                  explanation:
                    'transferFund takes wei, not 0G. Mixing the two conventions in one file is how people accidentally transfer a millionth of what they meant to. Use ethers.parseEther every time.',
                },
                {
                  line: 22,
                  explanation:
                    'Read the raw object once. Different sources disagree: the docs use account.totalBalance, the official skill file uses account[1]. ethers v6 returns a Result that can behave both ways, so print it before you depend on either shape.',
                },
              ],
              explanation:
                'Two calls, two different unit conventions, two different minimums. Getting the units wrong is silent.',
            },
          },
        },
        {
          title: 'Bug one: the starter kit fails its own first run',
          content:
            'The official 0G compute starter kit ships a first-run path that cannot work on a fresh wallet. Its startup routine catches the "no ledger" error and then tries to create a ledger with 0.01 0G, which is three hundred times below the 3 0G minimum documented in the same repository. This is worth studying, because it is exactly the class of bug you will hit yourself: a default that was fine when it was written and is now below a contract rule.',
          emoji: '🐞',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// 0g-compute-ts-starter-kit/src/startup.ts (abridged, as shipped)
export const initializeApplication = async (): Promise<void> => {
  try {
    const balanceInfo = await brokerService.getBalance();
    console.log('Ledger account exists:', balanceInfo);
  } catch (error) {
    console.log('Ledger account does not exist, creating...');
    const initialAmount = 0.01;
    await brokerService.addFundsToLedger(initialAmount);
    console.log('Ledger account created');
  }
};

// The fix is one line plus a guard:
const LEDGER_MINIMUM_OG = 3;
const initialAmount = Number(process.env.INITIAL_LEDGER_OG ?? LEDGER_MINIMUM_OG);
if (initialAmount < LEDGER_MINIMUM_OG) {
  throw new Error('Ledger creation requires at least 3 0G');
}`,
              highlights: [
                {
                  line: 4,
                  explanation:
                    'getBalance calls broker.ledger.getLedger(). On a wallet that has never had a ledger it throws, which is the intended signal to create one.',
                },
                {
                  line: 8,
                  explanation:
                    'Here is the bug. 0.01 0G is far below the 3 0G contract minimum. The call reverts and the whole app refuses to boot on precisely the wallet the quickstart tells a newcomer to use.',
                },
                {
                  line: 9,
                  explanation:
                    'addFundsToLedger wraps broker.ledger.addLedger(amount). Same units as depositFund: plain 0G, not wei.',
                },
                {
                  line: 15,
                  explanation:
                    'The fix starts here: give the minimum a name so it can be asserted against instead of living as a magic number in a catch block.',
                },
                {
                  line: 17,
                  explanation:
                    'Then fail loudly above the SDK rather than letting a revert surface as an opaque RPC error twelve frames down. A newcomer reading "execution reverted" learns nothing.',
                },
              ],
              explanation:
                'A hardcoded default below a contract minimum is invisible until it reverts on a fresh wallet.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-701',
    },
    {
      sectionTitle: 'Two rules the official material gets wrong',
      slides: [
        {
          title: 'acknowledgeProviderSigner has been quietly demoted',
          content:
            "Older guides state an absolute rule: always call acknowledgeProviderSigner before using a provider. That was true once. transferFund now auto-acknowledges the provider's TEE signer on-chain as part of the same operation, so the extra call is a transaction that costs gas and changes nothing. It still has one legitimate use: acknowledging a provider without moving funds to it.",
          emoji: '🪧',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What acknowledging actually means',
                  content:
                    "You are recording on-chain that you accept a specific signer address as the provider's TEE identity. Later verification of a response signature is checked against that acknowledged signer, which is why it has to happen before the provider will bill you.",
                },
                {
                  label: 'What changed',
                  content:
                    "transferFund(provider, 'inference', wei) now performs the acknowledgement itself. The 0G docs say so directly under the browser account example: this also auto-acknowledges the provider's TEE signer on-chain.",
                },
                {
                  label: 'When you still need it',
                  content:
                    "Only when you want to acknowledge without transferring. The CLI reflects this: 0g-compute-cli inference acknowledge-provider --provider <ADDR> is documented as needed only if you have not used transfer-fund.",
                },
                {
                  label: 'Why this matters beyond one wasted tx',
                  content:
                    'Skill files and quickstarts encode ALWAYS and NEVER rules that were true at a point in time. When an SDK absorbs a step, the rule becomes cargo cult. Check the behaviour, not the checklist.',
                },
              ],
              explanation:
                'An ALWAYS rule that the SDK has since absorbed becomes a gas-burning no-op.',
            },
          },
        },
        {
          title: 'Bug two: processResponse takes two arguments, not three',
          content:
            'The starter kit demo passes the response content as a third argument to processResponse. The docs describe two parameters, providerAddress and chatID. Older skill files describe three, with JSON.stringify(usage) as the third. Three sources, three shapes. The docs match the current SDK: chatID is what enables TEE verification, and passing nothing for it makes the call return null rather than a boolean.',
          emoji: '🔧',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// As shipped in demo-compute-flow.ts (around line 220)
const isValid = await broker.inference.processResponse(
  selectedProvider,
  chatId,
  aiResponse || '',   // third argument: the response CONTENT
);

// Current documented shape: two arguments.
// chatID comes from the ZG-Res-Key response HEADER first,
// and only falls back to the JSON body id when the header is absent.
const res = await fetch(endpoint + '/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ messages, model }),
});
const data = await res.json();

let chatID = res.headers.get('ZG-Res-Key') || res.headers.get('zg-res-key');
if (!chatID) chatID = data.id;

const verified = chatID
  ? await broker.inference.processResponse(providerAddress, chatID)
  : null;`,
              highlights: [
                {
                  line: 5,
                  explanation:
                    'The third argument. The docs list two parameters. An old skill file lists three where the third is JSON.stringify(usage). The content string matches neither, so at best it is ignored.',
                },
                {
                  line: 18,
                  explanation:
                    'Check both casings. HTTP header names are case-insensitive on the wire, but header APIs differ across runtimes and proxies, and this one costs you nothing to get right.',
                },
                {
                  line: 19,
                  explanation:
                    'The body id is a fallback for chatbot responses only. Image and audio endpoints give you the id in the header or not at all.',
                },
                {
                  line: 21,
                  explanation:
                    'No chatID means no verification. processResponse returns null instead of true or false, which is a third state you have to handle rather than treat as a failure.',
                },
              ],
              explanation:
                'Read the signature from the SDK you actually installed, not from the first example you find.',
            },
          },
        },
        {
          title: 'Which call does what',
          content:
            'Six methods cover the entire Direct lifecycle. Most confusion comes from two pairs that sound alike: depositFund versus transferFund, and refund versus retrieveFund. One pair moves money down a level, the other moves it back up.',
          emoji: '🗺️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'deposit', label: 'ledger.depositFund(n)', emoji: '⬇️' },
                { id: 'transfer', label: 'ledger.transferFund(p, t, wei)', emoji: '➡️' },
                { id: 'retrieve', label: 'ledger.retrieveFund(t)', emoji: '⬅️' },
                { id: 'refund', label: 'ledger.refund(n)', emoji: '⬆️' },
                { id: 'headers', label: 'inference.getRequestHeaders(p)', emoji: '🎫' },
                { id: 'process', label: 'inference.processResponse(p, id)', emoji: '🔍' },
              ],
              targets: [
                { id: 't-deposit', label: 'Wallet into main ledger account' },
                { id: 't-transfer', label: 'Main ledger into a provider sub-account' },
                { id: 't-retrieve', label: 'Sub-account back to main ledger, 24h lock' },
                { id: 't-refund', label: 'Main ledger back out to your wallet' },
                { id: 't-headers', label: 'Single-use auth headers for one request' },
                { id: 't-process', label: 'Verify the TEE signature for one chatID' },
              ],
              correctPairs: [
                { itemId: 'deposit', targetId: 't-deposit' },
                { itemId: 'transfer', targetId: 't-transfer' },
                { itemId: 'retrieve', targetId: 't-retrieve' },
                { itemId: 'refund', targetId: 't-refund' },
                { itemId: 'headers', targetId: 't-headers' },
                { itemId: 'process', targetId: 't-process' },
              ],
              explanation:
                'deposit and transfer push money down. retrieveFund and refund pull it back up, one level each.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-702',
    },
    {
      sectionTitle: 'The lock and the lag',
      slides: [
        {
          title: 'retrieveFund must be called twice, 24 hours apart',
          content:
            'The first call to retrieveFund does not move money. It registers a refund request and starts a 24-hour lock. The funds return to your main ledger only when you call it a second time after the lock expires. Called back to back, the second call does nothing at all, which reads exactly like a broken SDK and is in fact the security model working: the delay stops a user from draining an escrow the instant a provider starts serving them.',
          emoji: '⏳',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Call 1: registers the request and starts the clock. No funds move.
await broker.ledger.retrieveFund('inference');

// Call 2: only works after 24 hours have elapsed. Now funds move.
// await broker.ledger.retrieveFund('inference');

// Watch the countdown from the CLI:
//   0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS>
//
// Details of Each Amount Applied for Return to Main Account
// | Amount (0G)          | Remaining Locked Time |
// | 0.099785050000000000 | 23h 43min 15s         |

// Or read the same state from the SDK:
const [subAccount, refunds] = await broker.inference.getAccountWithDetail(
  providerAddress,
);
console.log('pending refunds:', refunds.length);`,
              highlights: [
                {
                  line: 2,
                  explanation:
                    "retrieveFund takes the service type, not a provider and not an amount. It applies to your sub-accounts of that type. Passing 'fine-tuning' when you meant 'inference' silently does nothing useful.",
                },
                {
                  line: 5,
                  explanation:
                    'Same call, second time, at least 24 hours later. There is no separate completeRefund method. Idempotent-looking APIs that are actually stateful are worth a comment in your own code.',
                },
                {
                  line: 12,
                  explanation:
                    'Remaining Locked Time is the artefact this lesson asks you to produce. It is proof you started a real refund rather than reading about one.',
                },
                {
                  line: 15,
                  explanation:
                    'getAccountWithDetail returns the sub-account plus an array of pending refunds. An empty refunds array after you called retrieveFund means the call did not land.',
                },
              ],
              explanation:
                'One method name, two distinct effects, separated by a mandatory 24 hours.',
            },
          },
        },
        {
          title: 'Why your balance did not move after that request',
          content:
            'You send one chat completion, then check your sub-account, and the balance is unchanged. Nothing is free and nothing is broken. 0G Compute uses delayed batch settlement: providers accumulate usage and settle it on-chain in lumps. So ten requests show up as one larger deduction rather than ten small ones, and for a while your sub-account reads higher than your true remaining balance.',
          emoji: '📉',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                {
                  label: 'What batch settlement buys',
                  content:
                    'One on-chain transaction instead of one per request. On a network where inference costs a fraction of a cent, per-request settlement would cost more in gas than the inference itself.',
                },
                {
                  label: 'What it costs you',
                  content:
                    'Observability. Between settlements you cannot read your true balance from chain state, and a sudden drop looks like theft until you reconcile it against your own request log. The totals always match actual usage, but only eventually.',
                },
                {
                  label: 'Why the Router advertises inline billing',
                  content:
                    "This is exactly why the Router's per-response x_0g_trace.billing block with input_cost, output_cost and total_cost in neuron is a real feature and not decoration. It gives you the per-request number that the Direct path structurally cannot give you at request time.",
                },
                {
                  label: 'The one refund that destroys work',
                  content:
                    'Never start a refund while a fine-tuning job is running. Inference is stateless and a starved sub-account just means rejected requests you can retry. A fine-tuning job with its funding pulled loses the run in progress, and the compute already spent goes with it.',
                },
              ],
              explanation:
                'Batch settlement trades per-request visibility for gas efficiency. The Router buys the visibility back.',
            },
          },
        },
        {
          title: 'The full round trip',
          content:
            'Put the whole lifecycle in order once and the API stops feeling arbitrary. Money flows down through two gates and back up through two gates, and only one of those four steps has a mandatory delay attached to it.',
          emoji: '🔁',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 's1', label: '1. Fund the ledger', emoji: '💰' },
                { id: 's2', label: '2. Fund one provider', emoji: '🤝' },
                { id: 's3', label: '3. Send a request', emoji: '💬' },
                { id: 's4', label: '4. Wait for settlement', emoji: '🧾' },
                { id: 's5', label: '5. Start the refund', emoji: '⏳' },
                { id: 's6', label: '6. Finish the refund', emoji: '✅' },
              ],
              targets: [
                { id: 'g1', label: 'depositFund or addLedger, at least 3 0G' },
                { id: 'g2', label: 'transferFund, at least 1 0G, auto-acknowledges' },
                { id: 'g3', label: 'getRequestHeaders then fetch, headers are single use' },
                { id: 'g4', label: 'Provider settles a batch on-chain, balance drops once' },
                { id: 'g5', label: 'retrieveFund call one, clock starts, nothing moves' },
                { id: 'g6', label: 'retrieveFund call two after 24h, then refund to wallet' },
              ],
              correctPairs: [
                { itemId: 's1', targetId: 'g1' },
                { itemId: 's2', targetId: 'g2' },
                { itemId: 's3', targetId: 'g3' },
                { itemId: 's4', targetId: 'g4' },
                { itemId: 's5', targetId: 'g5' },
                { itemId: 's6', targetId: 'g6' },
              ],
              explanation:
                'Six steps, two of which are the same method call separated by a day.',
            },
          },
        },
      ],
      exerciseId: 'ch-0g-703',
    },
  ],

  quiz: [
    {
      question:
        'You call broker.ledger.addLedger(0.01) on a wallet that has never used 0G Compute. What happens?',
      options: [
        'A ledger is created with a 0.01 0G balance',
        'The call reverts, because ledger creation requires a minimum of 3 0G',
        'A ledger is created and topped up automatically to the minimum',
        'It succeeds but the ledger is unusable until you acknowledge a provider',
      ],
      correctAnswer: 1,
      explanation:
        'Ledger creation has a documented contract minimum of 3 0G, and each provider sub-account needs at least 1 0G locked to be served. The official starter kit hardcodes 0.01 in src/startup.ts, which is why its first-run path fails on a fresh wallet.',
      weaknessTopic: '0g-economics',
      practiceHint:
        'Two numbers to memorise: 3 0G to open the ledger, 1 0G per provider sub-account.',
    },
    {
      question:
        'You made one chat completion against a funded provider. Your sub-account balance is unchanged. Why?',
      options: [
        'Testnet inference is free, so nothing was charged',
        'The fee is taken from the main account, not the sub-account',
        'Providers use delayed batch settlement and settle accumulated usage on-chain in lumps',
        'The request failed silently and you were never billed',
      ],
      correctAnswer: 2,
      explanation:
        'Fees are not deducted per request. The provider accumulates usage and settles a batch on-chain, so ten requests appear as one larger deduction. The total always matches actual usage, but the balance lags. This is exactly why the Router exposes a per-response billing block that the Direct path cannot.',
      weaknessTopic: '0g-compute',
      practiceHint:
        'Balance lag is a settlement schedule, not a pricing model. Reconcile against your own request log.',
    },
    {
      question:
        "You call broker.ledger.retrieveFund('inference') twice in a row inside the same script. What is the result?",
      options: [
        'Both calls succeed and the funds return to your main account immediately',
        'The first registers a refund request and starts a 24-hour lock; the second does nothing',
        'The second call cancels the first',
        'The second call throws and reverts the first request',
      ],
      correctAnswer: 1,
      explanation:
        'retrieveFund is stateful. Call one registers the request and starts the lock, moving no funds. Call two completes the transfer only after 24 hours have elapsed. Back to back it looks like a broken SDK. Check Remaining Locked Time with 0g-compute-cli get-sub-account.',
      weaknessTopic: '0g-compute',
      practiceHint: 'Same method name, two different effects, separated by a mandatory day.',
    },
    {
      question:
        "You just called transferFund(provider, 'inference', parseEther('2')). Do you still need acknowledgeProviderSigner?",
      options: [
        'Yes, always, or the provider will reject every request',
        "No, transferFund auto-acknowledges the provider's TEE signer on-chain",
        'Yes, but only for verifiable TeeML providers',
        'No, acknowledgement was removed from the protocol entirely',
      ],
      correctAnswer: 1,
      explanation:
        "transferFund now acknowledges the provider's TEE signer as part of the same operation. Calling acknowledgeProviderSigner afterwards burns a transaction for nothing. It is still useful in one case: acknowledging a provider without transferring funds to it.",
      weaknessTopic: '0g-compute',
      practiceHint:
        'ALWAYS rules in older skill files go stale when the SDK absorbs the step they describe.',
    },
    {
      question:
        'What is the current documented signature of broker.inference.processResponse?',
      options: [
        '(providerAddress, chatID, responseContent)',
        '(providerAddress, chatID, JSON.stringify(usage))',
        '(providerAddress, chatID)',
        '(chatID, providerAddress)',
      ],
      correctAnswer: 2,
      explanation:
        'The docs describe two parameters. chatID comes from the ZG-Res-Key response header first, falling back to the body id for chatbot responses. Omit chatID and the method returns null rather than a boolean. The starter kit demo passes response content as a third argument and an older skill file claims JSON.stringify(usage). Trust the SDK you installed.',
      weaknessTopic: '0g-verification',
      practiceHint:
        'null is a third outcome, distinct from false. It means verification was skipped, not that it failed.',
    },
    {
      question:
        'A teammate deposited on the Router billing page and their Direct sub-account still reads zero. What happened?',
      options: [
        'The deposit needs 24 hours to propagate to sub-accounts',
        'They need to call transferFund to move the Router balance down',
        'Router and Direct use separate contracts and separate balances; a Router deposit never funds a sub-account',
        'The deposit failed and needs to be resubmitted',
      ],
      correctAnswer: 2,
      explanation:
        'The Router holds one unified balance in the shared 0G Payment Layer contract behind an sk- key. The Direct path uses a main ledger plus per-provider sub-accounts in entirely different contracts. Money does not flow between them. This is the most common support question 0G receives.',
      weaknessTopic: '0g-router',
      practiceHint:
        'Two payment systems, one brand. Ask which contract holds the money before debugging anything else.',
    },
    {
      question:
        'Which situation makes starting a refund genuinely destructive rather than merely inconvenient?',
      options: [
        'A high-volume inference workload, because requests will start failing',
        'An active fine-tuning job, because pulling its funding loses the run in progress',
        'Any time the sub-account is below 1 0G',
        'While a batch settlement is pending, because the settlement will revert',
      ],
      correctAnswer: 1,
      explanation:
        'Inference is stateless: a starved sub-account rejects requests you can simply retry after topping up. A fine-tuning job is long-running work, and pulling its funding mid-run loses the training in progress along with the compute already paid for.',
      weaknessTopic: '0g-economics',
      practiceHint: 'Stateless work is retryable. Long-running work is not.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Compute, Direct path: the full ledger lifecycle on Galileo testnet.
// npm install @0gfoundation/0g-compute-ts-sdk ethers dotenv
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

const RPC_URL = 'https://evmrpc-testnet.0g.ai'; // Galileo, chainId 16602
const EXPLORER = 'https://chainscan-galileo.0g.ai';

// Contract minimums. These are rules, not recommendations.
const LEDGER_MINIMUM_OG = 3;
const SUB_ACCOUNT_MINIMUM_OG = 1;

// An official provider (llama-3.3-70b-instruct).
const PROVIDER = '0xf07240Efa67755B5311bc75784a061eDB47165Dd';

// TODO 1: Guard the ledger minimum.
// Throw an Error naming the minimum if amountOg is below LEDGER_MINIMUM_OG.
// Otherwise return amountOg unchanged.
function assertLedgerAmount(amountOg: number): number {
  // Your code here
}

// TODO 2: Guard the sub-account minimum, then convert to wei.
// Throw if amountOg is below SUB_ACCOUNT_MINIMUM_OG.
// Otherwise return ethers.parseEther(String(amountOg)).
// Remember: depositFund takes 0G, transferFund takes wei.
function toSubAccountWei(amountOg: number): bigint {
  // Your code here
}

// TODO 3: Turn raw wei totals into the three numbers the CLI shows.
// available = total - locked. Format each with ethers.formatEther.
function summariseLedger(
  totalWei: bigint,
  lockedWei: bigint
): { total: string; locked: string; available: string } {
  // Your code here
}

// TODO 4: Open the ledger if it does not exist yet.
// getLedger() throws when there is no ledger for this wallet: catch that,
// guard the amount with assertLedgerAmount, then call addLedger(amountOg).
// Return 'created' or 'existing'.
async function openLedger(
  broker: any,
  amountOg: number
): Promise<'created' | 'existing'> {
  // Your code here
}

// TODO 5: Fund one provider sub-account.
// Use toSubAccountWei, then broker.ledger.transferFund(provider, 'inference', wei).
// Do NOT call acknowledgeProviderSigner: transferFund already did it.
async function fundProvider(
  broker: any,
  providerAddress: string,
  amountOg: number
): Promise<void> {
  // Your code here
}

// TODO 6: Send one chat completion with fetch, then verify it.
// - getServiceMetadata(providerAddress) gives { endpoint, model }
// - getRequestHeaders(providerAddress) gives single-use auth headers
// - POST to endpoint + '/chat/completions'
// - read chatID from the ZG-Res-Key header, BOTH casings, body id as fallback
// - call processResponse with TWO arguments only
async function chatOnce(
  broker: any,
  providerAddress: string,
  prompt: string
): Promise<{ answer: string; chatID: string | null; verified: boolean | null }> {
  // Your code here
}

// TODO 7: Start a refund and report how many are now pending.
// retrieveFund('inference') once, then getAccountWithDetail to count refunds.
// Remind the caller in the returned string that call two comes 24 hours later.
async function beginRefund(
  broker: any,
  providerAddress: string
): Promise<string> {
  // Your code here
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const broker = await createZGComputeNetworkBroker(wallet);

  console.log('ledger:', await openLedger(broker, LEDGER_MINIMUM_OG));
  await fundProvider(broker, PROVIDER, SUB_ACCOUNT_MINIMUM_OG);
  console.log(await chatOnce(broker, PROVIDER, 'Say hello in five words.'));
  console.log(await beginRefund(broker, PROVIDER));
  console.log('Explorer:', EXPLORER + '/address/' + wallet.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  solution: `// 0G Compute, Direct path: the full ledger lifecycle on Galileo testnet.
// npm install @0gfoundation/0g-compute-ts-sdk ethers dotenv
import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

const RPC_URL = 'https://evmrpc-testnet.0g.ai'; // Galileo, chainId 16602
const EXPLORER = 'https://chainscan-galileo.0g.ai';

const LEDGER_MINIMUM_OG = 3;
const SUB_ACCOUNT_MINIMUM_OG = 1;

const PROVIDER = '0xf07240Efa67755B5311bc75784a061eDB47165Dd';

// TODO 1: Guard the ledger minimum.
function assertLedgerAmount(amountOg: number): number {
  if (!Number.isFinite(amountOg) || amountOg < LEDGER_MINIMUM_OG) {
    throw new Error(
      'Ledger creation requires at least ' + LEDGER_MINIMUM_OG + ' 0G, got ' + amountOg,
    );
  }
  return amountOg;
}

// TODO 2: Guard the sub-account minimum, then convert to wei.
function toSubAccountWei(amountOg: number): bigint {
  if (!Number.isFinite(amountOg) || amountOg < SUB_ACCOUNT_MINIMUM_OG) {
    throw new Error(
      'Provider sub-accounts require at least ' +
        SUB_ACCOUNT_MINIMUM_OG +
        ' 0G, got ' +
        amountOg,
    );
  }
  return ethers.parseEther(String(amountOg));
}

// TODO 3: Total / Locked / Available, the same three numbers get-account prints.
function summariseLedger(
  totalWei: bigint,
  lockedWei: bigint
): { total: string; locked: string; available: string } {
  const availableWei = totalWei - lockedWei;
  return {
    total: ethers.formatEther(totalWei),
    locked: ethers.formatEther(lockedWei),
    available: ethers.formatEther(availableWei < 0n ? 0n : availableWei),
  };
}

// TODO 4: Open the ledger if it does not exist yet.
async function openLedger(
  broker: any,
  amountOg: number
): Promise<'created' | 'existing'> {
  try {
    await broker.ledger.getLedger();
    return 'existing';
  } catch {
    await broker.ledger.addLedger(assertLedgerAmount(amountOg));
    return 'created';
  }
}

// TODO 5: Fund one provider sub-account. transferFund auto-acknowledges.
async function fundProvider(
  broker: any,
  providerAddress: string,
  amountOg: number
): Promise<void> {
  const wei = toSubAccountWei(amountOg);
  await broker.ledger.transferFund(providerAddress, 'inference', wei);
}

// TODO 6: One chat completion via fetch, then verify with two arguments.
async function chatOnce(
  broker: any,
  providerAddress: string,
  prompt: string
): Promise<{ answer: string; chatID: string | null; verified: boolean | null }> {
  const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
  const headers = await broker.inference.getRequestHeaders(providerAddress);

  const res = await fetch(endpoint + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!res.ok) {
    throw new Error('Provider returned ' + res.status + ': ' + (await res.text()));
  }

  // chatID lives in a HEADER. Check both casings before falling back to the body.
  let chatID =
    res.headers.get('ZG-Res-Key') || res.headers.get('zg-res-key') || null;

  const data: any = await res.json();
  if (!chatID) chatID = data.id ?? null;

  const verified = chatID
    ? await broker.inference.processResponse(providerAddress, chatID)
    : null;

  return {
    answer: data.choices?.[0]?.message?.content ?? '',
    chatID,
    verified,
  };
}

// TODO 7: Start a refund. Call one only starts the clock.
async function beginRefund(
  broker: any,
  providerAddress: string
): Promise<string> {
  await broker.ledger.retrieveFund('inference');
  const [, refunds] = await broker.inference.getAccountWithDetail(providerAddress);
  return (
    'Refund requested. Pending refunds: ' +
    refunds.length +
    '. Funds move only on the SECOND retrieveFund call, at least 24 hours from now. ' +
    'Watch it with: 0g-compute-cli get-sub-account --provider ' +
    providerAddress
  );
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const broker = await createZGComputeNetworkBroker(wallet);

  console.log('ledger:', await openLedger(broker, LEDGER_MINIMUM_OG));
  await fundProvider(broker, PROVIDER, SUB_ACCOUNT_MINIMUM_OG);
  console.log(await chatOnce(broker, PROVIDER, 'Say hello in five words.'));
  console.log(await beginRefund(broker, PROVIDER));
  console.log('Explorer:', EXPLORER + '/address/' + wallet.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});`,

  hints: [
    'assertLedgerAmount and toSubAccountWei are pure guards. The only trap is units: depositFund and addLedger take a plain number of 0G, while transferFund takes wei, so only the sub-account helper calls ethers.parseEther.',
    'openLedger relies on getLedger() throwing when no ledger exists. That thrown error is the signal, so catch it and create rather than treating it as a failure. Do not swallow errors from addLedger itself.',
    'In chatOnce, build the request with fetch rather than an SDK convenience method. Convenience wrappers hide the raw Response object, and chatID lives in the ZG-Res-Key header, so hiding the response makes verification impossible.',
    'Read the ZG-Res-Key header with both casings before falling back to data.id. Then call processResponse with exactly two arguments. Passing response content as a third argument matches no current signature.',
    'Do not call acknowledgeProviderSigner after fundProvider. transferFund already acknowledged the provider TEE signer, so the extra call is a transaction that changes nothing.',
    'beginRefund should return a string that makes the two-call rule impossible to miss. If refunds.length is still 0 after retrieveFund, the call did not land and you are about to wait 24 hours for nothing.',
  ],

  proof: {
    label: 'Ledger and sub-account artefacts plus a live refund countdown',
    hint: 'Submit four things from your own run on Galileo: the addLedger transaction hash, the transferFund transaction hash, a get-sub-account output showing a non-zero Locked balance, and the Remaining Locked Time countdown from the refund you started. Produce the countdown with 0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS> after calling retrieveFund once. A countdown near 24h proves you started a real refund rather than reading about one.',
    verifyUrl: 'https://chainscan-galileo.0g.ai',
    pattern: '^0x[a-fA-F0-9]{64}$',
  },
};
