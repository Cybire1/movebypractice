'use client';

/**
 * Data Migration Notice
 * Prompts users to sync their local progress to their account
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/lib/auth/AuthProvider';
import { useGameStore } from '@/app/lib/store/gameStore';

export default function DataMigrationNotice() {
  const { user } = useAuth();
  const { xp, completedLessons, achievements, syncToServer, userEmail } = useGameStore();
  const [showNotice, setShowNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Show if user is logged in, has local progress, but hasn't been synced
    if (user && !userEmail && (xp > 0 || completedLessons.length > 0 || achievements.length > 0)) {
      setShowNotice(true);
    }
  }, [user, xp, completedLessons, achievements, userEmail]);

  const handleSync = async () => {
    if (!user) return;

    try {
      setIsSyncing(true);
      await syncToServer();
      setShowNotice(false);
    } catch (error) {
      console.error('Failed to sync data:', error);
      alert('Failed to sync your progress. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSkip = () => {
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-sui-sky rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-sui-ocean" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-sui-navy mb-3">
              Sync Your Progress?
            </h2>
            <p className="text-sui-gray-600 mb-4">
              We found existing progress on this device. Would you like to sync it to your account?
            </p>

            {/* Progress Summary */}
            <div className="bg-sui-sky rounded-xl p-4 space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-sui-gray-700">XP Earned</span>
                <span className="font-semibold text-sui-navy">{xp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-sui-gray-700">Lessons Completed</span>
                <span className="font-semibold text-sui-navy">{completedLessons.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-sui-gray-700">Achievements</span>
                <span className="font-semibold text-sui-navy">{achievements.length}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full px-6 py-3 bg-sui-ocean text-white rounded-full hover:bg-sui-ocean-dark transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Syncing...' : 'Sync My Progress'}
            </button>
            <button
              onClick={handleSkip}
              disabled={isSyncing}
              className="w-full px-6 py-3 bg-white border-2 border-sui-gray-300 text-sui-gray-700 rounded-full hover:border-sui-gray-400 transition-all font-semibold disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-sui-gray-500 mt-4">
            Your progress will be saved to the cloud and synced across devices.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
