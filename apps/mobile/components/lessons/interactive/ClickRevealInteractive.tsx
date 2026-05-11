import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  config: {
    reveals?: { label: string; content: string }[];
  };
}

export function ClickRevealInteractive({ config }: Props) {
  const { reveals = [] } = config;
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggleReveal(index: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <View className="gap-3">
      {reveals.map((item, index) => {
        const isRevealed = revealed.has(index);
        return (
          <Pressable
            key={index}
            className={`rounded-xl border overflow-hidden ${
              isRevealed ? 'border-sui-sky/40 bg-sui-sky/5' : 'border-sui-navy bg-sui-navy/50'
            }`}
            onPress={() => toggleReveal(index)}
          >
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-medium">{item.label}</Text>
                <Text className="text-sui-accent text-lg">
                  {isRevealed ? '▼' : '▶'}
                </Text>
              </View>
              {isRevealed && (
                <Animated.View entering={FadeIn.duration(200)} className="mt-3 pt-3 border-t border-sui-navy">
                  <Text className="text-sui-mist/80 text-sm leading-6">
                    {item.content}
                  </Text>
                </Animated.View>
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Progress */}
      <Text className="text-sui-accent/50 text-xs text-center mt-1">
        {revealed.size}/{reveals.length} revealed
      </Text>
    </View>
  );
}
