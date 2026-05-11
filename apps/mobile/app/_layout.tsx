import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { GameStoreProvider } from '@/providers/GameStoreProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GameStoreProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A1628' },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
              <Stack.Screen name="lessons/[id]" />
              <Stack.Screen name="classes/[id]" />
            </Stack>
            <StatusBar style="light" />
          </GameStoreProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
