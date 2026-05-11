import { LessonContent } from '../types/lesson';

export const msgLesson6: LessonContent = {
  id: 'msg-6',
  title: 'Walrus Storage & Attachments',
  description: 'Use Walrus decentralized storage to send file attachments through messaging channels.',
  difficulty: 'advanced',
  xpReward: 300,
  order: 6,
  language: 'typescript',
  prerequisiteLessons: ['msg-5'],

  narrative: {
    welcomeMessage: "Messages aren't just text! Let's add file attachments using Walrus decentralized storage.",
    quizTransition: "Let's check your understanding of Walrus storage integration...",
    practiceTransition: "Build the complete attachment upload/download pipeline!",
    celebrationMessage: "Full attachment support! Your messaging app can now handle files.",
  },

  teachingSections: [
    {
      sectionTitle: 'Walrus Decentralized Storage',
      slides: [
        {
          title: 'What is Walrus?',
          emoji: '🦭',
          content: "Walrus is Sui's decentralized storage layer for storing large blobs of data -- images, files, videos -- off-chain but with on-chain references. Unlike storing data directly in Move objects (expensive and size-limited), Walrus uses **erasure coding** to split files across storage nodes, providing redundancy and availability without replicating the full file everywhere. Each uploaded blob receives a unique **blobId** that you can reference from Sui objects.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Erasure Coding', content: 'Files are split into fragments and encoded with redundancy. Even if some storage nodes go offline, the file can be fully reconstructed from the remaining fragments.' },
                { label: 'BlobId', content: 'A content-addressed identifier for stored data. It is derived from the blob content, so identical files produce the same blobId.' },
                { label: 'On-Chain Reference', content: 'The blobId is small enough to store in a Sui Move object. Your message object stores the blobId, and the actual file lives on Walrus.' },
                { label: 'Cost Efficiency', content: 'Storing 1MB on-chain in Move costs significantly more than storing it on Walrus. Walrus is designed for bulk data at low cost.' },
              ],
            },
          },
        },
        {
          title: 'Content Addressing and Blob Storage',
          emoji: '📦',
          content: "Walrus uses **content addressing**: the blobId is a cryptographic hash of the file contents. This means (1) identical files have the same blobId (deduplication for free), (2) you can verify file integrity by re-hashing and comparing, and (3) blobIds are immutable references -- the data behind a blobId never changes. When you upload a file, Walrus returns a `blobId` and a `registeredEpoch` indicating when storage begins. Blobs are stored for a configurable number of epochs.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'Content Addressing', content: 'The blobId is derived from file contents. Upload the same image twice and you get the same blobId -- no duplication.' },
                { label: 'Immutability', content: 'Once uploaded, the data behind a blobId cannot change. This guarantees message attachments are tamper-proof.' },
                { label: 'Storage Duration', content: 'Blobs are stored for a specified number of epochs. You can extend storage by paying for more epochs before expiry.' },
                { label: 'Integrity Verification', content: 'Downloaders can hash the received data and compare with the blobId to verify nothing was corrupted or tampered with.' },
              ],
            },
          },
        },
        {
          title: 'WalrusClient Setup',
          emoji: '🔧',
          content: "The `@mysten/walrus` SDK provides `WalrusClient` for uploading and downloading blobs. Initialize it with an `aggregatorUrl` (for reading blobs) and a `publisherUrl` (for writing blobs). These URLs point to Walrus aggregator and publisher services. You also need a `SuiClient` for on-chain operations like registering blob metadata. Once configured, uploading is a single `store()` call and downloading is a single `read()` call.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { WalrusClient } from '@mysten/walrus';\nimport { SuiClient } from '@mysten/sui/client';\n\nconst suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });\n\nconst walrusClient = new WalrusClient({\n  network: 'testnet',\n  suiClient,\n});\n\n// The client is now ready for uploads and downloads\nconsole.log('WalrusClient initialized for testnet');`,
              highlights: [
                { line: 1, explanation: "Import WalrusClient from the @mysten/walrus package" },
                { line: 6, explanation: "Create a WalrusClient instance with network configuration" },
                { line: 7, explanation: "network: 'testnet' configures aggregator and publisher URLs automatically" },
                { line: 8, explanation: "suiClient is needed for on-chain blob registration and payment" },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-msg-016',
    },
    {
      sectionTitle: 'Uploading Attachments',
      slides: [
        {
          title: 'Using WalrusClient.store()',
          emoji: '📤',
          content: "To upload a file, convert it to a `Uint8Array` or `Blob` and pass it to `walrusClient.store()`. The method handles erasure coding, distributes fragments to storage nodes, and returns a response containing the `blobId`. You specify `epochs` (how long to store) and the `signer` (who pays for storage). The returned `blobId` is what you store in your Sui message object as a reference to the attachment.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Upload a file to Walrus\nconst file = new File(['Hello Walrus!'], 'hello.txt', { type: 'text/plain' });\nconst fileBytes = new Uint8Array(await file.arrayBuffer());\n\nconst storeResult = await walrusClient.store({\n  blob: fileBytes,\n  deletable: false,\n  epochs: 5,\n  signer: keypair,\n});\n\nconst blobId = storeResult.blobId;\nconsole.log('Uploaded! BlobId:', blobId);`,
              highlights: [
                { line: 2, explanation: "Create or receive a File object from user input" },
                { line: 3, explanation: "Convert the file to Uint8Array for the Walrus API" },
                { line: 5, explanation: "walrusClient.store() uploads the blob to decentralized storage" },
                { line: 7, explanation: "deletable: false makes the blob permanent for its storage duration" },
                { line: 8, explanation: "epochs: 5 means the blob is stored for 5 Walrus epochs" },
                { line: 9, explanation: "signer pays the storage fee in SUI tokens" },
                { line: 12, explanation: "blobId is the content-addressed identifier to reference this file" },
              ],
            },
          },
        },
        {
          title: 'Creating a Blob from File Input',
          emoji: '📁',
          content: "In a web application, files come from `<input type='file'>` elements. You read the file using `file.arrayBuffer()`, convert to `Uint8Array`, then upload. For large files, consider showing a progress indicator. Always validate file size and type before uploading -- Walrus has per-blob size limits and you should enforce your own limits (e.g., 10MB max for chat attachments) for good UX.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Handle file input from a form\nconst MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB\n\nasync function prepareAttachment(file: File) {\n  // Validate file size\n  if (file.size > MAX_FILE_SIZE) {\n    throw new Error('File exceeds 10MB limit');\n  }\n\n  // Convert to bytes\n  const buffer = await file.arrayBuffer();\n  const bytes = new Uint8Array(buffer);\n\n  return {\n    bytes,\n    fileName: file.name,\n    mimeType: file.type,\n    size: file.size,\n  };\n}`,
              highlights: [
                { line: 2, explanation: "Define a sensible max file size for your messaging app" },
                { line: 6, explanation: "Always validate before uploading -- saves gas and bandwidth" },
                { line: 11, explanation: "file.arrayBuffer() reads the file content into memory" },
                { line: 14, explanation: "Return metadata alongside bytes -- you will store fileName and mimeType in the message object" },
              ],
            },
          },
        },
        {
          title: 'Attaching BlobId to Messages',
          emoji: '🔗',
          content: "After uploading to Walrus, you get a `blobId`. Now attach it to your messaging channel by calling a Move function that stores the blobId, file name, MIME type, and size in the message object. This creates an on-chain record linking the message to its Walrus-stored attachment. Recipients read the blobId from the message object and download the file from Walrus.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: 'On-Chain Metadata', content: 'Store blobId, fileName, mimeType, and size in the Sui message object. The actual file bytes live on Walrus.' },
                { label: 'Small On-Chain Footprint', content: 'A blobId is only ~32 bytes. Storing just the reference keeps transaction costs minimal even for large files.' },
                { label: 'Recipient Flow', content: 'Recipient reads message -> extracts blobId -> calls walrusClient.read(blobId) -> displays the file.' },
                { label: 'Encryption Integration', content: 'For private channels, encrypt the file bytes with Seal BEFORE uploading to Walrus. The blobId then points to encrypted data.' },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-017',
    },
    {
      sectionTitle: 'Downloading and Displaying',
      slides: [
        {
          title: 'Downloading Blobs with WalrusClient.read()',
          emoji: '📥',
          content: "To download an attachment, call `walrusClient.read({ blobId })` with the blobId stored in the message object. Walrus fetches fragments from storage nodes, reconstructs the full blob using erasure coding, and returns the raw bytes as a `Uint8Array`. If the blob was encrypted with Seal before upload, you must decrypt the bytes after downloading. The read operation is free -- no gas is required to download from Walrus.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Download a blob from Walrus\nconst blobBytes = await walrusClient.read({\n  blobId: message.attachmentBlobId,\n});\n\n// If encrypted, decrypt first\nlet fileBytes: Uint8Array;\nif (message.isEncrypted) {\n  fileBytes = await sealClient.decrypt({\n    data: blobBytes,\n    sessionKey,\n    txBytes: accessProofTxBytes,\n  });\n} else {\n  fileBytes = blobBytes;\n}\n\nconsole.log('Downloaded', fileBytes.length, 'bytes');`,
              highlights: [
                { line: 2, explanation: "walrusClient.read() fetches and reconstructs the blob from storage nodes" },
                { line: 3, explanation: "Use the blobId stored in the message object to identify the attachment" },
                { line: 8, explanation: "Check if the channel uses encryption before attempting to use raw bytes" },
                { line: 9, explanation: "For encrypted channels, decrypt with SealClient after downloading" },
              ],
            },
          },
        },
        {
          title: 'Reconstructing and Displaying Files',
          emoji: '🖼️',
          content: "Once you have the raw bytes and metadata (fileName, mimeType), reconstruct the file for display. For images, create an object URL with `URL.createObjectURL(new Blob([bytes], { type: mimeType }))`. For downloadable files, create a temporary anchor element and trigger a click. Always clean up object URLs with `URL.revokeObjectURL()` to prevent memory leaks. Handle different MIME types gracefully -- show image previews inline, offer download buttons for other types.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Display an attachment based on its type\nfunction displayAttachment(\n  bytes: Uint8Array,\n  fileName: string,\n  mimeType: string\n): string {\n  const blob = new Blob([bytes], { type: mimeType });\n  const objectUrl = URL.createObjectURL(blob);\n\n  // For images, return URL for <img> tag\n  if (mimeType.startsWith('image/')) {\n    return objectUrl; // Use as img src\n  }\n\n  // For other files, trigger download\n  const anchor = document.createElement('a');\n  anchor.href = objectUrl;\n  anchor.download = fileName;\n  anchor.click();\n\n  // Clean up to prevent memory leaks\n  URL.revokeObjectURL(objectUrl);\n  return objectUrl;\n}\n\n// Usage in a message component\nconst imageUrl = displayAttachment(fileBytes, 'photo.png', 'image/png');`,
              highlights: [
                { line: 7, explanation: "Create a Blob from raw bytes with the correct MIME type" },
                { line: 8, explanation: "URL.createObjectURL() creates a temporary URL the browser can render" },
                { line: 11, explanation: "For images, return the URL to use as an <img> src attribute" },
                { line: 16, explanation: "For non-image files, programmatically trigger a file download" },
                { line: 22, explanation: "Always revoke object URLs after use to prevent memory leaks" },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-018',
    },
  ],

  quiz: [
    {
      question: 'What is a blobId in Walrus?',
      options: [
        'A random UUID assigned by the storage server',
        'A content-addressed identifier derived from the hash of the file contents',
        'The IP address of the storage node holding the file',
        'A sequential auto-incrementing integer',
      ],
      correctAnswer: 1,
      explanation: 'A blobId is a content-addressed identifier -- it is derived from the cryptographic hash of the file contents. This means identical files always produce the same blobId, enabling deduplication and integrity verification.',
      weaknessTopic: 'walrus-storage',
      practiceHint: 'Think about what "content addressing" means: the address comes from the content itself.',
    },
    {
      question: 'Why does a messaging app store only the blobId on-chain instead of the full file?',
      options: [
        'Sui Move does not support storing bytes',
        'On-chain storage is expensive and size-limited; a blobId is only ~32 bytes',
        'Files cannot be encrypted on-chain',
        'Walrus requires all references to be off-chain',
      ],
      correctAnswer: 1,
      explanation: 'Storing large files directly in Sui objects would be extremely expensive. By storing only the blobId (~32 bytes) on-chain and the actual file on Walrus, you keep transaction costs minimal while still maintaining a verifiable reference.',
      weaknessTopic: 'walrus-storage',
      practiceHint: 'Consider the gas cost difference between storing 32 bytes vs 10MB on-chain.',
    },
    {
      question: 'How does Walrus ensure file availability even if some storage nodes go offline?',
      options: [
        'It replicates the full file to every node in the network',
        'It uses erasure coding to split files into redundant fragments across nodes',
        'It stores files on a single highly reliable server',
        'It keeps a backup on the Sui blockchain itself',
      ],
      correctAnswer: 1,
      explanation: 'Walrus uses erasure coding to split files into fragments with built-in redundancy. Even if a significant portion of storage nodes go offline, the file can be fully reconstructed from the remaining fragments.',
      weaknessTopic: 'walrus-storage',
      practiceHint: 'Erasure coding is more space-efficient than full replication while still providing fault tolerance.',
    },
    {
      question: 'What is the correct order for sending an encrypted file attachment?',
      options: [
        'Upload to Walrus -> Encrypt with Seal -> Store blobId in message',
        'Encrypt with Seal -> Upload encrypted bytes to Walrus -> Store blobId in message',
        'Store blobId in message -> Upload to Walrus -> Encrypt with Seal',
        'Upload to Walrus -> Store blobId in message -> Encrypt the blobId',
      ],
      correctAnswer: 1,
      explanation: 'You must encrypt the file bytes with Seal BEFORE uploading to Walrus. This way, the blob stored on Walrus is encrypted and only authorized channel members can decrypt after downloading.',
      weaknessTopic: 'walrus-storage',
      practiceHint: 'If you upload first then encrypt, the unencrypted file would already be on Walrus for anyone to read.',
    },
    {
      question: 'Why should you call URL.revokeObjectURL() after displaying a downloaded attachment?',
      options: [
        'To delete the file from Walrus storage',
        'To re-encrypt the file for security',
        'To free browser memory and prevent memory leaks',
        'To invalidate the blobId so no one else can download it',
      ],
      correctAnswer: 2,
      explanation: 'URL.createObjectURL() allocates browser memory to hold the file data. If you do not revoke it, the memory is never freed, causing memory leaks -- especially problematic in a chat app where many attachments may be viewed.',
      weaknessTopic: 'walrus-storage',
      practiceHint: 'Object URLs hold references to in-memory blobs. Without revoking, the garbage collector cannot reclaim that memory.',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';
import { SealClient } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';

const SUI_RPC_URL = 'https://fullnode.testnet.sui.io';
const PACKAGE_ID = '0xYOUR_MESSAGING_PACKAGE';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// TODO 1: Initialize WalrusClient
// - Create a SuiClient pointing to SUI_RPC_URL
// - Create a WalrusClient with network 'testnet' and the suiClient

// TODO 2: Create an upload function
// - Function: uploadAttachment(file: File, signer: any)
// - Validate that file.size does not exceed MAX_FILE_SIZE (throw an error if it does)
// - Convert file to Uint8Array using file.arrayBuffer()
// - Call walrusClient.store() with the blob bytes, deletable: false, epochs: 5, and the signer
// - Return an object with { blobId, fileName: file.name, mimeType: file.type, size: file.size }

// TODO 3: Create a download function
// - Function: downloadAttachment(blobId: string)
// - Call walrusClient.read() with the blobId
// - Return the Uint8Array of bytes

// TODO 4: Create a function to send a message with an attachment
// - Function: sendMessageWithAttachment(channelId: string, text: string, blobId: string, fileName: string, mimeType: string, signer: any)
// - Create a new Transaction
// - Add a moveCall to \`\${PACKAGE_ID}::messaging::send_message_with_attachment\`
// - Pass channelId (as object), text (as string), blobId (as string), fileName (as string), and mimeType (as string) as arguments
// - Sign and execute the transaction with suiClient
// - Return the transaction result

// TODO 5: Create a display function
// - Function: displayAttachment(bytes: Uint8Array, mimeType: string, fileName: string)
// - Create a Blob from the bytes with the correct mimeType
// - Create an object URL using URL.createObjectURL()
// - If mimeType starts with 'image/', return the objectUrl for inline display
// - Otherwise, create an anchor element, set href and download attributes, trigger click, then revoke the URL
// - Return the objectUrl`,

  solution: `import { WalrusClient } from '@mysten/walrus';
import { SuiClient } from '@mysten/sui/client';
import { SealClient } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';

const SUI_RPC_URL = 'https://fullnode.testnet.sui.io';
const PACKAGE_ID = '0xYOUR_MESSAGING_PACKAGE';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 1: Initialize WalrusClient
const suiClient = new SuiClient({ url: SUI_RPC_URL });

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

// 2: Upload an attachment to Walrus
async function uploadAttachment(file: File, signer: any) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(\`File exceeds \${MAX_FILE_SIZE / (1024 * 1024)}MB limit\`);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const storeResult = await walrusClient.store({
    blob: bytes,
    deletable: false,
    epochs: 5,
    signer,
  });

  return {
    blobId: storeResult.blobId,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

// 3: Download an attachment from Walrus
async function downloadAttachment(blobId: string): Promise<Uint8Array> {
  const bytes = await walrusClient.read({
    blobId,
  });

  return bytes;
}

// 4: Send a message with an attachment reference
async function sendMessageWithAttachment(
  channelId: string,
  text: string,
  blobId: string,
  fileName: string,
  mimeType: string,
  signer: any
) {
  const tx = new Transaction();
  tx.moveCall({
    target: \`\${PACKAGE_ID}::messaging::send_message_with_attachment\`,
    arguments: [
      tx.object(channelId),
      tx.pure.string(text),
      tx.pure.string(blobId),
      tx.pure.string(fileName),
      tx.pure.string(mimeType),
    ],
  });

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
  });

  return result;
}

// 5: Display an attachment in the browser
function displayAttachment(
  bytes: Uint8Array,
  mimeType: string,
  fileName: string
): string {
  const blob = new Blob([bytes], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);

  if (mimeType.startsWith('image/')) {
    return objectUrl;
  }

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
  return objectUrl;
}`,

  hints: [
    "Start with TODO 1: Create SuiClient with `new SuiClient({ url: SUI_RPC_URL })` and WalrusClient with `new WalrusClient({ network: 'testnet', suiClient })`.",
    "For TODO 2: Convert the file with `new Uint8Array(await file.arrayBuffer())`, then call walrusClient.store() with blob, deletable, epochs, and signer. Return the blobId and file metadata.",
    "For TODO 3: Call walrusClient.read({ blobId }) to download. It returns the raw Uint8Array directly.",
    "For TODO 4: Build a Transaction with tx.moveCall(), using tx.object() for the channelId and tx.pure.string() for text, blobId, fileName, and mimeType. Then signAndExecuteTransaction.",
    "For TODO 5: Use `new Blob([bytes], { type: mimeType })` and `URL.createObjectURL(blob)`. Check mimeType.startsWith('image/') to decide between inline display and triggering a download.",
  ],
};
