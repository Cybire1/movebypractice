import { LessonContent } from '@/app/types/lesson';

export const ogLesson5: LessonContent = {
  id: '0g-5',
  title: "Trust Modes: What the Word 'TEE' Actually Promises",
  description: 'Learn how X-0G-Provider-Trust-Mode picks providers, why the tier is a floor and not an exact match, and the difference between TeeML sealed inference and TeeTLS attested relay. Includes the fine print on zero data retention.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 5,
  language: 'typescript',
  prerequisiteLessons: ['0g-4'],

  narrative: {
    welcomeMessage: "You can already send requests through the 0G Compute Router. Now comes the question people skip until an auditor asks it: who actually sees the text you send? Every provider on the network runs inside a TEE, and it is tempting to read that as 'my prompt is sealed'. It is not the same claim. In this lesson you will learn what each trust tier really buys, and how to force the one you meant.",
    quizTransition: "You have seen the three tiers, the two verification modes behind them, and the retention fine print. Time to check whether the distinctions stuck, because this is exactly the area where a confident wrong answer costs you a compliance conversation.",
    practiceTransition: "Now write the code. You will list the sealed-inference models straight from the live catalog, implement the floor comparison the Router uses, and handle the 503 that proves the Router never silently downgrades you.",
    celebrationMessage: "Solid. You can now say precisely which parties touched a prompt, and you can prove the tier you asked for is the tier you got. That is a sentence most teams shipping on hosted AI cannot say about their own stack.",
    nextLessonTease: "Next: verify_tee, and the uncomfortable moment where a gateway documents the one thing it cannot prove to you.",
  },

  teachingSections: [
    {
      sectionTitle: 'The Tier Is a Floor, Not a Filter',
      slides: [
        {
          title: 'Why Trust Modes Exist At All',
          content: "Every 0G Compute provider runs inside a Trusted Execution Environment and signs its responses. That sounds like one guarantee, but it is really two very different ones bundled under one acronym. Some providers run the model itself inside the enclave. Others run only the 0G broker inside an enclave and forward your request to a centralized LLM. Both are honestly called TEE-backed. Only one of them means your plaintext never left the box. Trust modes exist so you can say which of the two you are willing to accept, per request or per key.",
          emoji: '🔐',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'standard', content: 'Routes to any TEE-backed provider, any tier. You get execution inside a TEE, but the upstream discloses no independent verifiability method. This is the loosest tier and it is what you get by shape if you never set the header.' },
                { label: 'verified', content: 'Routes to TeeML and TeeTLS providers. The guarantee is verifiable execution: the response provably came from the real model, not a cheaper one swapped in behind your back. It says nothing about who read the prompt.' },
                { label: 'private', content: 'Routes to TeeML providers only. Sealed inference: the model runs inside the enclave, the prompt enters encrypted, the response is signed inside the enclave, and the host machine sees only encrypted traffic. This is the only tier where no third party processes your plaintext.' },
                { label: 'Omitting the header', content: 'No trust-tier restriction at all. The Router picks by health and performance. If a model has both TeeML and TeeTLS providers, you will get whichever one is convenient, and it can differ between two identical requests.' },
              ],
              explanation: 'The three values of X-0G-Provider-Trust-Mode and what each one actually restricts.',
            },
          },
        },
        {
          title: 'A Floor, Not an Exact Match',
          content: "The tiers are ordered: standard is weaker than verified, verified is weaker than private. The header sets a minimum, not an equality test. Asking for verified is also satisfied by a private provider, because private is strictly stronger. This matters when you read routing logs and see a private-tier provider serving a request you tagged as verified. That is correct behaviour, not a bug. What never happens is the opposite: the Router will not quietly hand a verified request to a standard provider because supply is tight.",
          emoji: '📏',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Per request: the routing header is the whole mechanism
const res = await fetch('https://router-api.0g.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-YOUR_API_KEY',
    'X-0G-Provider-Trust-Mode': 'private',
  },
  body: JSON.stringify({
    model: 'zai-org/GLM-5-FP8',
    messages: [{ role: 'user', content: 'Hello' }],
  }),
});

