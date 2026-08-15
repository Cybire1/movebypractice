import { LessonContent } from '../types/lesson';

export const ogLesson6: LessonContent = {
  id: '0g-6',
  title: 'verify_tee and the Trust Boundary a Gateway Cannot Close',
  description: 'Ask the Router to verify a provider TEE signature with verify_tee, understand exactly what tee_verified does and does not assert, then reproduce the check yourself with a throwaway wallet and broker.inference.processResponse.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 6,
  language: 'typescript',
  prerequisiteLessons: ['0g-5'],

  narrative: {
    welcomeMessage: "This is the most honest page in the 0G documentation, because it is a gateway writing down the one thing it cannot prove to you. The Router will happily verify a provider signature on your behalf and hand you back a boolean. That boolean is useful. It is also, strictly speaking, the Router telling you that the Router did its job. In this lesson you learn where that boundary sits and how to step over it in about fifteen lines of code.",
    quizTransition: "You have the mechanism and the caveat. Now the details that decide whether your implementation works: which header carries the chatID, what null means, and why the convenient SDK call quietly makes verification impossible.",
    practiceTransition: "Code time. You will make a request with fetch, pull the two public inputs out of it, spin up a wallet that has never held funds, and check the signature yourself. Two booleans, one from the Router and one from you, and they should agree.",
    celebrationMessage: "You just built something most AI products cannot offer: a check your users can run against you without trusting you. That is not a compliance checkbox, it is a feature, and you can ship it in an afternoon.",
    nextLessonTease: "Next: the Direct path, where you skip the Router entirely and talk to providers through your own on-chain account, main account, sub-accounts and the 24 hour lock included.",
  },

  teachingSections: [
    {
      sectionTitle: 'Asking the Router to Check',
      slides: [
        {
          title: 'Why Anyone Bothers Verifying',
          content: "The failure mode this feature exists to catch is quiet model substitution. You ask for a large expensive model, something cheaper answers, and the text looks fine because text usually does. On a centralized endpoint you have no way to detect it. On 0G every provider runs inside a Trusted Execution Environment and signs its responses with a key held inside that enclave, so a valid signature is evidence that the attested model produced those exact bytes. The point of the network is that you get OpenAI-style ergonomics and a cryptographic answer to 'was this really the model I paid for'.",
          emoji: '🔎',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'The risk', content: 'Silent model swapping. A cheaper model answers, billing says otherwise, and output quality drifts in a way nobody notices for weeks. Prompt evaluation suites catch this late and expensively.' },
                { label: 'The mechanism', content: 'Every provider signs its response with a TEE-held key. The signer address is registered on-chain in the provider service record, so anyone can look up who should have signed and check whether they did.' },
                { label: 'When to bother', content: 'Most chat-like applications do not need per-request verification. Audit logs, high-trust pipelines and research workloads do, because there the artefact outlives the conversation and somebody will ask where it came from.' },
                { label: 'The default in the wild', content: 'The pc.0g.ai playground UI enables verify_tee by default on its own requests. Mirroring that in your client is reasonable and the docs explicitly say so.' },
              ],
              explanation: 'Verification is cheap insurance against the one failure a hosted endpoint cannot rule out for you.',
            },
          },
        },
        {
          title: 'Opting In With verify_tee',
          content: "Turning it on is one field. Add verify_tee: true to the JSON body and the Router fetches the provider signature, looks up the signer address on-chain, verifies it, and only then returns the response to you. It is a 0G extension rather than part of the OpenAI schema, so the Router strips it before forwarding to the provider and nothing downstream chokes on an unexpected field. Multipart endpoints have no JSON body to put it in, so there you pass it as a query parameter instead.",
          emoji: '🎛️',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `# JSON endpoints: put it in the body
curl https://router-api.0g.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -d '{
    "model": "zai-org/GLM-5-FP8",
    "messages": [{"role": "user", "content": "Hello"}],
    "verify_tee": true
  }'

# multipart/form-data endpoints: put it in the query string
curl "https://router-api.0g.ai/v1/audio/transcriptions?verify_tee=true" \\
  -H "Authorization: Bearer sk-YOUR_API_KEY" \\
  -F "file=@recording.mp3" \\
  -F "model=openai/whisper-large-v3"

# The result comes back inside x_0g_trace:
# "x_0g_trace": {
#   "request_id": "0852f405-6c56-40c2-a800-e6fd70785065",
#   "provider": "0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C",
#   "billing": { "input_cost": "...", "total_cost": "..." },
#   "tee_verified": true
# }`,
              highlights: [
                { line: 8, explanation: 'One boolean in the body. The Router strips verify_tee before forwarding, so the provider never sees a field that is not part of the OpenAI-compatible schema.' },
                { line: 12, explanation: 'Multipart endpoints such as audio transcription and image edits have no JSON body, so verify_tee moves to the query string. Same feature, different transport.' },
                { line: 20, explanation: 'x_0g_trace.provider is the on-chain address of the provider that served you. Remember this field, because you need it to run the check yourself later.' },
                { line: 22, explanation: 'tee_verified only appears when you asked for it. Without verify_tee the field is absent, which is not the same as a failed verification.' },
              ],
              explanation: 'One field on JSON endpoints, one query parameter on multipart endpoints, one result field in the trace block.',
            },
          },
        },
        {
          title: 'Reading the Result Correctly',
          content: "Three states, and confusing two of them is the classic bug in this area. A false is a real alarm and should make you treat the response as untrusted. A null or absent field is not an alarm at all, it usually means nobody asked. Write the branch that distinguishes them before you write anything that acts on the value, because a monitoring dashboard that reports 'unverified' for requests that never requested verification will train your team to ignore it.",
          emoji: '🚦',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'true', label: 'tee_verified: true', emoji: '✅' },
                { id: 'false', label: 'tee_verified: false', emoji: '🚨' },
                { id: 'null', label: 'tee_verified null or absent', emoji: '➖' },
              ],
              targets: [
                { id: 't-true', label: 'The signature was present and validated successfully' },
                { id: 't-false', label: 'A signature was present but did not verify, treat the response as untrusted' },
                { id: 't-null', label: 'Verification was not requested for this response' },
              ],
              correctPairs: [
                { itemId: 'true', targetId: 't-true' },
                { itemId: 'false', targetId: 't-false' },
                { itemId: 'null', targetId: 't-null' },
              ],
              explanation: 'Absent means unasked. Only false is a signal that something is wrong.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'The Boundary a Gateway Cannot Close',
      slides: [
        {
          title: 'What tee_verified Actually Asserts',
          content: "Here is the sentence worth reading twice, straight from the docs: tee_verified: true in the response says the Router says it verified the signature. It does not carry the raw signature back to you, so you still have to trust the Router to have done the check honestly. This is not a flaw in the design, it is a structural fact about any intermediary. A gateway that summarises a cryptographic check into a boolean has, at that moment, replaced the cryptography with its own reputation. What is unusual is that the documentation says so out loud instead of letting you assume otherwise.",
          emoji: '🧱',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'What the Router does', content: 'Fetches the provider TEE signature, reads the signer address from the on-chain service record, verifies the signature against it, and returns a single boolean summarising all of that.' },
                { label: 'What you receive', content: 'The boolean. Not the signature, not the signed text, not the signer address. You cannot recompute anything from what comes back in the response.' },
                { label: 'What that means', content: 'Your trust in tee_verified is exactly your trust in the Router. For a huge number of applications that is completely fine, and the docs tell you to stop there if so.' },
                { label: 'Why it is fixable', content: 'Every input the Router used is public: the provider address, the chatID, the on-chain service record, and the provider public signature endpoint. Nothing about the check requires the Router. You can run it yourself.' },
              ],
              explanation: 'A boolean from an intermediary is a claim about the intermediary. The inputs behind it are public, which is what makes this recoverable.',
            },
          },
        },
        {
          title: 'The Two Public Inputs',
          content: "To reproduce the check you need exactly two values: the provider address and the chatID. The provider address sits in the response body at x_0g_trace.provider, which is easy. The chatID is the awkward one, because it arrives in the ZG-Res-Key response header rather than the body. The id field in the JSON body is a fallback for providers that omit the header, but the header is the primary source. HTTP header names are case-insensitive, and different runtimes normalise them differently, so check both casings before you conclude the header was missing.",
          emoji: '🧾',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Both inputs come out of one fetch call
const response = await fetch('https://router-api.0g.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-YOUR_API_KEY',
  },
  body: JSON.stringify({
    model: 'zai-org/GLM-5-FP8',
    messages: [{ role: 'user', content: 'Hello' }],
    verify_tee: true,
  }),
});

