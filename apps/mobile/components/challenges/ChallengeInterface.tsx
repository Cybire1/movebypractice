import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Challenge } from '@glide/shared/types';
import { useGameStore } from '@/lib/store/gameStore';
import { api } from '@/lib/api';

interface Props {
  challenge: Challenge;
}

export function ChallengeInterface({ challenge }: Props) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const { addXP } = useGameStore();

  const hints = [challenge.hint1, challenge.hint2, challenge.hint3].filter(Boolean);

  function checkAnswer() {
    const normalized = answer.trim().toLowerCase();
    const solutionNormalized = challenge.solution.trim().toLowerCase();

    if (normalized === solutionNormalized || answer.trim() === challenge.solution.trim()) {
      setResult('correct');
      const bonus = !showHint ? challenge.noHintBonus || 0 : 0;
      addXP(challenge.baseXP + bonus);
      api.completeChallenge().catch(() => {});
    } else {
      setResult('wrong');
    }
  }

  function showNextHint() {
    setShowHint(true);
    if (hintLevel < hints.length - 1) {
      setHintLevel(hintLevel + 1);
    }
  }

  return (
    <View className="bg-sui-navy rounded-2xl p-5">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-sui-sky/10 px-3 py-1 rounded-lg">
          <Text className="text-sui-sky text-xs font-medium capitalize">
            {challenge.difficulty}
          </Text>
        </View>
        <Text className="text-sui-accent/60 text-xs">
          {challenge.baseXP} XP
        </Text>
      </View>

      <Text className="text-white text-lg font-semibold mb-2">
        {challenge.title}
      </Text>
      <Text className="text-sui-accent/80 text-sm mb-4">
        {challenge.description}
      </Text>

      {/* Code Display */}
      {(challenge.starterCode || challenge.buggyCode || challenge.predictionCode) && (
        <View className="bg-sui-ocean rounded-xl p-4 mb-4">
          <Text className="text-sui-mist/80 font-mono text-xs">
            {challenge.starterCode || challenge.buggyCode || challenge.predictionCode}
          </Text>
        </View>
      )}

      {/* Multiple Choice */}
      {challenge.multipleChoiceOptions ? (
        <View className="gap-2 mb-4">
          {challenge.multipleChoiceOptions.map((option, i) => (
            <Pressable
              key={i}
              className={`rounded-xl p-3 border ${
                answer === option
                  ? 'border-sui-sky bg-sui-sky/10'
                  : 'border-sui-navy bg-sui-ocean/50'
              }`}
              onPress={() => setAnswer(option)}
            >
              <Text className="text-white text-sm">{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <TextInput
          className="bg-sui-ocean border border-sui-navy rounded-xl px-4 py-3 text-white font-mono text-sm mb-4"
          placeholder="Your answer..."
          placeholderTextColor="#6B7280"
          value={answer}
          onChangeText={setAnswer}
          multiline
        />
      )}

      {/* Hints */}
      {showHint && hints[hintLevel] && (
        <Animated.View entering={FadeIn} className="bg-yellow-500/10 rounded-xl p-3 mb-4">
          <Text className="text-yellow-400 text-xs font-medium mb-1">
            Hint {hintLevel + 1}
          </Text>
          <Text className="text-yellow-200/80 text-sm">{hints[hintLevel]}</Text>
        </Animated.View>
      )}

      {/* Result */}
      {result && (
        <Animated.View
          entering={FadeIn}
          className={`rounded-xl p-3 mb-4 ${
            result === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}
        >
          <Text
            className={`font-medium ${
              result === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {result === 'correct' ? '✓ Correct!' : '✗ Try again'}
          </Text>
        </Animated.View>
      )}

      {/* Actions */}
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 bg-sui-ocean border border-sui-navy rounded-xl py-3 items-center active:opacity-80"
          onPress={showNextHint}
        >
          <Text className="text-yellow-400 font-medium text-sm">Hint</Text>
        </Pressable>
        <Pressable
          className="flex-[2] bg-sui-sky rounded-xl py-3 items-center active:opacity-80"
          onPress={checkAnswer}
          disabled={!answer}
        >
          <Text className="text-white font-semibold">Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}
