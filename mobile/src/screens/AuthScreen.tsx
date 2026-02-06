import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks';
import { haptics } from '../lib/haptics';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      haptics.success();
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View
        className="flex-1 justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Logo/Title */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-text-primary mb-2">
            DOER
          </Text>
          <Text className="text-text-secondary text-lg">
            The Execution Engine
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />

          {error && (
            <Text className="text-error text-sm text-center">{error}</Text>
          )}

          <Button
            onPress={handleSubmit}
            title={isSignUp ? 'Create Account' : 'Sign In'}
            loading={loading}
          />

          <Button
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            title={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            variant="ghost"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
