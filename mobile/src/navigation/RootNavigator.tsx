import { useState, useCallback } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import { HomeScreen, AuthScreen } from '../screens';
import { AuthProvider } from '../providers/AuthProvider';

const Stack = createNativeStackNavigator();

// Dark theme matching our design tokens
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFD700',
    background: '#000000',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#FFD700',
  },
};

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);

  const handleSessionChange = useCallback((newSession: Session | null) => {
    setSession(newSession);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    // Session will be updated through AuthProvider
  }, []);

  return (
    <AuthProvider onSessionChange={handleSessionChange}>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#000000' },
          }}
        >
          {session ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <Stack.Screen name="Auth">
              {() => <AuthScreen onAuthSuccess={handleAuthSuccess} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
