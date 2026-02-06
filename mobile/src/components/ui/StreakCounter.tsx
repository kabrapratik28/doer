import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface StreakCounterProps {
  count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Bounce animation when count changes
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0) {
    return null;
  }

  return (
    <Animated.View
      className="flex-row items-center gap-1"
      style={animatedStyle}
      accessibilityLabel={`${count} day streak`}
      accessibilityRole="text"
    >
      <Text className="text-xl">🔥</Text>
      <Text className="text-xl font-bold text-accent-gold">{count}</Text>
    </Animated.View>
  );
}
