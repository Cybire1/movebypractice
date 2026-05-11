import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LessonContent } from '@glide/shared/types';
import { MobileCodeEditor } from '@/components/editor/MobileCodeEditor';

interface Props {
  lesson: LessonContent;
  onComplete: () => void;
}

export function PracticePhase({ lesson, onComplete }: Props) {
  const [code, setCode] = useState(lesson.starterCode || '');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const hints = lesson.hints || [];

  function revealNextHint() {
    if (hintIndex < hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    setShowHint(true);
  }

  function handleSubmit() {
    // Basic validation: check if starter code blanks are filled
    const hasUnfilled = code.includes('___') || code.includes('/* TODO */');
    if (hasUnfilled) {
      // Could show toast
      return;
    }
    onComplete();
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-white font-semibold text-lg mb-2">
            Practice
          </Text>
          <Text className="text-sui-accent/70 text-sm mb-4">
            Complete the code below to finish this lesson
          </Text>
        </View>

        {/* Code Editor */}
        <View className="mx-4 rounded-xl overflow-hidden border border-sui-navy" style={{ height: 300 }}>
          <MobileCodeEditor
            value={code}
            onChange={setCode}
            language={lesson.language || 'move'}
          />
        </View>

        {/* Hints */}
        <View className="px-5 mt-4">
          {showHint && hints.length > 0 && (
            <View className="bg-sui-navy/80 rounded-xl p-4 mb-3">
              <Text className="text-yellow-400 text-sm font-medium mb-1">
                Hint {hintIndex + 1}
              </Text>
              <Text className="text-sui-accent text-sm">
                {hints[hintIndex]}
              </Text>
            </View>
          )}

          <View className="flex-row gap-3">
            {hints.length > 0 && (
              <Pressable
                className="flex-1 bg-sui-navy rounded-xl py-3 items-center active:opacity-80"
                onPress={revealNextHint}
              >
                <Text className="text-yellow-400 text-sm font-medium">
                  {showHint ? 'Next Hint' : 'Show Hint'}
                </Text>
              </Pressable>
            )}
            <Pressable
              className="flex-1 bg-sui-navy rounded-xl py-3 items-center active:opacity-80"
              onPress={() => setShowSolution(!showSolution)}
            >
              <Text className="text-sui-accent text-sm font-medium">
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </Text>
            </Pressable>
          </View>

          {showSolution && (
            <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-3">
              <Text className="text-green-400 text-sm font-medium mb-2">Solution</Text>
              <Text className="text-sui-mist/80 text-xs font-mono">
                {lesson.solution}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="px-5 py-4 border-t border-sui-navy">
        <Pressable
          className="bg-green-500 rounded-xl py-4 items-center active:opacity-80"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-lg">Submit</Text>
        </Pressable>
      </View>
    </View>
  );
}
