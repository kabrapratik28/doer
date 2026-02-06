'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, onComplete, onClick }: TaskCardProps) {
  return (
    <motion.div
      className="h-14 bg-surface rounded-xl px-4 flex items-center cursor-pointer
                 hover:bg-surface-elevated transition-colors duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 150 || info.velocity.x > 500) {
          onComplete(task.id);
        }
      }}
    >
      <span className="text-base font-medium truncate">{task.text}</span>
    </motion.div>
  );
}
