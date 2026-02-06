'use client';

import { motion } from 'framer-motion';

interface StreakCounterProps {
  count: number;
}

export function StreakCounter({ count }: StreakCounterProps) {
  return (
    <motion.div
      className="flex items-center gap-1"
      key={count}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-xl" role="img" aria-label="fire">
        {count > 0 ? '🔥' : '💤'}
      </span>
      <span className="text-xl font-bold text-accent-gold">{count}</span>
    </motion.div>
  );
}
