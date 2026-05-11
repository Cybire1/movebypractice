'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ExerciseRenderer from '../components/exercises/ExerciseRenderer';
import {
  allExercises,
} from '../data/exercises';
import {
  Exercise,
  ExerciseType,
  ExerciseTopic,
  ExerciseDifficulty,
  ValidationResult,
  ExerciseFeedback
} from '../types/exercises';
import {
  getExerciseProgress,
  recordAttempt,
  getOverallStatistics,
  isExerciseCompleted
} from '../utils/exerciseProgress';

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [filterType, setFilterType] = useState<ExerciseType | 'all'>('all');
  const [filterTopic, setFilterTopic] = useState<ExerciseTopic | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<ExerciseDifficulty | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);


  // Get statistics
  const stats = getOverallStatistics();

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let filtered = allExercises;

    if (filterType !== 'all') {
      filtered = filtered.filter(ex => ex.type === filterType);
    }

    if (filterTopic !== 'all') {
      filtered = filtered.filter(ex => ex.topic === filterTopic);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(ex => ex.difficulty === filterDifficulty);
    }

    if (!showCompleted) {
      filtered = filtered.filter(ex => !isExerciseCompleted(ex.id));
    }

    return filtered;
  }, [filterType, filterTopic, filterDifficulty, showCompleted]);

  const handleExerciseComplete = (result: ValidationResult, feedback: ExerciseFeedback) => {
    if (!selectedExercise) return;

    // Record attempt
    recordAttempt(
      'demo-user',
      selectedExercise.id,
      result,
      feedback,
      {}, // User answer would be tracked properly in production
      0, // Hints used
      0  // Time spent
    );

    // Show success message and return to list after delay
    setTimeout(() => {
      setSelectedExercise(null);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: ExerciseDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  // If an exercise is selected, show the practice interface
  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-surface pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedExercise(null)}
            className="mb-8 flex items-center gap-2 text-foreground-secondary hover:text-foreground font-medium transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center group-hover:bg-[var(--border-default)] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Hub
          </button>

          {/* Exercise */}
          <ExerciseRenderer
            exercise={selectedExercise}
            onComplete={handleExerciseComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-28 sm:pt-32 pb-12 px-4 sm:px-6 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-6xl font-black tracking-tight text-foreground">
              Practice Hub
            </h1>
            <p className="text-xl text-foreground-secondary font-medium max-w-lg">
              Master Move language concepts through hands-on interactive challenges.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:block"
          >
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center text-3xl shadow-xl">
              💪
            </div>
          </motion.div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Progress - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 bg-zinc-900 text-white rounded-3xl p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-1">Total Progress</h3>
                <div className="text-5xl font-black tracking-tight flex items-baseline gap-2">
                  {Math.round((stats.completedExercises / allExercises.length) * 100)}%
                  <span className="text-lg font-medium text-zinc-500">Mastery</span>
                </div>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completedExercises / allExercises.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Mastered Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-elevated rounded-3xl border border-[var(--border-default)] p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full" />
            <div className="relative z-10 text-center">
              <div className="text-4xl font-black text-blue-600 mb-2">{stats.masteredExercises}</div>
              <div className="text-sm font-bold text-foreground-secondary uppercase tracking-wide">Exercises Mastered</div>
            </div>
          </motion.div>

          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-elevated rounded-3xl border border-[var(--border-default)] p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-50 rounded-full" />
            <div className="relative z-10 text-center">
              <div className="text-4xl font-black text-green-600 mb-2">{stats.totalXP}</div>
              <div className="text-sm font-bold text-foreground-secondary uppercase tracking-wide">Total XP Earned</div>
            </div>
          </motion.div>
        </div>


        {/* Filter Island */}
        <div className="sticky top-4 z-30">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[var(--surface-overlay)] backdrop-blur-xl border border-[var(--border-default)] rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between"
          >
            {/* Left: Dropdowns */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ExerciseType | 'all')}
                className="bg-surface-secondary hover:bg-[var(--border-default)] text-foreground-secondary font-semibold text-sm rounded-xl px-4 py-2.5 border-none outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer transition-colors appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Types</option>
                <option value="code_completion">Code Completion</option>
                <option value="bug_fix">Bug Fix</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="output_prediction">Output Prediction</option>
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as ExerciseDifficulty | 'all')}
                className="bg-surface-secondary hover:bg-[var(--border-default)] text-foreground-secondary font-semibold text-sm rounded-xl px-4 py-2.5 border-none outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer transition-colors appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value as ExerciseTopic | 'all')}
                className="bg-surface-secondary hover:bg-[var(--border-default)] text-foreground-secondary font-semibold text-sm rounded-xl px-4 py-2.5 border-none outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer transition-colors appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                <option value="all">All Topics</option>
                {/* We can map these dynamically but keeping explicit for now */}
                <option value="functions">Functions</option>
                <option value="structs">Structs</option>
                <option value="abilities">Abilities</option>
                <option value="primitives">Primitives</option>
                <option value="control_flow">Control Flow</option>
                <option value="vectors">Vectors</option>
                <option value="options">Options</option>
                <option value="references">References</option>
                <option value="generics">Generics</option>
              </select>
            </div>

            {/* Right: Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${showCompleted ? 'bg-foreground border-foreground' : 'border-foreground-tertiary/40 group-hover:border-foreground-tertiary'}`}>
                  {showCompleted && <svg className="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} className="hidden" />
                <span className="text-sm font-semibold text-foreground-secondary group-hover:text-foreground transition-colors">Show Completed</span>
              </label>
            </div>
          </motion.div>
        </div>

        {/* Exercises Grid */}
        <div>
          {filteredExercises.length === 0 ? (
            <div className="text-center py-24 bg-surface-secondary rounded-3xl border-2 border-dashed border-[var(--border-default)]">
              <div className="text-8xl mb-6 opacity-20 filter grayscale">🦖</div>
              <h3 className="text-2xl font-black text-foreground-tertiary mb-2">No Challenges Found</h3>
              <p className="text-foreground-tertiary font-medium">Try loosening your filters to find more exercises.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise, index) => {

                const isCompleted = isExerciseCompleted(exercise.id);

                return (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedExercise(exercise)}
                    className="bg-surface-elevated rounded-3xl border border-[var(--border-default)] p-6 md:p-8 cursor-pointer group hover:shadow-xl hover:shadow-[#4A90D9]/10 hover:border-[#4A90D9]/40 transition-all hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#4A90D9] transition-colors">
                        {exercise.title}
                      </h3>
                      <p className="text-sm text-foreground-secondary font-medium line-clamp-2 mb-6">
                        {exercise.description}
                      </p>

                      <div className="flex items-center justify-between text-xs font-bold text-foreground-tertiary uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-foreground-tertiary"></span>
                          {exercise.type.replace('_', ' ')}
                        </span>
                        <span>{exercise.baseXP} XP</span>
                      </div>
                    </div>

                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/[0.03] via-transparent to-[#4A90D9]/[0.06] opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
