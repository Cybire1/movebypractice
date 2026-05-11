import { LessonContent } from '../types/lesson';

export const msgLesson2: LessonContent = {
  id: 'msg-2',
  title: 'Setting Up the Messaging Client',
  description: 'Configure SuiClient, SealClient, and WalrusClient step by step and verify your connection to the network.',
  difficulty: 'beginner',
  xpReward: 150,
  order: 2,
  language: 'typescript',
  prerequisiteLessons: ['msg-1'],

  narrative: {
    welcomeMessage: "Time to set up your messaging toolkit! We'll configure each client piece by piece, verify the connection, and build a reusable setup function.",
    quizTransition: "Let's test your understanding of client configuration...",
    practiceTransition: "Now build a complete messaging client with error handling and connection verification!",
    celebrationMessage: "Your messaging client is ready to go! You've mastered the full setup process.",
  },

  teachingSections: [
    {
      sectionTitle: 'SuiClient Configuration',
      slides: [
        {
          title: 'Connecting to the Sui Network',
          emoji: '🔗',
          content: "The SuiClient is your gateway to the Sui blockchain. It handles reading objects, querying events, and submitting transactions. You create one by providing a fullnode URL. The SDK includes getFullnodeUrl() to get the correct URL for any network. Let's set it up and verify the connection:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';\n\n// Create a client connected to testnet\nconst suiClient = new SuiClient({\n  url: getFullnodeUrl('testnet'),\n});\n\n// Verify the connection works\nconst gasPrice = await suiClient.getReferenceGasPrice();\nconsole.log('Connected! Gas price:', gasPrice);\n\n// Read an object from the chain\nconst obj = await suiClient.getObject({\n  id: '0xSOME_OBJECT_ID',\n  options: { showContent: true },\n});`,
              highlights: [
                { line: 1, explanation: "Import both SuiClient and the getFullnodeUrl helper from @mysten/sui/client." },
                { line: 4, explanation: "SuiClient takes an options object with a 'url' property pointing to a Sui fullnode." },
                { line: 5, explanation: "getFullnodeUrl('testnet') returns the official Sui testnet RPC endpoint." },
                { line: 9, explanation: "getReferenceGasPrice() is a lightweight call to confirm the connection works." },
                { line: 13, explanation: "getObject reads any Sui object by ID — you'll use this to read channels and messages." },
              ]
            }
          }
        },
        {
          title: 'Choosing Your Network',
          emoji: '🌐',
          content: "Sui has four networks: devnet (experimental, resets often), testnet (stable testing with free faucet tokens), mainnet (live production with real assets), and localnet (local node for offline development). Start with testnet for learning — it has free tokens and a stable environment. Match each network to its purpose:",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'devnet', label: 'devnet', emoji: '🧪' },
                { id: 'testnet', label: 'testnet', emoji: '🔬' },
                { id: 'mainnet', label: 'mainnet', emoji: '🚀' },
                { id: 'localnet', label: 'localnet', emoji: '💻' }
              ],
              targets: [
                { id: 'early', label: 'Experimental (resets frequently)' },
                { id: 'stable', label: 'Stable testing with faucet tokens' },
                { id: 'production', label: 'Live production with real assets' },
                { id: 'offline', label: 'Local offline development' }
              ],
              correctPairs: [
                { itemId: 'devnet', targetId: 'early' },
                { itemId: 'testnet', targetId: 'stable' },
                { itemId: 'mainnet', targetId: 'production' },
                { itemId: 'localnet', targetId: 'offline' }
              ]
            }
          }
        },
      ],
      exerciseId: 'cc-msg-004',
    },
    {
      sectionTitle: 'Seal and Walrus Configuration',
      slides: [
        {
          title: 'Setting Up SealClient',
          emoji: '🔐',
          content: "SealClient handles threshold encryption. It connects to Seal key servers that split encryption keys across multiple validators — at least t-of-n must cooperate to decrypt, so no single server can read your messages. To create one, you pass your SuiClient plus a server object ID that identifies which Seal deployment to use. The server ID differs between testnet and mainnet.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SealClient } from '@mysten/seal';\n\n// Server object IDs are network-specific\nconst SEAL_TESTNET_SERVER = '0x...';\n\nconst sealClient = new SealClient({\n  suiClient,            // reuse our SuiClient\n  serverObjectId: SEAL_TESTNET_SERVER,\n});\n\n// How threshold encryption works:\n// 1. Seal splits the key into n shares across key servers\n// 2. At least t shares are needed to decrypt\n// 3. No single server can decrypt alone\n// 4. Compromising 1 server doesn't break encryption`,
              highlights: [
                { line: 6, explanation: "SealClient needs suiClient (to read policies on-chain) and a server object ID." },
                { line: 7, explanation: "Reuse the same SuiClient instance — don't create a new one." },
                { line: 8, explanation: "Each network has its own Seal server deployment with a unique object ID." },
                { line: 12, explanation: "Threshold encryption (t-of-n) means multiple servers must cooperate to decrypt." },
              ]
            }
          }
        },
        {
          title: 'Setting Up WalrusClient',
          emoji: '🐘',
          content: "WalrusClient stores and retrieves encrypted message blobs. It connects to Walrus aggregator and publisher nodes. The simplest setup only needs a network name and your suiClient — Walrus auto-discovers the correct endpoints. For production apps, you can specify custom URLs.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { WalrusClient } from '@mysten/walrus';\n\n// Simple setup — auto-discovers endpoints\nconst walrusClient = new WalrusClient({\n  network: 'testnet',\n  suiClient,\n});\n\n// Store encrypted data\nconst { blobId } = await walrusClient.store({\n  data: encryptedPayload,\n  deletable: true,   // owner can delete later\n  epochs: 5,         // stored for 5 epochs\n});\n\n// Retrieve by blob ID\nconst data = await walrusClient.read({ blobId });`,
              highlights: [
                { line: 4, explanation: "WalrusClient auto-discovers aggregator/publisher URLs for your network." },
                { line: 5, explanation: "Network must match your SuiClient — don't mix testnet and mainnet." },
                { line: 10, explanation: "store() takes encrypted data and returns a blobId reference." },
                { line: 12, explanation: "Deletable blobs can be removed by the owner; non-deletable are permanent." },
                { line: 17, explanation: "read() retrieves the stored blob using the blobId from store()." },
              ]
            }
          }
        },
      ],
      exerciseId: 'op-msg-005',
    },
    {
      sectionTitle: 'The Complete Setup',
      slides: [
        {
          title: 'Assembling the MessagingClient',
          emoji: '💬',
          content: "Now combine all three clients into a MessagingClient. The constructor takes all three plus the current user's wallet address. Once created, this single client provides the full API: createChannel, sendMessage, getMessages, addMember, and more. All encryption and storage happens automatically.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { MessagingClient } from '@mysten/messaging';\n\n// Combine all clients into one\nconst messagingClient = new MessagingClient({\n  suiClient,       // Step 1: blockchain\n  sealClient,      // Step 2: encryption\n  walrusClient,    // Step 3: storage\n  userAddress: wallet.address,\n});\n\n// Now you can use the unified API:\nconst channel = await messagingClient.createChannel({\n  name: 'team-chat',\n  members: ['0xAlice', '0xBob'],\n});\n\nawait messagingClient.sendMessage({\n  channelId: channel.id,\n  content: { type: 'text', text: 'Setup complete!' },\n});`,
              highlights: [
                { line: 4, explanation: "MessagingClient is the single entry point — pass all three clients." },
                { line: 8, explanation: "userAddress identifies who is sending messages and determines decryption access." },
                { line: 12, explanation: "createChannel creates a Sui object and Seal policy in one transaction." },
                { line: 17, explanation: "sendMessage encrypts, stores, and records — all in one call." },
              ]
            }
          }
        },
        {
          title: 'Configuration Best Practices',
          emoji: '📋',
          content: "Follow these practices when configuring your messaging client: match the network across all clients, create client instances once and reuse them via React context, store network-specific constants in environment variables, and always handle connection errors. Here's a production-ready setup pattern:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Production-ready setup with error handling\nexport async function createMessagingClient(\n  network: 'testnet' | 'mainnet',\n  userAddress: string,\n  sealServerId: string,\n) {\n  const suiClient = new SuiClient({\n    url: getFullnodeUrl(network),\n  });\n\n  // Verify connection before proceeding\n  try {\n    await suiClient.getReferenceGasPrice();\n  } catch (error) {\n    throw new Error(\`Failed to connect to \${network}\`);\n  }\n\n  const sealClient = new SealClient({\n    suiClient,\n    serverObjectId: sealServerId,\n  });\n\n  const walrusClient = new WalrusClient({\n    network,\n    suiClient,\n  });\n\n  return new MessagingClient({\n    suiClient, sealClient, walrusClient,\n    userAddress,\n  });\n}`,
              highlights: [
                { line: 3, explanation: "Accept network as a typed parameter — prevents mixing networks." },
                { line: 12, explanation: "Verify the connection before creating dependent clients." },
                { line: 15, explanation: "Fail fast with a clear error message if the network is unreachable." },
                { line: 28, explanation: "Return the fully-configured client ready for use." },
              ]
            }
          }
        },
        {
          title: 'React Context Pattern',
          emoji: '⚛️',
          content: "In React apps, initialize clients once in a context provider so all components can access them. This avoids creating redundant connections and ensures consistent configuration. Here's how to expose the messaging client via React context:",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Why Context?", content: "Creating client instances in every component wastes connections and can cause inconsistent state. Context provides a single shared instance." },
                { label: "When to Initialize", content: "Create the MessagingClient when the user connects their wallet (you need their address). Store it in context state." },
                { label: "Error Boundaries", content: "Wrap the provider in an error boundary to handle network failures gracefully without crashing the whole app." },
                { label: "Network Switching", content: "If you support switching networks (testnet ↔ mainnet), recreate all clients when the network changes. Don't reuse a testnet SuiClient with a mainnet SealClient." }
              ]
            }
          }
        },
      ],
      exerciseId: 'mc-msg-006',
    },
  ],

  quiz: [
    {
      question: 'Why does SealClient need a suiClient instance passed to it?',
      options: [
        'To store encryption keys on the Sui blockchain',
        'To read encryption policies from on-chain Seal objects and verify membership',
        'To pay gas fees for encryption operations',
        'To generate random numbers for key generation',
      ],
      correctAnswer: 1,
      explanation: 'SealClient uses the suiClient to read encryption policy objects stored on Sui. These policies define which wallet addresses are authorized to decrypt. Without suiClient, Seal cannot verify if a user is a channel member.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about where the "who can decrypt" rules are stored.',
    },
    {
      question: 'What would happen if you used a testnet SuiClient but a mainnet Seal server object ID?',
      options: [
        'The setup would work but messages would be slower',
        'SealClient would fail because the server object ID doesn\'t exist on testnet',
        'Messages would be sent to both networks simultaneously',
        'The compiler would catch the mismatch at build time',
      ],
      correctAnswer: 1,
      explanation: 'Each network has its own set of deployed objects. A mainnet Seal server object ID doesn\'t exist on testnet, so SealClient would fail when trying to read it. Always match network across all clients.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about what happens when you try to read a Sui object that doesn\'t exist.',
    },
    {
      question: 'What is the advantage of verifying the connection with getReferenceGasPrice() before creating the full client?',
      options: [
        'It makes subsequent operations faster',
        'It lets you fail fast with a clear error instead of cryptic failures later during messaging operations',
        'It is required by the Sui protocol before any other calls',
        'It caches the gas price so you don\'t pay gas later',
      ],
      correctAnswer: 1,
      explanation: 'Verifying the connection early means you get a clear "cannot connect" error immediately, rather than a confusing error later when trying to create a channel or send a message. This is the fail-fast principle.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about debugging: where would you rather find out about a connection problem?',
    },
    {
      question: 'Why should you create client instances once and share them via React context, rather than creating new instances in each component?',
      options: [
        'React does not allow creating objects inside components',
        'Each client instance opens a network connection; multiple instances waste resources and can cause inconsistent state',
        'The SDK license limits you to one instance per app',
        'React context is faster than local state',
      ],
      correctAnswer: 1,
      explanation: 'Each SuiClient, SealClient, and WalrusClient instance opens network connections. Creating redundant instances wastes resources and can lead to inconsistent state if different components use different configurations.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about what happens if Component A and Component B each create their own SuiClient.',
    },
    {
      question: 'When should you recreate the MessagingClient in a React app?',
      options: [
        'Every time the user opens a new channel',
        'On every page navigation',
        'When the user switches wallets or networks — the userAddress or network has changed',
        'Never — once created it works forever',
      ],
      correctAnswer: 2,
      explanation: 'The MessagingClient is configured with a specific userAddress and network. If the user connects a different wallet or switches from testnet to mainnet, you must recreate all clients with the new configuration.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about which MessagingClient constructor parameters can change during a session.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// msg-lesson2: Production-Ready Messaging Client Setup
// ====================================================

import { MessagingClient } from '@mysten/messaging';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SealClient } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';

// Configuration constants
const NETWORK = 'testnet';
const SEAL_SERVER_OBJECT_ID = '0xSEAL_SERVER_ID';

// TODO 1: Write an async function called "initSuiClient"
// that creates a SuiClient for the given network,
// verifies the connection using getReferenceGasPrice(),
// and returns the client. If the connection fails, throw
// an Error with message "Failed to connect to {network}".


// TODO 2: Write a function called "initSealClient"
// that takes a suiClient parameter and returns a new
// SealClient configured with that suiClient and
// SEAL_SERVER_OBJECT_ID.


// TODO 3: Write a function called "initWalrusClient"
// that takes a suiClient parameter and returns a new
// WalrusClient configured with NETWORK and suiClient.


// TODO 4: Write an async function called "createFullClient"
// that takes a userAddress (string) parameter and:
//   1. Calls initSuiClient() to get the sui client
//   2. Calls initSealClient() with the sui client
//   3. Calls initWalrusClient() with the sui client
//   4. Returns a new MessagingClient with all three + userAddress
// Wrap everything in try/catch and rethrow with context.


// TODO 5: Write a main async function called "demo"
// that calls createFullClient with '0xMY_ADDRESS',
// then creates a channel called 'test-channel' with
// members ['0xMY_ADDRESS', '0xFRIEND'],
// and logs the channel ID.
`,

  solution: `// msg-lesson2: Production-Ready Messaging Client Setup
// ====================================================

import { MessagingClient } from '@mysten/messaging';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SealClient } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';

