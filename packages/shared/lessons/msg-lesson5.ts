import { LessonContent } from '../types/lesson';

export const msgLesson5: LessonContent = {
  id: 'msg-5',
  title: 'Encryption with Seal',
  description: 'Implement end-to-end encryption using Sui Seal for private messaging channels.',
  difficulty: 'intermediate',
  xpReward: 300,
  order: 5,
  language: 'typescript',
  prerequisiteLessons: ['msg-4'],

  narrative: {
    welcomeMessage: "Privacy is paramount! Let's encrypt your messages with Sui's Seal threshold encryption.",
    quizTransition: "Let's test your understanding of encryption concepts...",
    practiceTransition: "Implement encryption config, session keys, and key rotation!",
    celebrationMessage: "Your messages are now encrypted end-to-end! Privacy achieved.",
  },

  teachingSections: [
    {
      sectionTitle: 'Threshold Encryption Fundamentals',
      slides: [
        {
          title: 'What is Sui Seal?',
          emoji: '🔐',
          content: "Sui Seal is a threshold encryption framework built into the Sui ecosystem. Unlike traditional encryption where a single key encrypts and decrypts data, Seal uses **threshold encryption** (t-of-n) -- meaning a message is encrypted so that at least `t` out of `n` key shares are needed to decrypt it. This eliminates single points of failure and ensures that no single party can unilaterally access private messages. The `@mysten/seal` SDK provides a TypeScript-native interface to Seal's on-chain encryption primitives.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Threshold Encryption', content: 'A scheme where t-of-n key holders must cooperate to decrypt. If t=2 and n=3, any 2 of 3 key holders can decrypt the message.' },
                { label: 'No Single Point of Failure', content: 'Even if one key holder is compromised, the attacker cannot decrypt without reaching the threshold.' },
                { label: 'On-Chain Policy', content: 'Seal leverages Sui Move objects to define who can decrypt. The policy is enforced by the blockchain, not by a server.' },
                { label: '@mysten/seal SDK', content: 'The TypeScript SDK that wraps Seal\'s encryption, decryption, and key management APIs for frontend and backend use.' },
              ],
            },
          },
        },
        {
          title: 'How Threshold Encryption Works',
          emoji: '🧩',
          content: "In a t-of-n scheme, the encryption key is split into `n` **key shares** distributed to different validators or participants. To decrypt, at least `t` shares must be combined. Here's the flow: (1) A **policy object** on-chain defines who can request decryption. (2) The sender encrypts a message with the policy's public key using `SealClient.encrypt()`. (3) Authorized recipients request partial decryptions from key servers. (4) Once `t` partial decryptions are gathered, the SDK combines them to reveal the plaintext. The beauty is that the full decryption key is **never reconstructed** on any single machine.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'policy', label: 'Create Policy Object', emoji: '📜' },
                { id: 'encrypt', label: 'Encrypt with Policy Key', emoji: '🔒' },
                { id: 'request', label: 'Request Partial Decryptions', emoji: '📨' },
                { id: 'combine', label: 'Combine t Shares', emoji: '🔓' },
              ],
              targets: [
                { id: 'step1', label: 'Step 1' },
                { id: 'step2', label: 'Step 2' },
                { id: 'step3', label: 'Step 3' },
                { id: 'step4', label: 'Step 4' },
              ],
              correctPairs: [
                { itemId: 'policy', targetId: 'step1' },
                { itemId: 'encrypt', targetId: 'step2' },
                { itemId: 'request', targetId: 'step3' },
                { itemId: 'combine', targetId: 'step4' },
              ],
            },
          },
        },
        {
          title: 'Seal and Sui Objects',
          emoji: '🏗️',
          content: "Seal policies are themselves **Sui Move objects**. When you create an encrypted messaging channel, the channel object acts as the encryption policy: only members of the channel can request decryption. The `SealClient` takes a reference to this policy object when encrypting. This tight coupling between object ownership and encryption access means that Sui's permission model directly controls who can read messages -- no separate access control layer needed.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SealClient } from '@mysten/seal';\nimport { SuiClient } from '@mysten/sui/client';\n\nconst suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });\n\nconst sealClient = new SealClient({\n  suiClient,\n  serverObjectIds: [\n    '0xSEAL_SERVER_OBJECT_1',\n    '0xSEAL_SERVER_OBJECT_2',\n  ],\n  verifyKeyServers: true,\n});\n\n// Encrypt using a channel's policy ID\nconst encrypted = await sealClient.encrypt({\n  threshold: 2,\n  packageId: '0xYOUR_PACKAGE',\n  id: channelPolicyId,\n  data: new TextEncoder().encode('Hello, private world!'),\n});`,
              highlights: [
                { line: 1, explanation: "Import SealClient from the @mysten/seal package" },
                { line: 6, explanation: "Initialize SealClient with Sui client and key server object IDs" },
                { line: 11, explanation: "verifyKeyServers ensures the key servers are legitimate Seal validators" },
                { line: 16, explanation: "encrypt() takes a threshold, the policy package/ID, and the plaintext data as Uint8Array" },
                { line: 17, explanation: "threshold: 2 means 2-of-n key servers must participate in decryption" },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-msg-013',
    },
    {
      sectionTitle: 'Session Key Management',
      slides: [
        {
          title: 'SealClient Setup and Configuration',
          emoji: '🔧',
          content: "Before encrypting or decrypting, you must configure `SealClient` with the correct key server objects. Key servers are on-chain objects that hold their portion of the threshold key. You pass their object IDs during initialization. The `SealClient` communicates with these servers when decrypting -- it sends each server a request and collects partial decryptions. The `verifyKeyServers` flag ensures the SDK validates server authenticity before trusting their responses.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SealClient } from '@mysten/seal';\nimport { SuiClient } from '@mysten/sui/client';\n\nconst sealClient = new SealClient({\n  suiClient: new SuiClient({ url: rpcUrl }),\n  serverObjectIds: KEY_SERVER_IDS,\n  verifyKeyServers: true,\n});\n\n// To decrypt, the caller must prove channel membership\nconst decrypted = await sealClient.decrypt({\n  data: encryptedBytes,\n  sessionKey,\n  txBytes,\n});`,
              highlights: [
                { line: 4, explanation: "SealClient wraps all encryption and decryption operations" },
                { line: 6, explanation: "serverObjectIds: array of on-chain key server object IDs from the Seal network" },
                { line: 11, explanation: "decrypt() requires the encrypted data, a session key, and a transaction proving access rights" },
                { line: 13, explanation: "sessionKey is a temporary signing key that authorizes the decrypt request" },
              ],
            },
          },
        },
        {
          title: 'Creating Session Keys',
          emoji: '🗝️',
          content: "A **session key** is a short-lived keypair used to sign decryption requests without exposing the user's main wallet key. You create one with `SealSessionKey.create()`, specifying an address, a `maxEpoch` (expiry), and the `personalMessage` the user signs to authorize the session. The session key can then be used for multiple decrypt calls within its validity window. This pattern keeps the user's main private key safe while enabling repeated decryptions.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Why Session Keys?', content: 'Main wallet keys should never be passed to third-party libraries. Session keys are temporary delegates that can only decrypt, not transfer funds.' },
                { label: 'maxEpoch', content: 'The Sui epoch at which the session key expires. After this epoch, the key is invalid and cannot authorize decryptions.' },
                { label: 'personalMessage', content: 'A human-readable string the user signs in their wallet to authorize creation of the session key. This proves consent.' },
                { label: 'Lifecycle', content: 'Create -> use for multiple decryptions -> expires at maxEpoch -> create a new one.' },
              ],
            },
          },
        },
        {
          title: 'Session Key Lifecycle',
          emoji: '🔄',
          content: "Session keys have a clear lifecycle: **create** them when the user opens an encrypted channel, **use** them for every decrypt operation during the session, and let them **expire** at `maxEpoch`. If the session key is compromised, damage is limited because it can only decrypt (not sign transactions) and it expires soon. Best practice: create a new session key each time the user opens the app, with a maxEpoch a few epochs in the future.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SealSessionKey } from '@mysten/seal';\n\n// Create a session key for decryption\nconst sessionKey = await SealSessionKey.create({\n  address: userAddress,\n  packageId: '0xYOUR_PACKAGE',\n  ttlMin: 10,\n  suiClient,\n});\n\n// Use it to decrypt messages\nconst plaintext = await sealClient.decrypt({\n  data: encryptedMessage,\n  sessionKey,\n  txBytes: accessProofTxBytes,\n});\n\n// Session key automatically expires after ttlMin minutes\nconsole.log('Decrypted:', new TextDecoder().decode(plaintext));`,
              highlights: [
                { line: 1, explanation: "Import SealSessionKey alongside SealClient" },
                { line: 4, explanation: "SealSessionKey.create() generates a temporary keypair for decryption" },
                { line: 7, explanation: "ttlMin sets the time-to-live in minutes for this session key" },
                { line: 12, explanation: "Pass the session key into decrypt() calls -- it signs the request to key servers" },
                { line: 15, explanation: "txBytes is a serialized transaction that proves the caller has access to the channel" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-014',
    },
    {
      sectionTitle: 'Key Rotation',
      slides: [
        {
          title: 'Why Key Rotation Matters',
          emoji: '🔑',
          content: "Key rotation is the practice of periodically changing encryption keys. Even with threshold encryption, long-lived keys accumulate risk: over time, more key shares could be compromised or leaked. By rotating keys, you ensure that even if old shares are exposed, messages encrypted with newer keys remain secure. Seal supports key rotation at the policy level -- when a channel's encryption key is rotated, new messages use the new key while old messages remain decryptable with the old key (backward compatibility).",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Forward Secrecy', content: 'After rotation, compromising the new key does NOT expose old messages. Each rotation epoch has its own key.' },
                { label: 'Backward Compatibility', content: 'Old messages can still be decrypted by authorized users -- the old key shares are retained for historical access.' },
                { label: 'Compliance', content: 'Many security standards require periodic key rotation (e.g., every 90 days) to limit exposure windows.' },
                { label: 'Member Changes', content: 'When a member leaves a channel, rotating the key ensures they cannot decrypt future messages.' },
              ],
            },
          },
        },
        {
          title: 'The rotateKeys() API and Migration',
          emoji: '🔄',
          content: "Seal exposes key rotation through a Move transaction that updates the channel's policy object. On the TypeScript side, you build and execute this transaction, then update your local `SealClient` references. The pattern: (1) Call a Move function to rotate the on-chain policy key. (2) New messages are encrypted with the fresh key. (3) Decryption of old messages still works because key servers retain historical shares. Always rotate keys when removing channel members to maintain privacy guarantees.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { Transaction } from '@mysten/sui/transactions';\n\n// Build a key rotation transaction\nconst tx = new Transaction();\ntx.moveCall({\n  target: \`\${packageId}::channel::rotate_key\`,\n  arguments: [\n    tx.object(channelId),\n    tx.pure.u64(newEpoch),\n  ],\n});\n\n// Execute the rotation\nawait suiClient.signAndExecuteTransaction({\n  transaction: tx,\n  signer: adminKeypair,\n});\n\n// After rotation, new messages use the updated key\nconst encrypted = await sealClient.encrypt({\n  threshold: 2,\n  packageId,\n  id: channelId,\n  data: new TextEncoder().encode('Post-rotation message'),\n});\n\nconsole.log('Key rotated. New messages use fresh encryption key.');`,
              highlights: [
                { line: 5, explanation: "Call the rotate_key Move function on the channel object" },
                { line: 8, explanation: "Pass the channel object ID to identify which policy to rotate" },
                { line: 9, explanation: "newEpoch marks the rotation boundary for key versioning" },
                { line: 14, explanation: "Execute the transaction with the channel admin's keypair" },
                { line: 20, explanation: "After rotation, SealClient.encrypt() automatically uses the new key" },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-015',
    },
  ],

  quiz: [
    {
      question: 'What does "threshold encryption" mean in the context of Sui Seal?',
      options: [
        'Messages are encrypted with a password that meets a minimum strength threshold',
        'A minimum number (t) of key shares out of (n) total must cooperate to decrypt a message',
        'Encryption is only applied when message size exceeds a threshold in bytes',
        'Messages are encrypted multiple times for extra security layers',
      ],
      correctAnswer: 1,
      explanation: 'Threshold encryption (t-of-n) means that at least t out of n key holders must provide their partial decryptions to recover the plaintext. This prevents any single party from decrypting alone.',
      weaknessTopic: 'encryption',
      practiceHint: 'Review the threshold parameter in SealClient.encrypt() and think about what t and n represent.',
    },
    {
      question: 'What is the role of a session key in Seal decryption?',
      options: [
        'It permanently replaces the user\'s wallet key for all operations',
        'It is a temporary keypair that authorizes decryption requests without exposing the main wallet key',
        'It encrypts the message before sending it to the channel',
        'It stores the full decryption key on the client device',
      ],
      correctAnswer: 1,
      explanation: 'A session key is a short-lived keypair created to sign decryption requests. It keeps the user\'s main private key safe by acting as a temporary delegate that can only authorize decrypt operations.',
      weaknessTopic: 'encryption',
      practiceHint: 'Think about why you would not want to pass your main wallet key to a third-party SDK.',
    },
    {
      question: 'Why should you rotate encryption keys when a member is removed from a channel?',
      options: [
        'To make the channel load faster',
        'To reduce storage costs on-chain',
        'To ensure the removed member cannot decrypt future messages',
        'Key rotation is purely cosmetic and has no security benefit',
      ],
      correctAnswer: 2,
      explanation: 'When a member is removed, they may still have cached key shares. Rotating the key ensures that new messages are encrypted with a key the removed member does not have access to.',
      weaknessTopic: 'encryption',
      practiceHint: 'Consider what happens if a removed member still holds old key shares and you do not rotate.',
    },
    {
      question: 'What does the verifyKeyServers option do when initializing SealClient?',
      options: [
        'It checks that the key servers have enough disk space',
        'It validates the authenticity of key server objects before trusting their decryption responses',
        'It encrypts the connection between client and server',
        'It automatically rotates keys on all servers',
      ],
      correctAnswer: 1,
      explanation: 'verifyKeyServers ensures the SDK validates that key server objects are legitimate Seal network participants before sending decryption requests. This prevents man-in-the-middle attacks from rogue servers.',
      weaknessTopic: 'encryption',
      practiceHint: 'Think about what could go wrong if you accepted partial decryptions from unverified servers.',
    },
    {
      question: 'What happens to old messages after a key rotation?',
      options: [
        'They become permanently unreadable',
        'They are automatically re-encrypted with the new key',
        'They remain decryptable because key servers retain historical key shares',
        'They are deleted from the blockchain',
      ],
      correctAnswer: 2,
      explanation: 'Old messages remain decryptable after key rotation because the key servers retain historical key shares. This provides backward compatibility -- authorized users can still read the message history.',
      weaknessTopic: 'encryption',
      practiceHint: 'Seal supports key versioning. Old shares are not destroyed when new keys are generated.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import { SealClient, SealSessionKey } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const SUI_RPC_URL = 'https://fullnode.testnet.sui.io';
const PACKAGE_ID = '0xYOUR_MESSAGING_PACKAGE';
const KEY_SERVER_IDS = [
  '0xSEAL_KEY_SERVER_1',
  '0xSEAL_KEY_SERVER_2',
  '0xSEAL_KEY_SERVER_3',
];

// TODO 1: Initialize SuiClient and SealClient
// - Create a SuiClient pointing to SUI_RPC_URL
// - Create a SealClient with:
//   - The SuiClient instance
//   - serverObjectIds from KEY_SERVER_IDS
//   - verifyKeyServers set to true

// TODO 2: Create a function to encrypt a message for a channel
// - Function: encryptMessage(channelPolicyId: string, plaintext: string)
// - Encode the plaintext to Uint8Array using TextEncoder
// - Use sealClient.encrypt() with threshold: 2, the packageId, the channelPolicyId as id, and the encoded data
// - Return the encrypted bytes

// TODO 3: Create a session key for decryption
// - Function: createSessionKey(userAddress: string)
// - Use SealSessionKey.create() with the user address, packageId, ttlMin of 10, and suiClient
// - Return the session key

// TODO 4: Create a function to decrypt a message
// - Function: decryptMessage(encryptedData: Uint8Array, sessionKey: any, txBytes: Uint8Array)
// - Use sealClient.decrypt() with the data, sessionKey, and txBytes
// - Decode the result with TextDecoder and return the string

// TODO 5: Implement key rotation for a channel
// - Function: rotateChannelKey(channelId: string, newEpoch: number, adminKeypair: any)
// - Create a new Transaction
// - Add a moveCall to \`\${PACKAGE_ID}::channel::rotate_key\` with channelId and newEpoch as arguments
// - Execute the transaction with suiClient.signAndExecuteTransaction using the adminKeypair
// - Return the transaction result`,

  solution: `import { SealClient, SealSessionKey } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const SUI_RPC_URL = 'https://fullnode.testnet.sui.io';
const PACKAGE_ID = '0xYOUR_MESSAGING_PACKAGE';
const KEY_SERVER_IDS = [
  '0xSEAL_KEY_SERVER_1',
  '0xSEAL_KEY_SERVER_2',
  '0xSEAL_KEY_SERVER_3',
];

// 1: Initialize SuiClient and SealClient
const suiClient = new SuiClient({ url: SUI_RPC_URL });

const sealClient = new SealClient({
  suiClient,
  serverObjectIds: KEY_SERVER_IDS,
  verifyKeyServers: true,
});

// 2: Encrypt a message for a channel
async function encryptMessage(channelPolicyId: string, plaintext: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(plaintext);

  const encrypted = await sealClient.encrypt({
    threshold: 2,
    packageId: PACKAGE_ID,
    id: channelPolicyId,
    data,
  });

  return encrypted;
}

// 3: Create a session key for decryption
async function createSessionKey(userAddress: string) {
  const sessionKey = await SealSessionKey.create({
    address: userAddress,
    packageId: PACKAGE_ID,
    ttlMin: 10,
    suiClient,
  });

  return sessionKey;
}

// 4: Decrypt a message
async function decryptMessage(
  encryptedData: Uint8Array,
  sessionKey: any,
  txBytes: Uint8Array
): Promise<string> {
  const decrypted = await sealClient.decrypt({
    data: encryptedData,
    sessionKey,
    txBytes,
  });

  return new TextDecoder().decode(decrypted);
}

// 5: Key rotation for a channel
async function rotateChannelKey(
  channelId: string,
  newEpoch: number,
  adminKeypair: any
) {
  const tx = new Transaction();
  tx.moveCall({
    target: \`\${PACKAGE_ID}::channel::rotate_key\`,
    arguments: [
      tx.object(channelId),
      tx.pure.u64(newEpoch),
    ],
  });

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: adminKeypair,
  });

  return result;
}`,

  hints: [
    "Start with TODO 1: Create SuiClient with `new SuiClient({ url: SUI_RPC_URL })` and SealClient with the suiClient, serverObjectIds, and verifyKeyServers options.",
    "For TODO 2: Use `new TextEncoder().encode(plaintext)` to convert the string, then pass threshold, packageId, id (the channelPolicyId), and data to sealClient.encrypt().",
    "For TODO 3: SealSessionKey.create() needs address, packageId, ttlMin, and suiClient. The ttlMin should be 10 as specified.",
    "For TODO 4: sealClient.decrypt() takes an object with data, sessionKey, and txBytes. Decode the result with `new TextDecoder().decode(decrypted)`.",
    "For TODO 5: Create a Transaction, add a moveCall targeting `${PACKAGE_ID}::channel::rotate_key`, pass tx.object(channelId) and tx.pure.u64(newEpoch) as arguments, then sign and execute.",
  ],
};
