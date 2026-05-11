import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@glide/shared/lessons';
import { useGameStore } from '@/lib/store/gameStore';
import { TeachingPhase } from '@/components/lessons/TeachingPhase';
import { QuizPhase } from '@/components/lessons/QuizPhase';
import { PracticePhase } from '@/components/lessons/PracticePhase';
import { PhaseIndicator } from '@/components/lessons/PhaseIndicator';
import { Ionicons } from '@expo/vector-icons';

type Phase = 'teaching' | 'quiz' | 'practice' | 'complete';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completeLesson } = useGameStore();
  const [phase, setPhase] = useState<Phase>('teaching');

  const lesson = getLessonById(id);

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-sui-ocean justify-center items-center">
        <Text className="text-white text-lg">Lesson not found</Text>
        <Pressable className="mt-4" onPress={() => router.back()}>
          <Text className="text-sui-sky">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  function handleTeachingComplete() {
    setPhase('quiz');
  }

  function handleQuizComplete(passed: boolean) {
    if (passed) {
      setPhase('practice');
    }
    // If failed, quiz component handles retry internally
  }

  function handlePracticeComplete() {
    completeLesson(lesson!.id, lesson!.xpReward);
    setPhase('complete');
  }

  return (
    <SafeAreaView className="flex-1 bg-sui-ocean">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-sui-navy">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#4DA2FF" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-white font-semibold" numberOfLines={1}>
            {lesson.title}
          </Text>
          <PhaseIndicator currentPhase={phase} />
        </View>
      </View>

      {/* Phase Content */}
      {phase === 'teaching' && (
        <TeachingPhase lesson={lesson} onComplete={handleTeachingComplete} />
      )}
      {phase === 'quiz' && (
        <QuizPhase
          questions={lesson.quiz}
          passThreshold={lesson.quizPassThreshold || 0.8}
          onComplete={handleQuizComplete}
        />
      )}
      {phase === 'practice' && (
        <PracticePhase lesson={lesson} onComplete={handlePracticeComplete} />
      )}
      {phase === 'complete' && (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-5xl mb-4">🎉</Text>
          <Text className="text-white text-2xl font-bold mb-2">
            Lesson Complete!
          </Text>
          <Text className="text-sui-accent text-center mb-2">
            {lesson.narrative?.celebrationMessage || 'Great work!'}
          </Text>
          <Text className="text-sui-sky text-lg font-semibold mb-8">
            +{lesson.xpReward} XP
          </Text>
          <Pressable
            className="bg-sui-sky rounded-xl px-8 py-4 active:opacity-80"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold text-lg">Continue</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
