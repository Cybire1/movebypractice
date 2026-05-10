import { LessonContent } from '@/app/types/lesson';

export const msgLesson8: LessonContent = {
  id: 'msg-8',
  title: 'Production Deployment & Advanced Patterns',
  description: 'Deploy your messaging app to mainnet with multi-RPC failover, monitoring, and error recovery.',
  difficulty: 'advanced',
  xpReward: 500,
  order: 8,
  language: 'typescript',
  prerequisiteLessons: ['msg-7'],

  narrative: {
    welcomeMessage: "The final lesson! Let's make your messaging app production-ready with advanced patterns.",
    quizTransition: "Let's verify you're ready for production deployment...",
    practiceTransition: "Build a production-ready configuration with multi-RPC, error handling, and monitoring!",
    celebrationMessage: "Congratulations! You've completed the Sui Messaging SDK course. You're ready to ship!",
  },

  teachingSections: [
    {
      sectionTitle: 'Mainnet Configuration',
      slides: [
        {
          title: 'Switching from Testnet to Mainnet',
          emoji: '🚀',
          content: "Moving to mainnet requires careful configuration changes. Replace your testnet RPC URL with a mainnet endpoint, set environment variables for network selection, and ensure your package IDs point to mainnet-deployed contracts. Never hardcode RPC URLs -- use environment variables so you can switch networks without code changes. The @mysten/messaging SDK respects the SuiClient network configuration you provide.",
          interactiveElement: {
            type: 'drag-drop',
            config: {
              items: [
                { id: 'env-vars', label: 'Environment Variables', emoji: '🔐' },
                { id: 'rpc-url', label: 'RPC Endpoint URL', emoji: '🌐' },
                { id: 'package-id', label: 'Package Object ID', emoji: '📦' },
                { id: 'gas-budget', label: 'Gas Budget Config', emoji: '⛽' },
              ],
              targets: [
                { id: 'must-change', label: 'Must Change for Mainnet' },
                { id: 'best-practice', label: 'Best Practice (Recommended)' },
              ],
              correctPairs: [
                { itemId: 'rpc-url', targetId: 'must-change' },
                { itemId: 'package-id', targetId: 'must-change' },
                { itemId: 'env-vars', targetId: 'best-practice' },
                { itemId: 'gas-budget', targetId: 'best-practice' },
              ],
            },
          },
        },
        {
          title: 'Environment-Based Configuration',
          emoji: '🔧',
          content: "Create a configuration module that reads from environment variables and provides typed defaults. Use NEXT_PUBLIC_SUI_NETWORK for the network name and NEXT_PUBLIC_SUI_RPC_URL for the endpoint. This pattern lets you deploy the same code to staging (testnet) and production (mainnet) by changing environment variables. Always validate config at startup to catch misconfigurations early.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `type NetworkConfig = {\n  network: 'mainnet' | 'testnet' | 'devnet';\n  rpcUrl: string;\n  messagingPackageId: string;\n  wsUrl?: string;\n};\n\nconst NETWORK_CONFIGS: Record<string, NetworkConfig> = {\n  mainnet: {\n    network: 'mainnet',\n    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL\n      || 'https://mainnet.sui.io',\n    messagingPackageId: process.env.NEXT_PUBLIC_MESSAGING_PACKAGE_ID!,\n    wsUrl: process.env.NEXT_PUBLIC_SUI_WS_URL,\n  },\n  testnet: {\n    network: 'testnet',\n    rpcUrl: 'https://fullnode.testnet.sui.io:443',\n    messagingPackageId: '0xtestnet_package_id',\n  },\n};\n\nexport function getConfig(): NetworkConfig {\n  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';\n  const config = NETWORK_CONFIGS[network];\n  if (!config) throw new Error(\`Unknown network: \${network}\`);\n  return config;\n}`,
              highlights: [
                { line: 1, explanation: "Type-safe configuration with explicit network options" },
                { line: 11, explanation: "Environment variables override defaults for mainnet RPC" },
                { line: 13, explanation: "Package ID must be set via env var for mainnet" },
                { line: 23, explanation: "Config function validates network selection at startup" },
              ],
            },
          },
        },
        {
          title: 'Multi-RPC Failover Pattern',
          emoji: '🔄',
          content: "Production apps need redundancy. If your primary RPC provider goes down, your app should automatically failover to a secondary endpoint. Create a custom SuiClient wrapper that tries multiple RPC URLs in order. Log failover events for monitoring. Popular Sui RPC providers include Mysten Labs, Shinami, BlockVision, and Triton. Use at least two providers for reliability.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client';\n\nconst RPC_ENDPOINTS = [\n  process.env.NEXT_PUBLIC_PRIMARY_RPC!,\n  process.env.NEXT_PUBLIC_FALLBACK_RPC!,\n  'https://mainnet.sui.io',\n];\n\nexport function createResilientClient(): SuiClient {\n  let currentIndex = 0;\n\n  const tryNextEndpoint = async <T>(\n    operation: (client: SuiClient) => Promise<T>\n  ): Promise<T> => {\n    for (let i = 0; i < RPC_ENDPOINTS.length; i++) {\n      const idx = (currentIndex + i) % RPC_ENDPOINTS.length;\n      const client = new SuiClient({ url: RPC_ENDPOINTS[idx] });\n      try {\n        const result = await operation(client);\n        currentIndex = idx;\n        return result;\n      } catch (err) {\n        console.warn(\`RPC \${RPC_ENDPOINTS[idx]} failed, trying next...\`);\n        if (i === RPC_ENDPOINTS.length - 1) throw err;\n      }\n    }\n    throw new Error('All RPC endpoints failed');\n  };\n\n  return { tryNextEndpoint } as unknown as SuiClient;\n}`,
              highlights: [
                { line: 3, explanation: "List multiple RPC endpoints in priority order" },
                { line: 15, explanation: "Try each endpoint in round-robin order starting from last successful" },
                { line: 20, explanation: "Remember the last working endpoint to try first next time" },
                { line: 24, explanation: "Only throw if ALL endpoints fail" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-022',
    },
    {
      sectionTitle: 'Advanced Patterns',
      slides: [
        {
          title: 'Message Batching & Offline Queue',
          emoji: '📦',
          content: "In production, users may send messages while briefly offline or during network hiccups. Implement an offline queue that stores unsent messages in memory (or IndexedDB for persistence) and automatically retries when the connection is restored. For high-throughput channels, batch multiple messages into a single Sui transaction using a Programmable Transaction Block to save gas costs.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `class MessageQueue {\n  private queue: PendingMessage[] = [];\n  private isProcessing = false;\n  private retryDelay = 1000;\n\n  enqueue(message: PendingMessage) {\n    this.queue.push(message);\n    this.processQueue();\n  }\n\n  private async processQueue() {\n    if (this.isProcessing || this.queue.length === 0) return;\n    this.isProcessing = true;\n\n    while (this.queue.length > 0) {\n      const batch = this.queue.splice(0, 5);\n      try {\n        await this.sendBatch(batch);\n        this.retryDelay = 1000;\n      } catch (err) {\n        this.queue.unshift(...batch);\n        await this.wait(this.retryDelay);\n        this.retryDelay = Math.min(this.retryDelay * 2, 30000);\n      }\n    }\n    this.isProcessing = false;\n  }\n\n  private async sendBatch(messages: PendingMessage[]) {\n    const txb = new Transaction();\n    for (const msg of messages) {\n      txb.moveCall({\n        target: \`\${PACKAGE_ID}::messaging::send_message\`,\n        arguments: [txb.pure.string(msg.channelId), txb.pure.string(msg.text)],\n      });\n    }\n    await suiClient.signAndExecuteTransaction({ transaction: txb });\n  }\n\n  private wait(ms: number) {\n    return new Promise(resolve => setTimeout(resolve, ms));\n  }\n}`,
              highlights: [
                { line: 6, explanation: "Enqueue messages and trigger processing" },
                { line: 16, explanation: "Batch up to 5 messages per transaction to save gas" },
                { line: 21, explanation: "On failure, put messages back in queue and retry" },
                { line: 23, explanation: "Exponential backoff: 1s, 2s, 4s, 8s... up to 30s" },
              ],
            },
          },
        },
        {
          title: 'Reconnection Logic',
          emoji: '🔌',
          content: "Network connections drop. Your app needs a reconnection strategy with exponential backoff and jitter. Track connection state to show users a 'Reconnecting...' banner. When reconnected, fetch missed messages by requesting all messages since the last known timestamp. Add a heartbeat ping every 30 seconds to detect stale connections early.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Exponential Backoff", content: "Start at 1 second, double each retry: 1s, 2s, 4s, 8s, 16s. Cap at 30 seconds. Add random jitter (0-1s) to prevent thundering herd when many clients reconnect simultaneously." },
                { label: "Connection State UI", content: "Track state as 'connected' | 'reconnecting' | 'disconnected'. Show a subtle banner: green dot for connected, yellow spinner for reconnecting, red warning for disconnected." },
                { label: "Missed Message Recovery", content: "Store the timestamp of the last received message. On reconnection, call messaging.getMessages({ channelId, after: lastTimestamp }) to fetch everything you missed." },
                { label: "Heartbeat Ping", content: "Send a lightweight health check every 30 seconds. If it fails twice in a row, trigger reconnection immediately rather than waiting for the next real operation to fail." },
              ],
            },
          },
        },
        {
          title: 'Rate Limiting & Throttling',
          emoji: '🚦',
          content: "Protect your app and RPC provider by implementing client-side rate limiting. Throttle message sends to a maximum rate (e.g., 1 message per second per user). Debounce polling requests to avoid hammering the RPC when rapidly switching channels. Use a token bucket algorithm for smooth rate control that allows short bursts while maintaining average limits.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `class RateLimiter {\n  private tokens: number;\n  private lastRefill: number;\n  private readonly maxTokens: number;\n  private readonly refillRate: number;\n\n  constructor(maxPerSecond: number) {\n    this.maxTokens = maxPerSecond;\n    this.tokens = maxPerSecond;\n    this.refillRate = maxPerSecond;\n    this.lastRefill = Date.now();\n  }\n\n  async acquire(): Promise<void> {\n    this.refill();\n    if (this.tokens < 1) {\n      const waitMs = ((1 - this.tokens) / this.refillRate) * 1000;\n      await new Promise(r => setTimeout(r, waitMs));\n      this.refill();\n    }\n    this.tokens -= 1;\n  }\n\n  private refill() {\n    const now = Date.now();\n    const elapsed = (now - this.lastRefill) / 1000;\n    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);\n    this.lastRefill = now;\n  }\n}\n\n// Usage:\nconst limiter = new RateLimiter(2);\nasync function sendMessage(text: string) {\n  await limiter.acquire();\n  await messaging.sendMessage({ channelId, content: { text } });\n}`,
              highlights: [
                { line: 7, explanation: "Configure max messages per second (e.g., 2 per second)" },
                { line: 16, explanation: "If no tokens available, calculate wait time" },
                { line: 27, explanation: "Refill tokens based on elapsed time for smooth rate control" },
                { line: 35, explanation: "Always acquire a token before sending to enforce the rate limit" },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-msg-023',
    },
    {
      sectionTitle: 'Error Recovery & Monitoring',
      slides: [
        {
          title: 'Error Boundaries & Graceful Degradation',
          emoji: '🛡',
          content: "Wrap your messaging components in React Error Boundaries to catch rendering errors without crashing the whole app. Create a MessagingErrorBoundary that shows a friendly 'Chat unavailable' fallback with a retry button. For transaction errors, categorize them: network errors should retry, insufficient gas errors should prompt the user, and contract errors should log and alert. Always show user-friendly messages, never raw error strings.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `class MessagingErrorBoundary extends React.Component<\n  { children: React.ReactNode; fallback?: React.ReactNode },\n  { hasError: boolean; error: Error | null }\n> {\n  state = { hasError: false, error: null };\n\n  static getDerivedStateFromError(error: Error) {\n    return { hasError: true, error };\n  }\n\n  componentDidCatch(error: Error, info: React.ErrorInfo) {\n    console.error('[Messaging Error]', error, info);\n    reportToMonitoring(error, { component: 'messaging', ...info });\n  }\n\n  render() {\n    if (this.state.hasError) {\n      return this.props.fallback || (\n        <div className="p-6 text-center">\n          <p>Chat is temporarily unavailable.</p>\n          <button onClick={() => this.setState({ hasError: false })}>\n            Try Again\n          </button>\n        </div>\n      );\n    }\n    return this.props.children;\n  }\n}\n\n// Wrap your chat:\n<MessagingErrorBoundary>\n  <ChatWindow channelId={activeChannel} />\n</MessagingErrorBoundary>`,
              highlights: [
                { line: 7, explanation: "getDerivedStateFromError catches rendering errors" },
                { line: 13, explanation: "Report errors to your monitoring service (Sentry, DataDog, etc.)" },
                { line: 21, explanation: "Retry button resets error state to re-render the chat" },
                { line: 32, explanation: "Wrap chat components so errors don't crash the whole page" },
              ],
            },
          },
        },
        {
          title: 'Health Checks & Production Monitoring',
          emoji: '📊',
          content: "Implement health checks that verify RPC connectivity, messaging contract accessibility, and wallet connection status. Create a monitoring dashboard that tracks message send latency, RPC error rates, and transaction success rates. Emit structured logs for every messaging operation. Use a health check endpoint that your uptime monitor can ping to detect outages before users report them.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Health Check Function", content: "async function checkHealth(): Promise<HealthStatus> { const rpc = await pingRpc(); const contract = await checkContractExists(); const wallet = checkWalletConnected(); return { rpc, contract, wallet, timestamp: Date.now() }; } Run this on a 60-second interval." },
                { label: "Structured Logging", content: "Log every operation: { action: 'sendMessage', channelId, duration: 1234, success: true, rpcEndpoint: 'mainnet.sui.io' }. Use structured JSON so your log aggregator can create dashboards and alerts automatically." },
                { label: "Key Metrics to Track", content: "1) Message send latency (p50, p95, p99). 2) RPC error rate per endpoint. 3) Transaction success/failure ratio. 4) Time to first message loaded. 5) Failover events count." },
                { label: "Alerting Rules", content: "Alert if: error rate > 5% for 5 minutes, p95 latency > 10 seconds, all RPC endpoints failing, or failover events > 3 in 10 minutes. Use PagerDuty or Slack webhooks for notifications." },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-024',
    },
  ],

  quiz: [
    {
      question: 'Why should you use environment variables for RPC URLs instead of hardcoding them?',
      options: [
        'Environment variables make the app run faster',
        'So you can switch between testnet and mainnet without changing code',
        'Hardcoded URLs are blocked by Sui validators',
        'Environment variables provide automatic encryption',
      ],
      correctAnswer: 1,
      explanation: 'Environment variables let you deploy the same code to different environments (staging/testnet, production/mainnet) by changing configuration without modifying or redeploying the application code.',
      weaknessTopic: 'production-config',
    },
    {
      question: 'What is the purpose of exponential backoff with jitter in reconnection logic?',
      options: [
        'To make the reconnection animation look smoother',
        'To encrypt reconnection attempts for security',
        'To avoid overwhelming the server when many clients reconnect simultaneously',
        'To prioritize premium users over free-tier users',
      ],
      correctAnswer: 2,
      explanation: 'Exponential backoff increases wait time between retries (1s, 2s, 4s...) to reduce load. Jitter adds randomness so clients that disconnected at the same time do not all retry at the exact same moment, which would overwhelm the server (thundering herd problem).',
      weaknessTopic: 'production-config',
    },
    {
      question: 'How should a production messaging app recover missed messages after a network reconnection?',
      options: [
        'Delete all messages and reload from scratch',
        'Ask the user to manually refresh the page',
        'Fetch messages since the last known timestamp using the messaging SDK',
        'Missed messages cannot be recovered on a blockchain',
      ],
      correctAnswer: 2,
      explanation: 'Store the timestamp of the last received message. On reconnection, query for all messages after that timestamp. This efficiently fetches only what was missed without reloading everything or losing data.',
      weaknessTopic: 'production-config',
    },
    {
      question: 'What is the benefit of batching multiple messages into a single Sui transaction?',
      options: [
        'It encrypts all messages together for better security',
        'It reduces total gas costs by combining operations into one transaction',
        'It guarantees all messages are delivered in order',
        'It bypasses the rate limit on the Sui network',
      ],
      correctAnswer: 1,
      explanation: 'A Programmable Transaction Block can bundle multiple Move calls into a single transaction, which costs less total gas than executing each message send as a separate transaction. This is especially impactful for high-throughput messaging.',
      weaknessTopic: 'production-config',
    },
    {
      question: 'Why should you wrap messaging components in a React Error Boundary?',
      options: [
        'Error boundaries make the messages load faster',
        'To prevent messaging errors from crashing the entire application',
        'React requires error boundaries for all async components',
        'Error boundaries automatically retry failed transactions',
      ],
      correctAnswer: 1,
      explanation: 'React Error Boundaries catch JavaScript errors in their child component tree and display a fallback UI instead of crashing the whole page. This ensures a messaging failure shows a friendly "Chat unavailable" message rather than a blank screen.',
      weaknessTopic: 'production-config',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import { SuiClient } from '@mysten/sui/client';
import { MessagingClient } from '@mysten/messaging';
import { Transaction } from '@mysten/sui/transactions';

// ============================================
// TODO 1: Production Configuration
// ============================================

// TODO: Define a NetworkConfig type with:
//   - network: 'mainnet' | 'testnet' | 'devnet'
//   - rpcUrl: string
//   - messagingPackageId: string
//   - wsUrl?: string

// TODO: Create a getConfig() function that:
//   - Reads NEXT_PUBLIC_SUI_NETWORK from environment
//   - Returns the appropriate config for mainnet or testnet
//   - Throws an error for unknown networks

// ============================================
// TODO 2: Multi-RPC Failover Client
// ============================================

// TODO: Define an array of RPC endpoints (primary, fallback, default)

// TODO: Create a createResilientClient() function that:
//   - Maintains a currentIndex to track the last working endpoint
//   - Implements a tryNextEndpoint method that:
//     - Tries each RPC endpoint in order
//     - On success, remembers which endpoint worked
//     - On failure, logs a warning and tries the next
//     - Throws if ALL endpoints fail

// ============================================
// TODO 3: Error Handling Wrapper
// ============================================

// TODO: Create a withErrorHandling<T> higher-order function that:
//   - Takes an async operation function
//   - Wraps it in try/catch
//   - Categorizes errors (network, gas, contract)
//   - Implements retry logic for network errors (up to 3 retries)
//   - Logs errors with structured data
//   - Re-throws with user-friendly messages

// ============================================
// TODO 4: Health Check Function
// ============================================

// TODO: Define a HealthStatus type with:
//   - rpc: boolean
//   - messaging: boolean
//   - timestamp: number
//   - latencyMs: number

// TODO: Create a checkHealth() async function that:
//   - Pings the RPC endpoint (try getting chain ID)
//   - Checks messaging contract exists on-chain
//   - Measures latency of the RPC call
//   - Returns a HealthStatus object
//   - Returns degraded status on partial failures (don't throw)

// ============================================
// TODO 5: Monitoring & Logging
// ============================================

// TODO: Create a MessagingMonitor class that:
//   - Tracks message send count, error count, and total latency
//   - Has a recordSend(durationMs, success) method
//   - Has a getMetrics() method returning:
//     { totalSends, errorRate, avgLatencyMs, p95LatencyMs }
//   - Stores the last 100 latency samples for percentile calculation
`,

  solution: `import { SuiClient } from '@mysten/sui/client';
import { MessagingClient } from '@mysten/messaging';
import { Transaction } from '@mysten/sui/transactions';

// ============================================
// Part 1: Production Configuration
// ============================================

type NetworkConfig = {
  network: 'mainnet' | 'testnet' | 'devnet';
  rpcUrl: string;
  messagingPackageId: string;
  wsUrl?: string;
};

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://mainnet.sui.io',
    messagingPackageId: process.env.NEXT_PUBLIC_MESSAGING_PACKAGE_ID!,
    wsUrl: process.env.NEXT_PUBLIC_SUI_WS_URL,
  },
  testnet: {
    network: 'testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    messagingPackageId: '0xTESTNET_MESSAGING_PACKAGE',
  },
  devnet: {
    network: 'devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    messagingPackageId: '0xDEVNET_MESSAGING_PACKAGE',
  },
};

