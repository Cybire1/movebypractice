import {
  ExerciseProgress,
  ExerciseAttempt,
  ExerciseAnswer,
  ValidationResult,
  ExerciseFeedback
} from '../types/exercises';

const STORAGE_KEY = 'move_by_practice_exercise_progress';

// ============================================================================
// STORAGE ABSTRACTION
// ============================================================================

export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

// Default: use localStorage if available (web), otherwise no-op
let storageAdapter: StorageAdapter = {
  getItem: (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, value) => { if (typeof window !== 'undefined') localStorage.setItem(key, value); },
  removeItem: (key) => { if (typeof window !== 'undefined') localStorage.removeItem(key); },
};

/** Inject a platform-specific storage adapter (e.g., AsyncStorage, MMKV) */
export function setStorageAdapter(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

/**
 * Get all exercise progress from storage.
 */
export function getAllProgress(): Record<string, ExerciseProgress> {
  try {
    const stored = storageAdapter.getItem(STORAGE_KEY);
    if (stored instanceof Promise) return {}; // async adapters should use getAllProgressAsync
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading exercise progress:', error);
    return {};
  }
}

/** Async version for React Native (MMKV/AsyncStorage) */
export async function getAllProgressAsync(): Promise<Record<string, ExerciseProgress>> {
  try {
    const stored = await storageAdapter.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading exercise progress:', error);
    return {};
  }
}

/**
 * Save all exercise progress to storage.
 */
export function saveAllProgress(progress: Record<string, ExerciseProgress>): void {
  try {
    storageAdapter.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving exercise progress:', error);
  }
}

/**
 * Get progress for a specific exercise.
 */
export function getExerciseProgress(exerciseId: string): ExerciseProgress | null {
  const allProgress = getAllProgress();
  return allProgress[exerciseId] || null;
}

/**
 * Initialize progress for a new exercise.
 */
export function initializeExerciseProgress(
  userId: string,
  exerciseId: string
): ExerciseProgress {
  return {
    userId,
    exerciseId,
    status: 'not_started',
    totalAttempts: 0,
    successfulAttempts: 0,
    bestScore: 0,
    averageScore: 0,
    totalXPEarned: 0,
    attempts: []
  };
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Record a new exercise attempt.
 */
export function recordAttempt(
  userId: string,
  exerciseId: string,
  validation: ValidationResult,
  feedback: ExerciseFeedback,
  userAnswer: ExerciseAnswer,
  hintsUsed: number,
  timeSpent: number
): ExerciseProgress {
  const allProgress = getAllProgress();
  const exerciseProgress = allProgress[exerciseId] || initializeExerciseProgress(userId, exerciseId);

  // Create attempt record
  const attempt: ExerciseAttempt = {
    attemptId: `${exerciseId}-${Date.now()}`,
    exerciseId,
    userId,
    timestamp: new Date(),
    userAnswer,
    isCorrect: validation.isCorrect,
    score: validation.score,
    hintsUsed,
    timeSpent,
    earnedXP: feedback.earnedXP
  };

  // Update progress
  exerciseProgress.attempts.push(attempt);
  exerciseProgress.totalAttempts++;
  exerciseProgress.lastAttemptAt = new Date();
  exerciseProgress.totalXPEarned += feedback.earnedXP;

  if (validation.isCorrect) {
    exerciseProgress.successfulAttempts++;
    if (!exerciseProgress.completedAt) {
      exerciseProgress.completedAt = new Date();
      exerciseProgress.status = 'completed';
    }
  } else {
    exerciseProgress.status = 'in_progress';
  }

  // Update best score
  if (validation.score > exerciseProgress.bestScore) {
    exerciseProgress.bestScore = validation.score;
  }

  // Update average score
  const totalScore = exerciseProgress.attempts.reduce((sum, a) => sum + a.score, 0);
  exerciseProgress.averageScore = Math.round(totalScore / exerciseProgress.totalAttempts);

  // Check for mastery (3+ perfect scores with minimal hints)
  const recentPerfect = exerciseProgress.attempts
    .slice(-5)
    .filter(a => a.score === 100 && a.hintsUsed <= 1);
  if (recentPerfect.length >= 3) {
    exerciseProgress.status = 'mastered';
  }

  // Save updated progress
  allProgress[exerciseId] = exerciseProgress;
  saveAllProgress(allProgress);

  return exerciseProgress;
}

/**
 * Get completion status for an exercise.
 */
export function getCompletionStatus(exerciseId: string): 'not_started' | 'in_progress' | 'completed' | 'mastered' {
  const progress = getExerciseProgress(exerciseId);
  return progress?.status || 'not_started';
}

/**
 * Check if exercise is completed.
 */
export function isExerciseCompleted(exerciseId: string): boolean {
  const progress = getExerciseProgress(exerciseId);
  return progress?.status === 'completed' || progress?.status === 'mastered';
}

/**
 * Get total XP earned for an exercise.
 */
export function getTotalXPForExercise(exerciseId: string): number {
  const progress = getExerciseProgress(exerciseId);
  return progress?.totalXPEarned || 0;
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get overall statistics across all exercises.
 */
export function getOverallStatistics() {
  const allProgress = getAllProgress();
  const exercises = Object.values(allProgress);

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(
    e => e.status === 'completed' || e.status === 'mastered'
  ).length;
  const masteredExercises = exercises.filter(e => e.status === 'mastered').length;
  const inProgressExercises = exercises.filter(e => e.status === 'in_progress').length;

  const totalAttempts = exercises.reduce((sum, e) => sum + e.totalAttempts, 0);
  const totalXP = exercises.reduce((sum, e) => sum + e.totalXPEarned, 0);

  const allScores = exercises.flatMap(e => e.attempts.map(a => a.score));
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
    : 0;

  const completionRate = totalExercises > 0
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  return {
    totalExercises,
    completedExercises,
    masteredExercises,
    inProgressExercises,
    totalAttempts,
    totalXP,
    averageScore,
    completionRate
  };
}

/**
 * Get statistics for a specific exercise type.
 */
export function getStatisticsByType(_type: string) {
  // const allProgress = getAllProgress();
  // Note: We'd need to enhance this to store exercise type in progress
  // For now, return placeholder
  return {
    totalExercises: 0,
    completed: 0,
    averageScore: 0
  };
}

/**
 * Get statistics for a specific topic.
 */
export function getStatisticsByTopic(_topic: string) {
  // const allProgress = getAllProgress();
  // Note: We'd need to enhance this to store topic in progress
  // For now, return placeholder
  return {
    totalExercises: 0,
    completed: 0,
    averageScore: 0
  };
}

/**
 * Get recent exercise attempts (last N).
 */
export function getRecentAttempts(limit: number = 10): ExerciseAttempt[] {
  const allProgress = getAllProgress();
  const allAttempts = Object.values(allProgress).flatMap(p => p.attempts);

  return allAttempts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get exercise history for a specific exercise.
 */
export function getExerciseHistory(exerciseId: string): ExerciseAttempt[] {
  const progress = getExerciseProgress(exerciseId);
  return progress?.attempts || [];
}

/**
 * Get best attempt for an exercise.
 */
export function getBestAttempt(exerciseId: string): ExerciseAttempt | null {
  const history = getExerciseHistory(exerciseId);
  if (history.length === 0) return null;

  return history.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}

/**
 * Get fastest completion time for an exercise.
 */
export function getFastestCompletion(exerciseId: string): number | null {
  const history = getExerciseHistory(exerciseId).filter(a => a.isCorrect);
  if (history.length === 0) return null;

  return Math.min(...history.map(a => a.timeSpent));
}

// ============================================================================
// PROGRESS RESET & MANAGEMENT
// ============================================================================

/**
 * Reset progress for a specific exercise.
 */
export function resetExerciseProgress(exerciseId: string): void {
  const allProgress = getAllProgress();
  delete allProgress[exerciseId];
  saveAllProgress(allProgress);
}

/**
 * Reset all exercise progress.
 */
export function resetAllProgress(): void {
  storageAdapter.removeItem(STORAGE_KEY);
}

/**
 * Export progress data as JSON.
 */
export function exportProgress(): string {
  const allProgress = getAllProgress();
  return JSON.stringify(allProgress, null, 2);
}

/**
 * Import progress data from JSON.
 */
export function importProgress(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    saveAllProgress(data);
    return true;
  } catch (error) {
    console.error('Error importing progress:', error);
    return false;
  }
}

// ============================================================================
// STREAKS & ACHIEVEMENTS
// ============================================================================

/**
 * Calculate current streak of consecutive days with completed exercises.
 */
export function calculateExerciseStreak(): number {
  const allProgress = getAllProgress();
  const exercises = Object.values(allProgress);

  // Get all completion dates
  const completionDates = exercises
    .filter(e => e.completedAt)
    .map(e => {
      const date = new Date(e.completedAt!);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a); // Sort descending

  if (completionDates.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Check if most recent completion was today or yesterday
  const mostRecent = completionDates[0];
  const daysDiff = Math.floor((todayTime - mostRecent) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = completionDates[i - 1];
    const currDate = completionDates[i];
    const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get achievement milestones.
 */
export function getAchievements() {
  const stats = getOverallStatistics();
  const streak = calculateExerciseStreak();

  const achievements: { name: string; description: string; earned: boolean; icon: string }[] = [
    {
      name: 'First Steps',
      description: 'Complete your first exercise',
      earned: stats.completedExercises >= 1,
      icon: '🎯'
    },
    {
      name: 'Getting Started',
      description: 'Complete 5 exercises',
      earned: stats.completedExercises >= 5,
      icon: '🌱'
    },
    {
      name: 'Practice Makes Perfect',
      description: 'Complete 10 exercises',
      earned: stats.completedExercises >= 10,
      icon: '⚡'
    },
    {
      name: 'Master of One',
      description: 'Master your first exercise',
      earned: stats.masteredExercises >= 1,
      icon: '⭐'
    },
    {
      name: 'Week Warrior',
      description: '7-day exercise streak',
      earned: streak >= 7,
      icon: '🔥'
    },
    {
      name: 'XP Hunter',
      description: 'Earn 1000 XP',
      earned: stats.totalXP >= 1000,
      icon: '💎'
    },
    {
      name: 'Perfect Score',
      description: 'Get 100% on any exercise',
      earned: stats.averageScore >= 100,
      icon: '💯'
    }
  ];

  return achievements;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ExerciseProgressUtils = {
  getAllProgress,
  saveAllProgress,
  getExerciseProgress,
  initializeExerciseProgress,
  recordAttempt,
  getCompletionStatus,
  isExerciseCompleted,
  getTotalXPForExercise,
  getOverallStatistics,
  getStatisticsByType,
  getStatisticsByTopic,
  getRecentAttempts,
  getExerciseHistory,
  getBestAttempt,
  getFastestCompletion,
  resetExerciseProgress,
  resetAllProgress,
  exportProgress,
  importProgress,
  calculateExerciseStreak,
  getAchievements
};

export default ExerciseProgressUtils;
