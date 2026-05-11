import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export default function ClassRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    loadClass();
  }, [id]);

  async function loadClass() {
    try {
      // The join endpoint returns LiveKit connection info
      const data = await api.joinClass(id);
      setClassData(data);
      setJoined(true);
    } catch (e: any) {
      console.error('Failed to join class:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-sui-ocean justify-center items-center">
        <ActivityIndicator size="large" color="#4DA2FF" />
        <Text className="text-sui-accent mt-4">Joining class...</Text>
      </SafeAreaView>
    );
  }

  if (!joined || !classData) {
    return (
      <SafeAreaView className="flex-1 bg-sui-ocean justify-center items-center px-6">
        <Text className="text-white text-lg mb-4">Unable to join class</Text>
        <Pressable
          className="bg-sui-sky rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // LiveKit room view will be integrated here
  // Using @livekit/react-native Room component
  return (
    <SafeAreaView className="flex-1 bg-sui-ocean">
      <View className="flex-row items-center px-4 py-3 border-b border-sui-navy">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#4DA2FF" />
        </Pressable>
        <Text className="text-white font-semibold flex-1">Live Class</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
          <Text className="text-red-400 text-sm">LIVE</Text>
        </View>
      </View>

      {/* Video Area - placeholder for LiveKit integration */}
      <View className="flex-1 bg-sui-navy m-4 rounded-xl items-center justify-center">
        <Text className="text-sui-accent">
          LiveKit video stream
        </Text>
        <Text className="text-sui-accent/60 text-sm mt-2">
          Token: {classData.token ? '✓ Connected' : 'Connecting...'}
        </Text>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-4 pb-4">
        <Pressable className="w-12 h-12 rounded-full bg-sui-navy items-center justify-center">
          <Ionicons name="mic" size={20} color="#4DA2FF" />
        </Pressable>
        <Pressable className="w-12 h-12 rounded-full bg-sui-navy items-center justify-center">
          <Ionicons name="videocam" size={20} color="#4DA2FF" />
        </Pressable>
        <Pressable className="w-12 h-12 rounded-full bg-sui-navy items-center justify-center">
          <Ionicons name="chatbubble" size={20} color="#4DA2FF" />
        </Pressable>
        <Pressable
          className="w-12 h-12 rounded-full bg-red-500 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="call" size={20} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
