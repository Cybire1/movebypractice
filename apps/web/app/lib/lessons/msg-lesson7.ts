import { LessonContent } from '@/app/types/lesson';

export const msgLesson7: LessonContent = {
  id: 'msg-7',
  title: 'React Integration Patterns',
  description: 'Build React components and hooks for a complete chat UI powered by the Sui messaging SDK.',
  difficulty: 'advanced',
  xpReward: 350,
  order: 7,
  language: 'typescript',
  prerequisiteLessons: ['msg-6'],

  narrative: {
    welcomeMessage: "Time to build the UI! Let's create React components that bring your messaging to life.",
    quizTransition: "Let's test your understanding of React integration patterns...",
    practiceTransition: "Build a ChatProvider, useChat hook, and ChatWindow component!",
    celebrationMessage: "Your chat UI is complete! You've built a full React messaging interface.",
  },

  teachingSections: [
    {
      sectionTitle: 'Context Provider Pattern',
      slides: [
        {
          title: 'Creating a MessagingProvider',
          emoji: '🏗',
          content: "The first step to integrating @mysten/messaging into React is creating a context provider. This wraps your entire app and makes the MessagingClient instance available to every component via React context. The provider initializes the client once and shares it, avoiding redundant connections and ensuring a single source of truth for all messaging state.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { createContext, useContext, useMemo } from 'react';\nimport { MessagingClient } from '@mysten/messaging';\nimport { useSuiClient } from '@mysten/dapp-kit';\n\ninterface MessagingContextType {\n  client: MessagingClient | null;\n}\n\nconst MessagingContext = createContext<MessagingContextType>({\n  client: null,\n});\n\nexport function MessagingProvider({ children }: { children: React.ReactNode }) {\n  const suiClient = useSuiClient();\n\n  const messagingClient = useMemo(\n    () => new MessagingClient({ suiClient }),\n    [suiClient]\n  );\n\n  return (\n    <MessagingContext.Provider value={{ client: messagingClient }}>\n      {children}\n    </MessagingContext.Provider>\n  );\n}`,
              highlights: [
                { line: 2, explanation: "Import MessagingClient from the @mysten/messaging SDK" },
                { line: 9, explanation: "Create a typed context with MessagingClient as the value" },
                { line: 16, explanation: "useMemo ensures the client is only created once per suiClient instance" },
                { line: 22, explanation: "The Provider wrapper makes the client available to all children" },
              ],
            },
          },
        },
        {
          title: 'Wrapping Your App with the Provider',
          emoji: '🌐',
          content: "Place the MessagingProvider inside your SuiClientProvider and WalletProvider so it has access to the Sui client and wallet context. The provider hierarchy matters: SuiClientProvider > WalletProvider > MessagingProvider > your app components. This ensures the messaging client can access both the RPC connection and the user's wallet for signing transactions.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';\nimport { MessagingProvider } from './providers/MessagingProvider';\nimport { ChatWindow } from './components/ChatWindow';\n\nexport default function App() {\n  return (\n    <SuiClientProvider>\n      <WalletProvider>\n        <MessagingProvider>\n          <ChatWindow />\n        </MessagingProvider>\n      </WalletProvider>\n    </SuiClientProvider>\n  );\n}`,
              highlights: [
                { line: 7, explanation: "SuiClientProvider is the outermost - provides RPC connection" },
                { line: 8, explanation: "WalletProvider enables wallet signing for messages" },
                { line: 9, explanation: "MessagingProvider wraps components that need messaging" },
                { line: 10, explanation: "ChatWindow and all children can now access the messaging client" },
              ],
            },
          },
        },
        {
          title: 'Consuming Context with useMessaging',
          emoji: '🔌',
          content: "Create a custom hook `useMessaging()` that wraps useContext for type safety and error handling. This hook throws an error if used outside the provider, preventing subtle bugs. Components call useMessaging() to get the client instance and can then call methods like sendMessage, getChannel, and subscribeToMessages directly.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `export function useMessaging(): MessagingClient {\n  const context = useContext(MessagingContext);\n\n  if (!context.client) {\n    throw new Error(\n      'useMessaging must be used within a <MessagingProvider>'\n    );\n  }\n\n  return context.client;\n}\n\n// Usage in any component:\nfunction SendButton() {\n  const messaging = useMessaging();\n\n  const handleSend = async (text: string) => {\n    await messaging.sendMessage({\n      channelId,\n      content: { text },\n    });\n  };\n}`,
              highlights: [
                { line: 1, explanation: "Custom hook returns the MessagingClient directly" },
                { line: 4, explanation: "Guard clause prevents usage outside the provider tree" },
                { line: 14, explanation: "Any component can now access the messaging client cleanly" },
                { line: 18, explanation: "Call SDK methods directly from the returned client" },
              ],
            },
          },
        },
      ],
      exerciseId: 'cc-msg-019',
    },
    {
      sectionTitle: 'Chat UI Components',
      slides: [
        {
          title: 'Building a ChatWindow Component',
          emoji: '💬',
          content: "The ChatWindow is the top-level container that composes MessageList and MessageInput. It manages the active channel state and coordinates between child components. Use a clean layout with flex column: the message list fills available space with overflow-y scroll, and the input sticks to the bottom. The ChatWindow also handles loading and empty states.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface ChatWindowProps {\n  channelId: string;\n}\n\nexport function ChatWindow({ channelId }: ChatWindowProps) {\n  const { messages, sendMessage, isLoading } = useChat(channelId);\n\n  if (isLoading) return <LoadingSkeleton />;\n\n  return (\n    <div className=\"flex flex-col h-full\">\n      <ChannelHeader channelId={channelId} />\n      <MessageList\n        messages={messages}\n        className=\"flex-1 overflow-y-auto\"\n      />\n      <MessageInput onSend={sendMessage} />\n    </div>\n  );\n}`,
              highlights: [
                { line: 6, explanation: "useChat hook provides messages, send function, and loading state" },
                { line: 11, explanation: "Flex column layout with full height fills the container" },
                { line: 13, explanation: "MessageList takes the flexible space and scrolls" },
                { line: 17, explanation: "MessageInput is fixed at the bottom for composing messages" },
              ],
            },
          },
        },
        {
          title: 'The MessageList Component',
          emoji: '📜',
          content: "MessageList renders an array of Message objects with proper styling for sent vs received messages. Use a ref to auto-scroll to the bottom when new messages arrive. Each message bubble shows the sender address (truncated), content, and a timestamp. Group consecutive messages from the same sender to reduce visual clutter.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `import { Message } from '@mysten/messaging';\nimport { useCurrentAccount } from '@mysten/dapp-kit';\n\ninterface MessageListProps {\n  messages: Message[];\n  className?: string;\n}\n\nexport function MessageList({ messages, className }: MessageListProps) {\n  const account = useCurrentAccount();\n  const bottomRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [messages.length]);\n\n  return (\n    <div className={className}>\n      {messages.map((msg) => (\n        <MessageBubble\n          key={msg.id}\n          message={msg}\n          isOwn={msg.sender === account?.address}\n        />\n      ))}\n      <div ref={bottomRef} />\n    </div>\n  );\n}`,
              highlights: [
                { line: 1, explanation: "Import the Message type from the SDK for type safety" },
                { line: 10, explanation: "useCurrentAccount determines which messages are 'ours'" },
                { line: 14, explanation: "Auto-scroll to bottom when new messages arrive" },
                { line: 23, explanation: "Compare sender address to distinguish sent vs received" },
              ],
            },
          },
        },
        {
          title: 'The MessageInput Component',
          emoji: '✏',
          content: "MessageInput handles text composition with a controlled input, send button, and keyboard shortcut (Enter to send). Disable the input while a message is being sent to prevent double-sends. Add a character limit indicator and handle empty-string validation. The component calls onSend from props and clears the input on success.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `interface MessageInputProps {\n  onSend: (text: string) => Promise<void>;\n}\n\nexport function MessageInput({ onSend }: MessageInputProps) {\n  const [text, setText] = useState('');\n  const [isSending, setIsSending] = useState(false);\n\n  const handleSend = async () => {\n    const trimmed = text.trim();\n    if (!trimmed || isSending) return;\n\n    setIsSending(true);\n    try {\n      await onSend(trimmed);\n      setText('');\n    } finally {\n      setIsSending(false);\n    }\n  };\n\n  const handleKeyDown = (e: React.KeyboardEvent) => {\n    if (e.key === 'Enter' && !e.shiftKey) {\n      e.preventDefault();\n      handleSend();\n    }\n  };\n\n  return (\n    <div className=\"flex gap-2 p-4 border-t\">\n      <textarea\n        value={text}\n        onChange={(e) => setText(e.target.value)}\n        onKeyDown={handleKeyDown}\n        placeholder=\"Type a message...\"\n        disabled={isSending}\n        className=\"flex-1 resize-none\"\n      />\n      <button onClick={handleSend} disabled={isSending || !text.trim()}>\n        {isSending ? 'Sending...' : 'Send'}\n      </button>\n    </div>\n  );\n}`,
              highlights: [
                { line: 2, explanation: "onSend is async - returns a Promise so we can track sending state" },
                { line: 11, explanation: "Guard against empty messages and double-sends" },
                { line: 16, explanation: "Clear input only after successful send" },
                { line: 23, explanation: "Enter sends, Shift+Enter adds a new line" },
              ],
            },
          },
        },
      ],
      exerciseId: 'bf-msg-020',
    },
    {
      sectionTitle: 'State Management',
      slides: [
        {
          title: 'Building the useChat Hook',
          emoji: '🪝',
          content: "The useChat custom hook encapsulates all messaging state: fetching messages, polling for updates, sending messages, and optimistic UI updates. It uses useState for the message array and loading flag, and useEffect for initial fetch and polling interval. The hook returns a clean API: { messages, sendMessage, isLoading, error }. This separates data logic from UI rendering completely.",
          interactiveElement: {
            type: 'code-highlight',
            config: {
              code: `export function useChat(channelId: string) {\n  const messaging = useMessaging();\n  const [messages, setMessages] = useState<Message[]>([]);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n\n  // Fetch messages and poll for updates\n  useEffect(() => {\n    let cancelled = false;\n\n    const fetchMessages = async () => {\n      try {\n        const result = await messaging.getMessages({ channelId });\n        if (!cancelled) {\n          setMessages(result.messages);\n          setIsLoading(false);\n        }\n      } catch (err) {\n        if (!cancelled) setError(err as Error);\n      }\n    };\n\n    fetchMessages();\n    const interval = setInterval(fetchMessages, 3000);\n\n    return () => {\n      cancelled = true;\n      clearInterval(interval);\n    };\n  }, [channelId, messaging]);\n\n  return { messages, isLoading, error, sendMessage };\n}`,
              highlights: [
                { line: 2, explanation: "Get the messaging client from context via useMessaging hook" },
                { line: 9, explanation: "Cancelled flag prevents state updates after unmount" },
                { line: 24, explanation: "Poll every 3 seconds for new messages" },
                { line: 26, explanation: "Cleanup function clears interval and sets cancelled flag" },
              ],
            },
          },
        },
        {
          title: 'Optimistic Updates',
          emoji: '🚀',
          content: "Optimistic updates make the UI feel instant. When the user sends a message, immediately add it to the local state with a temporary ID and a 'pending' status. Once the transaction confirms on-chain, replace the optimistic message with the real one. If the send fails, mark it as 'failed' and show a retry button. This pattern is critical for good UX on blockchain apps where confirmations take a few seconds.",
          interactiveElement: {
            type: 'click-reveal',
            config: {
              reveals: [
                { label: "Step 1: Optimistic Insert", content: "Immediately add the message to local state with status: 'pending' and a temp ID. The user sees it instantly." },
                { label: "Step 2: Send Transaction", content: "Call messaging.sendMessage() in the background. The message is already visible in the UI while the transaction processes." },
                { label: "Step 3: Confirm or Rollback", content: "On success, replace the temp message with the confirmed one. On failure, mark it as 'failed' with a retry option." },
                { label: "Code Pattern", content: "setMessages(prev => [...prev, optimisticMsg]); try { const real = await messaging.sendMessage(...); setMessages(prev => prev.map(m => m.id === tempId ? real : m)); } catch { setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)); }" },
              ],
            },
          },
        },
      ],
      exerciseId: 'mc-msg-021',
    },
  ],

  quiz: [
    {
      question: 'Why should the MessagingClient be created with useMemo inside the provider?',
      options: [
        'useMemo makes the client faster',
        'It prevents creating a new client instance on every re-render',
        'useMemo is required by the @mysten/messaging SDK',
        'It encrypts the client connection automatically',
      ],
      correctAnswer: 1,
      explanation: 'useMemo ensures the MessagingClient is only instantiated once (or when its dependencies change). Without it, every re-render would create a new client, wasting resources and breaking stateful connections.',
      weaknessTopic: 'react-patterns',
    },
    {
      question: 'What is the correct provider nesting order for a Sui messaging dApp?',
      options: [
        'MessagingProvider > WalletProvider > SuiClientProvider',
        'WalletProvider > SuiClientProvider > MessagingProvider',
        'SuiClientProvider > WalletProvider > MessagingProvider',
        'The order does not matter',
      ],
      correctAnswer: 2,
      explanation: 'SuiClientProvider must be outermost because WalletProvider depends on it. MessagingProvider depends on both, so it goes innermost. Each provider consumes context from the providers above it.',
      weaknessTopic: 'react-patterns',
    },
    {
      question: 'Why does the useChat hook use a cancelled flag in the useEffect cleanup?',
      options: [
        'To cancel the blockchain transaction if the component unmounts',
        'To prevent setting state on an unmounted component after async operations',
        'To stop the messaging SDK from sending duplicate messages',
        'To clear the message encryption keys from memory',
      ],
      correctAnswer: 1,
      explanation: 'The cancelled flag prevents calling setState after the component has unmounted. Without it, async operations that complete after unmount cause React warnings and potential memory leaks.',
      weaknessTopic: 'react-patterns',
    },
    {
      question: 'What is the purpose of optimistic updates in a messaging UI?',
      options: [
        'To encrypt messages before they are sent to the blockchain',
        'To show the sent message immediately in the UI before on-chain confirmation',
        'To batch multiple messages into a single Sui transaction',
        'To cache messages in local storage for offline access',
      ],
      correctAnswer: 1,
      explanation: 'Optimistic updates immediately add the message to the local UI state, making the chat feel instant. The actual blockchain confirmation happens in the background, and the UI updates again when confirmed or shows a retry on failure.',
      weaknessTopic: 'react-patterns',
    },
    {
      question: 'How should the MessageInput component prevent double-sending?',
      options: [
        'Disable the send button and input while isSending is true',
        'Use a debounce function with a 5-second delay',
        'Remove the send button after the first click',
        'Store sent messages in localStorage to check for duplicates',
      ],
      correctAnswer: 0,
      explanation: 'The simplest and most effective approach is tracking an isSending boolean state. While true, the send handler returns early and the UI disables the button/input, preventing duplicate submissions.',
      weaknessTopic: 'react-patterns',
    },
  ],
  quizPassThreshold: 0.8,

  starterCode: `import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { MessagingClient, Message } from '@mysten/messaging';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';

// ============================================
// TODO 1: Create the MessagingContext and Provider
// ============================================

// Define the context type
interface MessagingContextType {
  client: MessagingClient | null;
}

// TODO: Create the context with createContext
// const MessagingContext = ...

// TODO: Create the MessagingProvider component that:
// - Uses useSuiClient() to get the Sui client
// - Creates a MessagingClient with useMemo
// - Wraps children in MessagingContext.Provider
// export function MessagingProvider({ children }: { children: React.ReactNode }) { ... }

// TODO: Create the useMessaging() hook that:
// - Calls useContext(MessagingContext)
// - Throws an error if client is null (used outside provider)
// - Returns the MessagingClient
// export function useMessaging(): MessagingClient { ... }

// ============================================
// TODO 2: Build the useChat custom hook
// ============================================

// TODO: Create the useChat hook that:
// - Takes a channelId string parameter
// - Uses useMessaging() to get the client
// - Manages messages state with useState<Message[]>([])
// - Manages isLoading state with useState(true)
// - Uses useEffect to fetch messages and poll every 3 seconds
// - Implements cleanup with a cancelled flag and clearInterval
// - Implements a sendMessage function with optimistic updates
// - Returns { messages, sendMessage, isLoading, error }

// export function useChat(channelId: string) { ... }

// ============================================
// TODO 3: Build the ChatWindow component
// ============================================

// TODO: Create the ChatWindow component that:
// - Takes a channelId prop
// - Uses the useChat hook to get messages, sendMessage, isLoading
// - Renders a flex column layout with:
//   - A MessageList component (messages + auto-scroll to bottom)
//   - A MessageInput component (text input + send button + Enter key handler)
// - Handles loading state with a loading indicator
// - The MessageInput should disable while sending

// export function ChatWindow({ channelId }: { channelId: string }) { ... }
`,

  solution: `import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { MessagingClient, Message } from '@mysten/messaging';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';

// ============================================
// Part 1: MessagingContext and Provider
// ============================================

interface MessagingContextType {
  client: MessagingClient | null;
}

const MessagingContext = createContext<MessagingContextType>({
  client: null,
});

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const suiClient = useSuiClient();

  const messagingClient = useMemo(
    () => new MessagingClient({ suiClient }),
    [suiClient]
  );

  return (
    <MessagingContext.Provider value={{ client: messagingClient }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging(): MessagingClient {
  const context = useContext(MessagingContext);

  if (!context.client) {
    throw new Error('useMessaging must be used within a <MessagingProvider>');
  }

  return context.client;
}

// ============================================
// Part 2: useChat custom hook
// ============================================

export function useChat(channelId: string) {
  const messaging = useMessaging();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const result = await messaging.getMessages({ channelId });
        if (!cancelled) {
          setMessages(result.messages);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [channelId, messaging]);

  const sendMessage = async (text: string) => {
    const tempId = \`temp-\${Date.now()}\`;
    const optimisticMessage: Message = {
      id: tempId,
      channelId,
      content: { text },
      sender: 'self',
      timestamp: Date.now(),
      status: 'pending',
    } as Message;

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const confirmed = await messaging.sendMessage({
        channelId,
        content: { text },
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? confirmed : m))
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' } as Message : m
        )
      );
      throw err;
    }
  };

  return { messages, sendMessage, isLoading, error };
}

// ============================================
// Part 3: ChatWindow component
// ============================================

function MessageList({ messages }: { messages: Message[] }) {
  const account = useCurrentAccount();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg) => {
        const isOwn = msg.sender === account?.address;
        return (
          <div
            key={msg.id}
            className={\`flex \${isOwn ? 'justify-end' : 'justify-start'}\`}
          >
            <div
              className={\`max-w-xs px-4 py-2 rounded-lg \${
                isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }\`}
            >
              <p>{msg.content.text}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isSending}
        className="flex-1 resize-none border rounded-lg p-2"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={isSending || !text.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

export function ChatWindow({ channelId }: { channelId: string }) {
  const { messages, sendMessage, isLoading } = useChat(channelId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
`,

  hints: [
    "Start with createContext<MessagingContextType>({ client: null }) to create the context with a default null value",
    "Use useMemo(() => new MessagingClient({ suiClient }), [suiClient]) to avoid recreating the client on every render",
    "In useChat, remember to return a cleanup function from useEffect that sets cancelled = true and calls clearInterval",
    "For optimistic updates, add the message to state immediately with a temp ID, then replace it after the transaction confirms",
    "In MessageInput, track isSending state and check it in the handleSend guard clause to prevent double-sends",
  ],
};