const data = await response.json();

// Input 1: who served the request, as an on-chain address
const providerAddress = data.x_0g_trace.provider;

// Input 2: the chat session id, from the HEADER first
const chatID =
  response.headers.get('ZG-Res-Key') ??
  response.headers.get('zg-res-key') ??
  data.id;

// The Router's own answer, for comparison later
const routerSays = data.x_0g_trace.tee_verified;`,
              highlights: [
                { line: 11, explanation: 'verify_tee sits alongside model and messages in the body. You can run the independent check without it, but asking for both gives you two answers to compare.' },
                { line: 18, explanation: 'x_0g_trace is present on every Router response, verified or not, so the provider address is always available to you.' },
                { line: 22, explanation: 'ZG-Res-Key is the primary source for chatID. This is the whole reason this lesson insists on fetch: you need the raw response object to reach headers at all.' },
                { line: 24, explanation: 'data.id is a fallback for providers that do not send the header. Use it last, not first.' },
                { line: 27, explanation: 'Keep the Router answer next to your own. Two independent booleans that agree is a much stronger artefact than either one alone.' },
              ],
              explanation: 'Provider address from the body, chatID from the header with the body as fallback.',
            },
          },
        },
        {
          title: 'Why the Convenient SDK Call Blocks You',
          content: "Most OpenAI-compatible client libraries hand you a parsed object and throw the HTTP response away. That is a nice ergonomic default and it is fatal here, because chatID lives in a header that the parsed object does not contain. If your client hides raw responses, you cannot get a chatID, and without a chatID there is nothing to verify. Some SDKs expose a raw-response or with-response helper that gives you the headers back, and those work fine. The convenience method does not. Reach for fetch and the problem disappears.",
          emoji: '🧯',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// This works: raw response, headers reachable
const res = await fetch(url, { method: 'POST', headers, body });
const chatID = res.headers.get('ZG-Res-Key') ?? (await res.json()).id;
//    ^ verification is possible

// This does not: the HTTP response is gone by the time you get a value
const completion = await client.chat.completions.create({
  model: 'zai-org/GLM-5-FP8',
  messages: [{ role: 'user', content: 'Hello' }],
});
const chatID2 = completion.id;   // body id only, no ZG-Res-Key anywhere
//    ^ you cannot see the header, so you cannot verify independently

// Middle ground, if you like your SDK:
// most OpenAI SDKs expose a "raw response" / "with response" helper
// that returns both the parsed body and the HTTP headers.`,
              highlights: [
                { line: 3, explanation: 'One line, both sources, header first. This is the entire fix.' },
                { line: 11, explanation: 'The convenience method returns only the parsed body. completion.id is the fallback, and if the provider relies on the header you are simply stuck.' },
                { line: 12, explanation: 'This is the trap the docs warn about. It is not an SDK bug, it is a design choice that happens to discard the field you need.' },
                { line: 15, explanation: 'If you prefer the SDK, use its raw-response helper rather than abandoning it. What matters is reaching the headers, not which client you use.' },
              ],
              explanation: 'Independent verification requires header access, so the client you choose decides whether it is possible at all.',
            },
          },
        },
      ],
    },
    {
      sectionTitle: 'Verifying It Yourself',
      slides: [
        {
          title: 'A Wallet That Has Never Held Money',
          content: "The SDK ships a one-shot helper that does the whole verification, and the striking part is what it does not need. processResponse only reads the on-chain service record and calls the provider public signature endpoint. It does not spend anything, it does not need a funded ledger account, and it does not need to be the wallet that paid for the request. A wallet generated on the spot with ethers.Wallet.createRandom works. That is what makes this shippable as a user-facing feature: your users can verify your outputs with a throwaway key and zero balance.",
          emoji: '🪪',
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

// Mainnet: chainId 16661, https://evmrpc.0g.ai
// Galileo testnet: chainId 16602, https://evmrpc-testnet.0g.ai
const rpc = new ethers.JsonRpcProvider('https://evmrpc.0g.ai');

// Any wallet works. This one is generated now and funded never.
const wallet = ethers.Wallet.createRandom().connect(rpc);
const broker = await createZGComputeNetworkBroker(wallet);

// Reads the chain, calls the provider, never asks the Router anything
const isValid = await broker.inference.processResponse(
  providerAddress,   // from data.x_0g_trace.provider
  chatID,            // from the ZG-Res-Key header
);

console.log({ routerSays, isValid });`,
              highlights: [
                { line: 6, explanation: 'The broker must point at the same network the provider registered on. Verifying a mainnet response against the testnet RPC finds no service record and fails for the wrong reason.' },
                { line: 9, explanation: 'createRandom generates a fresh key in memory. No faucet, no funding, no prior transactions. Verification is a read operation.' },
                { line: 13, explanation: 'processResponse(providerAddress, chatID) is the one-shot helper. Under the hood it reads the provider on-chain service record, fetches the signature from the provider, and checks it against the TEE signer address.' },
                { line: 18, explanation: 'Two booleans from two independent paths. Agreement is the artefact you publish. Disagreement is a very interesting bug report.' },
              ],
              explanation: 'Independent verification needs an RPC connection and nothing else.',
            },
          },
        },
        {
          title: 'true, false, and the Two Ways to Get null',
          content: "processResponse returns a boolean or null, and null is the one that generates support tickets. There are exactly two documented reasons for it. The first is that no chatID reached the call, so verification was skipped before it began, which in practice means you read the wrong header casing or used a client that hid the headers from you. The second is that the provider exposes no verifiable TEE service, so there is genuinely nothing to check. Those are distinguishable from your own request: if you can print a non-empty chatID, you have ruled out the first.",
          emoji: '❓',
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'true', content: 'Independently verified. The signature fetched from the provider validated against the TEE signer address recorded on-chain, and you did that check yourself.' },
                { label: 'false', content: 'Verification failed. Treat the response as untrusted, log the provider address and the chatID, and do not quietly retry as though nothing happened.' },
                { label: 'null, cause one', content: 'No chatID was provided, so the verifiability check was skipped. Usually a header-reading bug: wrong casing, or an SDK convenience method that discarded the response headers.' },
                { label: 'null, cause two', content: 'The provider has no verifiable TEE service, so there is nothing to verify. Nothing you can fix in your client, it is a property of the provider you were routed to.' },
                { label: 'Telling them apart', content: 'Print the chatID before you call. A non-empty chatID rules out cause one and leaves cause two as the only explanation, which turns a mystery into a routing decision.' },
              ],
              explanation: 'null is not a failure. It means the check did not run, and there are exactly two documented reasons for that.',
            },
          },
        },
        {
          title: 'Ship It as a Feature',
          content: "Verification is usually framed as a compliance chore. Framed correctly it is a product claim almost nobody can make: my users can verify my outputs without trusting me. Store the four fields alongside each generated artefact, expose them in your own UI or API, and anyone can rerun the check with a wallet they created a second ago. The four steps behind the SDK helper are documented too, so a user working in a language with no 0G SDK can still reproduce it: read the on-chain service record, GET the signature endpoint for that chatID, verify it as an EIP-191 personal_sign against the TEE signer address, and confirm the signed text matches what they were shown.",
          emoji: '🚀',
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'chatid', label: 'chatID', emoji: '🆔' },
                { id: 'provider', label: 'providerAddress', emoji: '📍' },
                { id: 'routerflag', label: 'router tee_verified', emoji: '🛰️' },
                { id: 'ownflag', label: 'your own boolean', emoji: '🔏' },
              ],
              targets: [
                { id: 'g-chatid', label: 'Identifies the exact response to fetch a signature for' },
                { id: 'g-provider', label: 'Locates the on-chain service record and TEE signer address' },
                { id: 'g-router', label: 'The gateway claim, useful but resting on trust in the gateway' },
                { id: 'g-own', label: 'The claim that needs no trust in anyone, computed on your side' },
              ],
              correctPairs: [
                { itemId: 'chatid', targetId: 'g-chatid' },
                { itemId: 'provider', targetId: 'g-provider' },
                { itemId: 'routerflag', targetId: 'g-router' },
                { itemId: 'ownflag', targetId: 'g-own' },
              ],
              explanation: 'The four fields of a verification artefact and what each one contributes.',
            },
          },
        },
      ],
    },
  ],

  quiz: [
    {
      question: 'What does tee_verified: true in x_0g_trace actually assert?',
      options: [
        'The raw provider signature is included in the response for you to check',
        'The Router says it verified the provider signature, and you are trusting the Router to have done so honestly',
        'The response was generated inside a TEE that you personally attested',
        'The provider staked tokens against the correctness of this response',
      ],
      correctAnswer: 1,
      explanation: 'The Router fetches the signature, looks up the signer on-chain, verifies it, and returns a single boolean. The raw signature is not carried back to you, so the flag is a claim by the Router about work the Router did. The docs say this plainly, and they also point out that every input is public so you can reproduce the check yourself.',
      weaknessTopic: '0g-verification',
      practiceHint: 'Ask what you could recompute from the response alone. If the answer is nothing, you are trusting a summary.',
    },
    {
      question: 'Where does the chatID needed by processResponse come from?',
      options: [
        'The ZG-Res-Key response header, with the body id field as a fallback',
        'The x_0g_trace.request_id field',
        'The Authorization header you sent',
        'A separate call to /v1/providers',
      ],
      correctAnswer: 0,
      explanation: 'The chatID lives in the ZG-Res-Key response header. The id field in the JSON body is a fallback for providers that omit the header. Header names are case-insensitive, so check ZG-Res-Key and zg-res-key before deciding it is absent. request_id is a different value used for support lookups and does not work here.',
      weaknessTopic: '0g-verification',
    },
    {
      question: 'Your independent processResponse returned null instead of true or false, and you can print a non-empty chatID. What does that tell you?',
      options: [
        'The signature failed to verify, so the response is untrusted',
        'You can rule out the missing-chatID cause, leaving the provider having no verifiable TEE service',
        'The wallet needs funding before verification will run',
        'The Router already verified it, so your call was skipped',
      ],
      correctAnswer: 1,
      explanation: 'There are two documented causes of null: no chatID was provided so the check was skipped, or the provider exposes no verifiable TEE service so there is nothing to check. A non-empty chatID rules out the first, which leaves the second. Note that null is not a failure. A failure is false.',
      weaknessTopic: '0g-verification',
      practiceHint: 'null means the check did not run. false means it ran and lost. Never collapse those two into one alert.',
    },
    {
      question: 'Why does the standard OpenAI SDK convenience method make independent verification impossible?',
      options: [
        'It strips the verify_tee field from the request',
        'It returns only the parsed body, so the ZG-Res-Key response header is unreachable',
        'It routes through a different base URL that skips the Router',
        'It requires a management key rather than an API key',
      ],
      correctAnswer: 1,
      explanation: 'The convenience method hands back a parsed object and discards the HTTP response, and chatID lives in a header rather than in the body. No header access means no chatID, and no chatID means nothing to verify. Use fetch, or use the SDK raw-response helper that returns headers alongside the parsed body.',
      weaknessTopic: '0g-router',
    },
    {
      question: 'Which wallet can run broker.inference.processResponse for an independent check?',
      options: [
        'Only the wallet that paid for the original request',
        'Any wallet, including a freshly generated one with no balance, since the call only reads the chain and hits the provider public endpoint',
        'Only a wallet with a funded ledger account on 0G Compute',
        'Only a wallet registered as a provider',
      ],
      correctAnswer: 1,
      explanation: 'Verification is a read operation. processResponse reads the provider on-chain service record and calls the provider public signature endpoint, so ethers.Wallet.createRandom is enough. That is precisely what makes user-facing verification practical: your users need no funds and no account to check your outputs.',
      weaknessTopic: '0g-compute',
    },
    {
      question: 'You are calling /v1/audio/transcriptions, which uses multipart/form-data. How do you request verification?',
      options: [
        'Add verify_tee: true to the JSON body',
        'Pass verify_tee=true as a query parameter on the URL',
        'Send an X-0G-Verify-Tee header',
        'Verification is unavailable on multipart endpoints',
      ],
      correctAnswer: 1,
      explanation: 'Multipart endpoints have no JSON body to carry the flag, so verify_tee moves into the query string: /v1/audio/transcriptions?verify_tee=true. Same feature, same tee_verified result inside x_0g_trace, different place to put the switch.',
      weaknessTopic: '0g-router',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// Independent TEE verification against the 0G Compute Router
// npm i ethers @0gfoundation/0g-compute-ts-sdk
// Run with: npx tsx verify-tee.ts   (needs ROUTER_API_KEY in the environment)

import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

const ROUTER = 'https://router-api.0g.ai/v1';
const API_KEY = process.env.ROUTER_API_KEY ?? '';

// Mainnet: chainId 16661. Galileo testnet: chainId 16602,
// https://evmrpc-testnet.0g.ai. Use the network the provider registered on.
const RPC_URL = 'https://evmrpc.0g.ai';

export interface RouterAnswer {
  content: string;
  providerAddress: string;
  chatID: string | null;
  routerVerified: boolean | null;
}

// TODO 1: Pull the chatID out of a raw fetch Response.
// Primary source is the ZG-Res-Key header. Header names are
// case-insensitive, so try both casings, then fall back to body.id.
// Return null if none of the three are present.
export function readChatId(res: Response, body: { id?: string }): string | null {
  // Your code here
}

// TODO 2: Send a chat completion with verify_tee enabled, using fetch
// so the headers survive. Return content, providerAddress from
// body.x_0g_trace.provider, chatID via readChatId, and routerVerified
// from body.x_0g_trace.tee_verified (which may be undefined).
export async function requestWithVerification(
  model: string,
  prompt: string
): Promise<RouterAnswer> {
  // Your code here
}

// TODO 3: Verify the same response yourself.
// Create a throwaway wallet with ethers.Wallet.createRandom(), connect it
// to RPC_URL, build a broker with createZGComputeNetworkBroker, then call
// broker.inference.processResponse(providerAddress, chatID).
// Return the boolean or null it gives you, plus the verifier address.
export async function independentlyVerify(
  providerAddress: string,
  chatID: string
): Promise<{ verified: boolean | null; verifierAddress: string }> {
  // Your code here
}

// TODO 4: Build the proof artefact.
// Return an object with chat_id, provider, router_tee_verified,
// independent_verified, verifier_wallet and an agreement boolean that is
// true only when both answers are strictly true.
export function buildProofArtefact(
  answer: RouterAnswer,
  independent: { verified: boolean | null; verifierAddress: string }
): Record<string, unknown> {
  // Your code here
}

async function main() {
  const answer = await requestWithVerification(
    'zai-org/GLM-5-FP8',
    'Reply with exactly: verification test.'
  );
  console.log('router says:', answer.routerVerified);

  if (!answer.chatID) {
    throw new Error('no chatID: check header casing before blaming the provider');
  }

  const independent = await independentlyVerify(answer.providerAddress, answer.chatID);
  console.log('you say:', independent.verified);

  console.log(JSON.stringify(buildProofArtefact(answer, independent), null, 2));
}

main().catch(console.error);`,

  solution: `// Independent TEE verification against the 0G Compute Router
// npm i ethers @0gfoundation/0g-compute-ts-sdk
// Run with: npx tsx verify-tee.ts   (needs ROUTER_API_KEY in the environment)

import { ethers } from 'ethers';
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk';

const ROUTER = 'https://router-api.0g.ai/v1';
const API_KEY = process.env.ROUTER_API_KEY ?? '';
const RPC_URL = 'https://evmrpc.0g.ai';

export interface RouterAnswer {
  content: string;
  providerAddress: string;
  chatID: string | null;
  routerVerified: boolean | null;
}

// TODO 1: header first, both casings, body id as fallback
export function readChatId(res: Response, body: { id?: string }): string | null {
  return (
    res.headers.get('ZG-Res-Key') ??
    res.headers.get('zg-res-key') ??
    body.id ??
    null
  );
}

// TODO 2: fetch, not the SDK convenience method, so headers survive
export async function requestWithVerification(
  model: string,
  prompt: string
): Promise<RouterAnswer> {
  const res = await fetch(\`\${ROUTER}/chat/completions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      verify_tee: true,
    }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(
      \`router returned \${res.status}: \${body?.error?.code ?? 'unknown_error'}\`
    );
  }

  return {
    content: body.choices[0].message.content,
    providerAddress: body.x_0g_trace.provider,
    chatID: readChatId(res, body),
    routerVerified: body.x_0g_trace.tee_verified ?? null,
  };
}

// TODO 3: reproduce the check with a wallet that has never held funds
export async function independentlyVerify(
  providerAddress: string,
  chatID: string
): Promise<{ verified: boolean | null; verifierAddress: string }> {
  const rpc = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = ethers.Wallet.createRandom().connect(rpc);
  const broker = await createZGComputeNetworkBroker(wallet);

  // Reads the provider on-chain service record, fetches the signature from
  // the provider, checks it against the TEE signer. The Router is not involved.
  const verified = await broker.inference.processResponse(providerAddress, chatID);

  return { verified, verifierAddress: wallet.address };
}

// TODO 4: the artefact anyone can re-run
export function buildProofArtefact(
  answer: RouterAnswer,
  independent: { verified: boolean | null; verifierAddress: string }
): Record<string, unknown> {
  return {
    chat_id: answer.chatID,
    provider: answer.providerAddress,
    router_tee_verified: answer.routerVerified,
    independent_verified: independent.verified,
    verifier_wallet: independent.verifierAddress,
    agreement: answer.routerVerified === true && independent.verified === true,
  };
}

async function main() {
  const answer = await requestWithVerification(
    'zai-org/GLM-5-FP8',
    'Reply with exactly: verification test.'
  );
  console.log('router says:', answer.routerVerified);

  if (!answer.chatID) {
    throw new Error('no chatID: check header casing before blaming the provider');
  }

  const independent = await independentlyVerify(answer.providerAddress, answer.chatID);
  console.log('you say:', independent.verified);
  // null here means either no chatID was passed (ruled out above)
  // or the provider exposes no verifiable TEE service.

  console.log(JSON.stringify(buildProofArtefact(answer, independent), null, 2));
}

main().catch(console.error);`,

  hints: [
    'readChatId: the nullish coalescing operator chains cleanly here, but the order matters. ZG-Res-Key first, the lowercase spelling second, body.id last. Getting the order wrong still works most of the time, which is exactly what makes it a bad habit.',
    'requestWithVerification: parse the body once into a variable rather than calling res.json() twice. A Response body can only be consumed once, and the second call throws.',
    'tee_verified is absent rather than false when you did not ask for verification, so normalise undefined to null before returning it. Reporting an unasked request as unverified will train your team to ignore the alert.',
    'independentlyVerify: ethers.Wallet.createRandom() returns a wallet with no provider attached, so chain .connect(rpc) before handing it to createZGComputeNetworkBroker. Without a provider the broker cannot read the service record.',
    'Point the JsonRpcProvider at the network the provider registered on. Mainnet is https://evmrpc.0g.ai with chainId 16661, Galileo testnet is https://evmrpc-testnet.0g.ai with chainId 16602. A network mismatch looks like a verification failure but is really a lookup miss.',
    'If processResponse returns null, print the chatID first. A non-empty chatID eliminates the skipped-check cause and tells you the provider simply exposes no verifiable service.',
  ],

  proof: {
    label: 'Independent verification artefact (JSON)',
    hint: 'Submit one JSON object containing the chatID, the provider address, the Router tee_verified flag, and your own independent boolean from broker.inference.processResponse. The independent boolean must have been produced with a wallet that has never held funds, so include that wallet address too. Two booleans from two independent paths, both true, is the artefact.',
    verifyUrl: 'https://chainscan.0g.ai',
    pattern: '0x[a-fA-F0-9]{40}',
  },
};
