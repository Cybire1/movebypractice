import { useEffect, ReactNode } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthProvider';
import { useGameStore } from '@/lib/store/gameStore';

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { loadFromServer, syncToServer } = useGameStore();

  // Load state from server when user signs in
  useEffect(() => {
    if (user?.email) {
      loadFromServer(user.email);
    }
  }, [user?.email]);

  // Sync to server when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        syncToServer();
      }
    });
    return () => subscription.remove();
  }, []);

  return <>{children}</>;
}
