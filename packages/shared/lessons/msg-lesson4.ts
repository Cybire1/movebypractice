import { LessonContent } from '../types/lesson';

export const msgLesson4: LessonContent = {
  id: 'msg-4',
  title: 'Messages - Sending & Receiving',
  description: 'Send messages to channels, poll for new messages, and handle message delivery on Sui.',
  difficulty: 'intermediate',
  xpReward: 250,
  order: 4,
  language: 'typescript',
  prerequisiteLessons: ['msg-3'],

  narrative: {
    welcomeMessage: "Now for the core of messaging - sending and receiving messages through channels!",
    quizTransition: "Let's check your understanding of the message lifecycle...",
    practiceTransition: "Build a complete send/receive message loop with polling!",
    celebrationMessage: "Messages flowing! You've built a working message send/receive system.",
  },

  teachingSections: [
    {
      sectionTitle: 'Sending Messages',
      slides: [
        {
          title: 'Sending Your First Message',
          emoji: '💬',
          content: "Use `client.sendMessage()` to post a message to a channel. You provide the `channelId` and the `content` string. The method creates an on-chain transaction and returns a `MessageResult` with the message ID, timestamp, and transaction digest. Only active channel members can send messages - the Move contract enforces this.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { MessagingClient } from '@mysten/messaging';\n\nconst client = new MessagingClient({ network: 'testnet' });\n\n// Send a simple text message\nconst msg = await client.sendMessage({\n  channelId: '0xabc123...',\n  content: 'Hello from Sui Messaging!',\n});\n\nconsole.log('Message ID:', msg.id);\nconsole.log('Sent at:', msg.timestamp);\nconsole.log('Tx digest:', msg.digest);`,
              highlights: [
                { line: 6, explanation: "sendMessage() posts content to a specific channel" },
                { line: 7, explanation: "channelId must be a valid channel you are a member of" },
                { line: 8, explanation: "content is the text payload of the message" },
                { line: 11, explanation: "Each message gets a unique on-chain ID" },
                { line: 13, explanation: "digest is the Sui transaction hash for verification" },
              ],
            },
          },
        },
        {
          title: 'Message Content & Options',
          emoji: '📝',
          content: "Messages support plain text content by default. The `sendMessage()` method also accepts optional fields: `replyTo` to reference a parent message ID (for threaded conversations), `metadata` for custom key-value data, and `contentType` to indicate the format (e.g., `'text/plain'`, `'text/markdown'`). Keep content concise - on-chain storage has gas costs proportional to data size.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Basic Text", content: "sendMessage({ channelId, content: 'Hello!' }) - Simple text message. Content is stored on-chain as a UTF-8 string." },
                { label: "Reply Threading", content: "sendMessage({ channelId, content: 'I agree!', replyTo: parentMsgId }) - Creates a threaded reply referencing the parent message." },
                { label: "Content Types", content: "sendMessage({ channelId, content: '**bold**', contentType: 'text/markdown' }) - Specify format so clients render correctly." },
                { label: "Custom Metadata", content: "sendMessage({ channelId, content: 'See file', metadata: { fileName: 'report.pdf', size: '2048' } }) - Attach key-value metadata." },
              ],
            },
          },
        },
        {
          title: 'Attachments & Rich Content',
          emoji: '📎',
          content: "For files and rich content, use the `attachments` option. Attachment data is stored off-chain (via Walrus or similar storage), and only the reference hash is stored on-chain. This keeps gas costs low while supporting images, documents, and other media. Each attachment has a `name`, `mimeType`, and `blobId` that points to the off-chain data.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Upload attachment data first, then reference it\nconst blobId = await walrusClient.upload(fileBuffer);\n\nconst msg = await client.sendMessage({\n  channelId: channel.id,\n  content: 'Here is the quarterly report',\n  attachments: [\n    {\n      name: 'Q4-report.pdf',\n      mimeType: 'application/pdf',\n      blobId: blobId,  // Reference to off-chain storage\n    },\n  ],\n});\n\nconsole.log('Message with attachment:', msg.id);`,
              highlights: [
                { line: 2, explanation: "Upload the file to off-chain storage first (e.g., Walrus)" },
                { line: 7, explanation: "attachments is an array - you can include multiple files" },
                { line: 9, explanation: "name and mimeType help clients display the attachment" },
                { line: 11, explanation: "blobId references the off-chain data - only this hash is on-chain" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-010',
    },
    {
      sectionTitle: 'Polling for Messages',
      slides: [
        {
          title: 'Fetching Messages',
          emoji: '📥',
          content: "Retrieve messages with `client.getMessages()`. It returns a page of messages along with a `cursor` for pagination. Pass `channelId` to specify which channel to read from, and optional `limit` to control page size. Messages are returned in chronological order. The `cursor` field in the response lets you fetch the next page of results.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Fetch the latest messages from a channel\nconst result = await client.getMessages({\n  channelId: '0xabc123...',\n  limit: 20,\n});\n\nconsole.log('Messages:', result.messages.length);\nconsole.log('Has more:', result.hasNextPage);\n\nfor (const msg of result.messages) {\n  console.log(\`[\${msg.sender}]: \${msg.content}\`);\n}`,
              highlights: [
                { line: 2, explanation: "getMessages() fetches a page of messages from a channel" },
                { line: 4, explanation: "limit controls how many messages per page (default varies by SDK)" },
                { line: 8, explanation: "hasNextPage tells you if there are more messages to fetch" },
                { line: 10, explanation: "Each message has sender (address), content, id, and timestamp" },
              ],
            },
          },
        },
        {
          title: 'Cursor-Based Pagination',
          emoji: '📄',
          content: "The messaging SDK uses cursor-based pagination to handle message history efficiently. After your first `getMessages()` call, use the returned `cursor` in the next request to get subsequent messages. This avoids offset-based issues like missing or duplicating messages when new ones arrive. Always store the latest cursor so you only fetch new messages.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'first-call', label: 'getMessages({ channelId })', emoji: '1️⃣' },
                { id: 'save-cursor', label: 'Save result.cursor', emoji: '2️⃣' },
                { id: 'next-call', label: 'getMessages({ channelId, cursor })', emoji: '3️⃣' },
                { id: 'check-more', label: 'Check result.hasNextPage', emoji: '4️⃣' },
              ],
              targets: [
                { id: 'step-1', label: 'Step 1: Initial Fetch' },
                { id: 'step-2', label: 'Step 2: Store Position' },
                { id: 'step-3', label: 'Step 3: Fetch Next Page' },
                { id: 'step-4', label: 'Step 4: Continue or Stop' },
              ],
              correctPairs: [
                { itemId: 'first-call', targetId: 'step-1' },
                { itemId: 'save-cursor', targetId: 'step-2' },
                { itemId: 'next-call', targetId: 'step-3' },
                { itemId: 'check-more', targetId: 'step-4' },
              ],
            },
          },
        },
        {
          title: 'Polling Pattern with setInterval',
          emoji: '🔄',
          content: "Since on-chain messaging does not support push notifications natively, you use a polling pattern to check for new messages. Set up a `setInterval` that calls `getMessages()` with the last known cursor. When new messages arrive (the response contains messages), process them and update the cursor. A typical polling interval is 3-5 seconds on testnet. Clear the interval when the user leaves the channel.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `let cursor: string | undefined;\n\nfunction startPolling(channelId: string) {\n  const intervalId = setInterval(async () => {\n    try {\n      const result = await client.getMessages({\n        channelId,\n        cursor,       // Only fetch messages after this point\n        limit: 50,\n      });\n\n      if (result.messages.length > 0) {\n        for (const msg of result.messages) {\n          displayMessage(msg);\n        }\n        cursor = result.cursor;  // Update cursor to latest\n      }\n    } catch (err) {\n      console.error('Polling error:', err);\n    }\n  }, 3000); // Poll every 3 seconds\n\n  return intervalId; // Return so caller can clearInterval()\n}`,
              highlights: [
                { line: 1, explanation: "Track the cursor outside the interval to persist between polls" },
                { line: 4, explanation: "setInterval runs the fetch on a regular schedule" },
                { line: 8, explanation: "Pass cursor to only get messages newer than last fetch" },
                { line: 16, explanation: "Update cursor after processing so next poll starts from here" },
                { line: 21, explanation: "3 seconds is a good balance between responsiveness and rate limiting" },
                { line: 23, explanation: "Return the interval ID so the caller can stop polling with clearInterval()" },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-011',
    },
    {
      sectionTitle: 'Error Handling',
      slides: [
        {
          title: 'Handling Network & Transaction Errors',
          emoji: '🛡️',
          content: "Network requests and on-chain transactions can fail for many reasons: network timeouts, insufficient gas, channel not found, not a member, or channel archived. Always wrap SDK calls in try/catch blocks. The SDK throws typed errors: `ChannelNotFoundError`, `NotAMemberError`, `ChannelArchivedError`, and generic `MessagingError`. Inspect the error type to provide meaningful feedback to users.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "ChannelNotFoundError", content: "Thrown when the channelId does not match any on-chain channel object. Verify the ID is correct and the channel has not been deleted." },
                { label: "NotAMemberError", content: "Thrown when the signing address is not a member of the channel. The user must be added by an admin before they can send or read messages." },
                { label: "ChannelArchivedError", content: "Thrown when attempting to send a message or add members to an archived channel. Archived channels are read-only." },
                { label: "InsufficientGasError", content: "Thrown when the wallet does not have enough SUI to cover the transaction gas fee. Prompt the user to fund their wallet." },
              ],
            },
          },
        },
        {
          title: 'Retry Patterns & Delivery Confirmation',
          emoji: '🔁',
          content: "For production apps, implement a retry strategy for transient failures. Use exponential backoff: wait 1s, then 2s, then 4s between retries, up to a maximum of 3 attempts. After a successful `sendMessage()`, verify delivery by checking the returned `digest` against the chain using `client.waitForTransaction(digest)`. This confirms the message is finalized on-chain and not just submitted to the mempool.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `async function sendWithRetry(\n  client: MessagingClient,\n  channelId: string,\n  content: string,\n  maxRetries = 3\n) {\n  for (let attempt = 0; attempt < maxRetries; attempt++) {\n    try {\n      const msg = await client.sendMessage({ channelId, content });\n\n      // Confirm delivery on-chain\n      await client.waitForTransaction(msg.digest);\n      console.log('Confirmed on-chain:', msg.id);\n      return msg;\n    } catch (err) {\n      if (attempt === maxRetries - 1) throw err;\n      const delay = Math.pow(2, attempt) * 1000;\n      console.log(\`Retry in \${delay}ms...\`);\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n}`,
              highlights: [
                { line: 7, explanation: "Loop up to maxRetries attempts before giving up" },
                { line: 9, explanation: "Attempt to send the message normally" },
                { line: 12, explanation: "waitForTransaction() confirms the tx is finalized on-chain" },
                { line: 16, explanation: "On the last attempt, rethrow the error to the caller" },
                { line: 17, explanation: "Exponential backoff: 1s, 2s, 4s delays between retries" },
                { line: 19, explanation: "Promise-based delay to wait before the next attempt" },
              ],
            },
          },
        },
      ],
      exerciseId: 'op-msg-012',
    },
  ],

  quiz: [
    {
      question: 'What does client.sendMessage() return upon success?',
      options: [
        'A boolean true/false',
        'The raw transaction bytes',
        'A MessageResult with the message ID, timestamp, and transaction digest',
        'Nothing - it is a void function',
      ],
      correctAnswer: 2,
      explanation: 'sendMessage() returns a MessageResult object containing the unique message ID, the timestamp of when it was created, and the Sui transaction digest for on-chain verification.',
      weaknessTopic: 'messaging-concepts',
    },
    {
      question: 'Why does the messaging SDK use cursor-based pagination instead of offset-based?',
      options: [
        'Cursors are faster to compute than offsets',
        'Cursors avoid missing or duplicating messages when new ones arrive during pagination',
        'Offset-based pagination is not supported by Sui',
        'Cursors use less gas than offsets',
      ],
      correctAnswer: 1,
      explanation: 'Cursor-based pagination avoids the issue where new messages shift the list, causing offset-based approaches to miss or duplicate items. The cursor acts as a stable reference point in the message history.',
      weaknessTopic: 'messaging-concepts',
    },
    {
      question: 'What is a recommended polling interval for checking new messages on testnet?',
      options: [
        '100 milliseconds',
        '3-5 seconds',
        '1 minute',
        '10 minutes',
      ],
      correctAnswer: 1,
      explanation: 'A polling interval of 3-5 seconds provides a good balance between responsiveness (users see new messages quickly) and avoiding rate limiting or excessive RPC calls.',
      weaknessTopic: 'messaging-concepts',
    },
    {
      question: 'How do you confirm a sent message is finalized on-chain?',
      options: [
        'Check if sendMessage() did not throw an error',
        'Call client.waitForTransaction(digest) with the returned transaction digest',
        'Poll getMessages() and look for the message ID',
        'Check the wallet balance changed',
      ],
      correctAnswer: 1,
      explanation: 'Use client.waitForTransaction(digest) with the digest returned by sendMessage(). This waits for the transaction to be finalized on-chain, confirming the message is permanently stored and not just in the mempool.',
      weaknessTopic: 'messaging-concepts',
    },
    {
      question: 'What is exponential backoff in a retry pattern?',
      options: [
        'Retrying immediately without any delay',
        'Waiting a fixed 1-second delay between every retry',
        'Doubling the wait time between each retry attempt (e.g., 1s, 2s, 4s)',
        'Sending multiple copies of the message simultaneously',
      ],
      correctAnswer: 2,
      explanation: 'Exponential backoff increases the delay between retries exponentially (1s, 2s, 4s, etc.). This reduces load on the network during transient failures and gives the system time to recover.',
      weaknessTopic: 'messaging-concepts',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import { MessagingClient } from '@mysten/messaging';

const client = new MessagingClient({ network: 'testnet' });

const channelId = '0xYourChannelId...';

// TODO 1: Create a sendMessage function that:
// - Takes channelId and content as parameters
// - Sends the message using client.sendMessage()
// - Confirms delivery with client.waitForTransaction()
// - Returns the message result
// - Wraps everything in try/catch with proper error logging

// TODO 2: Create a pollMessages function that:
// - Takes channelId as a parameter
// - Uses setInterval to poll every 3 seconds
// - Tracks a cursor variable to only fetch new messages
// - Calls client.getMessages() with the cursor
// - Logs each new message's sender and content
// - Updates the cursor after processing
// - Returns the intervalId so polling can be stopped

// TODO 3: Create a main function that:
// - Sends a test message using your sendMessage function
// - Starts polling using your pollMessages function
// - After 15 seconds, stops polling with clearInterval
// - Handles any errors that occur

async function main() {
  // Your implementation here
}

main();`,

  solution: `import { MessagingClient } from '@mysten/messaging';

const client = new MessagingClient({ network: 'testnet' });

const channelId = '0xYourChannelId...';

// Send a message with delivery confirmation
async function sendMessage(channelId: string, content: string) {
  try {
    const msg = await client.sendMessage({
      channelId,
      content,
    });

    // Confirm the transaction is finalized on-chain
    await client.waitForTransaction(msg.digest);
    console.log('Message confirmed:', msg.id);
    return msg;
  } catch (err) {
    console.error('Failed to send message:', err);
    throw err;
  }
}

// Poll for new messages with cursor tracking
function pollMessages(channelId: string) {
  let cursor: string | undefined;

  const intervalId = setInterval(async () => {
    try {
      const result = await client.getMessages({
        channelId,
        cursor,
        limit: 50,
      });

      if (result.messages.length > 0) {
        for (const msg of result.messages) {
          console.log(\`[\${msg.sender}]: \${msg.content}\`);
        }
        cursor = result.cursor;
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 3000);

  return intervalId;
}

// Main function tying it all together
async function main() {
  try {
    // Send a test message
    const msg = await sendMessage(channelId, 'Hello from Sui Messaging!');
    console.log('Sent message at:', msg.timestamp);

    // Start polling for messages
    const pollId = pollMessages(channelId);
    console.log('Polling started...');

    // Stop polling after 15 seconds
    setTimeout(() => {
      clearInterval(pollId);
      console.log('Polling stopped.');
    }, 15000);
  } catch (err) {
    console.error('Error in main:', err);
  }
}

main();`,

  hints: [
    "For sendMessage, use client.sendMessage({ channelId, content }) and await the result before calling waitForTransaction()",
    "Declare the cursor variable with 'let cursor: string | undefined' outside the setInterval callback so it persists between polls",
    "In pollMessages, call client.getMessages({ channelId, cursor, limit: 50 }) and check if result.messages.length > 0 before processing",
    "After processing new messages in the poll, update the cursor with cursor = result.cursor so the next poll only fetches newer messages",
    "Use setTimeout with clearInterval(intervalId) to stop polling after a set duration - remember to return the intervalId from pollMessages",
  ],
};
