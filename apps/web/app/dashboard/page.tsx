'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useGameStore } from '@/app/lib/store/gameStore';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import Link from 'next/link';

// --- Lesson data for module progress ---
const MODULES = [
  {
    name: 'Move Fundamentals',
    prefix: 'move-',
    total: 7,
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    ringColor: '#10B981',
    tag: 'Move',
  },
  {
    name: 'Sui Messaging',
    prefix: 'msg-',
    total: 8,
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    ringColor: '#3B82F6',
    tag: 'TypeScript',
  },
  {
    name: 'DeepBook Predict',
    prefix: 'predict-',
    total: 8,
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    ringColor: '#8B5CF6',
    tag: 'TypeScript',
  },
  {
    name: 'Hashi: Bitcoin on Sui',
    prefix: 'hashi-',
    total: 3,
    color: '#F7931A',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    ringColor: '#F7931A',
    tag: 'TypeScript',
  },
];

const ALL_LESSONS = [
  { id: 'move-1', title: 'Hello Move', module: 'Move Fundamentals' },
  { id: 'move-2', title: 'Mastering Move Types', module: 'Move Fundamentals' },
  { id: 'move-3', title: 'Control Flow & Logic', module: 'Move Fundamentals' },
  { id: 'move-4', title: 'Structs & Objects', module: 'Move Fundamentals' },
  { id: 'move-5', title: 'Collections & Dynamic Fields', module: 'Move Fundamentals' },
  { id: 'move-6', title: 'Ownership & Transfer', module: 'Move Fundamentals' },
  { id: 'move-7', title: 'Advanced Generics & Patterns', module: 'Move Fundamentals' },
  { id: 'msg-1', title: 'On-Chain Messaging on Sui', module: 'Sui Messaging' },
  { id: 'msg-2', title: 'Setting Up the Messaging Client', module: 'Sui Messaging' },
  { id: 'msg-3', title: 'Channels - Creation & Management', module: 'Sui Messaging' },
  { id: 'msg-4', title: 'Messages - Sending & Receiving', module: 'Sui Messaging' },
  { id: 'msg-5', title: 'Encryption with Seal', module: 'Sui Messaging' },
  { id: 'msg-6', title: 'Walrus Storage & Attachments', module: 'Sui Messaging' },
  { id: 'msg-7', title: 'React Integration Patterns', module: 'Sui Messaging' },
  { id: 'msg-8', title: 'Production Deployment', module: 'Sui Messaging' },
  { id: 'predict-1', title: 'What is DeepBook Predict?', module: 'DeepBook Predict' },
  { id: 'predict-2', title: 'Oracle Architecture & Price Feeds', module: 'DeepBook Predict' },
  { id: 'predict-3', title: 'SVI Pricing Model', module: 'DeepBook Predict' },
  { id: 'predict-4', title: 'Fee Structure & Economics', module: 'DeepBook Predict' },
  { id: 'predict-5', title: 'Building Trading Transactions', module: 'DeepBook Predict' },
  { id: 'predict-6', title: 'LP Vault Management', module: 'DeepBook Predict' },
  { id: 'predict-7', title: 'Portfolio & P&L', module: 'DeepBook Predict' },
  { id: 'predict-8', title: 'React Integration Patterns', module: 'DeepBook Predict' },
  { id: 'hashi-1', title: 'Introduction to Hashi', module: 'Hashi: Bitcoin on Sui' },
  { id: 'hashi-2', title: 'Building on Hashi', module: 'Hashi: Bitcoin on Sui' },
  { id: 'hashi-3', title: 'Advanced Hashi', module: 'Hashi: Bitcoin on Sui' },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯' },
  { id: 'first-exercise', name: 'Code Runner', description: 'Complete your first exercise', icon: '💻' },
  { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'move-complete', name: 'Move Master', description: 'Complete all Move lessons', icon: '🏆' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'exercises-10', name: 'Practice Pro', description: 'Complete 10 exercises', icon: '🧠' },
];

// --- Animated Number ---
function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toString();
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref} className={className}>0</span>;
}

