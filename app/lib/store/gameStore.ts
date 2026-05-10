import { create } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
}

interface GameState {
  // Player stats
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;

  // User identity
  userEmail: string | null;
  walletAddress: string | null;

  // Progress
  completedLessons: string[];
  completedQuizzes: string[];
  completedExercises: string[];
  currentLesson: string | null;
  achievements: Achievement[];

  // Actions
  addXP: (points: number) => void;
  completeLesson: (lessonId: string, xpReward: number, timeSpentMinutes?: number, codeSubmitted?: string) => Promise<void>;
  completeQuiz: (quizId: string) => void;
  completeExercise: (exerciseId: string) => void;
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  updateStreak: () => Promise<void>;
  setCurrentLesson: (lessonId: string) => void;

  // Server sync
  loadFromServer: (email: string) => Promise<void>;
  syncToServer: () => Promise<void>;
  resetStore: () => void;
}

const XP_PER_LEVEL = 1000;

// Debounced sync — waits 1s after last change before syncing
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY_MS = 1000;

function scheduleDebouncedSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    useGameStore.getState().syncToServer();
  }, SYNC_DELAY_MS);
}

// Send data on tab close
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const state = useGameStore.getState();
    if (!state.userEmail) return;

    const payload = JSON.stringify({
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      completedLessons: state.completedLessons,
      completedQuizzes: state.completedQuizzes,
      completedExercises: state.completedExercises,
    });

    navigator.sendBeacon('/api/user/stats', payload);
  });
}

export const useGameStore = create<GameState>()((set, get) => ({
  // Initial state
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  userEmail: null,
  walletAddress: null,
  completedLessons: [],
  completedQuizzes: [],
  completedExercises: [],
  currentLesson: null,
  achievements: [],

  // Add XP and check for level up
  addXP: (points: number) => {
    set((state) => {
      const newXP = state.xp + points;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { xp: newXP, level: newLevel };
    });
    scheduleDebouncedSync();
  },

  // Complete a lesson
  completeLesson: async (lessonId: string, xpReward: number, timeSpentMinutes?: number, codeSubmitted?: string) => {
    const { completedLessons } = get();
    if (completedLessons.includes(lessonId)) return;

    try {
      const response = await fetch('/api/user/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, xpReward, timeSpentMinutes, codeSubmitted }),
      });

      if (!response.ok) throw new Error('Failed to complete lesson');
      const data = await response.json();

      set({
        completedLessons: [...completedLessons, lessonId],
        xp: data.stats.xp,
        level: data.stats.level,
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      // Fallback: update local state only
      set({ completedLessons: [...completedLessons, lessonId] });
      get().addXP(xpReward);
    }
  },

  // Complete a quiz (local + debounced sync)
  completeQuiz: (quizId: string) => {
    const { completedQuizzes } = get();
    if (completedQuizzes.includes(quizId)) return;
    set({ completedQuizzes: [...completedQuizzes, quizId] });
    scheduleDebouncedSync();
  },

  // Complete an exercise (local + debounced sync)
  completeExercise: (exerciseId: string) => {
    const { completedExercises } = get();
    if (completedExercises.includes(exerciseId)) return;
    set({ completedExercises: [...completedExercises, exerciseId] });
    scheduleDebouncedSync();
  },

  // Unlock achievement
  unlockAchievement: async (achievement: Achievement) => {
    const { achievements } = get();
    if (achievements.some((a) => a.id === achievement.id)) return;

    try {
      const response = await fetch('/api/user/unlock-achievement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementDescription: achievement.description,
          icon: achievement.icon,
        }),
      });

      if (!response.ok) throw new Error('Failed to unlock achievement');
      const data = await response.json();

      set((state) => ({
        achievements: [
          ...state.achievements,
          { ...achievement, unlockedAt: new Date(data.achievement.unlockedAt) },
        ],
      }));
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      set((state) => ({
        achievements: [...state.achievements, { ...achievement, unlockedAt: new Date() }],
      }));
    }
  },

  // Update streak
  updateStreak: async () => {
    const { lastActiveDate } = get();
    const today = new Date().toDateString();
    if (lastActiveDate === today) return;

    try {
      const response = await fetch('/api/user/update-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to update streak');
      const data = await response.json();

      set({ lastActiveDate: today, streak: data.stats.streak });
    } catch (error) {
      console.error('Error updating streak:', error);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      const newStreak = lastActiveDate === yesterdayStr ? get().streak + 1 : 1;
      set({ lastActiveDate: today, streak: newStreak });
    }
  },

  setCurrentLesson: (lessonId: string) => {
    set({ currentLesson: lessonId });
  },

  // Load data from server — server values override local on login
  loadFromServer: async (email: string) => {
    try {
      const response = await fetch('/api/user/stats');
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();

      set({
        userEmail: email,
        xp: data.stats?.xp || 0,
        level: data.stats?.level || 1,
        streak: data.stats?.streak || 0,
        lastActiveDate: data.stats?.lastActiveDate
          ? new Date(data.stats.lastActiveDate).toDateString()
          : null,
        completedLessons: data.completedLessons || [],
      });
    } catch (error) {
      console.error('Error loading from server:', error);
      set({ userEmail: email });
    }
  },

  // Manual sync to server
  syncToServer: async () => {
    const { userEmail, xp, level, streak, completedLessons, completedQuizzes, completedExercises } = get();
    if (!userEmail) return;

    try {
      await fetch('/api/user/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, level, streak, completedLessons, completedQuizzes, completedExercises }),
      });
    } catch (error) {
      console.error('Error syncing to server:', error);
    }
  },

  // Reset store on logout
  resetStore: () => {
    if (syncTimer) clearTimeout(syncTimer);
    set({
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      userEmail: null,
      walletAddress: null,
      completedLessons: [],
      completedQuizzes: [],
      completedExercises: [],
      currentLesson: null,
      achievements: [],
    });
  },
}));
