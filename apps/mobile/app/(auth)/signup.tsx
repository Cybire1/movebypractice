import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignup() {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, username);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-sui-ocean justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-2">Create account</Text>
      <Text className="text-sui-accent mb-8">Start your Move learning journey</Text>

      {error ? (
        <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      ) : null}

      <TextInput
        className="bg-sui-navy border border-sui-navy rounded-xl px-4 py-4 text-white mb-3"
        placeholder="Username"
        placeholderTextColor="#6B7280"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

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
        className="bg-sui-sky rounded-xl py-4 items-center active:opacity-80"
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Create Account</Text>
        )}
      </Pressable>

      <Pressable className="mt-4" onPress={() => router.back()}>
        <Text className="text-sui-accent text-center">
          Already have an account? <Text className="text-sui-sky">Sign In</Text>
        </Text>
      </Pressable>
    </View>
  );
}
