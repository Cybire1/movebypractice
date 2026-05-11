import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-sui-ocean justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-2">Welcome back</Text>
      <Text className="text-sui-accent mb-8">Sign in to continue learning</Text>

      {error ? (
        <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      ) : null}

      <TextInput
        className="bg-sui-navy border border-sui-navy rounded-xl px-4 py-4 text-white mb-3"
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="bg-sui-navy border border-sui-navy rounded-xl px-4 py-4 text-white mb-6"
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        className="bg-sui-sky rounded-xl py-4 items-center active:opacity-80 mb-4"
        onPress={handleEmailLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        )}
      </Pressable>

      {/* OAuth Buttons */}
      <View className="gap-3 mb-6">
        <Pressable
          className="bg-white rounded-xl py-4 items-center active:opacity-90"
          onPress={() => signInWithOAuth('google')}
        >
          <Text className="text-gray-800 font-semibold">Continue with Google</Text>
        </Pressable>
        <Pressable
          className="bg-gray-800 rounded-xl py-4 items-center active:opacity-90"
          onPress={() => signInWithOAuth('github')}
        >
          <Text className="text-white font-semibold">Continue with GitHub</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/(auth)/signup')}>
        <Text className="text-sui-accent text-center">
          Don't have an account? <Text className="text-sui-sky">Sign Up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
