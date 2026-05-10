'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useGameStore } from '@/app/lib/store/gameStore';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

// --- Components ---

const BentoGrid = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 auto-rows-[225px] gap-4 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
};

const BentoItem = ({
  children,
  className = "",
  colSpan = 1,
  rowSpan = 1
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        group relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-surface-elevated/60 p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-sui-navy/5
        ${colSpan === 2 ? 'md:col-span-2' : colSpan === 3 ? 'md:col-span-3' : colSpan === 4 ? 'md:col-span-4' : 'md:col-span-1'}
        ${rowSpan === 2 ? 'md:row-span-2' : 'md:row-span-1'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

// 1. Hero Profile Card
const ProfileHero = ({ user, level, xp }: { user: any, level: number, xp: number }) => {
  // Calculate progress to next level (arbitrary formula for visuals: level * 1000)
  const nextLevelXp = (level + 1) * 1000;
  const progress = Math.min((xp / nextLevelXp) * 100, 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full flex flex-col justify-between relative z-10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-sui-gray-500 uppercase tracking-widest mb-1">Welcome back</h2>
          <h1 className="text-3xl md:text-4xl font-black text-sui-navy tracking-tighter-swiss">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Builder'}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-sui-navy/5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-sui-navy">Online & Ready</span>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              className="text-sui-gray-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50%"
              cy="50%"
            />
            <motion.circle
              className="text-sui-ocean"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50%"
              cy="50%"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ strokeDasharray: circumference, strokeLinecap: "round" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-black text-sui-navy">{level}</span>
            <span className="text-[10px] uppercase font-bold text-sui-gray-400">Level</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/lessons" className="inline-flex items-center gap-2 text-sui-ocean font-bold hover:underline">
          Continue Learning
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>

      {/* Decoration */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sui-ocean/5 rounded-full blur-3xl" />
    </div>
  );
};

// 2. Network Visualizer (Mock Force Graph)
const NetworkVisualizer = () => {
  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <h3 className="text-lg font-bold text-sui-navy z-10">Network State</h3>
      <p className="text-xs text-sui-gray-500 mb-4 z-10">Visualizing your Move objects</p>

      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        {/* Animated Graph Nodes */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-sui-navy/10" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Nodes */}
          <motion.g
            animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="30" cy="40" r="4" className="fill-sui-ocean" />
          </motion.g>
          <motion.g
            animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="70" cy="60" r="6" className="fill-sui-navy" />
          </motion.g>
          <motion.g
            animate={{ scale: [1, 1.2, 1] }}
            style={{ transformOrigin: "50px 50px" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="50" cy="50" r="8" className="fill-sui-ocean" />
          </motion.g>
          {/* Connecting Lines */}
          <motion.g
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="30" y1="40" x2="50" y2="50" stroke="currentColor" className="text-sui-navy" strokeWidth="1" opacity="0.2" />
          </motion.g>
          <motion.g
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <line x1="70" y1="60" x2="50" y2="50" stroke="currentColor" className="text-sui-navy" strokeWidth="1" opacity="0.2" />
          </motion.g>
        </svg>
      </div>

      <div className="mt-auto z-10 flex gap-2">
        <div className="px-2 py-1 bg-surface-elevated/80 rounded-lg border border-[var(--border-subtle)] text-[10px] font-mono text-sui-navy overflow-hidden">
          0x8...a3f2
        </div>
        <div className="px-2 py-1 bg-surface-elevated/80 rounded-lg border border-[var(--border-subtle)] text-[10px] font-mono text-sui-navy overflow-hidden">
          Mycoin::Store
        </div>
      </div>
    </div>
  );
};

// 3. Stat Card
const StatCard = ({ label, value, icon, color = "bg-sui-navy" }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-sui-navy/10`}>
        {icon}
      </div>
      <div>
        <h3 className="text-3xl font-black text-sui-navy tracking-tighter">{value}</h3>
        <p className="text-xs font-bold text-sui-gray-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
};

// 4. Streak Heatmap ("Embers")
const StreakEmbers = ({ streak }: { streak: number }) => {
  // Generate a mock year of data
  const days = 14 * 7; // Last 14 weeks
  const intensity = Array.from({ length: days }, (_, i) => Math.random() > 0.7 ? Math.ceil(Math.random() * 3) : 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-bold text-sui-navy">Contribution Activity</h3>
          <p className="text-xs text-sui-gray-500">Last 3 months</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-sui-ocean">{streak}</span>
          <span className="text-xs font-bold text-sui-gray-400 block uppercase">Day Streak</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[repeat(14,1fr)] gap-1 content-center justify-center">
        {intensity.map((val, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={`
                         w-3 h-3 rounded-sm
                         ${val === 0 ? 'bg-sui-gray-100' : ''}
                         ${val === 1 ? 'bg-sui-ocean/40' : ''}
                         ${val === 2 ? 'bg-sui-ocean/70' : ''}
                         ${val === 3 ? 'bg-sui-ocean shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}
                       `}
          />
        ))}
      </div>
    </div>
  );
};

// 5. 3D Credential Card
const CredentialCard = ({ achievement }: { achievement: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  if (!achievement) return (
    <div className="h-full w-full rounded-[2rem] border border-[var(--border-subtle)] bg-surface-elevated/60 p-6 backdrop-blur-xl flex items-center justify-center text-sui-gray-400 text-center">
      <div>
        <div className="w-12 h-12 bg-sui-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">🔒</div>
        <p className="text-sm">Complete lessons to earn credentials</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ perspective: 1000 }}>
      <h3 className="text-lg font-bold text-sui-navy mb-4 z-10 relative pointer-events-none">Latest Credential</h3>

      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100 }}
        drag
        dragElastic={0.16}
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        whileHover={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
        className="flex-1 w-full bg-gradient-to-br from-sui-navy to-black rounded-2xl p-6 shadow-2xl relative overflow-hidden group border border-white/10"
      >
        {/* Card Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full items-center justify-center text-center pointer-events-none">
          <div className="text-5xl mb-4 filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            {achievement.icon}
          </div>
          <h4 className="text-white font-bold text-xl mb-1">{achievement.name}</h4>
          <p className="text-white/60 text-xs uppercase tracking-widest">Soulbound Token</p>
        </div>

        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sui-ocean via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};

// --- Main Page ---

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { xp, level, streak, completedLessons, achievements, loadFromServer } = useGameStore();
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
        <div className="w-16 h-16 border-4 border-sui-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-secondary text-sui-navy pt-28 pb-20 px-4 md:px-8 bg-grid-graph">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter-swiss text-sui-navy mb-2">Dashboard</h1>
          <p className="text-sui-gray-500 font-medium">Your command center for Move development.</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-sm font-bold text-sui-gray-400 uppercase tracking-widest">Current Session</div>
          <div className="font-mono text-sui-navy">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <BentoGrid>
        {/* 1. Hero (2x2) */}
        <BentoItem colSpan={2} rowSpan={2}>
          <ProfileHero user={user} level={level} xp={xp} />
        </BentoItem>

        {/* 2. Network Visualizer (2x1) - Next to Hero on top right */}
        <BentoItem colSpan={2} rowSpan={1} className="bg-sui-gray-50/50">
          <NetworkVisualizer />
        </BentoItem>

        {/* 3. Stat: Completed Lessons (1x1) */}
        <BentoItem colSpan={1} rowSpan={1}>
          <StatCard
            label="Lessons Done"
            value={completedLessons.length}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </BentoItem>

        {/* 4. Stat: Sui Earned (1x1) */}
        <BentoItem colSpan={1} rowSpan={1}>
          <StatCard
            label="Sui Earned"
            value="12.5"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="bg-sui-ocean"
          />
        </BentoItem>

        {/* 5. Streak Heatmap (2x2) */}
        <BentoItem colSpan={2} rowSpan={2}>
          <StreakEmbers streak={streak} />
        </BentoItem>

        {/* 6. Credential 3D Card (1x2 tall) */}
        <BentoItem colSpan={1} rowSpan={2} className="!p-0 !bg-transparent border-none !shadow-none !overflow-visible">
          <CredentialCard achievement={achievements[achievements.length - 1]} />
        </BentoItem>

        {/* 7. Action / Daily Challenge (1x2) */}
        <BentoItem colSpan={1} rowSpan={2} className="bg-gradient-to-br from-sui-ocean to-sui-navy border-none">
          <Link href="/daily-challenge" className="h-full flex flex-col justify-center items-center text-center text-white group-hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="font-bold text-lg leading-tight">Daily<br />Challenge</h3>
            <div className="mt-2 text-xs opacity-80 font-mono bg-white/20 px-2 py-1 rounded">
              +50 XP
            </div>
          </Link>
        </BentoItem>

      </BentoGrid>
    </div>
  );
}
