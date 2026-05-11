import { LessonContent } from '../types/lesson';

export const msgLesson3: LessonContent = {
  id: 'msg-3',
  title: 'Channels - Creation & Management',
  description: 'Create messaging channels, manage members, and control channel lifecycle on Sui.',
  difficulty: 'intermediate',
  xpReward: 200,
  order: 3,
  language: 'typescript',
  prerequisiteLessons: ['msg-2'],

  narrative: {
    welcomeMessage: "Channels are the foundation of organized messaging. Let's learn to create and manage them!",
    quizTransition: "Let's verify your understanding of channel operations...",
    practiceTransition: "Time to build a complete channel manager with create, addMembers, and archive!",
    celebrationMessage: "You've mastered channel management! Your channels are ready for messages.",
  },

  teachingSections: [
    {
      sectionTitle: 'Creating Channels',
      slides: [
        {
          title: 'Your First Channel',
          emoji: '📢',
          content: "Channels in `@mysten/messaging` are on-chain objects that group participants for structured conversations. You create a channel using `client.createChannel()`, passing in a `ChannelOptions` object. Each channel gets a unique on-chain ID that you use for all subsequent operations like sending messages or managing members.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { MessagingClient } from '@mysten/messaging';\n\nconst client = new MessagingClient({ network: 'testnet' });\n\nconst channel = await client.createChannel({\n  name: 'dev-team',\n  description: 'Development team discussions',\n  members: [aliceAddress, bobAddress],\n});\n\nconsole.log('Channel ID:', channel.id);`,
              highlights: [
                { line: 1, explanation: "Import the MessagingClient from @mysten/messaging" },
                { line: 5, explanation: "createChannel() returns a Channel object with an on-chain ID" },
                { line: 6, explanation: "Channel name is a human-readable identifier" },
                { line: 8, explanation: "Initial members array - these addresses are added on creation" },
                { line: 11, explanation: "channel.id is the unique on-chain object ID for this channel" },
              ],
            },
          },
        },
        {
          title: 'Channel Options',
          emoji: '🔧',
          content: "The `ChannelOptions` interface gives you full control over channel creation. The `name` field is required and acts as a human-readable label. `description` provides context. `members` is an array of Sui addresses to add at creation time. The `encrypted` flag enables end-to-end encryption for all messages in the channel using shared key derivation.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface ChannelOptions {\n  name: string;            // Required: channel display name\n  description?: string;    // Optional: what the channel is for\n  members: string[];       // Required: initial member addresses\n  encrypted?: boolean;     // Optional: enable E2E encryption\n  metadata?: Record<string, string>; // Optional: custom key-value data\n}\n\n// Encrypted channel example\nconst secureChannel = await client.createChannel({\n  name: 'treasury-ops',\n  description: 'Sensitive financial operations',\n  members: [admin1, admin2, treasurer],\n  encrypted: true,\n});`,
              highlights: [
                { line: 2, explanation: "name is required - used for display and search" },
                { line: 4, explanation: "members must be valid Sui addresses (0x...)" },
                { line: 5, explanation: "When encrypted is true, messages use shared key derivation" },
                { line: 6, explanation: "metadata allows attaching custom key-value pairs to the channel" },
                { line: 14, explanation: "Encrypted channels protect message content on-chain" },
              ],
            },
          },
        },
        {
          title: 'Working with Channel IDs',
          emoji: '🆔',
          content: "Every channel has a unique Sui object ID (a 32-byte hex string like `0x1a2b...`). You use this ID to reference the channel in all operations: sending messages, adding members, archiving, and querying. Store channel IDs in your application state. You can also look up channels by calling `client.getChannel(channelId)` to retrieve its current state.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// After creating a channel, save the ID\nconst channel = await client.createChannel({\n  name: 'announcements',\n  members: [admin],\n});\nconst channelId: string = channel.id; // e.g. '0x1a2b3c...'\n\n// Later, retrieve the channel by its ID\nconst retrieved = await client.getChannel(channelId);\nconsole.log(retrieved.name);        // 'announcements'\nconsole.log(retrieved.memberCount);  // 1\nconsole.log(retrieved.createdAt);    // timestamp`,
              highlights: [
                { line: 6, explanation: "channel.id is a Sui object ID - a hex string starting with 0x" },
                { line: 9, explanation: "getChannel() fetches the current on-chain state of the channel" },
                { line: 10, explanation: "Access channel properties like name, memberCount, createdAt" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-007',
    },
    {
      sectionTitle: 'Managing Members',
      slides: [
        {
          title: 'Adding Members',
          emoji: '👥',
          content: "After creating a channel, you can add new members with `client.addMembers()`. Pass in the channel ID and an array of Sui addresses. Only the channel creator (or addresses with admin permissions) can add members. The method returns a transaction result so you can confirm the operation succeeded on-chain.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Add new members to an existing channel\nconst result = await client.addMembers({\n  channelId: channel.id,\n  members: [carolAddress, daveAddress],\n});\n\nconsole.log('Transaction:', result.digest);\nconsole.log('New member count:', result.memberCount);`,
              highlights: [
                { line: 2, explanation: "addMembers() takes channelId and an array of new member addresses" },
                { line: 4, explanation: "Each address must be a valid Sui address (0x prefix, 64 hex chars)" },
                { line: 7, explanation: "result.digest is the Sui transaction digest for verification" },
                { line: 8, explanation: "result.memberCount reflects the updated total after adding" },
              ],
            },
          },
        },
        {
          title: 'Removing Members & Listing',
          emoji: '🚪',
          content: "Remove members with `client.removeMembers()` - same pattern as adding. To see who is in a channel, call `client.getChannelMembers()` which returns an array of member objects with their addresses and join timestamps. Only admins can remove members, and the channel creator cannot be removed.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "removeMembers()", content: "await client.removeMembers({ channelId, members: [address] }) - Removes specified addresses. Only admins can call this. The creator cannot be removed." },
                { label: "getChannelMembers()", content: "await client.getChannelMembers(channelId) - Returns an array of { address, joinedAt, role } objects for all current members." },
                { label: "Member Roles", content: "Members have roles: 'admin' (can manage members and settings), 'member' (can read and send messages). The creator is always an admin." },
                { label: "Events", content: "Member changes emit on-chain events. Subscribe with client.onMemberChange(channelId, callback) to react to adds/removes in real time." },
              ],
            },
          },
        },
        {
          title: 'Permission Model',
          emoji: '🔒',
          content: "Channels enforce a simple permission model on-chain. The creator is automatically an `admin`. Admins can add/remove members, update channel info, and archive the channel. Regular `member` roles can only send and read messages. You can promote a member to admin with `client.setMemberRole()`. Permissions are enforced by the Move smart contract, so they cannot be bypassed client-side.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Promote a member to admin\nawait client.setMemberRole({\n  channelId: channel.id,\n  member: carolAddress,\n  role: 'admin',\n});\n\n// List members with their roles\nconst members = await client.getChannelMembers(channel.id);\nfor (const m of members) {\n  console.log(m.address, m.role); // '0xabc...' 'admin'\n}`,
              highlights: [
                { line: 2, explanation: "setMemberRole() changes a member's permission level" },
                { line: 5, explanation: "Roles are 'admin' or 'member' - enforced on-chain" },
                { line: 9, explanation: "getChannelMembers() returns each member's address, role, and joinedAt" },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-008',
    },
    {
      sectionTitle: 'Channel Lifecycle',
      slides: [
        {
          title: 'Archiving Channels',
          emoji: '📦',
          content: "When a channel is no longer needed, archive it with `client.archiveChannel()`. Archived channels become read-only: no new messages can be sent, and no members can be added. However, existing messages remain accessible for historical reference. Only admins can archive a channel. Archiving is a soft-delete - the on-chain object persists but its state changes to `archived`.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `// Archive a channel - makes it read-only\nconst result = await client.archiveChannel({\n  channelId: channel.id,\n});\n\nconsole.log('Archived:', result.success); // true\n\n// Trying to send a message now throws an error\ntry {\n  await client.sendMessage({\n    channelId: channel.id,\n    content: 'This will fail',\n  });\n} catch (err) {\n  console.error(err.message); // 'Channel is archived'\n}`,
              highlights: [
                { line: 2, explanation: "archiveChannel() sets the channel state to 'archived'" },
                { line: 6, explanation: "Returns a success boolean confirming the operation" },
                { line: 10, explanation: "Sending to an archived channel throws an error" },
                { line: 15, explanation: "The SDK provides clear error messages for archived channels" },
              ],
            },
          },
        },
        {
          title: 'Channel States & Best Practices',
          emoji: '🏗️',
          content: "Channels have two states: `active` (default, fully functional) and `archived` (read-only). Check a channel's state with `channel.status`. Best practices: use descriptive names and descriptions for discoverability, keep member lists small for performance, archive old channels rather than deleting members, and use encrypted channels for sensitive topics. Store channel IDs in your app's database for quick lookups.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Active State", content: "Default state. Members can send messages, admins can manage settings. All operations are available." },
                { label: "Archived State", content: "Read-only. No new messages or members. Existing data remains accessible. Cannot be un-archived." },
                { label: "Naming Best Practices", content: "Use kebab-case names like 'dev-team' or 'project-alpha'. Add clear descriptions. This helps with channel discovery and search." },
                { label: "Performance Tips", content: "Keep channels under 100 members for best performance. Use pagination when listing channels with client.listChannels({ cursor, limit })." },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-msg-009',
    },
  ],

  quiz: [
    {
      question: 'Why are channel permissions enforced on-chain in the Move contract rather than in the TypeScript SDK?',
      options: [
        'TypeScript is too slow for permission checks',
        'Because client-side checks can be bypassed — on-chain enforcement is tamper-proof',
        'The SDK does not have access to member lists',
        'On-chain enforcement is cheaper in terms of gas',
      ],
      correctAnswer: 1,
      explanation: 'Client-side permission checks can be bypassed by anyone who modifies the SDK or sends raw transactions. On-chain Move contracts enforce permissions at the transaction level, making them impossible to circumvent.',
      weaknessTopic: 'channels',
    },
    {
      question: 'A team removes a contractor from a channel but does NOT archive it. What security concern remains?',
      options: [
        'The contractor can still send messages to the channel',
        'The contractor can still read past messages they had access to before removal',
        'The channel ID changes when members are removed',
        'Removing members deletes their previously sent messages',
      ],
      correctAnswer: 1,
      explanation: 'Removing a member prevents future access, but they may have already cached or downloaded past messages. If the channel is encrypted, rotating keys after removal ensures future messages are unreadable, but past messages they already decrypted cannot be un-seen.',
      weaknessTopic: 'channels',
    },
    {
      question: 'Why does archiving make a channel read-only instead of deleting it from the blockchain?',
      options: [
        'Sui does not support deleting objects',
        'Deletion would orphan message references and break on-chain history — archiving preserves the audit trail',
        'Archived channels use less storage than deleted ones',
        'Users might want to un-archive it later',
      ],
      correctAnswer: 1,
      explanation: 'Blockchain data is meant to be immutable and auditable. Archiving preserves the entire message history and membership records while preventing new writes. Deleting would break references from other on-chain objects and destroy the historical record.',
      weaknessTopic: 'channels',
    },
    {
      question: 'You create a channel with encrypted: true and 3 members. What happens behind the scenes that differs from a non-encrypted channel?',
      options: [
        'The channel name is hidden from non-members',
        'A shared encryption key is derived so only the 3 members can decrypt messages sent to this channel',
        'Each message is stored on a separate blockchain for privacy',
        'Member addresses are replaced with anonymous identifiers',
      ],
      correctAnswer: 1,
      explanation: 'When encrypted is true, the channel uses shared key derivation (via Sui Seal) so that message content is encrypted before being stored on-chain. Only current members with the correct key shares can decrypt. The channel metadata (name, member list) remains visible.',
      weaknessTopic: 'channels',
    },
    {
      question: 'Why should you store channel IDs in your app database rather than relying solely on on-chain lookups?',
      options: [
        'Channel IDs change periodically and need to be cached',
        'On-chain lookups require gas fees for every query',
        'Querying by channel name is not supported — you need the object ID for direct lookups, and storing it locally avoids expensive enumeration',
        'The SDK cannot retrieve channels without a database',
      ],
      correctAnswer: 2,
      explanation: 'Sui uses object IDs for direct lookups (fast and free via RPC reads). Without storing the channel ID, you would need to enumerate all objects owned by a user and filter — which is slow and wasteful. A local database provides instant access to known channel IDs.',
      weaknessTopic: 'channels',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import { MessagingClient } from '@mysten/messaging';

// Initialize the messaging client
const client = new MessagingClient({ network: 'testnet' });

// Sample addresses for testing
const adminAddress = '0xadmin123...';
const member1 = '0xmember1...';
const member2 = '0xmember2...';
const member3 = '0xmember3...';

async function manageChannel() {
  // TODO 1: Create a channel named 'project-alpha' with a description
  //         'Collaboration channel for Project Alpha'
  //         and initial members: [adminAddress, member1]

  // TODO 2: Add member2 and member3 to the channel using addMembers()

  // TODO 3: List all channel members and log each member's address and role

  // TODO 4: Promote member1 to admin role using setMemberRole()

  // TODO 5: Archive the channel and confirm it was archived successfully
}

manageChannel();`,

  solution: `import { MessagingClient } from '@mysten/messaging';

// Initialize the messaging client
const client = new MessagingClient({ network: 'testnet' });

// Sample addresses for testing
const adminAddress = '0xadmin123...';
const member1 = '0xmember1...';
const member2 = '0xmember2...';
const member3 = '0xmember3...';

async function manageChannel() {
  // Step 1: Create the channel
  const channel = await client.createChannel({
    name: 'project-alpha',
    description: 'Collaboration channel for Project Alpha',
    members: [adminAddress, member1],
  });
  console.log('Channel created:', channel.id);

  // Step 2: Add new members
  const addResult = await client.addMembers({
    channelId: channel.id,
    members: [member2, member3],
  });
  console.log('Members added. New count:', addResult.memberCount);

  // Step 3: List all members
  const members = await client.getChannelMembers(channel.id);
  for (const m of members) {
    console.log(m.address, '-', m.role);
  }

  // Step 4: Promote member1 to admin
  await client.setMemberRole({
    channelId: channel.id,
    member: member1,
    role: 'admin',
  });
  console.log('Promoted member1 to admin');

  // Step 5: Archive the channel
  const archiveResult = await client.archiveChannel({
    channelId: channel.id,
  });
  console.log('Channel archived:', archiveResult.success);
}

manageChannel();`,

  hints: [
    "Use client.createChannel() with an object containing name, description, and members fields",
    "client.addMembers() takes an object with channelId and a members array of addresses to add",
    "Call client.getChannelMembers(channelId) and iterate over the returned array to log address and role",
    "client.setMemberRole() needs channelId, member address, and the new role string ('admin')",
    "client.archiveChannel({ channelId }) returns an object with a success boolean - log it to confirm",
  ],
};
