import { useState, useCallback } from 'react';
import { View, Text, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  config: {
    items?: { id: string; label: string; emoji: string }[];
    targets?: { id: string; label: string }[];
    correctPairs?: { itemId: string; targetId: string }[];
  };
}

export function DragDropInteractive({ config }: Props) {
  const { items = [], targets = [], correctPairs = [] } = config;
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [targetLayouts, setTargetLayouts] = useState<Record<string, LayoutRectangle>>({});

  const allCorrect = correctPairs.every(
    (pair) => placements[pair.itemId] === pair.targetId
  );

  function handleDrop(itemId: string, x: number, y: number) {
    // Find which target the item was dropped on
    for (const [targetId, layout] of Object.entries(targetLayouts)) {
      if (
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height
      ) {
        setPlacements((prev) => ({ ...prev, [itemId]: targetId }));
        return;
      }
    }
    // Dropped outside — remove placement
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }

  return (
    <View className="bg-sui-navy/50 rounded-xl p-4">
      {/* Targets */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {targets.map((target) => (
          <View
            key={target.id}
            className="flex-1 min-w-[40%] border-2 border-dashed border-sui-sky/30 rounded-xl p-4 items-center"
            onLayout={(e) =>
              setTargetLayouts((prev) => ({
                ...prev,
                [target.id]: e.nativeEvent.layout,
              }))
            }
          >
            <Text className="text-sui-accent text-sm mb-2">{target.label}</Text>
            {/* Show placed items */}
            {Object.entries(placements)
              .filter(([_, tid]) => tid === target.id)
              .map(([itemId]) => {
                const item = items.find((i) => i.id === itemId);
                const isCorrect = correctPairs.some(
                  (p) => p.itemId === itemId && p.targetId === target.id
                );
                return (
                  <View
                    key={itemId}
                    className={`px-3 py-1 rounded-lg mt-1 ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                  >
                    <Text className="text-white text-sm">
                      {item?.emoji} {item?.label}
                    </Text>
                  </View>
                );
              })}
          </View>
        ))}
      </View>

      {/* Draggable Items */}
      <View className="flex-row flex-wrap gap-2">
        {items
          .filter((item) => !placements[item.id])
          .map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onDrop={(x, y) => handleDrop(item.id, x, y)}
            />
          ))}
      </View>

      {/* Success */}
      {allCorrect && items.length > 0 && Object.keys(placements).length === items.length && (
        <View className="mt-4 bg-green-500/10 rounded-lg p-3">
          <Text className="text-green-400 text-center font-medium">
            All correct!
          </Text>
        </View>
      )}
    </View>
  );
}

function DraggableItem({
  item,
  onDrop,
}: {
  item: { id: string; label: string; emoji: string };
  onDrop: (x: number, y: number) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      scale.value = withSpring(1);
      runOnJS(onDrop)(e.absoluteX, e.absoluteY);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={animatedStyle}
        className="bg-sui-sky/20 border border-sui-sky/40 rounded-lg px-3 py-2"
      >
        <Text className="text-white text-sm">
          {item.emoji} {item.label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
