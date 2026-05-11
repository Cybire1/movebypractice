import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    async function processCallback() {
      try {
        await handleOAuthCallback(params);
        router.replace('/(tabs)');
      } catch {
        router.replace('/(auth)/login');
      }
    }
    processCallback();
  }, []);

  return (
    <View className="flex-1 bg-sui-ocean justify-center items-center">
      <ActivityIndicator size="large" color="#4DA2FF" />
      <Text className="text-sui-accent mt-4">Signing you in...</Text>
    </View>
  );
}
