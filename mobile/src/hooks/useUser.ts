import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { UserProfile, UpdateUserSettingsInput, WeeklyStats } from '../types/user';
import { queryKeys } from '../types';

/**
 * Fetch current user profile
 */
export function useProfile() {
  const setProfile = useUserStore((state) => state.setProfile);

  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (data) => {
      setProfile(data);
    },
  });
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const updateSettings = useUserStore((state) => state.updateSettings);

  return useMutation({
    mutationFn: async (input: UpdateUserSettingsInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (data) => {
      updateSettings(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
  });
}

/**
 * Fetch weekly stats for velocity score
 */
export function useWeeklyStats() {
  return useQuery({
    queryKey: queryKeys.user.stats,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('weekly-stats');

      if (error) throw error;
      return data as WeeklyStats;
    },
  });
}

/**
 * Check authentication status
 */
export function useAuth() {
  const { setProfile, logout } = useUserStore();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logout();
  };

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  return {
    signIn,
    signUp,
    signOut,
    getSession,
  };
}