// No TeeML provider free for that model right now? Hard failure:
// HTTP 503
// {
//   "error": {
//     "message": "no provider available for trust mode: tier=private",
//     "type": "server_error",
//     "code": "no_provider_for_trust_mode"
//   }
// }`,
              highlights: [
                { line: 7, explanation: 'One header does the whole job. Valid values are standard, verified and private. Anything else is rejected with 400 invalid_trust_mode, and a blank header is treated as unset rather than as an error.' },
                { line: 16, explanation: 'The failure is a 503, which is the class of error that means supply, not permission. It is transient: retry, or switch to a model that has a TeeML provider.' },
                { line: 21, explanation: 'The code no_provider_for_trust_mode is the important string. It is your proof that the Router refused rather than downgraded. Log it verbatim.' },
                { line: 19, explanation: 'The message echoes the tier you asked for, so a 503 in your logs tells you which requirement could not be met.' },
              ],
              explanation: 'Setting the trust mode per request, and the exact shape of the refusal when nothing matches.',
            },
          },
        },
        {
          title: 'Match Tier to Guarantee',
          content: "Before moving on, lock in which promise belongs to which tier. Most production incidents in this area are not exotic. They are someone assuming that 'we use a TEE provider' answered a question it never answered.",
          emoji: '🎚️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'standard', label: 'standard', emoji: '⚪' },
                { id: 'verified', label: 'verified', emoji: '🔵' },
                { id: 'private', label: 'private', emoji: '🟣' },
              ],
              targets: [
                { id: 't-standard', label: 'TEE-backed execution, upstream discloses no independent verifiability method' },
                { id: 't-verified', label: 'The response provably came from the real model (TeeML or TeeTLS)' },
                { id: 't-private', label: 'Sealed inference on TeeML only, prompts never leave the enclave' },
              ],
              correctPairs: [
                { itemId: 'standard', targetId: 't-standard' },
                { itemId: 'verified', targetId: 't-verified' },
                { itemId: 'private', targetId: 't-private' },
              ],
              explanation: 'Each tier maps to exactly one guarantee. Private implies verified, which implies standard.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'TeeML and TeeTLS: Who Sees Your Plaintext',
      slides: [
        {
          title: 'TeeML: The Model Is Inside the Box',
          content: "TeeML means the AI model itself runs inside the Trusted Execution Environment, on an Intel TDX CPU paired with a TEE-enabled NVIDIA H100 or H200. The signing key lives inside the enclave, so a response signature is evidence that this enclave, running this attested code, produced these bytes. Neither 0G nor the operator of the physical machine can read the inference data. Every enclave publishes a hardware attestation you can check independently with dstack. This is the only configuration where the sentence 'nobody else read my prompt' is true.",
          emoji: '🧊',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'The hardware', content: 'Intel TDX (Trust Domain Extensions) on the CPU side, plus an NVIDIA H100 or H200 with TEE support on the GPU side. Both halves matter: a CPU enclave in front of an unprotected GPU would leak the interesting part.' },
                { label: 'The key', content: 'The signing key is generated and held inside the enclave. That is what makes the signature meaningful. If the key lived on the host, a compromised host could sign anything.' },
                { label: 'The attestation', content: 'The enclave publishes a hardware attestation report. It is verifiable with dstack, independently of 0G, which is the whole point of an attestation: you should not have to take the operator at their word.' },
                { label: 'The practical claim', content: 'Prompt enters encrypted, response is signed inside, host sees only ciphertext. This is what the private tier buys and it is the reason private routes to TeeML only.' },
              ],
              explanation: 'The four moving parts of sealed inference under TeeML.',
            },
          },
        },
        {
          title: 'TeeTLS: An Attested Relay, Not an Enclave Model',
          content: "TeeTLS is a different design and a weaker privacy claim. Here the 0G broker runs inside a TEE and proxies your request over HTTPS to a centralized LLM provider. During the TLS handshake the broker checks the upstream certificate against trusted certificate authorities, then bundles the certificate fingerprint together with the request hash, the response hash and the provider identity into a routing proof signed by its TEE key. The docs describe it as conceptually similar to zkTLS but with stronger privacy properties, because the relay itself is attested. It is a real guarantee. It is a guarantee about authenticity, not about secrecy.",
          emoji: '🔗',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// What a TeeTLS broker signs inside its enclave (conceptual shape)
const routingProof = {
  certFingerprint:  'sha256:9f2b...',   // upstream TLS cert the broker saw
  requestHash:      '0x8a1c...',        // hash of what was sent
  responseHash:     '0x4d70...',        // hash of what came back
  providerIdentity: 'upstream-llm.example.com',
  signature:        '0x...',            // signed by the broker TEE key
};

// What this proves:
//   the bytes came from the real upstream provider, unmodified,
//   relayed by unmodified broker code running in an attested TEE.
//
// What this does NOT prove:
//   that the upstream never read your prompt. It did. It ran the model.`,
              highlights: [
                { line: 3, explanation: 'The certificate fingerprint is what rules out an imposter upstream. The CA system guarantees only the real provider holds a valid certificate for their domain.' },
                { line: 4, explanation: 'Request and response hashes bind the proof to specific content, so nobody can later claim a different exchange took place.' },
                { line: 7, explanation: 'The signature comes from the TEE-protected key, so the attestation of the broker code transfers to the proof itself. End-to-end integrity is the property being built here.' },
                { line: 15, explanation: 'This is the line people miss. Under TeeTLS the upstream provider processes your plaintext under its own data policy, not under 0G policy. The broker cannot read it in transit, but the destination obviously can.' },
              ],
              explanation: 'The routing proof gives authenticity and integrity. It does not give secrecy from the upstream.',
            },
          },
        },
        {
          title: 'Who Sees What',
          content: "Put the two designs side by side and the practical question becomes easy to answer: for this specific request, list every party that touched plaintext. If you cannot answer that from your routing configuration, you do not have a privacy posture, you have a hope. Note the trap in the middle of it: when a model is served by both TeeML and TeeTLS providers, the Router balances between them for performance unless you set a tier. So 'my model is a TEE model' does not mean 'my prompt stayed in an enclave' on any given call.",
          emoji: '👁️',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'teeml-host', label: 'Host machine of a TeeML provider', emoji: '🧊' },
                { id: 'teetls-broker', label: '0G broker under TeeTLS', emoji: '🔗' },
                { id: 'teetls-upstream', label: 'Upstream LLM under TeeTLS', emoji: '🏢' },
                { id: 'router-store', label: 'Router persistent storage', emoji: '🗄️' },
              ],
              targets: [
                { id: 'sees-nothing', label: 'Sees only encrypted traffic, never the prompt' },
                { id: 'relays-blind', label: 'Relays inside a TEE and cannot inspect or tamper with the bytes' },
                { id: 'reads-plaintext', label: 'Processes your plaintext under its own data policy' },
                { id: 'metadata-only', label: 'Holds billing and usage metadata only, no request bodies' },
              ],
              correctPairs: [
                { itemId: 'teeml-host', targetId: 'sees-nothing' },
                { itemId: 'teetls-broker', targetId: 'relays-blind' },
                { itemId: 'teetls-upstream', targetId: 'reads-plaintext' },
                { itemId: 'router-store', targetId: 'metadata-only' },
              ],
              explanation: 'Under TeeTLS exactly one party reads plaintext: the upstream provider. Under TeeML, none.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Enforcing It, and the Retention Fine Print',
      slides: [
        {
          title: 'The Catalog Tells You Before You Send',
          content: "You do not have to guess which models can serve a private request. GET /v1/models is public, needs no authentication, and carries a verifiability field per entry. Any model with verifiability set to TeeML accepts private requests. Read it at startup, cache it, and fail loudly in your own code if a model you depend on drops off the list. The catalog changes as providers join and leave the network, so treating it as a live source of truth rather than a constant is the difference between a graceful degradation and a 503 in front of a user.",
          emoji: '📚',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `# The sealed-inference set, straight from the live catalog
curl -s https://router-api.0g.ai/v1/models \\
  | jq '.data[] | select(.verifiability == "TeeML") | .name'

# A single entry looks roughly like this:
# {
#   "id": "zai-org/GLM-5-FP8",
#   "object": "model",
#   "name": "zai-org/GLM-5-FP8",
#   "context_length": 131072,
#   "verifiability": "TeeML",
#   "pricing": { "prompt": "100000000000", "completion": "320000000000" },
#   "provider_count": 3
# }

# Per-provider tiers for one model:
curl "https://router-api.0g.ai/v1/providers?model=zai-org/GLM-5-FP8"`,
              highlights: [
                { line: 2, explanation: 'No Authorization header. The catalog is public, so you can check tier availability before you have even funded an account.' },
                { line: 3, explanation: 'verifiability is the single field that answers the question before you send anything. This is the one to memorise.' },
                { line: 11, explanation: 'A model listed as TeeML accepts private requests. A model without it will 503 the moment you pin the private tier.' },
                { line: 13, explanation: 'provider_count above one is a reminder that a model is not a single machine. Different providers behind one model id can sit in different tiers.' },
                { line: 17, explanation: 'The providers endpoint drills into a single model and returns each provider address with its attestation info, useful when you want to pin one with X-0G-Provider-Address.' },
              ],
              explanation: 'Read the tier from the catalog before you send, not from a 503 afterwards.',
            },
          },
        },
        {
          title: 'Pin the Tier to the Key, Not to the Call Site',
          content: "A header is set by whoever writes the request. That is fine for one service you control and useless as a compliance guarantee across a codebase with many call sites. The stronger move is to pin the trust mode onto the API key itself. A key created with trust_mode set to private routes only to TeeML providers no matter what the calling code sends, so a junior dev copying a snippet from somewhere else cannot accidentally widen your exposure. Creating keys programmatically needs a management key, because sk- keys deliberately cannot mint other keys.",
          emoji: '🔑',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Create an sk- key with the tier baked in.
// Requires an mk- management key with the keys:create scope.
const res = await fetch('https://router-api.0g.ai/v1/api-keys', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mk-YOUR_MANAGEMENT_KEY',
  },
  body: JSON.stringify({
    name: 'agent-bot-private',
    trust_mode: 'private',
  }),
});

