import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Session } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: ReactNode;
  onSessionChange?: (session: Session | null) => void;
}

export function AuthProvider({ children, onSessionChange }: AuthProviderProps) {
  const setProfile = useUserStore((state) => state.setProfile);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      onSessionChange?.(session);
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        onSessionChange?.(session);

        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setProfile, onSessionChange]);

  if (!initialized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
