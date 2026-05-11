import { View, Text } from 'react-native';

interface Props {
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  level: number;
}

export function StatsCards({ streak, lessonsCompleted, totalLessons, level }: Props) {
  return (
    <View className="flex-row flex-wrap gap-3">
      <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
        <Text className="text-sui-accent text-sm">Streak</Text>
        <Text className="text-white text-2xl font-bold mt-1">{streak}</Text>
        <Text className="text-sui-accent/50 text-xs">days</Text>
      </View>
      <View className="flex-1 min-w-[45%] bg-sui-navy rounded-xl p-4">
        <Text className="text-sui-accent text-sm">Lessons</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {lessonsCompleted}/{totalLessons}
        </Text>
        <Text className="text-sui-accent/50 text-xs">completed</Text>
      </View>
    </View>
  );
}
