import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/lib/store/gameStore';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { StatsCards } from '@/components/dashboard/StatsCards';

export default function HomeScreen() {
  const router = useRouter();
  const { xp, level, streak, completedLessons } = useGameStore();

  return (
    <ScrollView className="flex-1 bg-sui-ocean">
      <View className="px-5 pt-16 pb-8">
        {/* Header */}
        <Text className="text-3xl font-bold text-white mb-2">
          Welcome back
        </Text>
        <Text className="text-sui-accent text-base mb-6">
          Continue your Move journey
        </Text>

        {/* XP Progress */}
        <XPProgressBar xp={xp} level={level} />

        {/* Stats */}
        <StatsCards
          streak={streak}
          lessonsCompleted={completedLessons.length}
          totalLessons={23}
          level={level}
        />

        {/* Quick Actions */}
        <View className="mt-6 gap-3">
          <Pressable
            className="bg-sui-sky rounded-2xl p-5 active:opacity-80"
            onPress={() => router.push('/lessons')}
          >
            <Text className="text-white font-semibold text-lg">
              Continue Learning
            </Text>
            <Text className="text-white/70 mt-1">
              Pick up where you left off
            </Text>
          </Pressable>

          <Pressable
            className="bg-sui-navy rounded-2xl p-5 border border-sui-sky/20 active:opacity-80"
            onPress={() => router.push('/challenges')}
          >
            <Text className="text-white font-semibold text-lg">
              Daily Challenge
            </Text>
            <Text className="text-sui-accent/70 mt-1">
              Earn bonus XP today
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
