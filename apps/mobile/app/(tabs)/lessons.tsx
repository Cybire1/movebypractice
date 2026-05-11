import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { allLessons } from '@glide/shared/lessons';
import { useGameStore } from '@/lib/store/gameStore';

const MODULES = [
  { key: 'move', title: 'Move Fundamentals', emoji: '🔷' },
  { key: 'msg', title: 'Sui Messaging SDK', emoji: '💬' },
  { key: 'predict', title: 'DeepBook Predict', emoji: '📈' },
] as const;

export default function LessonsScreen() {
  const router = useRouter();
  const { completedLessons } = useGameStore();

  return (
    <ScrollView className="flex-1 bg-sui-ocean">
      <View className="px-5 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Curriculum
        </Text>
        <Text className="text-sui-accent mb-6">
          {completedLessons.length}/23 lessons completed
        </Text>

        {MODULES.map((mod) => {
          const moduleLessons = allLessons.filter((l) => l.id.startsWith(mod.key));
          return (
            <View key={mod.key} className="mb-8">
              <Text className="text-xl font-semibold text-white mb-3">
                {mod.emoji} {mod.title}
              </Text>
              <View className="gap-2">
                {moduleLessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <Pressable
                      key={lesson.id}
                      className={`rounded-xl p-4 border ${
                        isCompleted
                          ? 'bg-sui-sky/10 border-sui-sky/30'
                          : 'bg-sui-navy/50 border-sui-navy'
                      } active:opacity-80`}
                      onPress={() => router.push(`/lessons/${lesson.id}`)}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-white font-medium">
                            {lesson.title}
                          </Text>
                          <Text className="text-sui-accent/60 text-sm mt-1">
                            {lesson.difficulty} · {lesson.xpReward} XP
                          </Text>
                        </View>
                        {isCompleted && (
                          <Text className="text-green-400 text-lg">✓</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
