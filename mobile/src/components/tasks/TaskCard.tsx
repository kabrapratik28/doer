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

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onPress: () => void;
}

export function TaskCard({ task, onComplete, onPress }: TaskCardProps) {
  const translateX = useSharedValue(0);

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
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd((event) => {
      if (
        translateX.value > GESTURE_THRESHOLDS.SWIPE_THRESHOLD - 30 ||
        event.velocityX > GESTURE_THRESHOLDS.VELOCITY_THRESHOLD
      ) {
        translateX.value = withSpring(400, { damping: 15 });
        runOnJS(triggerComplete)();
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(triggerPress)();
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const swipeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="relative mx-4">
      {/* Swipe indicator background */}
      <Animated.View
        className="absolute inset-0 bg-success rounded-xl justify-center pl-4"
        style={swipeIndicatorStyle}
      >
        <Text className="text-white text-lg">✓</Text>
      </Animated.View>

      {/* Main card */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          className="bg-surface rounded-xl px-4 justify-center"
          style={[{ height: UI_SIZES.STANDARD_TASK_HEIGHT }, animatedStyle]}
          accessibilityRole="button"
          accessibilityLabel={`Task: ${task.text}. Swipe right to complete.`}
        >
          <Text
            className="text-base font-medium text-text-primary"
            numberOfLines={1}
          >
            {task.text}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
