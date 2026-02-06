import { useState, useRef, useEffect } from 'react';
import { View, TextInput, Keyboard, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateTask } from '../../hooks';
import { useTaskStore } from '../../stores/taskStore';
import { haptics } from '../../lib/haptics';
import { TASK_CONSTRAINTS, UI_SIZES } from '../../types/constants';

interface QuickCaptureInputProps {
  autoFocus?: boolean;
}

export function QuickCaptureInput({ autoFocus = true }: QuickCaptureInputProps) {
  const [text, setText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const createTask = useCreateTask();
  const activeTasks = useTaskStore((state) => state.activeTasks);

  // Auto-focus on mount (2-Second Rule)
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Auto-capitalize first letter
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    haptics.light();

    // Check if at capacity
    const isAtCapacity = activeTasks.length >= TASK_CONSTRAINTS.MAX_ACTIVE_TASKS;

    createTask.mutate(
      { text: formatted },
      {
        onSuccess: () => {
          if (isAtCapacity) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }
        },
      }
    );

    setText('');
    Keyboard.dismiss();
  };

  return (
    <View
      className="bg-background border-t border-border px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Toast for capacity reached */}
      {showToast && (
        <View className="absolute -top-16 left-4 right-4 bg-surface-elevated rounded-xl p-3">
          <Text className="text-text-secondary text-sm text-center">
            Added to Ideas. Complete one to add to Today.
          </Text>
        </View>
      )}

      {/* Input field */}
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmit}
        placeholder="What needs to be done?"
        placeholderTextColor="#666666"
        className="bg-surface rounded-xl px-4 text-lg text-text-primary"
        style={{ height: UI_SIZES.INPUT_HEIGHT }}
        maxLength={TASK_CONSTRAINTS.MAX_TEXT_LENGTH}
        returnKeyType="done"
        blurOnSubmit={false}
        autoCapitalize="sentences"
        autoCorrect={true}
        accessibilityLabel="Task input"
        accessibilityHint="Enter a task and press done to add it"
      />

      {/* Affordance indicator */}
      <View className="items-center mt-2">
        <Text className="text-text-muted text-xs">▲ Ideas (swipe up)</Text>
      </View>
    </View>
  );
}
