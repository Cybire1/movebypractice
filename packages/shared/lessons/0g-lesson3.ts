import { LessonContent } from '../types/lesson';

export const ogLesson3: LessonContent = {
  id: '0g-3',
  title: 'First inference through the Router',
  description: 'Reach 0G Compute with the stock OpenAI SDK: one API key, one unified balance, and the x_0g_trace block that tells you exactly which provider served you and what it cost.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 3,
  language: 'typescript',
  prerequisiteLessons: ['0g-2'],

  narrative: {
    welcomeMessage: "You have a wallet and a deployed contract. Now you get inference. 0G Compute has two completely separate front doors, and picking the wrong one is the single most common support question in the whole ecosystem. This lesson takes the easy door, the Router, and gets you a real answer from a real GPU provider using the OpenAI SDK you already know.",
    quizTransition: "You have seen the two payment pools, the sk- key, and the x_0g_trace block. Time to check that the distinction actually landed, because this is the one that costs people afternoons.",
    practiceTransition: "Now build the client. You will list models without any key at all, send a completion, pull the provider address and the exact cost out of the response, and switch off GLM-5 thinking to see the token count drop.",
    celebrationMessage: "You just paid a decentralized GPU provider in neuron and got a receipt for it inside the response body. No centralized API does that.",
    nextLessonTease: "Next: you stop letting the Router choose for you. Routing headers, price ceilings, and the ordering rule that decides whether a fallback can quietly cost you money.",
  },

  teachingSections: [
    {
      sectionTitle: 'Two doors, two balances',
      slides: [
        {
          title: 'Why 0G Compute has two front doors',
          content: 'The same GPU providers are reachable two ways. The Router is a hosted, OpenAI-compatible gateway: you send an sk- key, it picks a provider, it fails over when one dies. The Direct SDK path skips the gateway: your wallet signs, you pick a provider yourself, you fund that provider yourself. Same network underneath, completely different plumbing on top. Start with the Router because it is a base URL change, not a rewrite.',
          emoji: '🚪',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Who signs', content: 'Router: the gateway signs server side using your sk- API key. Direct: the end user wallet signs every request. That single difference is why Router keys must never ship to a browser, and why Direct is the right answer for a wallet-connected dApp.' },
                { label: 'How you pay', content: 'Router: one unified balance in the shared 0G Payment Layer contract, covering every model and every service type. Direct: a main ledger account plus one funded sub-account per provider. Two different contracts, two different pools.' },
                { label: 'Who picks the provider', content: 'Router: automatic round-robin across healthy providers, with retry on the next one when a call fails. Direct: you discover providers, you choose, you fund, you handle the failure yourself.' },
                { label: 'What the code looks like', content: 'Router: point the OpenAI SDK at https://router-api.0g.ai/v1 and pass your key. Direct: install @0glabs/0g-serving-broker, create a broker from an ethers wallet, manage the ledger. Lesson 7 covers Direct in full.' },
              ],
              explanation: 'Router vs Direct is a payments and signing decision before it is an API decision.',
            },
          },
        },
        {
          title: 'The balance that seems to vanish',
          content: 'A Router deposit does not fund your Direct sub-accounts, and sub-account balances do not back Router calls. They live in different contracts. This is why people deposit on compute-marketplace.0g.ai, open pc.0g.ai, see a zero balance, and file a support ticket. Nothing was lost. They are looking at the wrong pool, and the fix is the Router / Advanced toggle in the top right of pc.0g.ai.',
          emoji: '💸',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// The Router balance lives in the 0G Payment Layer contract.
// It is shared across 0G products, not just the Router.
const PAYMENT_LAYER_MAINNET = '0xA3b15Bd2aD18BFB6b5f92D8AA9F444Dd59d1cE32';
const PAYMENT_LAYER_TESTNET = '0x0AD9690e0b34aB2d493DE02cDF149ee34f6C9939';

// Direct sub-account balances are NOT here. Different contracts entirely.
// compute-marketplace.0g.ai deposits  ->  per-provider sub-accounts
// pc.0g.ai default view (Router)      ->  Payment Layer balance
// pc.0g.ai "Advanced" toggle          ->  the sub-account view

// Symptom: "I deposited and my balance is zero."
// Cause:   deposited into the sub-account pool, reading the Router pool.
// Fix:     click Advanced. Or withdraw from sub-accounts and
//          deposit again from the default Router view to consolidate.`,
              highlights: [
                { line: 3, explanation: 'Mainnet Payment Layer. Every Router request debits this balance, whatever model or service type you call.' },
                { line: 4, explanation: 'Testnet Payment Layer. Same role on Galileo, chainId 16602.' },
                { line: 7, explanation: 'compute-marketplace.0g.ai is the old Direct flow. Money deposited there sits in per-provider sub-accounts and is invisible from the Router view.' },
                { line: 9, explanation: 'The Advanced toggle in pc.0g.ai switches the UI to the sub-account pool. It is a view switch, not a transfer.' },
                { line: 13, explanation: 'Consolidating means an actual withdraw then deposit. There is no internal transfer between the two pools.' },
              ],
              explanation: 'Two pools, two contracts, one confusing dashboard default.',
            },
          },
        },
        {
          title: 'Choosing a path on purpose',
          content: 'Match the situation to the path. If you get this wrong you will either ship a secret key to a browser or spend a week writing wallet plumbing for a cron job that did not need it.',
          emoji: '🧭',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'backend', label: 'Backend agent on a server', emoji: '🤖' },
                { id: 'dapp', label: 'Browser dApp, user wallet', emoji: '🦊' },
                { id: 'prototype', label: 'Weekend prototype', emoji: '⚡' },
                { id: 'onchain', label: 'On-chain settlement receipts', emoji: '🔗' },
              ],
              targets: [
                { id: 't-router-1', label: 'Router: one key, one balance, failover included' },
                { id: 't-direct-1', label: 'Direct: the user wallet signs, no secret key shipped' },
                { id: 't-router-2', label: 'Router: change base_url and you are done' },
                { id: 't-direct-2', label: 'Direct: every call settles against a sub-account you control' },
              ],
              correctPairs: [
                { itemId: 'backend', targetId: 't-router-1' },
                { itemId: 'dapp', targetId: 't-direct-1' },
                { itemId: 'prototype', targetId: 't-router-2' },
                { itemId: 'onchain', targetId: 't-direct-2' },
              ],
              explanation: 'Nothing stops a project from using both. The balances just stay separate.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Keys, models, and the first call',
      slides: [
        {
          title: 'sk- calls models, mk- reads money',
          content: 'The Router issues two credential types and they are not interchangeable. An sk- API key runs inference and is billed against your deposit. An mk- management key administers the account: it lists and rotates keys and reads balance, usage, and history. Sending an sk- key to /v1/account/balance returns 403 insufficient_scope, which reads like a bug until you know the split.',
          emoji: '🔑',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'sk- API key', content: 'Created at pc.0g.ai under Dashboard then API Keys. Shown once on creation, stored only as a hash. Use it for POST /v1/chat/completions and the other inference endpoints. Revoking is instant: the next call with that key returns 401 api_key_revoked.' },
                { label: 'mk- management key', content: 'Created under Settings then Management Keys, with an explicit scope allowlist: account:read, keys:read, keys:create, keys:manage. Use it for dashboards and CI that provisions keys. It is never billed for inference.' },
                { label: 'Why they are split', content: 'A leaked sk- key can spend your balance but cannot mint more keys or read your usage history. A read-only mk- key can audit spend without being able to spend anything. keys:manage and keys:create are deliberately separate so an audit integration can revoke a compromised key without being able to issue a replacement.' },
                { label: 'Same header either way', content: 'Both go in Authorization: Bearer. No OAuth, no per-request wallet signature, no session token. That is the whole point of the Router.' },
              ],
            },
          },
        },
        {
          title: 'The catalog is public',
          content: 'GET /v1/models needs no authentication at all. It returns the OpenAI list shape plus two fields OpenAI does not have: live pricing in neuron per token, and provider_count, the number of healthy independent providers currently serving that model. Read this before you write a single billed request, because it tells you what you are about to pay and how much redundancy you have.',
          emoji: '📚',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `curl https://router-api.0g.ai/v1/models

{
  "object": "list",
  "data": [
    {
      "id": "zai-org/GLM-5-FP8",
      "object": "model",
      "owned_by": "0G Foundation",
      "name": "zai-org/GLM-5-FP8",
      "context_length": 131072,
      "pricing": {
        "prompt": "100000000000",
        "completion": "320000000000"
      },
      "provider_count": 3
    }
  ]
}`,
              highlights: [
                { line: 1, explanation: 'No Authorization header. The catalog is open, so you can price a workload before you ever create a key.' },
                { line: 11, explanation: 'context_length is per model, not per provider. 131072 tokens for GLM-5-FP8.' },
                { line: 13, explanation: 'pricing.prompt is neuron per input token, as a decimal string. 100000000000 neuron is 1e11, which is 1e-7 0G per token.' },
                { line: 14, explanation: 'pricing.completion is neuron per output token, here 3.2 times the input price. Output is almost always the expensive side.' },
                { line: 16, explanation: 'provider_count is your failover depth. A model served by 1 provider has no failover, whatever the Router does by default.' },
              ],
              explanation: 'Prices are strings because they are integers larger than JavaScript can safely hold as numbers.',
            },
          },
        },
        {
          title: 'Point the OpenAI SDK at 0G',
          content: 'The Router speaks the OpenAI API: same routes, same fields, same SSE streaming format. Any SDK or agent framework that targets OpenAI works unchanged. You change two things, the base URL and the key, and the 0G-specific extras arrive as optional extra fields that a normal OpenAI client simply ignores.',
          emoji: '🔌',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://router-api.0g.ai/v1',
  apiKey: process.env.ZG_ROUTER_API_KEY, // the sk- key
});

