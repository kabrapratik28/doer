import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StreakCounter } from '../ui/StreakCounter';
import { useUserStore } from '../../stores/userStore';

interface HeaderProps {
  onMenuPress?: () => void;
}

export function Header({ onMenuPress }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((state) => state.profile);

  return (
    <View
      className="flex-row items-center justify-between px-4 pb-2 bg-background"
      style={{ paddingTop: insets.top + 8 }}
    >
      <TouchableOpacity
        onPress={onMenuPress}
        className="w-11 h-11 justify-center items-center"
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Text className="text-text-primary text-2xl">≡</Text>
      </TouchableOpacity>

      <Text className="text-text-primary text-xl font-bold">DOER</Text>

      <StreakCounter count={profile?.streak_count ?? 0} />
    </View>
  );
}
