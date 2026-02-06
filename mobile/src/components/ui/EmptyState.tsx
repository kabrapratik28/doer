import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  type: 'no-tasks' | 'all-done';
  streakCount?: number;
  onAddTomorrow?: () => void;
}

export function EmptyState({ type, streakCount = 0, onAddTomorrow }: EmptyStateProps) {
  if (type === 'all-done') {
    return (
      <View
        className="flex-1 justify-center items-center px-8"
        accessibilityRole="text"
      >
        <Text className="text-5xl mb-6">🎯</Text>
        <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
          You crushed it today.
        </Text>
        {streakCount > 0 && (
          <View className="flex-row items-center gap-1 mt-2">
            <Text className="text-xl">🔥</Text>
            <Text className="text-lg font-bold text-accent-gold">
              {streakCount} day streak
            </Text>
          </View>
        )}
        {onAddTomorrow && (
          <TouchableOpacity
            onPress={onAddTomorrow}
            className="mt-8 px-6 py-3 bg-surface rounded-full"
            accessibilityRole="button"
          >
            <Text className="text-text-secondary font-medium">
              Add Tomorrow's Tasks
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      className="flex-1 justify-center items-center px-8"
      accessibilityRole="text"
    >
      <Text className="text-5xl mb-6">📝</Text>
      <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
        What's The Big One?
      </Text>
      <Text className="text-text-secondary text-center leading-6">
        Add your most important task for today below.
      </Text>
    </View>
  );
}
