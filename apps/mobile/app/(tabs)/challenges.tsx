import { View, Text, ScrollView } from 'react-native';
import { getTodaysChallenge } from '@glide/shared/utils';
import { ChallengeInterface } from '@/components/challenges/ChallengeInterface';

export default function ChallengesScreen() {
  const todaysChallenge = getTodaysChallenge();

  return (
    <ScrollView className="flex-1 bg-sui-ocean">
      <View className="px-5 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          Daily Challenge
        </Text>
        <Text className="text-sui-accent mb-6">
          Solve today's puzzle to maintain your streak
        </Text>

        {todaysChallenge ? (
          <ChallengeInterface challenge={todaysChallenge} />
        ) : (
          <View className="bg-sui-navy rounded-2xl p-6 items-center">
            <Text className="text-white text-lg font-medium">
              No challenge available
            </Text>
            <Text className="text-sui-accent/60 mt-2 text-center">
              Check back tomorrow for a new challenge
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
