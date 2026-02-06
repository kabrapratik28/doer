'use client';

import { StreakCounter } from '../ui/StreakCounter';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const streakCount = useUIStore((state) => state.streakCount);

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6">
      <h1 className="text-xl font-bold tracking-tight">DOER</h1>
      <StreakCounter count={streakCount} />
    </header>
  );
}