// Configuration constants
const NETWORK = 'testnet';
const SEAL_SERVER_OBJECT_ID = '0xSEAL_SERVER_ID';

// TODO 1: Write an async function called "initSuiClient"
async function initSuiClient() {
  const suiClient = new SuiClient({
    url: getFullnodeUrl(NETWORK),
  });
  try {
    await suiClient.getReferenceGasPrice();
  } catch (error) {
    throw new Error(\`Failed to connect to \${NETWORK}\`);
  }
  return suiClient;
}

// TODO 2: Write a function called "initSealClient"
function initSealClient(suiClient: SuiClient) {
  return new SealClient({
    suiClient,
    serverObjectId: SEAL_SERVER_OBJECT_ID,
  });
}

// TODO 3: Write a function called "initWalrusClient"
function initWalrusClient(suiClient: SuiClient) {
  return new WalrusClient({
    network: NETWORK,
    suiClient,
  });
}

// TODO 4: Write an async function called "createFullClient"
async function createFullClient(userAddress: string) {
  try {
    const suiClient = await initSuiClient();
    const sealClient = initSealClient(suiClient);
    const walrusClient = initWalrusClient(suiClient);
    return new MessagingClient({
      suiClient,
      sealClient,
      walrusClient,
      userAddress,
    });
  } catch (error) {
    throw new Error(\`Messaging client setup failed: \${error}\`);
  }
}

// TODO 5: Write a main async function called "demo"
async function demo() {
  const client = await createFullClient('0xMY_ADDRESS');
  const channel = await client.createChannel({
    name: 'test-channel',
    members: ['0xMY_ADDRESS', '0xFRIEND'],
  });
  console.log('Channel created:', channel.id);
}
`,

  hints: [
    "initSuiClient creates a SuiClient with getFullnodeUrl(NETWORK), then calls getReferenceGasPrice() in a try/catch.",
    "initSealClient takes suiClient as a parameter and returns new SealClient({ suiClient, serverObjectId: SEAL_SERVER_OBJECT_ID }).",
    "initWalrusClient returns new WalrusClient({ network: NETWORK, suiClient }).",
    "createFullClient chains the three init functions, then creates MessagingClient with all clients + userAddress.",
    "demo() calls createFullClient, then uses the returned client to create a channel and log its ID.",
  ],
};
