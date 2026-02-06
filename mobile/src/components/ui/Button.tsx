import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const baseStyles = 'h-14 rounded-full justify-center items-center px-6';

  const variantStyles = {
    primary: 'bg-text-primary',
    secondary: 'bg-surface border border-border',
    ghost: 'bg-transparent',
  };

  const textStyles = {
    primary: 'text-background font-bold text-lg',
    secondary: 'text-text-primary font-medium text-base',
    ghost: 'text-text-secondary font-medium text-base',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        disabled ? 'opacity-50' : ''
      }`}
      style={style}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#000000' : '#FFFFFF'}
        />
      ) : (
        <Text className={textStyles[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
