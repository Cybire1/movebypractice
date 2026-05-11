import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function apiClient<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Typed API methods
export const api = {
  // User stats
  getStats: () => apiClient('/user/stats'),
  syncStats: (data: any) =>
    apiClient('/user/stats', { method: 'POST', body: JSON.stringify(data) }),

  // Lessons
  completeLesson: (data: { lessonId: string; xpReward: number; timeSpentMinutes?: number }) =>
    apiClient('/user/complete-lesson', { method: 'POST', body: JSON.stringify(data) }),

  // Challenges
  getChallengeStreak: () => apiClient('/user/challenge'),
  completeChallenge: () =>
    apiClient('/user/challenge', { method: 'POST' }),

  // Achievements
  unlockAchievement: (achievementId: string) =>
    apiClient('/user/unlock-achievement', { method: 'POST', body: JSON.stringify({ achievementId }) }),

  // AI Tutor
  chat: (message: string, context: string) =>
    apiClient('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),

  // Profile
  updateProfile: (data: any) =>
    apiClient('/user/profile', { method: 'POST', body: JSON.stringify(data) }),
  linkWallet: (walletAddress: string) =>
    apiClient('/user/link-wallet', { method: 'POST', body: JSON.stringify({ walletAddress }) }),

  // Classes
  getClasses: () => apiClient('/classes'),
  bookClass: (classId: string) =>
    apiClient(`/classes/${classId}/book`, { method: 'POST' }),
  joinClass: (classId: string) =>
    apiClient(`/classes/${classId}/join`, { method: 'POST' }),
};
