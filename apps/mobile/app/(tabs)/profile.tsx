import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useGameStore } from '@/lib/store/gameStore';
import { calculateLevel, levelProgress } from '@glide/shared/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { xp, streak, completedLessons, achievements } = useGameStore();
  const level = calculateLevel(xp);
  const progress = levelProgress(xp);

  if (!user) {
    return (
      <View className="flex-1 bg-sui-ocean justify-center items-center px-5">
        <Text className="text-white text-xl font-semibold mb-4">
          Sign in to track your progress
        </Text>
        <Pressable
          className="bg-sui-sky rounded-xl px-8 py-4 active:opacity-80"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-sui-ocean">
      <View className="px-5 pt-16 pb-8">
        {/* User Info */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-sui-sky/20 items-center justify-center mb-3">
            <Text className="text-3xl">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-white text-xl font-semibold">
            {user.user_metadata?.display_name || user.email}
          </Text>
          <Text className="text-sui-accent mt-1">Level {level}</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
            <Text className="text-sui-accent text-sm">Total XP</Text>
            <Text className="text-white text-2xl font-bold">{xp}</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
            <Text className="text-sui-accent text-sm">Streak</Text>
            <Text className="text-white text-2xl font-bold">{streak} days</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
            <Text className="text-sui-accent text-sm">Lessons</Text>
            <Text className="text-white text-2xl font-bold">{completedLessons.length}/23</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
            <Text className="text-sui-accent text-sm">Achievements</Text>
            <Text className="text-white text-2xl font-bold">{achievements.length}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View className="bg-sui-navy rounded-xl p-4 mb-6">
          <Text className="text-sui-accent text-sm mb-2">Level Progress</Text>
          <View className="h-3 bg-sui-ocean rounded-full overflow-hidden">
            <View
              className="h-full bg-sui-sky rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-sui-accent/60 text-xs mt-1">
            {Math.round(progress * 100)}% to Level {level + 1}
          </Text>
        </View>

        {/* Sign Out */}
        <Pressable
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 items-center active:opacity-80"
          onPress={signOut}
        >
          <Text className="text-red-400 font-medium">Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
