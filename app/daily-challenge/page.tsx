'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DailyChallengeCard from '../components/challenges/DailyChallengeCard';
import ChallengeInterface from '../components/challenges/ChallengeInterface';
import { Challenge, ChallengeStreak } from '../types/challenges';
import {
  getTodaysChallenge,
  hasCompletedToday,
  calculateStreak,
  getStreakBonusXP
} from '../utils/challengeRotation';

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
    // Load today's challenge using rotation system
    const challenge = getTodaysChallenge();
    setTodaysChallenge(challenge);

    // Load user streak from localStorage
    const savedStreak = localStorage.getItem('challengeStreak');
    if (savedStreak) {
      const streak = JSON.parse(savedStreak);
      setUserStreak(streak);

      // Check if completed today using rotation system helper
      setCompletedToday(hasCompletedToday(streak.lastCompletedDate));
    }
  }, []);

  const handleStartChallenge = () => {
    setIsInChallenge(true);
  };

  const handleExitChallenge = () => {
    setIsInChallenge(false);
  };

  const handleCompleteChallenge = (earnedXP: number, timeSpent: number, hintsUsed: number) => {
    // Update streak using the streak calculation system
    const streakStatus = calculateStreak(userStreak.lastCompletedDate);
    const newStreak = { ...userStreak };

    if (streakStatus.shouldContinue) {
      // Continue streak (completed yesterday)
      newStreak.currentStreak += 1;
    } else if (streakStatus.shouldReset) {
      // Reset streak (missed a day)
      newStreak.currentStreak = 1;
    }
    // If isToday, don't modify streak (already completed today)

    newStreak.lastCompletedDate = getTodaysChallenge()?.date || '';
    newStreak.totalChallengesCompleted += 1;
    newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);

    // Calculate streak bonus XP
    const streakBonus = getStreakBonusXP(newStreak.currentStreak);
    const totalXP = earnedXP + streakBonus;

    // Save to localStorage
    localStorage.setItem('challengeStreak', JSON.stringify(newStreak));
    setUserStreak(newStreak);
    setCompletedToday(true);
    setIsInChallenge(false);

    // In production, save completion data with XP, time, hints to backend
    console.log('Challenge completed:', {
      baseXP: earnedXP,
      streakBonus,
      totalXP,
      timeSpent,
      hintsUsed,
      newStreak: newStreak.currentStreak
    });
  };

  if (!todaysChallenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-sui-gray-600">Loading today&apos;s challenge...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sui-sky/20 to-surface pt-28 sm:pt-32 pb-8 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-sui-navy mb-3 sm:mb-4">
            Daily Challenge
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-sui-gray-600">
            Sharpen your Move skills with a new challenge every day
          </p>
        </motion.div>

        {/* Challenge Card */}
        <DailyChallengeCard
          challenge={todaysChallenge}
          userStreak={userStreak.currentStreak}
          isCompleted={completedToday}
          onStartChallenge={handleStartChallenge}
        />

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-[var(--border-default)] p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-sui-ocean mb-2">
              {userStreak.currentStreak}
            </div>
            <div className="text-xs sm:text-sm text-sui-gray-600 font-medium">
              Current Streak
            </div>
          </div>

          <div className="bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-[var(--border-default)] p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-bold text-sui-ocean mb-2">
              {userStreak.longestStreak}
            </div>
            <div className="text-xs sm:text-sm text-sui-gray-600 font-medium">
              Longest Streak
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6 text-center col-span-2 sm:col-span-1">
            <div className="text-3xl sm:text-4xl font-bold text-sui-ocean mb-2">
              {userStreak.totalChallengesCompleted}
            </div>
            <div className="text-xs sm:text-sm text-sui-gray-600 font-medium">
              Total Completed
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-surface-elevated rounded-xl sm:rounded-2xl border-2 border-[var(--border-default)] p-4 sm:p-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-sui-navy mb-4">
            How Daily Challenges Work
          </h2>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sui-sky/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sui-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sui-navy text-sm sm:text-base mb-1">
                  New Challenge Every Day
                </h3>
                <p className="text-xs sm:text-sm text-sui-gray-600">
                  A fresh Move coding challenge unlocks at midnight every day
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sui-navy text-sm sm:text-base mb-1">
                  Build Your Streak
                </h3>
                <p className="text-xs sm:text-sm text-sui-gray-600">
                  Complete challenges daily to maintain your streak and earn bonus XP
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sui-sky/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sui-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sui-navy text-sm sm:text-base mb-1">
                  Speed & No-Hint Bonuses
                </h3>
                <p className="text-xs sm:text-sm text-sui-gray-600">
                  Complete within 3 minutes for time bonus, solve without hints for extra XP
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sui-sky/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sui-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sui-navy text-sm sm:text-base mb-1">
                  Progressive Hints Available
                </h3>
                <p className="text-xs sm:text-sm text-sui-gray-600">
                  Stuck? Use up to 3 hints per challenge, each giving more guidance
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