const created = await res.json();
// The full sk- secret is shown exactly once, on creation.
// The dashboard stores only a hash. Copy it now or reissue.

// From here on, any request made with that key routes to TeeML only,
// regardless of what X-0G-Provider-Trust-Mode the caller sends.`,
              highlights: [
                { line: 7, explanation: 'An mk- key, not an sk- key. sk- keys call models; mk- keys administer the account. Sending an sk- key here returns 403 insufficient_scope.' },
                { line: 11, explanation: 'trust_mode on the key is the enforcement point. The header is a request, the key setting is a policy.' },
                { line: 16, explanation: 'The secret appears once. This is standard practice and it catches everyone at least once. Store it in your secret manager in the same breath as creating it.' },
                { line: 19, explanation: 'Key-level pinning wins over call-site headers, which is exactly why it is the right control for a team rather than a single script.' },
              ],
              explanation: 'Per-key trust mode is policy. Per-request headers are preference.',
            },
          },
        },
        {
          title: 'Zero Data Retention Has Fine Print',
          content: "The Router advertises zero data retention, and for text and audio inference content that is literally true: prompts and completions are handled in memory for the lifetime of the request and never written to storage. There is no conversation table and no prompt archive, and content that is never stored cannot be used for training. But file and image workflows use bounded transient storage, and if you are writing a data processing agreement you need the actual numbers rather than the slogan.",
          emoji: '⏳',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Prompts and completions', content: 'Memory only, for the lifetime of the request. The Router handles them to route and bill, then they are gone. No prompt log, no response archive.' },
                { label: 'Uploaded multipart files', content: 'Files sent to multipart endpoints such as audio transcription and image edits are auto-deleted within 60 minutes. That is bounded, not zero.' },
                { label: 'Image generation inputs and outputs', content: 'Held for at most 30 minutes so the result can be served, then deleted. Again bounded, not zero.' },
                { label: 'What is retained forever', content: 'Billing and usage metadata only: request id, wallet address, model and provider, token counts, trust tier served, cost and timestamp. None of those fields contain request content.' },
                { label: 'Why trust tier is retained', content: 'Because it makes auditing possible. Usage endpoints break consumption down by tier, so you can state exactly what share of your traffic ran sealed, per day and per model.' },
              ],
              explanation: 'The retention story in numbers rather than adjectives.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'Under TeeTLS, which party processes your plaintext prompt?',
      options: [
        'Nobody, the prompt stays encrypted end to end',
        'The upstream centralized LLM provider, under its own data policy',
        'The 0G Router, which logs it for billing',
        'The host machine running the 0G broker',
      ],
      correctAnswer: 1,
      explanation: 'Under TeeTLS the 0G broker runs inside a TEE and relays over attested TLS, so it cannot read the bytes in transit, and the host cannot either. The upstream provider, however, runs the model and therefore processes your plaintext under its own data policy. Only TeeML gives sealed inference where no third party sees the prompt.',
      weaknessTopic: '0g-verification',
      practiceHint: 'Ask yourself who runs the model. Whoever runs the model reads the prompt.',
    },
    {
      question: 'Which single field on GET /v1/models tells you a model can serve a private-tier request, before you send anything?',
      options: ['owned_by', 'verifiability', 'provider_count', 'context_length'],
      correctAnswer: 1,
      explanation: 'verifiability is the field. Any model with verifiability set to TeeML accepts private requests. The endpoint is public and needs no authentication, so you can check tier availability at startup: curl -s https://router-api.0g.ai/v1/models | jq \'.data[] | select(.verifiability == "TeeML") | .name\'',
      weaknessTopic: '0g-router',
      practiceHint: 'The word you want is the same word used for verification modes: TeeML and TeeTLS.',
    },
    {
      question: 'You send X-0G-Provider-Trust-Mode: verified and the only free provider for that model is a TeeML one. What happens?',
      options: [
        'The request is rejected because the tier does not match exactly',
        'The request is served by the TeeML provider, because the tier is a floor and private is stronger than verified',
        'The Router downgrades the request to standard for performance',
        'The Router queues the request until a TeeTLS provider frees up',
      ],
      correctAnswer: 1,
      explanation: 'The tiers are ordered standard < verified < private and the header acts as a floor, not an equality test. Asking for verified is also satisfied by the stronger private tier, so a TeeML provider serves it happily. The reverse never happens: a verified request is never handed to a standard-only provider.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'No TeeML provider is available for the model you pinned to the private tier. What does the Router do?',
      options: [
        'Silently falls back to a TeeTLS provider',
        'Returns a 503 with code no_provider_for_trust_mode and serves nothing',
        'Returns a 400 because the trust mode was invalid',
        'Generates a response itself from a fallback model',
      ],
      correctAnswer: 1,
      explanation: 'You get a hard 503 whose error code is no_provider_for_trust_mode, and the request is never silently downgraded. The condition is about tier supply rather than permissions, so it is transient: retry, or switch to a model that has a TeeML provider. The Router also never generates content itself.',
      weaknessTopic: '0g-router',
      practiceHint: '503 is the supply-side error class. 400 and 403 mean you sent something wrong, and those are not worth retrying unchanged.',
    },
    {
      question: 'You upload an audio file to /v1/audio/transcriptions. How long can that file persist on the Router side?',
      options: [
        'It is never stored at all',
        'Up to 60 minutes, then auto-deleted',
        'Up to 30 days for support lookups',
        'Until you delete it explicitly through the dashboard',
      ],
      correctAnswer: 1,
      explanation: 'Zero data retention applies to prompts and completions, which are memory only. File and image workflows use bounded transient storage: multipart uploads are auto-deleted within 60 minutes, and image-generation inputs and outputs are held at most 30 minutes. Billing metadata such as token counts and trust tier is retained, but it never contains request content.',
      weaknessTopic: '0g-compute',
    },
    {
      question: 'Why pin trust_mode on the API key instead of relying on the X-0G-Provider-Trust-Mode header?',
      options: [
        'The header is deprecated and will stop working',
        'A key created with trust_mode private routes only to TeeML regardless of what the calling code sends',
        'Headers cost more per request',
        'Key-level settings are the only way to reach the private tier',
      ],
      correctAnswer: 1,
      explanation: 'Both mechanisms work, but they are different kinds of control. The header is a per-request preference set by whoever writes the call. A key created with trust_mode set to private enforces TeeML-only routing for every request made with that key, regardless of headers, which is what you want across a codebase with many call sites. Creating such a key programmatically requires an mk- management key with the keys:create scope.',
      weaknessTopic: '0g-identity',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// 0G Compute Router: trust modes in practice
// Run with: npx tsx trust-modes.ts
// Needs ROUTER_API_KEY (an sk- key) in the environment.

const ROUTER = 'https://router-api.0g.ai/v1';
const API_KEY = process.env.ROUTER_API_KEY ?? '';

export type TrustMode = 'standard' | 'verified' | 'private';

// The tiers are ordered. Higher number means a stronger guarantee.
const TIER_RANK: Record<TrustMode, number> = {
  standard: 0,
  verified: 1,
  private: 2,
};

export interface RouterModel {
  id: string;
  name: string;
  verifiability?: string;   // 'TeeML' | 'TeeTLS' | undefined
  provider_count?: number;
}

export type TieredResult =
  | { ok: true; provider: string; content: string }
  | { ok: false; status: number; code: string; message: string };

// TODO 1: Fetch the public model catalog and return the names of every
// model whose verifiability is exactly 'TeeML'. These are the models that
// can serve a private-tier request.
// GET \${ROUTER}/models needs no Authorization header.
// The payload is { object: 'list', data: RouterModel[] }.
export async function listSealedModels(): Promise<string[]> {
  // Your code here
}

// TODO 2: Implement the floor comparison the Router uses.
// A provider satisfies the request when its own tier is at least as
// strong as the requested tier. Asking for 'verified' is satisfied by
// 'private'. Asking for 'private' is NOT satisfied by 'verified'.
export function satisfiesTrustMode(
  requested: TrustMode,
  providerTier: TrustMode
): boolean {
  // Your code here
}

// TODO 3: Send a chat completion pinned to a trust tier.
// Set X-0G-Provider-Trust-Mode to the given tier.
// On success return { ok: true, provider, content } where provider comes
// from body.x_0g_trace.provider and content from the first choice message.
// On failure return { ok: false, status, code, message } using
// body.error.code and body.error.message. A private request against a
// model with no TeeML provider gives 503 no_provider_for_trust_mode.
export async function completeWithTier(
  model: string,
  prompt: string,
  tier: TrustMode
): Promise<TieredResult> {
  // Your code here
}

// TODO 4: Create an sk- key with the trust mode baked in.
// POST \${ROUTER}/api-keys with an mk- management key in the
// Authorization header and a body of { name, trust_mode }.
// Return the parsed response body. The full secret appears once.
export async function createPinnedKey(
  managementKey: string,
  name: string,
  trustMode: TrustMode
): Promise<Record<string, unknown>> {
  // Your code here
}

async function main() {
  const sealed = await listSealedModels();
  console.log('TeeML models:', sealed);

  // A model that CAN serve private
  const good = await completeWithTier(sealed[0], 'Say hello in five words.', 'private');
  console.log('private tier:', good);

  // A model that CANNOT, to see the refusal rather than a downgrade
  const bad = await completeWithTier('some-non-teeml-model', 'Hello', 'private');
  console.log('expected 503:', bad);
}

main().catch(console.error);`,

  solution: `// 0G Compute Router: trust modes in practice
// Run with: npx tsx trust-modes.ts
// Needs ROUTER_API_KEY (an sk- key) in the environment.

const ROUTER = 'https://router-api.0g.ai/v1';
const API_KEY = process.env.ROUTER_API_KEY ?? '';

export type TrustMode = 'standard' | 'verified' | 'private';

const TIER_RANK: Record<TrustMode, number> = {
  standard: 0,
  verified: 1,
  private: 2,
};

export interface RouterModel {
  id: string;
  name: string;
  verifiability?: string;
  provider_count?: number;
}

export type TieredResult =
  | { ok: true; provider: string; content: string }
  | { ok: false; status: number; code: string; message: string };

// TODO 1: the sealed-inference set, from the live catalog
export async function listSealedModels(): Promise<string[]> {
  const res = await fetch(\`\${ROUTER}/models\`);
  if (!res.ok) {
    throw new Error(\`models endpoint returned \${res.status}\`);
  }
  const body = (await res.json()) as { data: RouterModel[] };
  return body.data
    .filter((m) => m.verifiability === 'TeeML')
    .map((m) => m.name ?? m.id);
}

// TODO 2: the tier is a floor, not an exact match
export function satisfiesTrustMode(
  requested: TrustMode,
  providerTier: TrustMode
): boolean {
  return TIER_RANK[providerTier] >= TIER_RANK[requested];
}

// TODO 3: pin a tier on a single request and handle the refusal
export async function completeWithTier(
  model: string,
  prompt: string,
  tier: TrustMode
): Promise<TieredResult> {
  const res = await fetch(\`\${ROUTER}/chat/completions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`,
      'X-0G-Provider-Trust-Mode': tier,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      code: body?.error?.code ?? 'unknown_error',
      message: body?.error?.message ?? 'no error message returned',
    };
  }

  return {
    ok: true,
    provider: body.x_0g_trace.provider,
    content: body.choices[0].message.content,
  };
}

