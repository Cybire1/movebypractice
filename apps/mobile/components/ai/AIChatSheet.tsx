import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  context: string; // Current lesson/slide/code context
}

export function AIChatSheet({ context }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat(userMessage.content, context);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || response.message || 'No response',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that. Try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-sui-ocean">
        {/* Header */}
        <View className="px-5 py-3 border-b border-sui-navy">
          <Text className="text-white font-semibold">AI Tutor</Text>
          <Text className="text-sui-accent/60 text-xs">Ask me anything about this lesson</Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          renderItem={({ item }) => (
            <Animated.View
              entering={FadeInDown.duration(200)}
              className={`mb-3 max-w-[85%] ${
                item.role === 'user' ? 'self-end' : 'self-start'
              }`}
            >
              <View
                className={`rounded-2xl px-4 py-3 ${
                  item.role === 'user'
                    ? 'bg-sui-sky rounded-br-sm'
                    : 'bg-sui-navy rounded-bl-sm'
                }`}
              >
                <Text className="text-white text-sm leading-5">{item.content}</Text>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">🤖</Text>
              <Text className="text-sui-accent/60 text-center">
                Ask me about Move, Sui, or this lesson
              </Text>
            </View>
          }
        />

        {/* Loading */}
        {loading && (
          <View className="px-5 pb-2">
            <Text className="text-sui-accent/60 text-sm">Thinking...</Text>
          </View>
        )}

        {/* Input */}
        <View className="flex-row items-end px-4 py-3 border-t border-sui-navy gap-2">
          <TextInput
            className="flex-1 bg-sui-navy rounded-xl px-4 py-3 text-white text-sm max-h-24"
            placeholder="Ask a question..."
            placeholderTextColor="#6B7280"
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={sendMessage}
          />
          <Pressable
            className={`w-10 h-10 rounded-full items-center justify-center ${
              input.trim() ? 'bg-sui-sky' : 'bg-sui-navy'
            }`}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text className="text-white font-bold">↑</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
