import { LessonContent } from '../types/lesson';

export const msgLesson1: LessonContent = {
  id: 'msg-1',
  title: 'On-Chain Messaging on Sui',
  description: 'Learn why decentralized messaging matters, see how the @mysten/messaging SDK works in code, and build your first message flow.',
  difficulty: 'beginner',
  xpReward: 100,
  order: 1,
  language: 'typescript',
  prerequisiteLessons: [],

  narrative: {
    welcomeMessage: "Welcome to Sui Messaging! You're about to learn how to build encrypted, decentralized messaging on the Sui blockchain. We'll go from 'why' to working code in this lesson.",
    quizTransition: "Great foundation! Let's test your understanding of on-chain messaging concepts...",
    practiceTransition: "Now let's write a real message flow — encrypting, storing, and sending a message end-to-end!",
    celebrationMessage: "Excellent! You understand both the architecture and the code behind on-chain messaging on Sui!",
  },

  teachingSections: [
    {
      sectionTitle: 'Why On-Chain Messaging',
      slides: [
        {
          title: 'The Problem with Centralized Messaging',
          emoji: '🔒',
          content: "Traditional messaging platforms like WhatsApp and Discord rely on centralized servers. A single company controls your data and can censor or ban you. If they shut down, your message history vanishes. On-chain messaging eliminates this by storing messages as blockchain objects that you own. Let's see what this looks like architecturally.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Censorship Risk", content: "Centralized platforms can delete messages, ban users, or comply with government censorship. On-chain messages, once committed, cannot be removed by any single entity." },
                { label: "Data Ownership", content: "On centralized platforms the company owns your data. With Sui messaging, channels and messages are Sui objects YOU own." },
                { label: "Single Point of Failure", content: "If the server goes down, everything is lost. Sui is maintained by hundreds of validators — no single point of failure." },
              ]
            }
          }
        },
        {
          title: 'The Sui Messaging Architecture',
          emoji: '🏗️',
          content: "Sui messaging uses three layers working together. The Sui blockchain stores channel metadata and message references as objects. The Seal protocol encrypts messages so only channel members can read them. Walrus (Sui's decentralized storage) holds the actual encrypted message blobs. Only a tiny blob ID is stored on-chain, keeping gas costs low. Here's how a message flows through all three layers:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// The three layers of Sui messaging:\n\n// Layer 1: Sui Blockchain — channels & references\nconst channel = await messagingClient.createChannel({\n  name: 'my-channel',\n  members: ['0xAlice', '0xBob'],\n});\n\n// Layer 2: Seal Protocol — encryption\nconst encrypted = await sealClient.encrypt({\n  data: new TextEncoder().encode('Hello!'),\n  policyId: channel.policyId,\n});\n\n// Layer 3: Walrus — decentralized blob storage\nconst { blobId } = await walrusClient.store({\n  data: encrypted,\n  epochs: 5,\n});`,
              highlights: [
                { line: 4, explanation: "Channel is a Sui object with a unique ID, member list, and encryption policy." },
                { line: 10, explanation: "Seal encrypts data using a channel-specific policy so only members can decrypt." },
                { line: 12, explanation: "The policyId ties encryption to this specific channel's member list." },
                { line: 16, explanation: "Walrus stores the encrypted blob and returns a blobId reference." },
                { line: 18, explanation: "Epochs control how long data is stored. Only the blobId goes on-chain." },
              ]
            }
          }
        },
        {
          title: 'How the Layers Connect',
          emoji: '🔗',
          content: "Each layer has a specific role: Sui handles ownership and access control, Seal handles privacy, and Walrus handles storage. The @mysten/messaging SDK ties them all together through a single MessagingClient. When you call sendMessage(), the SDK automatically encrypts with Seal, stores on Walrus, and records the reference on Sui. Match each component to its role:",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'sui', label: 'Sui Blockchain', emoji: '🔗' },
                { id: 'seal', label: 'Seal Protocol', emoji: '🔐' },
                { id: 'walrus', label: 'Walrus Storage', emoji: '🐘' },
                { id: 'sdk', label: 'MessagingClient', emoji: '💬' }
              ],
              targets: [
                { id: 'ownership', label: 'Channel objects, membership, blob ID references' },
                { id: 'encryption', label: 'Threshold encryption so only members can read' },
                { id: 'storage', label: 'Stores encrypted message blobs off-chain' },
                { id: 'orchestrate', label: 'Orchestrates all three layers in one API' }
              ],
              correctPairs: [
                { itemId: 'sui', targetId: 'ownership' },
                { itemId: 'seal', targetId: 'encryption' },
                { itemId: 'walrus', targetId: 'storage' },
                { itemId: 'sdk', targetId: 'orchestrate' }
              ]
            }
          }
        },
      ],
      exerciseId: 'mc-msg-001',
    },
    {
      sectionTitle: 'Channels and Messages',
      slides: [
        {
          title: 'Channels: Your Messaging Rooms',
          emoji: '📡',
          content: "A channel is a Sui object that represents a conversation. It stores member addresses, an encryption policy, and metadata. Channels can be direct messages (2 members) or group chats (many members). The channel object controls who can send, read, and decrypt messages. Let's see how to create one:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Creating a direct message channel\nconst dmChannel = await messagingClient.createChannel({\n  name: 'alice-bob-dm',\n  members: ['0xAlice', '0xBob'],\n});\n\nconsole.log('Channel ID:', dmChannel.id);\nconsole.log('Policy ID:', dmChannel.policyId);\n\n// Creating a group channel\nconst groupChannel = await messagingClient.createChannel({\n  name: 'dev-team',\n  members: ['0xAlice', '0xBob', '0xCharlie'],\n});\n\n// List your channels\nconst myChannels = await messagingClient.getChannels();`,
              highlights: [
                { line: 2, explanation: "createChannel creates a Sui object and a Seal encryption policy in one transaction." },
                { line: 4, explanation: "Members are specified by their Sui wallet addresses." },
                { line: 7, explanation: "channel.id is the Sui object ID — use it to reference this channel later." },
                { line: 8, explanation: "channel.policyId is the Seal policy that controls who can encrypt/decrypt." },
                { line: 17, explanation: "getChannels returns all channels where the current user is a member." },
              ]
            }
          }
        },
        {
          title: 'Sending a Message',
          emoji: '✉️',
          content: "Sending a message is a three-step process that the SDK handles for you: encrypt the content with Seal, store the encrypted blob on Walrus, and record the blob reference on-chain. The sendMessage method takes a channel ID and your plaintext content, then performs all three steps atomically. Here's the complete flow:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Send a text message to a channel\nconst message = await messagingClient.sendMessage({\n  channelId: dmChannel.id,\n  content: {\n    type: 'text',\n    text: 'Hello from Sui!',\n  },\n});\n\nconsole.log('Message sent!');\nconsole.log('Blob ID:', message.blobId);  // Walrus reference\nconsole.log('Tx digest:', message.digest); // Sui transaction\n\n// What happened behind the scenes:\n// 1. SDK called sealClient.encrypt() with channel policy\n// 2. SDK called walrusClient.store() with encrypted data\n// 3. SDK submitted a Sui transaction with the blobId`,
              highlights: [
                { line: 2, explanation: "sendMessage handles encrypt → store → record in one call." },
                { line: 3, explanation: "channelId identifies which channel (and encryption policy) to use." },
                { line: 5, explanation: "Content type can be 'text', 'image', or 'file' — SDK handles each." },
                { line: 11, explanation: "The blobId points to the encrypted data on Walrus." },
                { line: 12, explanation: "The transaction digest proves the message was committed to Sui." },
              ]
            }
          }
        },
        {
          title: 'Reading Messages',
          emoji: '📖',
          content: "Reading messages reverses the flow: fetch blob references from Sui, retrieve encrypted blobs from Walrus, and decrypt with Seal. Again, the SDK handles this. getMessages returns decrypted plaintext for all messages you're authorized to read. If you're not a member of the channel, decryption will fail — this is the Seal guarantee.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Read all messages from a channel\nconst messages = await messagingClient.getMessages({\n  channelId: dmChannel.id,\n});\n\n// Each message is already decrypted\nfor (const msg of messages) {\n  console.log(\`[\${msg.sender}]: \${msg.content.text}\`);\n  console.log(\`  Sent at: \${msg.timestamp}\`);\n}\n\n// Behind the scenes:\n// 1. SDK fetched message references from Sui\n// 2. SDK retrieved encrypted blobs from Walrus\n// 3. SDK decrypted each blob using Seal\n// 4. Only channel members can decrypt successfully`,
              highlights: [
                { line: 2, explanation: "getMessages fetches, decrypts, and returns all messages in the channel." },
                { line: 8, explanation: "Messages include sender address, decrypted content, and timestamp." },
                { line: 16, explanation: "Non-members calling getMessages would get a Seal decryption error." },
              ]
            }
          }
        },
      ],
      exerciseId: 'cc-msg-002',
    },
    {
      sectionTitle: 'SDK Setup',
      slides: [
        {
          title: 'Installing the SDK',
          emoji: '📦',
          content: "The messaging SDK has four packages: @mysten/messaging (the main client), @mysten/sui (blockchain interactions), @mysten/seal (encryption), and @mysten/walrus (storage). You install all four, then create each client and combine them into a MessagingClient. Let's walk through the complete setup:",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// npm install @mysten/messaging @mysten/sui @mysten/seal @mysten/walrus\n\nimport { MessagingClient } from '@mysten/messaging';\nimport { SuiClient, getFullnodeUrl } from '@mysten/sui/client';\nimport { SealClient } from '@mysten/seal';\nimport { WalrusClient } from '@mysten/walrus';\n\n// Step 1: Connect to Sui\nconst suiClient = new SuiClient({\n  url: getFullnodeUrl('testnet'),\n});\n\n// Step 2: Set up encryption\nconst sealClient = new SealClient({\n  suiClient,\n  serverObjectId: SEAL_SERVER_ID,\n});\n\n// Step 3: Set up storage\nconst walrusClient = new WalrusClient({\n  network: 'testnet',\n  suiClient,\n});\n\n// Step 4: Create the messaging client\nconst messagingClient = new MessagingClient({\n  suiClient, sealClient, walrusClient,\n  userAddress: wallet.address,\n});`,
              highlights: [
                { line: 3, explanation: "MessagingClient is the main entry point — it orchestrates all operations." },
                { line: 4, explanation: "SuiClient + getFullnodeUrl connect you to a Sui network." },
                { line: 9, explanation: "Each client builds on the previous: SealClient needs suiClient." },
                { line: 16, explanation: "Server object ID identifies the Seal key server for your network." },
                { line: 26, explanation: "MessagingClient combines all three clients into one unified API." },
              ]
            }
          }
        },
        {
          title: 'Client Dependencies',
          emoji: '🧩',
          content: "Each client has a specific responsibility. SuiClient reads blockchain state and submits transactions. SealClient manages threshold encryption keys — it splits the encryption key across multiple servers so no single server can decrypt alone. WalrusClient stores and retrieves encrypted data blobs using erasure coding for durability. MessagingClient ties them together. Match each client to what it does:",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'suiclient', label: 'SuiClient', emoji: '🔗' },
                { id: 'sealclient', label: 'SealClient', emoji: '🔐' },
                { id: 'walrusclient', label: 'WalrusClient', emoji: '🐘' },
                { id: 'messagingclient', label: 'MessagingClient', emoji: '💬' }
              ],
              targets: [
                { id: 'blockchain', label: 'Read objects, submit transactions to Sui' },
                { id: 'encrypt', label: 'Threshold encrypt/decrypt with key servers' },
                { id: 'blobs', label: 'Store and retrieve encrypted data blobs' },
                { id: 'orchestrate', label: 'Unified API for channels and messages' }
              ],
              correctPairs: [
                { itemId: 'suiclient', targetId: 'blockchain' },
                { itemId: 'sealclient', targetId: 'encrypt' },
                { itemId: 'walrusclient', targetId: 'blobs' },
                { itemId: 'messagingclient', targetId: 'orchestrate' }
              ]
            }
          }
        },
      ],
      exerciseId: 'mc-msg-003',
    },
  ],

  quiz: [
    {
      question: 'Why are encrypted message payloads stored on Walrus instead of directly on the Sui blockchain?',
      options: [
        'Walrus is faster than Sui for data transfer',
        'Storing large data on-chain is prohibitively expensive — Walrus stores blobs cheaply while Sui holds only a small reference',
        'Sui does not support storing any binary data',
        'Walrus provides better encryption than Seal',
      ],
      correctAnswer: 1,
      explanation: 'Storing large data directly on-chain would be extremely expensive in gas fees. Instead, only a small blob ID reference (a few bytes) is stored on Sui, while the actual encrypted payload lives on Walrus. This keeps messaging affordable while maintaining decentralization.',
      weaknessTopic: 'messaging-concepts',
      practiceHint: 'Think about the cost of storing 1KB vs 32 bytes on a blockchain.',
    },
    {
      question: 'What happens behind the scenes when you call messagingClient.sendMessage()?',
      options: [
        'The message is stored directly on the Sui blockchain in plaintext',
        'The SDK encrypts with Seal, stores on Walrus, and records the blob reference on Sui',
        'The message is sent to a centralized Mysten Labs server',
        'The SDK compresses the message and stores it in the user\'s wallet',
      ],
      correctAnswer: 1,
      explanation: 'sendMessage performs three steps: (1) encrypts the content using Seal with the channel\'s policy, (2) stores the encrypted blob on Walrus, and (3) records the blob ID on the Sui blockchain. This three-layer approach provides privacy, efficient storage, and blockchain-verified delivery.',
      weaknessTopic: 'messaging-concepts',
      practiceHint: 'Remember the three layers: encrypt → store → record.',
    },
    {
      question: 'What is the role of the policyId returned when creating a channel?',
      options: [
        'It is the channel\'s display name on the frontend',
        'It identifies the Seal encryption policy that controls who can encrypt and decrypt messages in that channel',
        'It is the transaction hash of the channel creation',
        'It is the Walrus storage location for channel metadata',
      ],
      correctAnswer: 1,
      explanation: 'The policyId is a Seal encryption policy object on Sui. It defines which wallet addresses (channel members) are authorized to encrypt and decrypt messages. When members change, the policy must be updated to grant or revoke access.',
      weaknessTopic: 'messaging-concepts',
      practiceHint: 'Think about what connects channel membership to encryption access.',
    },
    {
      question: 'What would happen if a non-member tried to call getMessages() for a channel they don\'t belong to?',
      options: [
        'They would see the messages in plaintext',
        'They would see encrypted gibberish',
        'The Seal decryption would fail because they lack the key shares',
        'The Sui blockchain would block the read request',
      ],
      correctAnswer: 2,
      explanation: 'Seal\'s threshold encryption ensures only authorized members (listed in the channel policy) can decrypt. A non-member can fetch the encrypted blobs from Walrus, but Seal key servers will refuse to provide decryption shares because the user isn\'t in the policy.',
      weaknessTopic: 'messaging-concepts',
      practiceHint: 'Think about what Seal checks before allowing decryption.',
    },
    {
      question: 'Which three client dependencies does MessagingClient require?',
      options: [
        'SuiClient, SealClient, and WalrusClient',
        'SuiClient, WebSocket, and HTTPClient',
        'GraphQLClient, SealClient, and IPFSClient',
        'SuiClient, FirebaseClient, and WalrusClient',
      ],
      correctAnswer: 0,
      explanation: 'MessagingClient orchestrates three clients: SuiClient for blockchain interactions, SealClient for threshold encryption, and WalrusClient for decentralized blob storage. Each must be configured for the same network.',
      weaknessTopic: 'sdk-setup',
      practiceHint: 'Think about the three layers: blockchain, encryption, and storage.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `// msg-lesson1: Build a Complete Message Flow
// ============================================
// In this exercise you'll write the core functions for
// creating a channel, sending a message, and reading messages.

import { MessagingClient } from '@mysten/messaging';

// Assume messagingClient is already configured and available.
declare const messagingClient: MessagingClient;

// TODO 1: Write an async function called "createDirectChannel"
// that takes two parameters: myAddress (string) and friendAddress (string)
// It should call messagingClient.createChannel() with:
//   - name: 'dm-channel'
//   - members: [myAddress, friendAddress]
// Return the channel object.


// TODO 2: Write an async function called "sendTextMessage"
// that takes two parameters: channelId (string) and text (string)
// It should call messagingClient.sendMessage() with:
//   - channelId: channelId
//   - content: { type: 'text', text: text }
// Return the message object (which includes blobId and digest).


// TODO 3: Write an async function called "readChannelMessages"
// that takes one parameter: channelId (string)
// It should call messagingClient.getMessages({ channelId })
// Then loop through each message and build an array of strings
// in the format: "[sender]: text"
// Return the array of formatted strings.


// TODO 4: Write an async function called "fullDemo"
// that ties it all together:
//   1. Create a DM channel between '0xAlice' and '0xBob'
//   2. Send the message "Hello from Sui!" to that channel
//   3. Read all messages from the channel
//   4. Return the formatted messages array
`,

  solution: `// msg-lesson1: Build a Complete Message Flow
// ============================================
// In this exercise you'll write the core functions for
// creating a channel, sending a message, and reading messages.

import { MessagingClient } from '@mysten/messaging';

// Assume messagingClient is already configured and available.
declare const messagingClient: MessagingClient;

// TODO 1: Write an async function called "createDirectChannel"
// that takes two parameters: myAddress (string) and friendAddress (string)
// It should call messagingClient.createChannel() with:
//   - name: 'dm-channel'
//   - members: [myAddress, friendAddress]
// Return the channel object.
async function createDirectChannel(myAddress: string, friendAddress: string) {
  const channel = await messagingClient.createChannel({
    name: 'dm-channel',
    members: [myAddress, friendAddress],
  });
  return channel;
}

// TODO 2: Write an async function called "sendTextMessage"
// that takes two parameters: channelId (string) and text (string)
// It should call messagingClient.sendMessage() with:
//   - channelId: channelId
//   - content: { type: 'text', text: text }
// Return the message object (which includes blobId and digest).
async function sendTextMessage(channelId: string, text: string) {
  const message = await messagingClient.sendMessage({
    channelId,
    content: { type: 'text', text },
  });
  return message;
}

// TODO 3: Write an async function called "readChannelMessages"
// that takes one parameter: channelId (string)
// It should call messagingClient.getMessages({ channelId })
// Then loop through each message and build an array of strings
// in the format: "[sender]: text"
// Return the array of formatted strings.
async function readChannelMessages(channelId: string) {
  const messages = await messagingClient.getMessages({ channelId });
  const formatted = messages.map(
    (msg: any) => \`[\${msg.sender}]: \${msg.content.text}\`
  );
  return formatted;
}

// TODO 4: Write an async function called "fullDemo"
// that ties it all together:
//   1. Create a DM channel between '0xAlice' and '0xBob'
//   2. Send the message "Hello from Sui!" to that channel
//   3. Read all messages from the channel
//   4. Return the formatted messages array
async function fullDemo() {
  const channel = await createDirectChannel('0xAlice', '0xBob');
  await sendTextMessage(channel.id, 'Hello from Sui!');
  const messages = await readChannelMessages(channel.id);
  return messages;
}
`,

  hints: [
    "Each function is async because it calls the messaging SDK which interacts with the blockchain.",
    "createDirectChannel calls messagingClient.createChannel() with a name and members array.",
    "sendTextMessage calls messagingClient.sendMessage() with channelId and a content object containing type and text.",
    "readChannelMessages calls messagingClient.getMessages(), then uses .map() to format each message as '[sender]: text'.",
    "fullDemo chains the three functions together: create channel → send message → read messages.",
  ],
};
