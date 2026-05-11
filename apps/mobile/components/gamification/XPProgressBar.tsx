import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { XP_PER_LEVEL, levelProgress } from '@glide/shared/constants';

interface Props {
  xp: number;
  level: number;
}

export function XPProgressBar({ xp, level }: Props) {
  const progress = levelProgress(xp);

  const animatedWidth = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, { damping: 15 }),
  }));

  return (
    <View className="bg-sui-navy rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-sui-sky/20 items-center justify-center mr-3">
            <Text className="text-sui-sky font-bold">{level}</Text>
          </View>
          <View>
            <Text className="text-white font-semibold">Level {level}</Text>
            <Text className="text-sui-accent/60 text-xs">{xp} XP total</Text>
          </View>
        </View>
        <Text className="text-sui-accent/60 text-sm">
          {XP_PER_LEVEL - (xp % XP_PER_LEVEL)} to next
        </Text>
      </View>
      <View className="h-3 bg-sui-ocean rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-sui-sky rounded-full"
          style={animatedWidth}
        />
      </View>
    </View>
  );
}
