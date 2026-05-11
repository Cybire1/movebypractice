import { View, Text } from 'react-native';

const PHASES = ['teaching', 'quiz', 'practice'] as const;
const LABELS = { teaching: 'Learn', quiz: 'Quiz', practice: 'Practice' };

interface Props {
  currentPhase: string;
}

export function PhaseIndicator({ currentPhase }: Props) {
  const currentIndex = PHASES.indexOf(currentPhase as any);

  return (
    <View className="flex-row items-center mt-1 gap-1">
      {PHASES.map((phase, i) => (
        <View key={phase} className="flex-row items-center">
          <View
            className={`h-1.5 w-6 rounded-full ${
              i <= currentIndex ? 'bg-sui-sky' : 'bg-sui-navy'
            }`}
          />
          {i < PHASES.length - 1 && <View className="w-0.5" />}
        </View>
      ))}
      <Text className="text-sui-accent/60 text-xs ml-2">
        {LABELS[currentPhase as keyof typeof LABELS] || ''}
      </Text>
    </View>
  );
}