const response = await client.chat.completions.create({
  model: 'zai-org/GLM-5-FP8',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);

// The 0G extras are not in the OpenAI type definitions.
// Cast to read them. They are always present on Router responses.
const trace = (response as any).x_0g_trace;
console.log(trace.provider, trace.billing.total_cost);`,
              highlights: [
                { line: 4, explanation: 'The only structural change. Everything downstream of this line is stock OpenAI code.' },
                { line: 5, explanation: 'Never inline the key and never ship it to a browser. Router keys are server side credentials.' },
                { line: 9, explanation: 'Model ids are namespaced by publisher, so zai-org/GLM-5-FP8, not glm-5. Copy the id verbatim from /v1/models.' },
                { line: 17, explanation: 'x_0g_trace is a top level field on the response body. TypeScript does not know it exists, so you cast or declare your own interface.' },
                { line: 18, explanation: 'provider is the on-chain address of the machine that answered you. billing.total_cost is what this exact request cost, in neuron.' },
              ],
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Reading the receipt',
      slides: [
        {
          title: 'x_0g_trace: the field OpenAI does not have',
          content: 'Every Router response carries an x_0g_trace object. This is the part worth caring about. A centralized API tells you token counts and lets you work out the bill later from a monthly invoice. The Router hands you the request id, the on-chain address of the provider that served you, and the exact cost of this one call, inline, before you have even printed the answer.',
          emoji: '🧾',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'request_id', content: 'A UUID unique to this request, for example 0852f405-6c56-40c2-a800-e6fd70785065. Log it. Quote it in any bug report. It is also how you line a local log line up with a row in the usage history endpoint.' },
                { label: 'provider', content: 'The on-chain address of the provider that actually served you, for example 0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C. Two identical requests can come back with different addresses, because round-robin is the default.' },
                { label: 'billing', content: 'input_cost, output_cost and total_cost, all in neuron as decimal strings. total_cost equals input_tokens times prompt_price plus output_tokens times completion_price. The Router adds no markup, so what the provider charges is what you pay.' },
                { label: 'tee_verified', content: 'Present only when you sent verify_tee: true. It reports whether the Router checked the provider TEE signature. Lesson 6 pulls that claim apart and shows you how to check it yourself.' },
              ],
            },
          },
        },
        {
          title: 'Neuron, and why the numbers are strings',
          content: 'Costs are quoted in neuron, the smallest unit of the 0G token. 1e18 neuron is 1 0G, the same relationship wei has to ether. Those integers routinely exceed 2^53, which is where JavaScript numbers stop being exact, so the Router sends them as strings. Parse with BigInt, not parseFloat, or your cost dashboard will drift.',
          emoji: '🔬',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `"x_0g_trace": {
  "request_id": "0852f405-6c56-40c2-a800-e6fd70785065",
  "provider": "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C",
  "billing": {
    "input_cost":  "19000000000000",
    "output_cost": "1916800000000000",
    "total_cost":  "1935800000000000"
  }
}

// Check the arithmetic against /v1/models pricing:
//   input:  19000000000000     / 100000000000 =    190 prompt tokens
//   output: 1916800000000000   / 320000000000 =   5990 completion tokens
//   total:  1935800000000000 neuron = 0.0019358 0G

const NEURON_PER_OG = 10n ** 18n;             // BigInt literal
const total = BigInt('1935800000000000');
const whole = total / NEURON_PER_OG;          // 0n
const frac = total % NEURON_PER_OG;           // 1935800000000000n`,
              highlights: [
                { line: 5, explanation: 'input_cost covers the entire context you sent: system prompt plus prior turns plus the current message. Long chat histories are re-billed every turn.' },
                { line: 6, explanation: 'output_cost dominates here, 100 times the input cost, because completions are priced higher and this model was thinking out loud.' },
                { line: 13, explanation: '5990 completion tokens for one answer is the signature of a reasoning model with thinking left on.' },
                { line: 16, explanation: 'Use a BigInt literal for the divisor. 10n ** 18n is exact, 1e18 as a number is not safe for this arithmetic.' },
                { line: 19, explanation: 'Split into whole and fractional parts, then pad the fraction to 18 digits, to render a precise 0G amount without ever touching a float.' },
              ],
            },
          },
        },
        {
          title: 'GLM-5 thinks by default, and you pay for it',
          content: 'zai-org/GLM-5-FP8 is a reasoning model with thinking enabled by default. It emits a reasoning_content field alongside the normal content, and those reasoning tokens are billed as completion tokens. For a one line answer that can be the difference between 60 output tokens and 6000. Pass chat_template_kwargs with enable_thinking false to turn it off, then compare usage before and after.',
          emoji: '🧠',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'reasoning', label: 'reasoning_content', emoji: '💭' },
                { id: 'kwargs', label: 'chat_template_kwargs', emoji: '🎛️' },
                { id: 'usage', label: 'usage.completion_tokens', emoji: '📊' },
                { id: 'trace', label: 'x_0g_trace.billing', emoji: '🧾' },
              ],
              targets: [
                { id: 't-reasoning', label: 'The thinking trace, returned next to the final answer' },
                { id: 't-kwargs', label: 'Where you pass enable_thinking: false' },
                { id: 't-usage', label: 'Counts reasoning tokens as output tokens' },
                { id: 't-trace', label: 'Turns those token counts into a neuron amount' },
              ],
              correctPairs: [
                { itemId: 'reasoning', targetId: 't-reasoning' },
                { itemId: 'kwargs', targetId: 't-kwargs' },
                { itemId: 'usage', targetId: 't-usage' },
                { itemId: 'trace', targetId: 't-trace' },
              ],
              explanation: 'Thinking is a quality knob with a direct, visible price. The Router shows you the price on every call.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'You deposited on compute-marketplace.0g.ai. pc.0g.ai shows a zero balance. What happened?',
      options: [
        'The deposit failed and needs to be resubmitted',
        'Your funds are in the Direct sub-account pool, and pc.0g.ai opens on the Router pool by default',
        'Router deposits take 24 hours to appear',
        'The Payment Layer contract only accepts deposits from the pc.0g.ai UI',
      ],
      correctAnswer: 1,
      explanation: 'Router balance and Direct sub-account balances live in different contracts. compute-marketplace.0g.ai deposits into per-provider sub-accounts, and pc.0g.ai defaults to the Router view. Click the Advanced toggle in the top right to see the sub-account pool. Nothing was lost, and no support ticket is needed.',
      weaknessTopic: '0g-router',
      practiceHint: 'Remember the rule: a Router deposit does not fund sub-accounts, and sub-accounts do not back Router calls.',
    },
    {
      question: 'What does 1e18 neuron equal?',
      options: ['1 gwei', '1 0G token', '1 USD', '1 million tokens of inference'],
      correctAnswer: 1,
      explanation: 'Neuron is the smallest unit of the 0G token: 1e18 neuron is 1 0G, the same relationship wei has to ether. A total_cost of 1935800000000000 neuron is 0.0019358 0G.',
      weaknessTopic: '0g-economics',
    },
    {
      question: 'Which credential do you use to call GET /v1/account/balance?',
      options: [
        'The sk- API key, same as inference',
        'An mk- management key with the account:read scope',
        'Your wallet private key',
        'No credential, the endpoint is public like /v1/models',
      ],
      correctAnswer: 1,
      explanation: 'sk- keys run inference only. Account endpoints require an mk- management key carrying account:read, and an sk- key there returns 403 insufficient_scope. Only /v1/models is genuinely public.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'Two identical Router requests come back with different values in x_0g_trace.provider. Why?',
      options: [
        'The first request failed silently and was refunded',
        'Default routing is round-robin across healthy providers, so the serving address can change per request',
        'The provider address is randomly generated per request and is not meaningful',
        'The model was swapped for a cheaper one',
      ],
      correctAnswer: 1,
      explanation: 'With no routing headers the Router distributes requests round-robin across the healthy provider set for that model, and retries on the next one when a call fails. The provider field is a real on-chain address, and it genuinely varies. Lesson 4 shows how to pin it.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'Your GLM-5 call answered in one sentence but billed nearly 6000 completion tokens. What is the most likely cause?',
      options: [
        'The Router double-billed and you should open a ticket',
        'Thinking is on by default, so reasoning_content tokens were billed as output tokens',
        'The context_length of 131072 is always charged in full',
        'Failover retried the request on three providers and charged for each',
      ],
      correctAnswer: 1,
      explanation: 'GLM-5 is a reasoning model with thinking enabled by default. The reasoning trace comes back in reasoning_content and counts as completion tokens. Pass chat_template_kwargs with enable_thinking set to false and the count collapses.',
      weaknessTopic: '0g-compute',
    },
    {
      question: 'Why does the Router send billing values as JSON strings instead of numbers?',
      options: [
        'To make them human readable in logs',
        'Because neuron amounts routinely exceed 2^53, where JavaScript numbers stop being exact',
        'Because the values can be negative',
        'Because JSON does not support integers',
      ],
      correctAnswer: 1,
      explanation: 'A neuron amount like 1935800000000000 already sits near the safe integer boundary, and pricing math multiplies it further. Strings preserve exactness, and you parse them with BigInt rather than parseFloat.',
      weaknessTopic: '0g-economics',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Router: first inference
// Run with: ZG_ROUTER_API_KEY=sk-... npx tsx router-first-call.ts

import OpenAI from 'openai';

const ROUTER_BASE_URL = 'https://router-api.0g.ai/v1';
const NEURON_PER_OG = 10n ** 18n;

export interface RouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  provider_count: number;
}

