'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/types';

interface FocusModeProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const handleComplete = () => {
    if (task) {
      onComplete(task.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center
                       text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close focus mode"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Task Title */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-center max-w-[80%] leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {task.text}
          </motion.h1>

          {/* Progress Bar (Visual placeholder) */}
          <motion.div
            className="w-full max-w-md h-1 bg-border rounded-full mt-12"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="h-full bg-accent-gold rounded-full w-0 animate-pulse" />
          </motion.div>

          {/* Done Button */}
          <motion.button
            onClick={handleComplete}
            className="mt-12 h-14 w-[200px] bg-text-primary text-background font-bold
                       rounded-full hover:bg-text-secondary transition-colors"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Done
          </motion.button>

          {/* Keyboard hint */}
          <motion.p
            className="mt-4 text-text-muted text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Press Enter or click Done to complete
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
