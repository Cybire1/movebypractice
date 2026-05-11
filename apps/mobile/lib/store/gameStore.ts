import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { calculateLevel, XP_PER_LEVEL } from '@glide/shared/constants';
import { api } from '../api';

const storage = new MMKV();

// MMKV adapter for Zustand persist
const mmkvStorage = createJSONStorage(() => ({
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}));

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  userEmail: string | null;
  walletAddress: string | null;
  completedLessons: string[];
  completedQuizzes: string[];
  completedExercises: string[];
  currentLesson: string | null;
  achievements: Achievement[];

  // Actions
  addXP: (points: number) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  completeQuiz: (quizId: string) => void;
  completeExercise: (exerciseId: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateStreak: () => void;
  loadFromServer: (email: string) => Promise<void>;
  syncToServer: () => Promise<void>;
  resetStore: () => void;
}

const initialState = {
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
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (points: number) => {
        set((state) => {
          const newXP = state.xp + points;
          return { xp: newXP, level: calculateLevel(newXP) };
        });
        get().syncToServer();
      },

      completeLesson: (lessonId: string, xpReward: number) => {
        set((state) => {
          if (state.completedLessons.includes(lessonId)) return state;
          const newXP = state.xp + xpReward;
          return {
            completedLessons: [...state.completedLessons, lessonId],
            xp: newXP,
            level: calculateLevel(newXP),
          };
        });
        // Also notify server
        api.completeLesson({ lessonId, xpReward }).catch(() => {});
      },

      completeQuiz: (quizId: string) => {
        set((state) => {
          if (state.completedQuizzes.includes(quizId)) return state;
          return { completedQuizzes: [...state.completedQuizzes, quizId] };
        });
      },

      completeExercise: (exerciseId: string) => {
        set((state) => {
          if (state.completedExercises.includes(exerciseId)) return state;
          return { completedExercises: [...state.completedExercises, exerciseId] };
        });
      },

      unlockAchievement: (achievement: Achievement) => {
        set((state) => {
          if (state.achievements.find((a) => a.id === achievement.id)) return state;
          return { achievements: [...state.achievements, achievement] };
        });
        api.unlockAchievement(achievement.id).catch(() => {});
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          if (state.lastActiveDate === today) return state;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
          return { streak: newStreak, lastActiveDate: today };
        });
      },

      loadFromServer: async (email: string) => {
        try {
          const data = await api.getStats();
          if (data?.stats) {
            set({
              userEmail: email,
              xp: Math.max(get().xp, data.stats.xp || 0),
              level: calculateLevel(Math.max(get().xp, data.stats.xp || 0)),
              streak: Math.max(get().streak, data.stats.streak || 0),
              completedLessons: data.completedLessons || get().completedLessons,
            });
          }
        } catch {
          // Offline — use local state
        }
      },

      syncToServer: async () => {
        const state = get();
        if (!state.userEmail) return;
        try {
          await api.syncStats({
            xp: state.xp,
            level: state.level,
            streak: state.streak,
            completedLessons: state.completedLessons,
            completedQuizzes: state.completedQuizzes,
            completedExercises: state.completedExercises,
          });
        } catch {
          // Will sync next time
        }
      },

      resetStore: () => set(initialState),
    }),
    {
      name: 'glide-game-store',
      storage: mmkvStorage,
    }
  )
);