export interface X0gTrace {
  request_id: string;
  provider: string;
  billing: { input_cost: string; output_cost: string; total_cost: string };
  tee_verified?: boolean;
}

// The Router response is an OpenAI ChatCompletion plus x_0g_trace.
// The OpenAI types do not model the extra field, so declare it yourself.
export interface RouterChatResponse {
  choices: { message: { content: string | null; reasoning_content?: string } }[];
  usage?: { prompt_tokens: number; completion_tokens: number };
  x_0g_trace: X0gTrace;
}

// TODO 1: Fetch the public model catalog.
// GET {ROUTER_BASE_URL}/models needs NO Authorization header.
// The body is { object: 'list', data: RouterModel[] }. Return data.
export async function listModels(): Promise<RouterModel[]> {
  // Your code here
}

// TODO 2: Build an OpenAI client pointed at the Router.
// Only two fields change: baseURL and apiKey.
export function createRouterClient(apiKey: string): OpenAI {
  // Your code here
}

// TODO 3: Convert a neuron string to an exact 0G decimal string.
// Use BigInt. Do NOT use Number or parseFloat, the values overflow.
// '1935800000000000' -> '0.0019358'
export function neuronToOG(neuron: string): string {
  // Your code here
}

// TODO 4: Estimate cost in neuron from token counts and catalog pricing.
// total = promptTokens * pricing.prompt + completionTokens * pricing.completion
// All arithmetic in BigInt. Return the result as a decimal string.
export function estimateCostNeuron(
  promptTokens: number,
  completionTokens: number,
  pricing: { prompt: string; completion: string },
): string {
  // Your code here
}

