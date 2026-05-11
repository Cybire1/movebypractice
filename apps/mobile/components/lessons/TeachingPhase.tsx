import { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, FlatList } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { LessonContent, TeachingSlide } from '@glide/shared/types';
import { DragDropInteractive } from '@/components/lessons/interactive/DragDropInteractive';
import { ClickRevealInteractive } from '@/components/lessons/interactive/ClickRevealInteractive';
import { CodeHighlightInteractive } from '@/components/lessons/interactive/CodeHighlightInteractive';

interface Props {
  lesson: LessonContent;
  onComplete: () => void;
}

export function TeachingPhase({ lesson, onComplete }: Props) {
  const slides = getAllSlides(lesson);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  function getAllSlides(lesson: LessonContent): TeachingSlide[] {
    if (lesson.teachingSections) {
      return lesson.teachingSections.flatMap((section) => section.slides);
    }
    return lesson.teachingSlides || [];
  }

  function goNext() {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  if (!currentSlide) {
    onComplete();
    return null;
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)} key={currentIndex}>
          {/* Slide Header */}
          <Text className="text-3xl mb-2">{currentSlide.emoji}</Text>
          <Text className="text-white text-xl font-bold mb-4">
            {currentSlide.title}
          </Text>

          {/* Slide Content */}
          <Text className="text-sui-mist/80 text-base leading-7 mb-6">
            {currentSlide.content}
          </Text>

          {/* Interactive Element */}
          {currentSlide.interactiveElement && (
            <View className="mb-6">
              {currentSlide.interactiveElement.type === 'drag-drop' && (
                <DragDropInteractive config={currentSlide.interactiveElement.config} />
              )}
              {currentSlide.interactiveElement.type === 'click-reveal' && (
                <ClickRevealInteractive config={currentSlide.interactiveElement.config} />
              )}
              {currentSlide.interactiveElement.type === 'code-highlight' && (
                <CodeHighlightInteractive config={currentSlide.interactiveElement.config} />
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row items-center justify-between px-5 py-4 border-t border-sui-navy">
        <Pressable
          className={`px-5 py-3 rounded-xl ${currentIndex > 0 ? 'bg-sui-navy' : 'opacity-30'}`}
          onPress={goPrev}
          disabled={currentIndex === 0}
        >
          <Text className="text-white font-medium">Back</Text>
        </Pressable>

        <Text className="text-sui-accent/60 text-sm">
          {currentIndex + 1} / {slides.length}
        </Text>

        <Pressable
          className="bg-sui-sky px-5 py-3 rounded-xl active:opacity-80"
          onPress={goNext}
        >
          <Text className="text-white font-medium">
            {currentIndex === slides.length - 1 ? 'Start Quiz' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
