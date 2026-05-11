import { Challenge } from '../types/challenges';
import { dailyChallenges } from '../data/dailyChallenges';

/**
 * Challenge Rotation System
 *
 * Ensures a new challenge is available every 24 hours at midnight
 * Cycles through the challenge database in order
 */

// Get the start date for challenge rotation (January 1, 2025)
const ROTATION_START_DATE = new Date('2025-01-01T00:00:00Z');

/**
 * Calculate which challenge should be active today
 * Based on days elapsed since rotation start
 */
export function getTodaysChallenge(): Challenge | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days elapsed since rotation start
  const daysElapsed = Math.floor(
    (today.getTime() - ROTATION_START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Cycle through challenges (wrap around if we exceed the array)
  const challengeIndex = daysElapsed % dailyChallenges.length;

  // Return the challenge for today
  return dailyChallenges[challengeIndex] || null;
}

/**
 * Get the date string for today in ISO format (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Calculate time remaining until next challenge (midnight)
 */
export function getTimeUntilNextChallenge(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMs: diff
  };
}

/**
 * Get challenge history for a specific date range
 */
export function getChallengeHistory(startDate: Date, endDate: Date): Challenge[] {
  const challenges: Challenge[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const daysElapsed = Math.floor(
      (current.getTime() - ROTATION_START_DATE.getTime()) / (1000 * 60 * 60 * 24)
    );
    const challengeIndex = daysElapsed % dailyChallenges.length;

    if (dailyChallenges[challengeIndex]) {
      challenges.push({
        ...dailyChallenges[challengeIndex],
        date: current.toISOString().split('T')[0]
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return challenges;
}

/**
 * Get upcoming challenges for the next N days
 */
export function getUpcomingChallenges(days: number): Challenge[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return getChallengeHistory(today, futureDate);
}

/**
 * Check if user has completed today's challenge
 */
export function hasCompletedToday(lastCompletedDate: string): boolean {
  const today = getTodayDateString();
  return lastCompletedDate === today;
}

/**
 * Calculate streak status
 */
export function calculateStreak(lastCompletedDate: string): {
  shouldContinue: boolean;
  shouldReset: boolean;
  isToday: boolean;
} {
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return {
    shouldContinue: lastCompletedDate === yesterday,
    shouldReset: lastCompletedDate !== yesterday && lastCompletedDate !== today,
    isToday: lastCompletedDate === today
  };
}

/**
 * Get streak bonus XP based on streak length
 * Bonus scales with streak:
 * - 7 days: +50 XP
 * - 14 days: +100 XP
 * - 30 days: +200 XP
 * - 60 days: +400 XP
 * - 100 days: +1000 XP
 */
export function getStreakBonusXP(streakDays: number): number {
  if (streakDays >= 100) return 1000;
  if (streakDays >= 60) return 400;
  if (streakDays >= 30) return 200;
  if (streakDays >= 14) return 100;
  if (streakDays >= 7) return 50;
  return 0;
}

/**
 * Get the challenge index for a specific date
 */
export function getChallengeIndexForDate(date: Date): number {
  const dateAtMidnight = new Date(date);
  dateAtMidnight.setHours(0, 0, 0, 0);

  const daysElapsed = Math.floor(
    (dateAtMidnight.getTime() - ROTATION_START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysElapsed % dailyChallenges.length;
}

/**
 * Check if a challenge is available for a specific date
 * (Used for preventing future challenge access)
 */
export function isChallengeAvailable(challengeDate: string): boolean {
  const today = getTodayDateString();
  return challengeDate <= today;
}