// TODO 5: Send one chat completion and return the answer plus the trace.
// When thinking is false, pass chat_template_kwargs: { enable_thinking: false }.
// The OpenAI types do not know about chat_template_kwargs or x_0g_trace,
// so cast where you must and say why in a comment.
export async function chat(
  client: OpenAI,
  prompt: string,
  opts: { model?: string; thinking?: boolean } = {},
): Promise<{ content: string; completionTokens: number; trace: X0gTrace }> {
  // Your code here
}

// Wire it together. This is the artefact you submit as proof.
async function main(): Promise<void> {
  const models = await listModels();
  const glm = models.find((m) => m.id === 'zai-org/GLM-5-FP8');
  console.log('providers serving GLM-5:', glm?.provider_count);

  const client = createRouterClient(process.env.ZG_ROUTER_API_KEY ?? '');
  const prompt = 'In one sentence: what is a Trusted Execution Environment?';

  const withThinking = await chat(client, prompt, { thinking: true });
  const withoutThinking = await chat(client, prompt, { thinking: false });

  console.log(JSON.stringify({
    with_thinking: withThinking.trace,
    without_thinking: withoutThinking.trace,
    token_delta: withThinking.completionTokens - withoutThinking.completionTokens,
    cost_og: neuronToOG(withThinking.trace.billing.total_cost),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});`,

  solution: `// 0G Router: first inference
// Run with: ZG_ROUTER_API_KEY=sk-... npx tsx router-first-call.ts

import OpenAI from 'openai';

const ROUTER_BASE_URL = 'https://router-api.0g.ai/v1';
const NEURON_PER_OG = 10n ** 18n;

export interface RouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  provider_count: number;
}

export interface X0gTrace {
  request_id: string;
  provider: string;
  billing: { input_cost: string; output_cost: string; total_cost: string };
  tee_verified?: boolean;
}

export interface RouterChatResponse {
  choices: { message: { content: string | null; reasoning_content?: string } }[];
  usage?: { prompt_tokens: number; completion_tokens: number };
  x_0g_trace: X0gTrace;
}

// TODO 1: public model catalog, no auth
export async function listModels(): Promise<RouterModel[]> {
  const res = await fetch(\`\${ROUTER_BASE_URL}/models\`);
  if (!res.ok) {
    throw new Error(\`GET /v1/models failed: \${res.status} \${await res.text()}\`);
  }
  const body = (await res.json()) as { object: string; data: RouterModel[] };
  return body.data;
}

// TODO 2: OpenAI client pointed at the Router
export function createRouterClient(apiKey: string): OpenAI {
  if (!apiKey.startsWith('sk-')) {
    // mk- management keys cannot run inference, they return 403 insufficient_scope
    throw new Error('Router inference needs an sk- API key from pc.0g.ai');
  }
  return new OpenAI({ baseURL: ROUTER_BASE_URL, apiKey });
}

// TODO 3: exact neuron to 0G, BigInt only
export function neuronToOG(neuron: string): string {
  const value = BigInt(neuron);
  const whole = value / NEURON_PER_OG;
  const frac = (value % NEURON_PER_OG).toString().padStart(18, '0').replace(/0+$/, '');
  return frac.length > 0 ? \`\${whole}.\${frac}\` : whole.toString();
}

// TODO 4: cost estimate from catalog pricing
export function estimateCostNeuron(
  promptTokens: number,
  completionTokens: number,
  pricing: { prompt: string; completion: string },
): string {
  const input = BigInt(promptTokens) * BigInt(pricing.prompt);
  const output = BigInt(completionTokens) * BigInt(pricing.completion);
  return (input + output).toString();
}

// TODO 5: one completion, answer plus trace
export async function chat(
  client: OpenAI,
  prompt: string,
  opts: { model?: string; thinking?: boolean } = {},
): Promise<{ content: string; completionTokens: number; trace: X0gTrace }> {
  const body: Record<string, unknown> = {
    model: opts.model ?? 'zai-org/GLM-5-FP8',
    messages: [{ role: 'user', content: prompt }],
  };

  // GLM-5 has thinking ON by default. Turning it off is a template kwarg,
  // not an OpenAI field, so the SDK types do not know about it.
  if (opts.thinking === false) {
    body.chat_template_kwargs = { enable_thinking: false };
  }

  // Two casts, both honest: the request carries a field OpenAI does not
  // define, and the response carries a field OpenAI does not return.
  const response = (await client.chat.completions.create(
    body as unknown as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
  )) as unknown as RouterChatResponse;

  const raw = response;

  return {
    content: raw.choices[0].message.content ?? '',
    completionTokens: raw.usage?.completion_tokens ?? 0,
    trace: raw.x_0g_trace,
  };
}

async function main(): Promise<void> {
  const models = await listModels();
  const glm = models.find((m) => m.id === 'zai-org/GLM-5-FP8');
  console.log('providers serving GLM-5:', glm?.provider_count);

  const client = createRouterClient(process.env.ZG_ROUTER_API_KEY ?? '');
  const prompt = 'In one sentence: what is a Trusted Execution Environment?';

  const withThinking = await chat(client, prompt, { thinking: true });
  const withoutThinking = await chat(client, prompt, { thinking: false });

  console.log(JSON.stringify({
    with_thinking: withThinking.trace,
    without_thinking: withoutThinking.trace,
    token_delta: withThinking.completionTokens - withoutThinking.completionTokens,
    cost_og: neuronToOG(withThinking.trace.billing.total_cost),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});`,

  hints: [
    'listModels sends no Authorization header at all. If you add one, it still works, but the point of the exercise is that the catalog is public: you can price a workload before you own a key.',
    'For neuronToOG, divide and modulo with BigInt, pad the remainder to 18 digits with padStart, then strip trailing zeros. Never route the value through Number, because 1e18 sized integers are past the safe range and you will silently lose the last digits.',
    'createRouterClient changes exactly two OpenAI options: baseURL to https://router-api.0g.ai/v1 and apiKey to your sk- secret. Everything else in the OpenAI SDK stays untouched, which is the whole selling point of the Router.',
    'chat_template_kwargs is a 0G and vLLM level field, not an OpenAI one, so TypeScript rejects it on ChatCompletionCreateParams. Build the body as a plain object, then cast at the call site rather than casting the whole client.',
    'x_0g_trace sits at the top level of the response, next to choices and usage, not inside a choice. If your cast reads response.choices[0].x_0g_trace you will get undefined.',
    'To compare thinking on and off honestly, send the exact same prompt twice. The token delta is the number worth recording, not the absolute counts, because those move with model version.',
  ],

  proof: {
    label: 'Router response JSON with request_id, provider address and billing',
    hint: 'Save the full JSON from both calls: the one with thinking on and the one with chat_template_kwargs enable_thinking false. It must contain x_0g_trace.request_id, x_0g_trace.provider, the billing block, and the completion token delta between the two runs. Convert total_cost from neuron to 0G and include that number.',
    verifyUrl: 'https://pc.0g.ai',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
  },
};
