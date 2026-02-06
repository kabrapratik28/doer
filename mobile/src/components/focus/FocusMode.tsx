import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import type { Task } from '../../types/task';
import { haptics } from '../../lib/haptics';

interface FocusModeProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export function FocusMode({ task, visible, onClose, onComplete }: FocusModeProps) {
  const insets = useSafeAreaInsets();
  const [startTime] = useState(Date.now());
  const progress = useSharedValue(0);

  // Animate progress bar over time (optional visual feedback)
  useEffect(() => {
    if (visible) {
      progress.value = 0;
      // Animate to 100% over 30 minutes (1800 seconds)
      progress.value = withTiming(100, {
        duration: 1800000,
        easing: Easing.linear,
      });
    }
  }, [visible]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const handleComplete = () => {
    if (task) {
      haptics.success();
      onComplete(task.id);
      onClose();
    }
  };

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View
        className="flex-1 bg-background justify-center items-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          className="absolute right-4 w-11 h-11 justify-center items-center"
          style={{ top: insets.top + 8 }}
          accessibilityLabel="Close focus mode"
          accessibilityRole="button"
        >
          <Text className="text-text-muted text-3xl font-light">×</Text>
        </TouchableOpacity>

        {/* Task Title */}
        <View className="max-w-[80%]">
          <Text
            className="text-3xl font-bold text-text-primary text-center"
            accessibilityRole="header"
          >
            {task.text}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="w-full max-w-md h-1 bg-border rounded-full mt-8 overflow-hidden">
          <Animated.View
            className="h-full bg-accent-gold rounded-full"
            style={progressStyle}
          />
        </View>

        {/* Timer hint */}
        <Text className="text-text-muted text-sm mt-2">
          Focus on this task
        </Text>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleComplete}
          className="h-14 w-48 bg-text-primary rounded-full justify-center items-center mt-12"
          accessibilityLabel="Mark task as done"
          accessibilityRole="button"
        >
          <Text className="text-background font-bold text-lg">✓ DONE</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
