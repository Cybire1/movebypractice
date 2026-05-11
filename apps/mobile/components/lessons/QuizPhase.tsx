import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { QuizQuestion } from '@glide/shared/types';

interface Props {
  questions: QuizQuestion[];
  passThreshold: number;
  onComplete: (passed: boolean) => void;
}

export function QuizPhase({ questions, passThreshold, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const question = questions[currentQ];

  function handleSelect(index: number) {
    if (showFeedback) return;
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (index === question.correctAnswer) {
      setScore((s) => s + 1);
    }
    setAnswered((a) => a + 1);
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz complete
      const finalScore = score + (selectedAnswer === question.correctAnswer ? 0 : 0); // already counted
      const passed = finalScore / questions.length >= passThreshold;
      onComplete(passed);
    }
  }

  if (!question) return null;

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 h-2 bg-sui-navy rounded-full overflow-hidden">
            <View
              className="h-full bg-sui-sky rounded-full"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </View>
          <Text className="text-sui-accent/60 text-sm ml-3">
            {currentQ + 1}/{questions.length}
          </Text>
        </View>

        {/* Question */}
        <Animated.View entering={FadeIn.duration(200)} key={currentQ}>
          <Text className="text-white text-lg font-semibold mb-6">
            {question.question}
          </Text>

          {/* Options */}
          <View className="gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              let borderColor = 'border-sui-navy';
              let bgColor = 'bg-sui-navy/50';

              if (showFeedback) {
                if (isCorrect) {
                  borderColor = 'border-green-500';
                  bgColor = 'bg-green-500/10';
                } else if (isSelected && !isCorrect) {
                  borderColor = 'border-red-500';
                  bgColor = 'bg-red-500/10';
                }
              } else if (isSelected) {
                borderColor = 'border-sui-sky';
                bgColor = 'bg-sui-sky/10';
              }

              return (
                <Pressable
                  key={index}
                  className={`rounded-xl p-4 border ${borderColor} ${bgColor}`}
                  onPress={() => handleSelect(index)}
                  disabled={showFeedback}
                >
                  <Text className="text-white">{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Feedback */}
          {showFeedback && question.explanation && (
            <Animated.View entering={FadeInDown.duration(300)} className="mt-4 bg-sui-navy/80 rounded-xl p-4">
              <Text className="text-sui-accent text-sm">
                {question.explanation}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next Button */}
      {showFeedback && (
        <View className="px-5 py-4 border-t border-sui-navy">
          <Pressable
            className="bg-sui-sky rounded-xl py-4 items-center active:opacity-80"
            onPress={handleNext}
          >
            <Text className="text-white font-semibold">
              {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
