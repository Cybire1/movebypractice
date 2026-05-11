'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseRenderer from '../exercises/ExerciseRenderer';
import { Exercise, ValidationResult, ExerciseFeedback } from '../../types/exercises';
import { getExerciseById } from '../../data/exercises';

interface LessonExercisesProps {
  exerciseIds: string[];
  onAllComplete: () => void;
}

export default function LessonExercises({
  exerciseIds,
  onAllComplete
}: LessonExercisesProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [hintsUsedTotal, setHintsUsedTotal] = useState(0);

  // Load exercises from IDs
  const exercises: Exercise[] = exerciseIds
    .map(id => getExerciseById(id))
    .filter((ex): ex is Exercise => ex !== undefined);

  if (exercises.length === 0) {
    return null;
  }

  const currentExercise = exercises[currentExerciseIndex];
  const progress = Math.round((completedExercises.size / exercises.length) * 100);
  const allCompleted = completedExercises.size === exercises.length;

  const handleExerciseComplete = (result: ValidationResult, feedback: ExerciseFeedback) => {
    // Mark exercise as completed
    setCompletedExercises(prev => new Set([...prev, currentExercise.id]));
    setTotalXPEarned(prev => prev + feedback.earnedXP);

    // Move to next exercise after delay
    setTimeout(() => {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // All exercises completed
        onAllComplete();
      }
    }, 2000);
  };

  const handleHintRequest = () => {
    setHintsUsedTotal(prev => prev + 1);
  };

  const handleSkip = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-sui-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-sui-navy">
              Practice Exercises
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-sui-gray-600">Total XP</div>
                <div className="text-lg sm:text-xl font-bold text-sui-ocean">
                  +{totalXPEarned}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sui-gray-600">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </span>
              <span className="font-semibold text-sui-navy">
                {completedExercises.size}/{exercises.length} completed
              </span>
            </div>
            <div className="w-full bg-sui-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-sui-ocean to-sui-ocean-dark h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Exercise Type Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  completedExercises.has(ex.id)
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : idx === currentExerciseIndex
                    ? 'bg-sui-ocean text-white border-2 border-sui-ocean-dark'
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                }`}
              >
                {idx + 1}. {ex.type.replace('_', ' ')}
                {completedExercises.has(ex.id) && ' ✓'}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Current Exercise */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ExerciseRenderer
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            onHintRequest={handleHintRequest}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentExerciseIndex === 0}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 text-sui-navy rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          ← Previous
        </button>

        <button
          onClick={handleSkip}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-sui-gray-200 hover:bg-sui-gray-300 text-sui-gray-700 rounded-xl font-semibold transition-colors text-sm sm:text-base"
        >
          Skip Exercise
        </button>

        {currentExerciseIndex === exercises.length - 1 && allCompleted && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onAllComplete}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg text-sm sm:text-base"
          >
            Continue Lesson →
          </motion.button>
        )}
      </div>

      {/* Completion Message */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-1">
                All Exercises Complete!
              </h3>
              <p className="text-sm sm:text-base text-green-600">
                You earned {totalXPEarned} XP and used {hintsUsedTotal} hints. Ready to continue the lesson?
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
