'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/types';

interface PrimeTaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onClick: () => void;
}

export function PrimeTaskCard({ task, onComplete, onClick }: PrimeTaskCardProps) {
  return (
    <motion.div
      className="min-h-[140px] bg-surface border-2 border-border rounded-2xl p-6 cursor-pointer
                 hover:border-accent-gold transition-colors duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 200 || info.velocity.x > 500) {
          onComplete(task.id);
        }
      }}
    >
      <span className="text-text-muted text-xs uppercase tracking-widest font-medium">
        THE BIG ONE
      </span>
      <h2 className="text-[28px] font-bold mt-3 leading-tight line-clamp-2">
        {task.text}
      </h2>
      <p className="text-text-muted text-sm mt-3">
        Swipe right to complete
      </p>
    </motion.div>
  );
}
