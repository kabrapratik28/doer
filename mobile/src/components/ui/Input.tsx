import { TextInput, View, Text, TextInputProps } from 'react-native';
import { forwardRef } from 'react';
import { UI_SIZES } from '../../types/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-text-secondary text-sm mb-2">{label}</Text>
        )}
        <TextInput
          ref={ref}
          className={`bg-surface rounded-xl px-4 text-lg text-text-primary ${
            error ? 'border border-error' : ''
          }`}
          style={[{ height: UI_SIZES.INPUT_HEIGHT }, style]}
          placeholderTextColor="#666666"
          {...props}
        />
        {error && (
          <Text className="text-error text-sm mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
