import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  config: {
    code?: string;
    highlights?: { line: number; explanation: string }[];
  };
}

export function CodeHighlightInteractive({ config }: Props) {
  const { code = '', highlights = [] } = config;
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const lines = code.split('\n');

  const selectedHighlight = highlights.find((h) => h.line === selectedLine);

  return (
    <View className="bg-sui-navy/80 rounded-xl overflow-hidden">
      {/* Code Block */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="p-4">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const hasHighlight = highlights.some((h) => h.line === lineNum);
            const isSelected = selectedLine === lineNum;

            return (
              <Pressable
                key={index}
                className={`flex-row py-0.5 px-2 rounded ${
                  isSelected
                    ? 'bg-sui-sky/20'
                    : hasHighlight
                    ? 'bg-sui-sky/5'
                    : ''
                }`}
                onPress={() => hasHighlight && setSelectedLine(isSelected ? null : lineNum)}
              >
                <Text className="text-sui-accent/40 text-xs font-mono w-6 mr-3">
                  {lineNum}
                </Text>
                <Text
                  className={`text-xs font-mono ${
                    hasHighlight ? 'text-sui-mist' : 'text-sui-mist/60'
                  }`}
                >
                  {line || ' '}
                </Text>
                {hasHighlight && (
                  <Text className="text-sui-sky text-xs ml-2">
                    {isSelected ? '◀' : '•'}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Explanation */}
      {selectedHighlight && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="border-t border-sui-navy p-4 bg-sui-sky/5"
        >
          <Text className="text-sui-sky text-xs font-medium mb-1">
            Line {selectedHighlight.line}
          </Text>
          <Text className="text-sui-mist/80 text-sm leading-5">
            {selectedHighlight.explanation}
          </Text>
        </Animated.View>
      )}

      {/* Progress */}
      <View className="px-4 pb-3">
        <Text className="text-sui-accent/40 text-xs">
          Tap highlighted lines to learn more
        </Text>
      </View>
    </View>
  );
}
