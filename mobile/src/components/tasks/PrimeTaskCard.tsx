import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { Task } from '../../types/task';
import { haptics } from '../../lib/haptics';
import { GESTURE_THRESHOLDS, UI_SIZES } from '../../types/constants';

interface PrimeTaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onPress: () => void;
}

export function PrimeTaskCard({ task, onComplete, onPress }: PrimeTaskCardProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const triggerComplete = () => {
    haptics.heavy();
    onComplete(task.id);
  };

  const triggerPress = () => {
    haptics.light();
    onPress();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swipe right
      translateX.value = Math.max(0, event.translationX);
      // Subtle scale increase as user swipes
      scale.value = interpolate(
        translateX.value,
        [0, GESTURE_THRESHOLDS.SWIPE_THRESHOLD],
        [1, 1.02],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (
        translateX.value > GESTURE_THRESHOLDS.SWIPE_THRESHOLD ||
        event.velocityX > GESTURE_THRESHOLDS.VELOCITY_THRESHOLD
      ) {
        // Trigger completion animation
        translateX.value = withSpring(400, { damping: 15 });
        runOnJS(triggerComplete)();
      } else {
        // Reset position
        translateX.value = withSpring(0, { damping: 20 });
        scale.value = withSpring(1);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(triggerPress)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  const swipeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, GESTURE_THRESHOLDS.SWIPE_THRESHOLD / 2],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="relative mx-4">
      {/* Swipe indicator background */}
      <Animated.View
        className="absolute inset-0 bg-success rounded-2xl justify-center pl-6"
        style={swipeIndicatorStyle}
      >
        <Text className="text-white text-2xl">✓</Text>
      </Animated.View>

      {/* Main card */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          className="bg-surface border-2 border-border rounded-2xl p-6"
          style={[{ height: UI_SIZES.PRIME_TASK_HEIGHT }, animatedStyle]}
          accessibilityRole="button"
          accessibilityLabel={`Prime task: ${task.text}. Swipe right to complete.`}
        >
          <Text className="text-text-muted text-xs uppercase tracking-widest mb-2">
            THE BIG ONE
          </Text>
          <Text
            className="text-2xl font-bold text-text-primary"
            numberOfLines={2}
          >
            {task.text}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
