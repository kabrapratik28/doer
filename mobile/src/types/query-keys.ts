/**
 * Query key factory for consistent cache management
 */
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    active: ['tasks', 'active'] as const,
    ideas: ['tasks', 'ideas'] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
    streak: ['user', 'streak'] as const,
    stats: ['user', 'stats'] as const,
  },
} as const;
