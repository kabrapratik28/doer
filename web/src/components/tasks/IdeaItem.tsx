'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { TASK_CONSTRAINTS } from '@/types';

interface IdeaItemProps {
  task: Task;
}

export function IdeaItem({ task }: IdeaItemProps) {
  const promoteTask = useTaskStore((state) => state.promoteTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const activeTasks = useTaskStore((state) => state.getActiveTasks());

  const canPromote = activeTasks.length < TASK_CONSTRAINTS.MAX_ACTIVE_TASKS;

  return (
    <motion.div
      className="h-12 flex items-center justify-between px-2 group"
      whileHover={{ x: 4 }}
    >
      <span className={`text-base truncate flex-1 ${task.is_from_yesterday ? 'text-text-muted' : 'text-text-secondary'}`}>
        {task.is_from_yesterday && <span className="text-text-muted text-sm mr-2">(Yesterday)</span>}
        {task.text}
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPromote && (
          <button
            onClick={() => promoteTask(task.id)}
            className="text-sm text-accent-gold hover:text-accent-gold-dim transition-colors"
            title="Add to Today"
          >
            + Today
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="text-sm text-text-muted hover:text-error transition-colors"
          title="Delete"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
