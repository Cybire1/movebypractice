'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeInterface from '../components/challenges/ChallengeInterface';
import { Challenge, ChallengeStreak } from '../types/challenges';
import {
  getTodaysChallenge,
  hasCompletedToday,
  calculateStreak,
  getStreakBonusXP
} from '../utils/challengeRotation';

function CountdownTimer() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[
        { val: time.h, label: 'HR' },
        { val: time.m, label: 'MIN' },
        { val: time.s, label: 'SEC' },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="bg-surface-elevated border border-[var(--border-default)] rounded-xl px-3 py-2 min-w-[52px] text-center">
            <div className="text-xl font-mono font-black tabular-nums">{pad(unit.val)}</div>
            <div className="text-[9px] font-bold text-foreground-tertiary uppercase tracking-widest">{unit.label}</div>
          </div>
          {i < 2 && <span className="text-foreground-tertiary font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}

function StreakRing({ streak }: { streak: number }) {
  const maxDisplay = 30;
  const progress = Math.min(streak / maxDisplay, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border-default)" strokeWidth="6" />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={streak > 0 ? '#f97316' : 'var(--border-default)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.4 }}
          className="text-4xl font-black"
        >
          {streak}
        </motion.div>
        <div className="text-[10px] font-bold text-foreground-tertiary uppercase tracking-widest">
          Day Streak
        </div>
      </div>
    </div>
  );
}

export default function DailyChallengePage() {
  const [todaysChallenge, setTodaysChallenge] = useState<Challenge | null>(null);
  const [isInChallenge, setIsInChallenge] = useState(false);
  const [userStreak, setUserStreak] = useState<ChallengeStreak>({
    userId: 'demo-user',
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    totalChallengesCompleted: 0
  });
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    const challenge = getTodaysChallenge();
    setTodaysChallenge(challenge);

    const savedStreak = localStorage.getItem('challengeStreak');
    if (savedStreak) {
      const streak = JSON.parse(savedStreak);
      setUserStreak(streak);
      setCompletedToday(hasCompletedToday(streak.lastCompletedDate));
    }
  }, []);

  const handleStartChallenge = () => setIsInChallenge(true);
  const handleExitChallenge = () => setIsInChallenge(false);

  const handleCompleteChallenge = (earnedXP: number, timeSpent: number, hintsUsed: number) => {
    const streakStatus = calculateStreak(userStreak.lastCompletedDate);
    const newStreak = { ...userStreak };

    if (streakStatus.shouldContinue) {
      newStreak.currentStreak += 1;
    } else if (streakStatus.shouldReset) {
      newStreak.currentStreak = 1;
    }

    newStreak.lastCompletedDate = getTodaysChallenge()?.date || '';
    newStreak.totalChallengesCompleted += 1;
    newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);

    const streakBonus = getStreakBonusXP(newStreak.currentStreak);
    localStorage.setItem('challengeStreak', JSON.stringify(newStreak));
    setUserStreak(newStreak);
    setCompletedToday(true);
    setIsInChallenge(false);
  };

  if (!todaysChallenge) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="text-foreground-secondary">Loading today&apos;s challenge...</div>
      </div>
    );
  }

  if (isInChallenge) {
    return (
      <ChallengeInterface
        challenge={todaysChallenge}
        onComplete={handleCompleteChallenge}
        onExit={handleExitChallenge}
      />
    );
  }

  const difficultyColor = {
    easy: 'bg-emerald-500 text-white',
    medium: 'bg-amber-500 text-white',
    hard: 'bg-red-500 text-white',
  }[todaysChallenge.difficulty];

  return (
    <div className="min-h-screen bg-surface-secondary pt-28 sm:pt-36 pb-16 px-6 sm:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <p className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest mb-4">
              Today&apos;s Challenge
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-4">
              Daily Challenge
            </h1>
            <p className="text-lg text-foreground-secondary font-medium max-w-lg">
              Sharpen your Move skills with a new challenge every day. Build streaks, earn bonus XP, and master the language.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <StreakRing streak={userStreak.currentStreak} />
          </motion.div>
        </div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-elevated rounded-[2rem] border-2 border-[var(--border-default)] p-8 md:p-10 mb-8"
        >
          {/* Badges + Timer Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${difficultyColor}`}>
                {todaysChallenge.difficulty}
              </span>
              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-secondary text-foreground-tertiary border border-[var(--border-default)]">
                {todaysChallenge.topic.replace('_', ' ')}
              </span>
              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-secondary text-foreground-tertiary border border-[var(--border-default)]">
                ~{todaysChallenge.estimatedTime} min
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-foreground-tertiary uppercase tracking-widest">Resets in</span>
              <CountdownTimer />
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            {todaysChallenge.title}
          </h2>
          <p className="text-foreground-secondary text-lg font-medium mb-10 max-w-2xl">
            {todaysChallenge.description}
          </p>

          {/* XP Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: todaysChallenge.baseXP, label: 'Base XP', accent: false },
              { value: `+${todaysChallenge.timeBonus}`, label: 'Speed Bonus', accent: false },
              { value: `+${todaysChallenge.noHintBonus}`, label: 'No Hints', accent: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl p-5 text-center border-2 transition-colors ${
                  item.accent
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-surface-secondary border-[var(--border-default)]'
                }`}
              >
                <div className={`text-2xl md:text-3xl font-black ${item.accent ? 'text-emerald-400' : 'text-foreground'}`}>
                  {item.value}
                </div>
                <div className="text-xs font-bold text-foreground-tertiary uppercase tracking-wider mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          {completedToday ? (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-8 text-center">
              <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-2xl font-black text-emerald-400 mb-1">Challenge Completed!</div>
              <div className="text-foreground-secondary font-medium">Come back tomorrow for a new challenge</div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartChallenge}
              className="w-full bg-zinc-900 text-white rounded-full py-5 font-bold text-lg shadow-xl hover:bg-zinc-800 transition-all group"
            >
              <span className="flex items-center justify-center gap-2">
                Start Challenge
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </motion.button>
          )}

          {todaysChallenge.relatedLesson && (
            <p className="text-center mt-5">
              <a href={`/lessons/${todaysChallenge.relatedLesson}`} className="text-sm text-[#4A90D9] hover:text-[#6BB5FF] font-medium transition-colors">
                Need help? Review the {todaysChallenge.topic.replace('_', ' ')} lesson →
              </a>
            </p>
          )}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { value: userStreak.currentStreak, label: 'Current Streak', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            )},
            { value: userStreak.longestStreak, label: 'Best Streak', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-2.77.682 6.016 6.016 0 01-2.77-.682" />
              </svg>
            )},
            { value: userStreak.totalChallengesCompleted, label: 'Completed', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-elevated rounded-2xl border-2 border-[var(--border-default)] p-6 text-center"
            >
              <div className="text-foreground-tertiary mb-3 flex justify-center">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-foreground-tertiary uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-elevated rounded-[2rem] border-2 border-[var(--border-default)] p-8 md:p-10"
        >
          <h2 className="text-2xl font-black tracking-tight mb-8">How It Works</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: 'New Challenge Every Day',
                desc: 'A fresh Move coding challenge unlocks at midnight',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
              },
              {
                title: 'Build Your Streak',
                desc: 'Complete daily to maintain your streak and earn bonus XP',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                ),
              },
              {
                title: 'Speed & No-Hint Bonuses',
                desc: 'Finish within 3 minutes or solve without hints for extra XP',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Progressive Hints',
                desc: 'Stuck? Use up to 3 hints per challenge, each revealing more',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-[var(--border-subtle)] flex items-center justify-center text-foreground-tertiary flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
