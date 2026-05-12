'use client';

import { useState, useRef, MouseEvent } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/app/lib/store/gameStore';

// Types
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Lesson {
  id: number | string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  difficulty: Difficulty;
  topics: string[];
  isLocked: boolean;
  colSpan?: 1 | 2; // For Bento Grid layout
}

// Data
const moveLessons: Lesson[] = [
  {
    id: 'move-1',
    title: 'Hello Move',
    description: 'Your first Move module — learn module structure, entry functions, and basic types on Sui.',
    duration: '20 min',
    xp: 100,
    difficulty: 'Beginner',
    topics: ['Modules', 'Functions', 'Basics'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'move-2',
    title: 'Mastering Move Types',
    description: 'Deep dive into the Move type system: integers, booleans, addresses, vectors, and type casting.',
    duration: '25 min',
    xp: 150,
    difficulty: 'Beginner',
    topics: ['Types', 'Primitives', 'Casting'],
    isLocked: false,
  },
  {
    id: 'move-3',
    title: 'Control Flow & Logic',
    description: 'Master if/else, loops, abort, assert, and scoping rules in Move.',
    duration: '30 min',
    xp: 200,
    difficulty: 'Beginner',
    topics: ['Control Flow', 'Loops', 'Logic'],
    isLocked: false,
  },
  {
    id: 'move-4',
    title: 'Structs & Objects',
    description: 'Define structs with abilities, understand the Sui object model, and create on-chain objects.',
    duration: '35 min',
    xp: 250,
    difficulty: 'Intermediate',
    topics: ['Structs', 'Objects', 'Abilities'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'move-5',
    title: 'Collections & Dynamic Fields',
    description: 'Work with vectors, Tables, and dynamic fields to store flexible on-chain data.',
    duration: '35 min',
    xp: 300,
    difficulty: 'Intermediate',
    topics: ['Vectors', 'Tables', 'Dynamic Fields'],
    isLocked: false,
  },
  {
    id: 'move-6',
    title: 'Ownership & Transfer',
    description: 'Master owned, shared, and immutable objects with transfer patterns on Sui.',
    duration: '40 min',
    xp: 350,
    difficulty: 'Advanced',
    topics: ['Ownership', 'Transfer', 'Sharing'],
    isLocked: false,
  },
  {
    id: 'move-7',
    title: 'Advanced Generics & Patterns',
    description: 'Implement the witness pattern, phantom types, hot potato, and capability patterns in Move.',
    duration: '45 min',
    xp: 500,
    difficulty: 'Advanced',
    topics: ['Generics', 'Patterns', 'Advanced'],
    isLocked: false,
    colSpan: 2,
  },
];

const messagingLessons: Lesson[] = [
  {
    id: 'msg-1',
    title: 'On-Chain Messaging on Sui',
    description: 'Learn why decentralized messaging matters and explore the @mysten/messaging SDK architecture.',
    duration: '25 min',
    xp: 100,
    difficulty: 'Beginner',
    topics: ['Messaging', 'SDK', 'Architecture'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'msg-2',
    title: 'Setting Up the Messaging Client',
    description: 'Configure SuiClient, SealClient, and WalrusClient to create a fully-featured messaging client.',
    duration: '30 min',
    xp: 150,
    difficulty: 'Beginner',
    topics: ['SuiClient', 'Config', 'Setup'],
    isLocked: false,
  },
  {
    id: 'msg-3',
    title: 'Channels - Creation & Management',
    description: 'Create messaging channels, manage members, and control channel lifecycle on Sui.',
    duration: '35 min',
    xp: 200,
    difficulty: 'Intermediate',
    topics: ['Channels', 'Members', 'Lifecycle'],
    isLocked: false,
  },
  {
    id: 'msg-4',
    title: 'Messages - Sending & Receiving',
    description: 'Send messages to channels, poll for new messages, and handle message delivery.',
    duration: '40 min',
    xp: 250,
    difficulty: 'Intermediate',
    topics: ['Messages', 'Polling', 'Delivery'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'msg-5',
    title: 'Encryption with Seal',
    description: 'Implement end-to-end encryption using Sui Seal for private messaging channels.',
    duration: '40 min',
    xp: 300,
    difficulty: 'Intermediate',
    topics: ['Encryption', 'Seal', 'Privacy'],
    isLocked: false,
  },
  {
    id: 'msg-6',
    title: 'Walrus Storage & Attachments',
    description: 'Use Walrus decentralized storage to send file attachments through messaging channels.',
    duration: '40 min',
    xp: 300,
    difficulty: 'Advanced',
    topics: ['Walrus', 'Storage', 'Attachments'],
    isLocked: false,
  },
  {
    id: 'msg-7',
    title: 'React Integration Patterns',
    description: 'Build React components and hooks for a complete chat UI powered by the messaging SDK.',
    duration: '45 min',
    xp: 350,
    difficulty: 'Advanced',
    topics: ['React', 'Hooks', 'Components'],
    isLocked: false,
  },
  {
    id: 'msg-8',
    title: 'Production Deployment',
    description: 'Deploy your messaging app to mainnet with multi-RPC failover, monitoring, and error recovery.',
    duration: '50 min',
    xp: 500,
    difficulty: 'Advanced',
    topics: ['Production', 'Mainnet', 'Monitoring'],
    isLocked: false,
    colSpan: 2,
  },
];

const predictLessons: Lesson[] = [
  {
    id: 'predict-1',
    title: 'What is DeepBook Predict?',
    description: 'Discover binary options on Sui — positions, sentinel encoding, protocol architecture, and market lifecycle.',
    duration: '25 min',
    xp: 100,
    difficulty: 'Beginner',
    topics: ['Binary Options', 'Architecture', 'Basics'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'predict-2',
    title: 'Oracle Architecture & Price Feeds',
    description: 'Deep dive into OracleSVI, Pyth Lazer price feeds, spot vs forward, and strike grid generation.',
    duration: '30 min',
    xp: 150,
    difficulty: 'Beginner',
    topics: ['Oracles', 'Price Feeds', 'Strikes'],
    isLocked: false,
  },
  {
    id: 'predict-3',
    title: 'SVI Pricing Model',
    description: 'Master the Stochastic Volatility Inspired model — 5 parameters, variance function, d2, and normalCDF.',
    duration: '35 min',
    xp: 200,
    difficulty: 'Intermediate',
    topics: ['SVI', 'Pricing', 'Volatility'],
    isLocked: false,
  },
  {
    id: 'predict-4',
    title: 'Fee Structure & Economics',
    description: 'Understand Bernoulli fees, utilization fees, FLOAT_SCALING encoding, and protocol economics.',
    duration: '35 min',
    xp: 250,
    difficulty: 'Intermediate',
    topics: ['Fees', 'Economics', 'Encoding'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'predict-5',
    title: 'Building Trading Transactions',
    description: 'Build PTBs for PredictManager setup, DUSDC deposits, minting positions, and atomic operations.',
    duration: '40 min',
    xp: 300,
    difficulty: 'Intermediate',
    topics: ['PTB', 'Transactions', 'Mint'],
    isLocked: false,
  },
  {
    id: 'predict-6',
    title: 'LP Vault Management',
    description: 'Learn vault architecture, PLP tokens, supply/withdraw flows, and risk management limits.',
    duration: '40 min',
    xp: 300,
    difficulty: 'Advanced',
    topics: ['Vault', 'LP', 'PLP'],
    isLocked: false,
  },
  {
    id: 'predict-7',
    title: 'Portfolio & P&L',
    description: 'Track positions, compute unrealized and realized P&L, and handle settlement and redemption.',
    duration: '45 min',
    xp: 350,
    difficulty: 'Advanced',
    topics: ['Portfolio', 'P&L', 'Settlement'],
    isLocked: false,
    colSpan: 2,
  },
  {
    id: 'predict-8',
    title: 'React Integration Patterns',
    description: 'Build a trading dApp with React hooks, visibility-aware polling, and transaction signing.',
    duration: '50 min',
    xp: 400,
    difficulty: 'Advanced',
    topics: ['React', 'Hooks', 'dApp Kit'],
    isLocked: false,
  },
];

// --- Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-[var(--border-default)] bg-surface-elevated overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 ease-out ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-multiply"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(82, 82, 91, 0.15),
              transparent 80%
            )
      `,
        }}
      />
      {children}
    </div>
  );
}

const ROTATION_RANGE = 20;
const HALF_ROTATION_RANGE = 20 / 2;

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Lesson Card ---

function LessonCard({ lesson, i, isCompleted, isLocked }: { lesson: Lesson; i: number; isCompleted: boolean; isLocked: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className={`${lesson.colSpan === 2 ? 'md:col-span-2' : ''}`}
    >
      <Link href={isLocked ? '#' : `/lessons/${lesson.id}`} className={isLocked ? 'cursor-not-allowed' : ''}>
        <TiltCard className={`h-full ${isLocked ? 'pointer-events-none' : ''}`}>
          <SpotlightCard className={`h-full rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-500
                          ${isLocked ? 'bg-surface-secondary opacity-60 grayscale' : 'bg-surface-elevated hover:shadow-2xl hover:shadow-zinc-900/10'}`
          }>
            {/* Top Row */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full
                    ${lesson.difficulty === 'Beginner' ? 'bg-sui-accent' :
                      lesson.difficulty === 'Intermediate' ? 'bg-sui-accent-dark' :
                        'bg-black'
                    }
                  `} />
                  <span className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
                    {lesson.difficulty}
                  </span>
                </div>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </span>
                )}
              </div>
              <span className="font-mono text-foreground-tertiary text-sm">
                #{typeof lesson.id === 'number' ? String(lesson.id).padStart(2, '0') : lesson.id}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight group-hover:text-[#8596A5] transition-colors">
                {lesson.title}
              </h3>
              <p className="text-foreground-secondary font-medium leading-relaxed mb-8 max-w-md">
                {lesson.description}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="relative z-10 mt-auto pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
              <div className="flex gap-4 text-sm font-semibold text-foreground-tertiary">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {lesson.duration}
                </span>
                <span className="flex items-center gap-1.5 text-sui-accent-dark">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  {lesson.xp} XP
                </span>
              </div>

              {/* Play Button Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                  ${isLocked ? 'bg-surface-secondary' : 'bg-surface-secondary group-hover:bg-sui-accent group-hover:text-black'}
                              `}>
                {isLocked ? (
                  <svg className="w-4 h-4 text-foreground-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </div>
            </div>
          </SpotlightCard>
        </TiltCard>
      </Link>
    </motion.div>
  );
}

// --- Main Page ---

export default function LessonsPage() {
  const { xp, completedLessons } = useGameStore();
  const [filter, setFilter] = useState<Difficulty | 'All'>('All');

  const filteredMoveLessons = moveLessons.filter(
    (l) => filter === 'All' || l.difficulty === filter
  );

  const filteredMsgLessons = messagingLessons.filter(
    (l) => filter === 'All' || l.difficulty === filter
  );

  const filteredPredictLessons = predictLessons.filter(
    (l) => filter === 'All' || l.difficulty === filter
  );

  return (
    <div className="min-h-screen bg-surface-secondary text-foreground pb-32">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

      {/* Header Section */}
      <header className="relative z-10 pt-20 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter-swiss mb-4 leading-none"
            >
              Curriculum
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-xl text-foreground-secondary max-w-lg"
            >
              A masterclass in Move. From zero to mainnet.
            </motion.p>
          </div>

          {/* XP Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-surface-elevated px-6 py-3 rounded-full border border-[var(--border-default)] shadow-sm"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wider font-bold text-foreground-tertiary">Total XP</span>
              <span className="text-2xl font-black text-sui-accent-dark font-mono">{xp}</span>
            </div>
            <div className="h-10 w-px bg-[var(--border-default)]" />
            <div className="flex flex-col items-start">
              <span className="text-xs uppercase tracking-wider font-bold text-foreground-tertiary">Completed</span>
              <span className="text-2xl font-black text-foreground font-mono">{completedLessons.length}/{moveLessons.length + messagingLessons.length + predictLessons.length}</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-24 z-20 px-4 sm:px-6 mb-12">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="inline-flex bg-[var(--surface-overlay)] backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border-default)] shadow-lg shadow-zinc-200/50 dark:shadow-black/20 overflow-x-auto max-w-full scrollbar-hide">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${filter === f
                  ? 'bg-zinc-900 text-white shadow-md dark:bg-zinc-700 dark:shadow-none transform scale-105'
                  : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Move Fundamentals Module */}
        {filteredMoveLessons.length > 0 && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Move Fundamentals</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Move</span>
              </div>
              <p className="text-foreground-secondary font-medium">Master the Move language from first principles in 7 lessons.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(250px,auto)] md:auto-rows-[minmax(300px,auto)]">
              {filteredMoveLessons.map((lesson, i) => {
                const isCompleted = completedLessons.includes(lesson.id.toString());
                const isLocked = lesson.isLocked;
                return (
                  <LessonCard key={lesson.id} lesson={lesson} i={i} isCompleted={isCompleted} isLocked={isLocked} />
                );
              })}
            </div>
          </>
        )}

        {/* Messaging Module */}
        {filteredMsgLessons.length > 0 && (
          <>
            <div className="mt-24 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Sui Messaging SDK</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">TypeScript</span>
              </div>
              <p className="text-foreground-secondary font-medium">Build encrypted, decentralized messaging on Sui in 8 lessons.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(250px,auto)] md:auto-rows-[minmax(300px,auto)]">
              {filteredMsgLessons.map((lesson, i) => {
                const isCompleted = completedLessons.includes(lesson.id.toString());
                const isLocked = lesson.isLocked;
                return (
                  <LessonCard key={lesson.id} lesson={lesson} i={i} isCompleted={isCompleted} isLocked={isLocked} />
                );
              })}
            </div>
          </>
        )}

        {/* DeepBook Predict Module */}
        {filteredPredictLessons.length > 0 && (
          <>
            <div className="mt-24 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">DeepBook Predict</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">TypeScript</span>
              </div>
              <p className="text-foreground-secondary font-medium">Build binary options trading dApps on Sui with DeepBook Predict in 8 lessons.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(250px,auto)] md:auto-rows-[minmax(300px,auto)]">
              {filteredPredictLessons.map((lesson, i) => {
                const isCompleted = completedLessons.includes(lesson.id.toString());
                const isLocked = lesson.isLocked;
                return (
                  <LessonCard key={lesson.id} lesson={lesson} i={i} isCompleted={isCompleted} isLocked={isLocked} />
                );
              })}
            </div>
          </>
        )}
      </main>

    </div>
  );
}
