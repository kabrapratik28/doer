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
import { GESTURE_THRESHOLDS } from '../../types/constants';

interface IdeaItemProps {
  task: Task;
  onPromote: () => void;
  onDelete: () => void;
}

export function IdeaItem({ task, onPromote, onDelete }: IdeaItemProps) {
  const translateX = useSharedValue(0);

  const triggerPromote = () => {
    haptics.medium();
    onPromote();
  };

  const triggerDelete = () => {
    haptics.light();
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > GESTURE_THRESHOLDS.IDEA_SWIPE_THRESHOLD) {
        // Swipe right = promote to active
        translateX.value = withSpring(400, { damping: 15 });
        runOnJS(triggerPromote)();
      } else if (event.translationX < -GESTURE_THRESHOLDS.IDEA_SWIPE_THRESHOLD) {
        // Swipe left = delete
        translateX.value = withSpring(-400, { damping: 15 });
        runOnJS(triggerDelete)();
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const promoteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 50],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -50],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="relative h-12">
      {/* Promote indicator (left side) */}
      <Animated.View
        className="absolute left-0 top-0 bottom-0 justify-center pl-2"
        style={promoteIndicatorStyle}
      >
        <Text className="text-success">+ Today</Text>
      </Animated.View>

      {/* Delete indicator (right side) */}
      <Animated.View
        className="absolute right-0 top-0 bottom-0 justify-center pr-2"
        style={deleteIndicatorStyle}
      >
        <Text className="text-error">Delete</Text>
      </Animated.View>

      {/* Main item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="h-12 flex-row items-center justify-between bg-surface px-3 rounded-lg"
          style={animatedStyle}
          accessibilityRole="button"
          accessibilityLabel={`Idea: ${task.text}. Swipe right to add to today, swipe left to delete.`}
        >
          <Text
            className={`text-base flex-1 ${
              task.is_from_yesterday ? 'text-text-muted' : 'text-text-secondary'
            }`}
            numberOfLines={1}
          >
            {task.is_from_yesterday && (
              <Text className="text-text-muted">From Yesterday: </Text>
            )}
            {task.text}
          </Text>
          <Text className="text-text-muted ml-2">→</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
