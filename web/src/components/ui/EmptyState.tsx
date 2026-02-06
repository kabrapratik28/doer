interface EmptyStateProps {
  type: 'no-tasks' | 'all-done';
  streakCount?: number;
}

export function EmptyState({ type, streakCount = 0 }: EmptyStateProps) {
  if (type === 'all-done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-6" role="img" aria-label="target">
          🎯
        </span>
        <h2 className="text-2xl font-bold mb-2">You crushed it today.</h2>
        <div className="flex items-center gap-1 text-accent-gold">
          <span role="img" aria-label="fire">🔥</span>
          <span className="font-bold">{streakCount} day streak</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-6" role="img" aria-label="notepad">
        📝
      </span>
      <h2 className="text-2xl font-bold mb-2">What&apos;s The Big One?</h2>
      <p className="text-text-secondary">
        Add your most important task for today below.
      </p>
    </div>
  );
}