export function getConfig(): NetworkConfig {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(
      \`Unknown network: "\${network}". Expected: mainnet, testnet, or devnet.\`
    );
  }
  return config;
}

// ============================================
// Part 2: Multi-RPC Failover Client
// ============================================

const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_PRIMARY_RPC!,
  process.env.NEXT_PUBLIC_FALLBACK_RPC!,
  'https://mainnet.sui.io',
].filter(Boolean);

let currentEndpointIndex = 0;

export async function tryWithFailover<T>(
  operation: (client: SuiClient) => Promise<T>
): Promise<T> {
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const idx = (currentEndpointIndex + i) % RPC_ENDPOINTS.length;
    const client = new SuiClient({ url: RPC_ENDPOINTS[idx] });

    try {
      const result = await operation(client);
      currentEndpointIndex = idx;
      return result;
    } catch (err) {
      console.warn(
        \`[RPC Failover] \${RPC_ENDPOINTS[idx]} failed: \${(err as Error).message}. Trying next...\`
      );
      if (i === RPC_ENDPOINTS.length - 1) {
        throw new Error(
          \`All \${RPC_ENDPOINTS.length} RPC endpoints failed. Last error: \${(err as Error).message}\`
        );
      }
    }
  }
  throw new Error('No RPC endpoints configured');
}

export function createResilientClient(): SuiClient {
  return new SuiClient({ url: RPC_ENDPOINTS[currentEndpointIndex] });
}

// ============================================
// Part 3: Error Handling Wrapper
// ============================================

type ErrorCategory = 'network' | 'gas' | 'contract' | 'unknown';

function categorizeError(err: Error): ErrorCategory {
  const message = err.message.toLowerCase();
  if (message.includes('fetch') || message.includes('timeout') || message.includes('network')) {
    return 'network';
  }
  if (message.includes('gas') || message.includes('insufficient')) {
    return 'gas';
  }
  if (message.includes('moveabort') || message.includes('execution') || message.includes('contract')) {
    return 'contract';
  }
  return 'unknown';
}

const USER_FRIENDLY_MESSAGES: Record<ErrorCategory, string> = {
  network: 'Network connection issue. Please check your connection and try again.',
  gas: 'Insufficient gas. Please add SUI to your wallet to cover transaction fees.',
  contract: 'The messaging contract encountered an error. Please try again later.',
  unknown: 'An unexpected error occurred. Please try again.',
};

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      const error = err as Error;
      const category = categorizeError(error);

      console.error(\`[Messaging] \${context} failed (attempt \${attempt}/\${maxRetries})\`, {
        category,
        message: error.message,
        attempt,
        timestamp: new Date().toISOString(),
      });

      if (category === 'network' && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new Error(USER_FRIENDLY_MESSAGES[category]);
    }
  }

  throw new Error(USER_FRIENDLY_MESSAGES.unknown);
}

// ============================================
// Part 4: Health Check Function
// ============================================

type HealthStatus = {
  rpc: boolean;
  messaging: boolean;
  timestamp: number;
  latencyMs: number;
};

export async function checkHealth(): Promise<HealthStatus> {
  const config = getConfig();
  const client = new SuiClient({ url: config.rpcUrl });
  const start = Date.now();

  let rpcHealthy = false;
  let messagingHealthy = false;

  try {
    await client.getChainIdentifier();
    rpcHealthy = true;
  } catch (err) {
    console.warn('[Health] RPC check failed:', (err as Error).message);
  }

  try {
    const packageObj = await client.getObject({ id: config.messagingPackageId });
    messagingHealthy = packageObj.data !== null && packageObj.data !== undefined;
  } catch (err) {
    console.warn('[Health] Messaging contract check failed:', (err as Error).message);
  }

  const latencyMs = Date.now() - start;

  return {
    rpc: rpcHealthy,
    messaging: messagingHealthy,
    timestamp: Date.now(),
    latencyMs,
  };
}

// ============================================
// Part 5: Monitoring & Logging
// ============================================

export class MessagingMonitor {
  private totalSends = 0;
  private errorCount = 0;
  private latencySamples: number[] = [];
  private readonly maxSamples = 100;

  recordSend(durationMs: number, success: boolean) {
    this.totalSends++;
    if (!success) this.errorCount++;

    this.latencySamples.push(durationMs);
    if (this.latencySamples.length > this.maxSamples) {
      this.latencySamples.shift();
    }

    console.log('[Messaging Monitor]', {
      action: 'sendMessage',
      durationMs,
      success,
      totalSends: this.totalSends,
      timestamp: new Date().toISOString(),
    });
  }

  getMetrics() {
    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const avgLatencyMs =
      sorted.length > 0
        ? sorted.reduce((sum, v) => sum + v, 0) / sorted.length
        : 0;
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95LatencyMs = sorted.length > 0 ? sorted[p95Index] || sorted[sorted.length - 1] : 0;

    return {
      totalSends: this.totalSends,
      errorRate: this.totalSends > 0 ? this.errorCount / this.totalSends : 0,
      avgLatencyMs: Math.round(avgLatencyMs),
      p95LatencyMs,
    };
  }
}
`,

  hints: [
    "For getConfig(), use process.env.NEXT_PUBLIC_SUI_NETWORK to read the network name and look it up in a configs record",
    "In the failover logic, use a for-loop over endpoints with try/catch -- on success return the result, on failure try the next endpoint",
    "For withErrorHandling, categorize errors by checking the message string for keywords like 'fetch', 'gas', 'moveabort' and only retry network errors",
    "The health check should catch errors individually for each check (RPC, messaging) and return partial results instead of throwing",
    "For the monitor's p95 calculation, sort the latency samples array and pick the element at index Math.floor(length * 0.95)",
  ],
};