// TODO 4: policy on the key beats preference at the call site
export async function createPinnedKey(
  managementKey: string,
  name: string,
  trustMode: TrustMode
): Promise<Record<string, unknown>> {
  const res = await fetch(\`\${ROUTER}/api-keys\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${managementKey}\`,
    },
    body: JSON.stringify({ name, trust_mode: trustMode }),
  });

  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(\`key creation failed: \${JSON.stringify(body)}\`);
  }
  // The full sk- secret is returned exactly once. Store it now.
  return body;
}

async function main() {
  const sealed = await listSealedModels();
  console.log('TeeML models:', sealed);

  const good = await completeWithTier(sealed[0], 'Say hello in five words.', 'private');
  console.log('private tier:', good);

  const bad = await completeWithTier('some-non-teeml-model', 'Hello', 'private');
  console.log('expected 503:', bad);
  // { ok: false, status: 503, code: 'no_provider_for_trust_mode', ... }
}

main().catch(console.error);`,

  hints: [
    'listSealedModels: the catalog is public, so send no Authorization header at all. The payload wraps the array in a data field, and each entry carries verifiability. Compare with strict equality against the string TeeML, because TeeTLS also contains the substring Tee.',
    'satisfiesTrustMode: turn each tier into a rank with the lookup table, then compare the provider rank against the requested rank with >=. If you find yourself writing three if statements you are re-encoding the ordering that TIER_RANK already gives you.',
    'completeWithTier: read the JSON body before branching on res.ok, because the 503 you are trying to observe carries its payload in the body. The code you want to surface is body.error.code, and for this lesson it should read exactly no_provider_for_trust_mode.',
    'The provider address is at body.x_0g_trace.provider, which is present on every Router response, not only on verified ones. It is the value you paste into your proof artefact.',
    'createPinnedKey: the Authorization header takes the mk- management key, not your sk- key. An sk- key here returns 403 insufficient_scope, which is the deliberate split between calling models and administering the account.',
  ],

  proof: {
    label: 'Trust-mode evidence bundle',
    hint: 'Submit three things you produced yourself: the TeeML model list from your own jq run against https://router-api.0g.ai/v1/models, one successful private-tier response including the provider address from x_0g_trace, and the verbatim 503 body from a private-tier request against a model with no TeeML provider. The third item is the one that proves the Router refuses rather than downgrades.',
    verifyUrl: 'https://router-api.0g.ai/v1/models',
    pattern: 'no_provider_for_trust_mode',
  },
};
