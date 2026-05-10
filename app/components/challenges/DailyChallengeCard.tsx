'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '../../types/challenges';
import Link from 'next/link';

interface DailyChallengeCardProps {
  challenge: Challenge;
  userStreak: number;
  isCompleted: boolean;
  onStartChallenge: () => void;
}

export default function DailyChallengeCard({
  challenge,
  userStreak,
  isCompleted,
  onStartChallenge
}: DailyChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate time until next challenge (midnight)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const difficultyColors = {
    easy: 'bg-green-50 text-green-600 border-green-200',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    hard: 'bg-red-50 text-red-600 border-red-200'
  };

  const typeIcons = {
    code_completion: '📝',
    bug_fix: '🐛',
    output_prediction: '🔮',
    write_function: '⚡'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-surface-elevated rounded-2xl sm:rounded-3xl border-2 border-sui-navy p-6 sm:p-8 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl sm:text-3xl">{typeIcons[challenge.type]}</span>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-sui-navy">
                Daily Challenge
              </h3>
              <p className="text-xs sm:text-sm text-sui-gray-600">
                Resets in {timeLeft}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${difficultyColors[challenge.difficulty]}`}>
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-sui-sky/30 text-sui-ocean border border-sui-ocean/20">
              {challenge.topic.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-surface-secondary text-foreground-secondary border border-[var(--border-default)]">
              ~{challenge.estimatedTime} min
            </span>
          </div>
        </div>

        {/* Streak Counter */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-3 sm:p-4 shadow-lg ml-3"
        >
          <div className="text-2xl sm:text-3xl font-bold">{userStreak}</div>
          <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
            Day Streak
          </div>
          <div className="text-lg sm:text-xl mt-1">🔥</div>
        </motion.div>
      </div>

      {/* Challenge Title & Description */}
      <div className="mb-6">
        <h4 className="text-xl sm:text-2xl font-bold text-sui-navy mb-2">
          {challenge.title}
        </h4>
        <p className="text-sm sm:text-base text-sui-gray-700">
          {challenge.description}
        </p>
      </div>

      {/* XP Rewards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        <div className="bg-sui-sky/20 rounded-lg p-2 sm:p-3 text-center border border-sui-ocean/20">
          <div className="text-base sm:text-lg font-bold text-sui-ocean">
            {challenge.baseXP}
          </div>
          <div className="text-[10px] sm:text-xs text-sui-gray-600">Base XP</div>
        </div>
        <div className="bg-sui-sky/20 rounded-lg p-2 sm:p-3 text-center border border-sui-ocean/20">
          <div className="text-base sm:text-lg font-bold text-sui-ocean">
            +{challenge.timeBonus}
          </div>
          <div className="text-[10px] sm:text-xs text-sui-gray-600">Speed Bonus</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center border border-green-200">
          <div className="text-base sm:text-lg font-bold text-green-600">
            +{challenge.noHintBonus}
          </div>
          <div className="text-[10px] sm:text-xs text-sui-gray-600">No Hints</div>
        </div>
      </div>

      {/* Action Button */}
      {isCompleted ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-lg font-bold text-green-700">Challenge Completed!</div>
          <div className="text-sm text-green-600 mt-1">
            Come back tomorrow for a new challenge
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartChallenge}
          className="w-full bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white rounded-xl py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-sui-ocean/40 transition-all"
        >
          <span className="flex items-center justify-center gap-2">
            Start Challenge
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </span>
        </motion.button>
      )}

      {/* Related Lesson Link */}
      {challenge.relatedLesson && (
        <div className="mt-4 text-center">
          <Link
            href={`/lessons/${challenge.relatedLesson}`}
            className="text-xs sm:text-sm text-sui-ocean hover:text-sui-ocean-dark underline"
          >
            Need help? Review the {challenge.topic.replace('_', ' ')} lesson
          </Link>
        </div>
      )}
    </motion.div>
  );
}