// --- Progress Ring ---
function ProgressRing({
  progress,
  color,
  size = 88,
  strokeWidth = 6,
  children,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--border-default)]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { xp, level, streak, completedLessons, completedExercises, completedQuizzes, achievements, loadFromServer } = useGameStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
    if (user?.email) {
      loadFromServer(user.email).then(() => setIsLoading(false));
    }
  }, [user, authLoading, router, loadFromServer]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="w-12 h-12 border-3 border-foreground-tertiary border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Compute data
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Builder';
  const nextLevelXp = (level + 1) * 1000;
  const xpProgress = Math.min((xp % 1000) / 1000 * 100, 100);
  const xpToNext = nextLevelXp - xp;
  const totalLessons = 23;

  // Module progress
  const moduleProgress = MODULES.map((mod) => {
    const completed = completedLessons.filter((id) => id.startsWith(mod.prefix)).length;
    const pct = Math.round((completed / mod.total) * 100);
    return { ...mod, completed, pct };
  });

  // Next lesson to continue
  const nextLesson = ALL_LESSONS.find((l) => !completedLessons.includes(l.id));
  const allDone = !nextLesson;

  // Merge achievements with defaults for locked state
  const achievementDisplay = DEFAULT_ACHIEVEMENTS.map((def) => {
    const unlocked = achievements.find((a: any) => a.id === def.id);
    return { ...def, unlocked: !!unlocked, unlockedAt: unlocked?.unlockedAt };
  });

  return (
    <div className="min-h-screen bg-surface-secondary text-foreground pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-foreground-tertiary text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{displayName}</h1>

              {/* XP Bar */}
              <div className="max-w-md">
                <div className="flex justify-between text-xs font-semibold text-foreground-tertiary mb-1.5">
                  <span>Level {level}</span>
                  <span>{xpToNext > 0 ? `${xpToNext} XP to Level ${level + 1}` : 'Max Level'}</span>
                </div>
                <div className="h-2.5 bg-[var(--border-default)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#4A90D9] to-[#6BB5FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </div>

            {/* Level Ring + Streak */}
            <div className="flex items-center gap-6">
              <ProgressRing progress={xpProgress} color="#4A90D9" size={80} strokeWidth={5}>
                <div className="text-center">
                  <span className="text-xl font-black">{level}</span>
                  <span className="block text-[9px] uppercase font-bold text-foreground-tertiary tracking-wider">LVL</span>
                </div>
              </ProgressRing>

              <div className="text-center px-4 py-3 bg-surface-secondary rounded-xl border border-[var(--border-default)]">
                <div className="text-2xl mb-0.5">{streak > 0 ? '🔥' : '❄️'}</div>
                <span className="text-xl font-black">{streak}</span>
                <span className="block text-[9px] uppercase font-bold text-foreground-tertiary tracking-wider">Streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total XP',
              value: xp,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ),
              accent: 'from-amber-500/20 to-orange-500/20',
              iconBg: 'bg-amber-500/10 text-amber-500',
            },
            {
              label: 'Lessons',
              value: completedLessons.length,
              suffix: `/${totalLessons}`,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              ),
              accent: 'from-blue-500/20 to-cyan-500/20',
              iconBg: 'bg-blue-500/10 text-blue-500',
            },
            {
              label: 'Exercises',
              value: completedExercises.length,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              ),
              accent: 'from-emerald-500/20 to-green-500/20',
              iconBg: 'bg-emerald-500/10 text-emerald-500',
            },
            {
              label: 'Quizzes',
              value: completedQuizzes.length,
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              ),
              accent: 'from-purple-500/20 to-violet-500/20',
              iconBg: 'bg-purple-500/10 text-purple-500',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-5 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber value={stat.value} className="text-2xl font-black" />
                {stat.suffix && <span className="text-sm font-semibold text-foreground-tertiary">{stat.suffix}</span>}
              </div>
              <p className="text-xs font-semibold text-foreground-tertiary mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Module Progress ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-4">Module Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moduleProgress.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-5 flex items-center gap-5"
              >
                <ProgressRing progress={mod.pct} color={mod.ringColor} size={72} strokeWidth={5}>
                  <span className="text-sm font-black">{mod.pct}%</span>
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{mod.name}</h3>
                  <p className="text-xs text-foreground-tertiary mt-0.5">
                    {mod.completed}/{mod.total} lessons
                  </p>
                  <div className="mt-2 h-1.5 bg-[var(--border-default)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: mod.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${mod.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Achievements ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-bold mb-4">Achievements</h2>
          <div className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-5">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {achievementDisplay.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                    ach.unlocked
                      ? 'hover:bg-surface-secondary cursor-default'
                      : 'opacity-30 grayscale'
                  }`}
                  title={ach.description}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${
                    ach.unlocked ? 'bg-surface-secondary' : 'bg-[var(--border-default)]'
                  }`}>
                    {ach.unlocked ? ach.icon : '🔒'}
                  </div>
                  <span className="text-[10px] font-bold leading-tight">{ach.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Continue Learning ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {allDone ? (
            <div className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold mb-1">All lessons completed!</h3>
              <p className="text-foreground-tertiary text-sm">You&apos;ve finished the entire curriculum. Keep practicing with exercises.</p>
              <Link
                href="/exercises"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-foreground text-surface rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Practice Exercises
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ) : nextLesson ? (
            <Link href={`/lessons/${nextLesson.id}`} className="block group">
              <div className="bg-surface-elevated rounded-2xl border border-[var(--border-default)] p-6 flex items-center justify-between hover:border-[#4A90D9]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#4A90D9]/10 text-[#4A90D9] flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground-tertiary mb-0.5">Continue where you left off</p>
                    <h3 className="font-bold">{nextLesson.title}</h3>
                    <p className="text-xs text-foreground-tertiary">{nextLesson.module}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-foreground-tertiary group-hover:text-foreground group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ) : null}
        </motion.div>

      </div>
    </div>
  );
}
