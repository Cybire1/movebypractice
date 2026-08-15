import { LessonContent } from '../types/lesson';

export const ogLesson4: LessonContent = {
  id: '0g-4',
  title: 'Routing headers and price ceilings',
  description: 'Take control of provider selection on the 0G Router: sort by latency or price, pin an address, cap what you are willing to pay, and learn why the order those rules run in decides whether a fallback can cost you money.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 4,
  language: 'typescript',
  prerequisiteLessons: ['0g-3'],

  narrative: {
    welcomeMessage: "In lesson 3 the Router chose for you. That default is round-robin with automatic failover, and for most workloads it is the right answer. This lesson is about the cases where it is not: when you want the cheapest provider, the fastest one, a specific one, or a hard promise that nothing above a price will ever serve you. All four are HTTP headers, and the interesting part is the order they are applied in.",
    quizTransition: "You have the four headers, the three price ceilings, and the strict validation rules. The quiz focuses on failure codes, because the difference between a 400 and a 503 is the difference between fixing your request and retrying forever.",
    practiceTransition: "Now write the header builder. It has to validate exactly the way the Router validates, otherwise your service will discover the rules in production instead of in a unit test.",
    celebrationMessage: "You can now steer a request across a decentralized provider set and prove, per call, which machine served it and what it cost. That is a control surface no centralized inference API offers.",
    nextLessonTease: "Next: trust modes. X-0G-Provider-Trust-Mode looks like a fifth routing header, but it is a security boundary, and the word TEE promises less than you probably assume.",
  },

  teachingSections: [
    {
      sectionTitle: 'The default, and the two ways to override it',
      slides: [
        {
          title: 'What happens when you send no headers',
          content: 'With no routing headers the Router picks a healthy provider for the requested model, retries on the next healthy provider if the first returns an error, and only gives up with a 503 when every provider failed. That is failover by default, and it is why provider_count from the catalog is worth reading: a model with one provider has nothing to fail over to, no matter what the policy says.',
          emoji: '🔁',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Round-robin', content: 'The Router health-checks providers continuously and spreads requests across the healthy set. This is why two identical calls can report two different addresses in x_0g_trace.provider.' },
                { label: 'Automatic retry', content: 'If the chosen provider errors, the Router transparently retries on the next healthy one. You see one response and one billing block, not two.' },
                { label: '502 vs 503', content: '502 provider_error means failover was exhausted: the Router tried the healthy providers and they all errored. 503 no_available_provider means there was nothing healthy to try in the first place. Retrying a 502 can help if a provider just recovered. A 503 is unlikely to clear in seconds.' },
                { label: 'When to override', content: 'Override when you have a requirement the default cannot express: a hard budget, a latency target, reproducibility against one provider, or a trust tier. Otherwise leave it alone. The default is the recommended path.' },
              ],
            },
          },
        },
        {
          title: 'Two surfaces, one winner',
          content: 'The Router accepts routing preferences from two places. X-0G-Provider-* request headers are canonical and work on every inference endpoint: JSON, multipart, and async. The older JSON body provider object is deprecated and works only on JSON endpoints. The surfaces are merged field by field, and when both set the same field the header wins. Multipart endpoints like audio transcriptions have no body surface at all, so headers are the only way to steer them.',
          emoji: '📮',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Canonical: headers. Works everywhere.
curl https://router-api.0g.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "X-0G-Provider-Sort: price" \\
  -d '{"model":"zai-org/GLM-5-FP8","messages":[{"role":"user","content":"Hello"}]}'

// Deprecated: JSON body. JSON endpoints only.
{
  "model": "zai-org/GLM-5-FP8",
  "messages": [{"role": "user", "content": "Hello"}],
  "provider": { "sort": "latency" }
}

// Both set? The header wins. This request sorts by price, not latency.
// Multipart has no body surface at all:
curl https://router-api.0g.ai/v1/audio/transcriptions \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -H "X-0G-Provider-Sort: latency" \\
  -F "file=@recording.mp3" \\
  -F "model=openai/whisper-large-v3"`,
              highlights: [
                { line: 5, explanation: 'Header names are case insensitive per RFC 7230, so x-0g-provider-sort is identical to X-0G-Provider-Sort. Note the zero in 0G, not the letter O.' },
                { line: 12, explanation: 'The body provider object still works for back-compat but is being phased out. New code should not use it.' },
                { line: 15, explanation: 'Merging is field by field, and the header wins on conflict. A stale body object cannot quietly override a header your infrastructure sets.' },
                { line: 17, explanation: 'Multipart endpoints send files, not JSON, so there is nowhere to put a provider object. Headers are the only routing surface here, which is exactly why headers are the canonical one.' },
              ],
              explanation: 'One surface that works on every endpoint is worth more than two surfaces that each work on some.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The four headers',
      slides: [
        {
          title: 'Sort, Address, Allow-Fallbacks, Trust-Mode',
          content: 'There are four steering headers plus three price ceilings. Learn what each one silently implies, because two of them change behaviour you did not explicitly ask to change.',
          emoji: '🎚️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'sort', label: 'X-0G-Provider-Sort', emoji: '↕️' },
                { id: 'address', label: 'X-0G-Provider-Address', emoji: '📌' },
                { id: 'fallbacks', label: 'X-0G-Provider-Allow-Fallbacks', emoji: '🪂' },
                { id: 'trust', label: 'X-0G-Provider-Trust-Mode', emoji: '🛡️' },
              ],
              targets: [
                { id: 't-sort', label: 'Exactly latency or price. Ignored when an address is pinned' },
                { id: 't-address', label: 'Pins one on-chain address and turns failover off by implication' },
                { id: 't-fallbacks', label: 'Exactly true or false. The only way to get retry back after pinning' },
                { id: 't-trust', label: 'standard, verified or private. A floor on the verification tier' },
              ],
              correctPairs: [
                { itemId: 'sort', targetId: 't-sort' },
                { itemId: 'address', targetId: 't-address' },
                { itemId: 'fallbacks', targetId: 't-fallbacks' },
                { itemId: 'trust', targetId: 't-trust' },
              ],
              explanation: 'Allow-Fallbacks defaults to true normally and to false the moment you pin an address.',
            },
          },
        },
        {
          title: 'Pinning silently disables failover',
          content: 'This is the trap in this lesson. X-0G-Provider-Address does not just express a preference, it removes the fallback pool. The default for Allow-Fallbacks is true when you are not pinning and false when you are. So a service that pins a provider for reproducibility has also, without writing a line about it, opted out of the resilience it had yesterday. If you want both, you have to ask for both.',
          emoji: '📌',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Pinned. Failover is now OFF by implication.
// If this provider is down, the request fails. It does not reroute.
const pinned = {
  'X-0G-Provider-Address': '0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C',
};

// Pinned AND resilient. You must say so explicitly.
const pinnedWithRetry = {
  'X-0G-Provider-Address': '0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C',
  'X-0G-Provider-Allow-Fallbacks': 'true',
};

// Sort is ignored while an address is pinned. This is not an error,
// it is simply inert: the pin already answered the question.
const contradictory = {
  'X-0G-Provider-Address': '0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C',
  'X-0G-Provider-Sort': 'price',
};

// Strict validation. These are 400 invalid_provider_header:
//   'X-0G-Provider-Sort': 'cheapest'
//   'X-0G-Provider-Sort': 'lowest-price'
//   'X-0G-Provider-Allow-Fallbacks': '1'
//   'X-0G-Provider-Allow-Fallbacks': 'yes'
// But a blank or whitespace-only header is treated as UNSET, never an error.`,
              highlights: [
                { line: 3, explanation: 'One header, two effects. The second effect is the one that pages you at 3am.' },
                { line: 10, explanation: 'Allow-Fallbacks true restores cross-provider retry while keeping your pin as the first choice.' },
                { line: 17, explanation: 'Sort is ignored, not rejected, when an address is set. Inert is different from invalid, and the Router treats them differently.' },
                { line: 21, explanation: 'Sort accepts exactly latency or price. Anything else non-empty is a 400. There is no fuzzy matching and no synonym list.' },
                { line: 23, explanation: 'Allow-Fallbacks accepts exactly true or false, case insensitive. The integers 1 and 0 that most config systems produce are rejected. Serialize booleans deliberately.' },
                { line: 25, explanation: 'This rule saves you: a templating system that emits an empty header for an unset variable does not break your requests.' },
              ],
            },
          },
        },
        {
          title: 'Discovering an address to pin',
          content: 'You do not invent provider addresses. GET /v1/providers?model=zai-org/GLM-5-FP8 returns every TEE-acknowledged provider serving that model, with its on-chain address, observed latency, and attestation info. That endpoint is also how you check whether a pinned provider is still in the healthy set before you blame the Router for a failed request.',
          emoji: '🔎',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'GET /v1/providers', content: 'Accepts model to filter by model id, and service_type to filter by category such as chatbot, text-to-image, or speech-to-text. Returns the addresses you can legitimately pin.' },
                { label: 'The address in x_0g_trace', content: 'The other legitimate source. Run one unpinned request, read x_0g_trace.provider, and pin that address on subsequent calls when you want the same machine.' },
                { label: 'Latency is observed, not promised', content: 'Sort latency uses recently observed latency for that model. It is a moving measurement, so the winner changes. Pinning freezes your choice, which is the point and also the risk.' },
                { label: 'provider_count is your safety margin', content: 'From GET /v1/models. If a model has provider_count 1, then pinning changes nothing about resilience because there was never a second provider to fail over to.' },
              ],
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Price ceilings and the ordering rule',
      slides: [
        {
          title: 'A ceiling is a filter, not a preference',
          content: 'The three X-0G-Provider-Max-Price-Usd headers, Prompt, Completion and Image, are the sharpest design decision in the routing layer. Providers above your ceiling are dropped from the candidate pool entirely, and that drop happens before sorting and before failover. The documented consequence is worth quoting: a fallback during an outage can never silently route you to a provider you have priced out. Sort by price is best effort. A ceiling is a promise.',
          emoji: '🚧',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Order of operations inside the Router:
//   1. Build the candidate pool for the model
//   2. Drop every provider above your Max-Price ceilings   <-- filter
//   3. Apply Trust-Mode floor
//   4. Sort by latency or price, or pick round-robin
//   5. Send, and fail over inside whatever survived step 2

curl https://router-api.0g.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "X-0G-Provider-Max-Price-Usd-Prompt: 1.0" \\
  -H "X-0G-Provider-Max-Price-Usd-Completion: 5.0" \\
  -H "X-0G-Provider-Max-Price-Usd-Image: 0.05" \\
  -d '{"model":"zai-org/GLM-5-FP8","messages":[{"role":"user","content":"Hello"}]}'

// Units: Prompt and Completion are USD per 1,000,000 tokens.
//        Image is USD per generated image.
// The Image header above is silently INERT on a chat call, because
// ceilings are service-type aware. A cross-endpoint SDK can safely
// send all three on every request without filtering itself to zero.`,
              highlights: [
                { line: 3, explanation: 'The filter runs at step 2, before anything else gets a vote. That single ordering choice is what turns a preference into a guarantee.' },
                { line: 6, explanation: 'Failover only ever selects from providers that already survived the ceiling. There is no emergency path around your budget.' },
                { line: 11, explanation: 'Each value must be a finite, non-negative decimal. NaN, Inf, negatives and non-numeric strings return 400 invalid_max_price_usd.' },
                { line: 16, explanation: 'Getting the unit wrong is expensive in both directions. 1.0 means one dollar per million tokens, not one dollar per request.' },
                { line: 19, explanation: 'Service-type awareness is what makes always-send-all-three safe. An Image ceiling on a chat call is ignored rather than filtering out every chat provider.' },
              ],
            },
          },
        },
        {
          title: 'Speech-to-text has no ceiling at all',
          content: 'Transcription is billed per second of audio, and the current USD pricing schema only has prompt, completion, and image dimensions. Reusing the Prompt header for audio would mean the same value 1.0 reads as one dollar per million tokens on chat and one dollar per second on audio. Rather than ship that footgun, /v1/audio/transcriptions enforces no ceiling for now. Budget for STT in your own code.',
          emoji: '🎙️',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Chat endpoints', content: '/v1/chat/completions and /v1/messages enforce the Prompt and Completion ceilings, in USD per 1M tokens.' },
                { label: 'Image endpoints', content: '/v1/images/generations, /v1/images/edits and the async variants enforce the Image ceiling, in USD per generated image.' },
                { label: 'Speech to text', content: '/v1/audio/transcriptions enforces nothing yet. Any Max-Price header you send there is inert. If you need a cap, estimate from audio duration before you upload.' },
                { label: 'Why not just overload Prompt', content: 'Because the same number would mean two wildly different things depending on the endpoint, and a shared config value would quietly become a thousand-fold pricing error. Leaving it unenforced is the honest choice.' },
              ],
            },
          },
        },
        {
          title: 'Four failure codes worth memorising',
          content: 'Routing produces very specific errors, and the split between 400 and 503 tells you whether to retry. A 400 means the pool was empty for a structural reason: your rules cannot be satisfied, so retrying the identical request loops forever. A 503 means the network had nothing healthy right now, which is a condition that can change on its own.',
          emoji: '🚨',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'invalid-header', label: '400 invalid_provider_header', emoji: '✍️' },
                { id: 'no-within-price', label: '400 no_provider_within_max_price', emoji: '💰' },
                { id: 'pinned-exceeds', label: '400 pinned_provider_exceeds_max_price', emoji: '📌' },
                { id: 'no-available', label: '503 no_available_provider', emoji: '📴' },
              ],
              targets: [
                { id: 't-invalid', label: 'You sent Sort: cheapest, or Allow-Fallbacks: 1' },
                { id: 't-price', label: 'Your ceiling filtered every candidate out of the pool' },
                { id: 't-pinned', label: 'The address you pinned costs more than your own ceiling' },
                { id: 't-none', label: 'No healthy provider is serving this model right now' },
              ],
              correctPairs: [
                { itemId: 'invalid-header', targetId: 't-invalid' },
                { itemId: 'no-within-price', targetId: 't-price' },
                { itemId: 'pinned-exceeds', targetId: 't-pinned' },
                { itemId: 'no-available', targetId: 't-none' },
              ],
              explanation: 'Three 400s you fix by changing the request, one 503 you fix by waiting or changing model. Never blanket-retry a 400.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'You set X-0G-Provider-Address and nothing else. The pinned provider goes down mid-incident. What happens?',
      options: [
        'The Router fails over to the next healthy provider as usual',
        'The request fails, because pinning implies Allow-Fallbacks false',
        'The Router queues the request until the provider returns',
        'The Router returns a 400 telling you to add a fallback header',
      ],
      correctAnswer: 1,
      explanation: 'Allow-Fallbacks defaults to true normally but to false the moment an address is pinned. Pinning is therefore two decisions in one header. Add X-0G-Provider-Allow-Fallbacks: true if you want the pin as a preference rather than a hard requirement.',
      weaknessTopic: '0g-router',
      practiceHint: 'Say the rule out loud: pinning an address opts you out of failover unless you opt back in.',
    },
    {
      question: 'You send X-0G-Provider-Sort: cheapest. What comes back?',
      options: [
        'It works, cheapest is an alias for price',
        '400 invalid_provider_header, because Sort accepts exactly latency or price',
        'The header is ignored and round-robin is used',
        '503 no_available_provider',
      ],
      correctAnswer: 1,
      explanation: 'Validation is strict and there are no synonyms. Sort must be exactly latency or price, and Allow-Fallbacks exactly true or false. Values like cheapest, 1, 0 and yes are rejected with 400 invalid_provider_header. A blank or whitespace-only header is the one exception: it is treated as unset and is never an error.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'A price ceiling filters out every provider. Why is that a 400 and not a 503, and why does retrying spin forever?',
      options: [
        'It is a 503, the docs group it with other capacity errors',
        'It is 400 no_provider_within_max_price: the pool is empty structurally because of your own rule, so the identical request will fail identically forever',
        'It is 400 but retrying works once prices move at the next block',
        'It is 429, and you should honour Retry-After',
      ],
      correctAnswer: 1,
      explanation: 'The distinction is deliberate. 503 means the network is transiently short of healthy providers. 400 no_provider_within_max_price means your ceiling emptied the pool, which is a property of your request, not of the network. Nothing changes until you raise the ceiling or change model, so a retry loop just burns rate limit.',
      weaknessTopic: '0g-economics',
      practiceHint: 'Classify by cause: 4xx means change your request, 5xx means the network may recover on its own.',
    },
    {
      question: 'Why does pinning a provider that costs more than your ceiling return pinned_provider_exceeds_max_price rather than no_provider_within_max_price?',
      options: [
        'They are aliases with no behavioural difference',
        'Because the two requests are wrong in different ways: one asked for something too cheap to exist, the other gave two instructions that contradict each other',
        'Because the pinned case is retryable and the other is not',
        'Because the pinned case returns 402 rather than 400',
      ],
      correctAnswer: 1,
      explanation: 'Both are 400s, but the fix differs. no_provider_within_max_price means no provider in the whole pool is that cheap, so raise the ceiling or pick another model. pinned_provider_exceeds_max_price means you named one provider and then priced that exact provider out, so drop the pin or raise the ceiling. Notably the Router does not silently ignore your pin to satisfy the budget, nor the budget to satisfy the pin.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'A cross-endpoint SDK sends all three Max-Price headers on every request, including chat calls. What happens to the Image ceiling on a chat call?',
      options: [
        'It filters out every chat provider, since none have image pricing',
        'It is silently inert, because ceilings are service-type aware',
        'It returns 400 invalid_max_price_usd',
        'It is applied to completion pricing instead',
      ],
      correctAnswer: 1,
      explanation: 'Ceilings are enforced per service type: Prompt and Completion on chat, Image on image endpoints. An irrelevant dimension is ignored rather than treated as an unsatisfiable filter, precisely so a shared client can send all three without accidentally emptying its own candidate pool.',
      weaknessTopic: '0g-economics',
    },
    {
      question: 'Why does /v1/audio/transcriptions enforce no price ceiling at all?',
      options: [
        'Speech to text is free on the Router',
        'STT is billed per second of audio, and reusing the token-based Prompt header would make the same value mean two very different things',
        'Audio requests never go through provider selection',
        'The ceiling exists but only applies to files above 25MB',
      ],
      correctAnswer: 1,
      explanation: 'The USD pricing schema currently has prompt, completion and image dimensions only. Audio bills per second, so a value of 1.0 would mean one dollar per million tokens on chat and one dollar per second on audio. Rather than ship that ambiguity, STT enforces no ceiling for now, and you budget for it in your own code.',
      weaknessTopic: '0g-compute',
    },
    {
      question: 'Your infrastructure emits an empty string for X-0G-Provider-Sort when the config value is unset. What does the Router do?',
      options: [
        'Rejects the request with 400 invalid_provider_header',
        'Treats the header as unset and applies the default routing behaviour',
        'Sorts by latency, the documented fallback for an empty sort',
        'Returns 503 because no sort strategy could be resolved',
      ],
      correctAnswer: 1,
      explanation: 'A header that is absent, or blank after trimming whitespace, is treated as unset and falls through to the default. Only a present-but-malformed value is rejected. This is a deliberate kindness towards templating and config systems, which routinely emit empty strings for unset variables.',
      weaknessTopic: '0g-router',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Router: provider routing headers
// Run with: ZG_ROUTER_API_KEY=sk-... npx tsx routing-headers.ts

const ROUTER_BASE_URL = 'https://router-api.0g.ai/v1';

export type ProviderSort = 'latency' | 'price';
export type TrustMode = 'standard' | 'verified' | 'private';

export interface RoutingOptions {
  sort?: ProviderSort;
  providerAddress?: string;
  allowFallbacks?: boolean;
  trustMode?: TrustMode;
  maxPriceUsdPrompt?: number;      // USD per 1M prompt tokens
  maxPriceUsdCompletion?: number;  // USD per 1M completion tokens
  maxPriceUsdImage?: number;       // USD per generated image
}

export interface RouterError {
  message: string;
  type: string;
  code: string;
}

// TODO 1: Build the X-0G-Provider-* headers from RoutingOptions.
// Rules the Router itself enforces, so enforce them here too:
//   - sort must be exactly 'latency' or 'price'
//   - allowFallbacks serializes to the strings 'true' or 'false', never '1'
//   - trustMode must be exactly standard | verified | private
//   - each max price must be a finite, non-negative number
//   - an option that is undefined must not appear as a header at all
// Throw a descriptive Error on invalid input rather than sending a bad request.
export function buildRoutingHeaders(opts: RoutingOptions): Record<string, string> {
  // Your code here
}

// TODO 2: Will this request fail over to another provider?
// Allow-Fallbacks defaults to true, EXCEPT when providerAddress is set,
// where it defaults to false. An explicit allowFallbacks always wins.
export function willFailover(opts: RoutingOptions): boolean {
  // Your code here
}

// TODO 3: Classify a Router error so a caller knows what to do.
// Return 'retry-after-delay' for 429.
// Return 'retry-maybe' for 502, where failover was exhausted but a
//   provider may have just recovered.
// Return 'wait-or-change-model' for 503.
// Return 'fix-request' for every 4xx, including the routing 400s
//   (invalid_provider_header, invalid_max_price_usd,
//    no_provider_within_max_price, pinned_provider_exceeds_max_price).
export function classifyRouterError(
  status: number,
  code: string,
): 'retry-after-delay' | 'retry-maybe' | 'wait-or-change-model' | 'fix-request' {
  // Your code here
}

// TODO 4: Send one chat completion with the routing headers applied.
// On a non-2xx response, parse { error: RouterError } and throw an Error
// whose message includes the status, the code, and the classification.
// On success return the provider address and total cost from x_0g_trace.
export async function sendChat(
  apiKey: string,
  prompt: string,
  opts: RoutingOptions = {},
): Promise<{ requestId: string; provider: string; totalCostNeuron: string }> {
  // Your code here
}

// The four calls that produce your proof artefact.
async function main(): Promise<void> {
  const key = process.env.ZG_ROUTER_API_KEY ?? '';
  const prompt = 'Reply with exactly the word: routed.';

  const cheapest = await sendChat(key, prompt, { sort: 'price' });
  const fastest = await sendChat(key, prompt, { sort: 'latency' });
  const pinned = await sendChat(key, prompt, { providerAddress: cheapest.provider });

  console.log(JSON.stringify({ cheapest, fastest, pinned }, null, 2));

  // Ceiling so low that nothing qualifies: expect
  // 400 no_provider_within_max_price, NOT a 503.
  try {
    await sendChat(key, prompt, { maxPriceUsdPrompt: 0.000001 });
  } catch (err) {
    console.log('ceiling error:', (err as Error).message);
  }

  // Invalid enum: expect 400 invalid_provider_header, thrown locally
  // by buildRoutingHeaders before a byte leaves the process.
  try {
    await sendChat(key, prompt, { sort: 'cheapest' as unknown as ProviderSort });
  } catch (err) {
    console.log('validation error:', (err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});`,

  solution: `// 0G Router: provider routing headers
// Run with: ZG_ROUTER_API_KEY=sk-... npx tsx routing-headers.ts

const ROUTER_BASE_URL = 'https://router-api.0g.ai/v1';

export type ProviderSort = 'latency' | 'price';
export type TrustMode = 'standard' | 'verified' | 'private';

export interface RoutingOptions {
  sort?: ProviderSort;
  providerAddress?: string;
  allowFallbacks?: boolean;
  trustMode?: TrustMode;
  maxPriceUsdPrompt?: number;
  maxPriceUsdCompletion?: number;
  maxPriceUsdImage?: number;
}

export interface RouterError {
  message: string;
  type: string;
  code: string;
}

const VALID_SORTS: ProviderSort[] = ['latency', 'price'];
const VALID_TRUST_MODES: TrustMode[] = ['standard', 'verified', 'private'];

// TODO 1: build the headers, validating the way the Router validates
export function buildRoutingHeaders(opts: RoutingOptions): Record<string, string> {
  const headers: Record<string, string> = {};

  if (opts.sort !== undefined) {
    if (!VALID_SORTS.includes(opts.sort)) {
      throw new Error(
        \`invalid_provider_header: Sort must be exactly latency or price, got "\${opts.sort}"\`,
      );
    }
    headers['X-0G-Provider-Sort'] = opts.sort;
  }

  if (opts.providerAddress !== undefined) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(opts.providerAddress)) {
      throw new Error(\`invalid_provider_header: Address must be a 0x address\`);
    }
    headers['X-0G-Provider-Address'] = opts.providerAddress;
  }

  if (opts.allowFallbacks !== undefined) {
    // Exactly the strings true or false. A serialized 1 or 0 is a 400.
    headers['X-0G-Provider-Allow-Fallbacks'] = opts.allowFallbacks ? 'true' : 'false';
  }

  if (opts.trustMode !== undefined) {
    if (!VALID_TRUST_MODES.includes(opts.trustMode)) {
      throw new Error(\`invalid_trust_mode: got "\${opts.trustMode}"\`);
    }
    headers['X-0G-Provider-Trust-Mode'] = opts.trustMode;
  }

  const ceilings: [keyof RoutingOptions, string][] = [
    ['maxPriceUsdPrompt', 'X-0G-Provider-Max-Price-Usd-Prompt'],
    ['maxPriceUsdCompletion', 'X-0G-Provider-Max-Price-Usd-Completion'],
    ['maxPriceUsdImage', 'X-0G-Provider-Max-Price-Usd-Image'],
  ];

  for (const [key, header] of ceilings) {
    const value = opts[key] as number | undefined;
    if (value === undefined) continue;
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(\`invalid_max_price_usd: \${header} must be finite and non-negative\`);
    }
    headers[header] = String(value);
  }

  return headers;
}

// TODO 2: does this request still have failover?
export function willFailover(opts: RoutingOptions): boolean {
  if (opts.allowFallbacks !== undefined) return opts.allowFallbacks;
  // Pinning an address flips the default from true to false.
  return opts.providerAddress === undefined;
}

// TODO 3: what should the caller do about this error?
export function classifyRouterError(
  status: number,
  code: string,
): 'retry-after-delay' | 'retry-maybe' | 'wait-or-change-model' | 'fix-request' {
  if (status === 429) return 'retry-after-delay';
  if (status === 502) return 'retry-maybe';
  if (status === 503) return 'wait-or-change-model';
  if (status >= 400 && status < 500) {
    // Includes no_provider_within_max_price: the pool is empty because of
    // your own ceiling, so an identical retry fails identically, forever.
    void code;
    return 'fix-request';
  }
  return 'retry-maybe';
}

// TODO 4: one routed chat completion
export async function sendChat(
  apiKey: string,
  prompt: string,
  opts: RoutingOptions = {},
): Promise<{ requestId: string; provider: string; totalCostNeuron: string }> {
  const res = await fetch(\`\${ROUTER_BASE_URL}/chat/completions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${apiKey}\`,
      ...buildRoutingHeaders(opts),
    },
    body: JSON.stringify({
      model: 'zai-org/GLM-5-FP8',
      messages: [{ role: 'user', content: prompt }],
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!res.ok) {
    const body = (await res.json()) as { error?: RouterError };
    const code = body.error?.code ?? 'unknown';
    const action = classifyRouterError(res.status, code);
    throw new Error(\`\${res.status} \${code} (\${action}): \${body.error?.message ?? ''}\`);
  }

  const body = (await res.json()) as {
    x_0g_trace: {
      request_id: string;
      provider: string;
      billing: { total_cost: string };
    };
  };

  return {
    requestId: body.x_0g_trace.request_id,
    provider: body.x_0g_trace.provider,
    totalCostNeuron: body.x_0g_trace.billing.total_cost,
  };
}

async function main(): Promise<void> {
  const key = process.env.ZG_ROUTER_API_KEY ?? '';
  const prompt = 'Reply with exactly the word: routed.';

  const cheapest = await sendChat(key, prompt, { sort: 'price' });
  const fastest = await sendChat(key, prompt, { sort: 'latency' });
  const pinned = await sendChat(key, prompt, { providerAddress: cheapest.provider });

  console.log(JSON.stringify({ cheapest, fastest, pinned }, null, 2));
  console.log('pinned call had failover:', willFailover({ providerAddress: cheapest.provider }));

  try {
    await sendChat(key, prompt, { maxPriceUsdPrompt: 0.000001 });
  } catch (err) {
    console.log('ceiling error:', (err as Error).message);
  }

  try {
    await sendChat(key, prompt, { sort: 'cheapest' as unknown as ProviderSort });
  } catch (err) {
    console.log('validation error:', (err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});`,

  hints: [
    'buildRoutingHeaders must distinguish "unset" from "invalid". An undefined option produces no header at all. A defined but wrong option throws. That mirrors the Router, where a blank header is never an error but a malformed one is a 400.',
    'Serialize allowFallbacks with a ternary producing the literal strings true or false. String(1) and String(true) are not the same thing to this API, and Allow-Fallbacks: 1 is rejected with invalid_provider_header.',
    'willFailover has exactly one interesting line: an explicit allowFallbacks always wins, and only when it is undefined does the presence of providerAddress flip the default from true to false.',
    'classifyRouterError should send every 4xx to fix-request. The routing 400s look transient because they mention providers, but no_provider_within_max_price means your ceiling emptied the pool, which will still be true on the next attempt.',
    'Use fetch rather than the OpenAI SDK here. You need to set arbitrary request headers and read the raw error body, and SDK convenience methods tend to hide both.',
    'To make call (c) meaningful, pin the address you got back from call (a). Then note that you did not send Allow-Fallbacks, so that request had no failover, and record whether it still succeeded.',
    'For the price ceiling call, 0.000001 USD per 1M tokens is far below any real provider price, which is the point: it guarantees an empty pool and gives you the verbatim 400 body for your proof.',
  ],

  proof: {
    label: 'Four request_ids with provider addresses and costs, plus two verbatim error bodies',
    hint: 'Record x_0g_trace.request_id, x_0g_trace.provider and billing.total_cost from all four routed calls: sort price, sort latency, pinned to the address from the price call, and the low ceiling attempt. Then capture the two error bodies verbatim, invalid_provider_header from Sort: cheapest and no_provider_within_max_price from the 0.000001 ceiling, with their HTTP status codes.',
    verifyUrl: 'https://pc.0g.ai',
    pattern: '^0x[0-9a-fA-F]{40}$',
  },
};
