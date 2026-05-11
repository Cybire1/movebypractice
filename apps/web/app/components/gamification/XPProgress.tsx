'use client';

import { useGameStore } from '@/app/lib/store/gameStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const XP_PER_LEVEL = 1000;

export default function XPProgress() {
  const { xp, level, streak } = useGameStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  const currentLevelXP = xp % XP_PER_LEVEL;
  const progressPercentage = (currentLevelXP / XP_PER_LEVEL) * 100;

  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  return (
    <div className="relative">
      {/* Level Up Animation */}
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-sui-ocean to-sui-ocean-dark text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl">
            🎉 Level Up! Level {level}
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-4 bg-white border-2 border-sui-gray-200 rounded-2xl p-5 shadow-sm">
        {/* Level Badge */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sui-ocean to-sui-ocean-dark flex items-center justify-center shadow-md">
            <div className="text-center">
              <div className="text-xs text-white/80 font-medium">Level</div>
              <div className="text-2xl font-bold text-white">{level}</div>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-sui-gray-600 font-medium">XP Progress</span>
            <span className="text-sm font-bold text-sui-ocean">
              {currentLevelXP} / {XP_PER_LEVEL} XP
            </span>
          </div>

          <div className="h-3 bg-sui-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sui-ocean to-sui-ocean-dark"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex-shrink-0 text-center px-3 py-2 bg-sui-ocean/10 rounded-xl">
            <div className="text-2xl">🔥</div>
            <div className="text-xs text-sui-ocean font-bold">{streak} day{streak !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>
    </div>
  );
}
