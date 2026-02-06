'use client';

import type { Task } from '@/types';
import { IdeaItem } from './IdeaItem';

interface IdeaListProps {
  tasks: Task[];
}

export function IdeaList({ tasks }: IdeaListProps) {
  const yesterdayTasks = tasks.filter(t => t.is_from_yesterday);
  const todayTasks = tasks.filter(t => !t.is_from_yesterday);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
        Ideas / Archive
      </h2>

      {tasks.length === 0 ? (
        <p className="text-text-muted text-sm">
          No ideas yet. When your Today list is full, new tasks will appear here.
        </p>
      ) : (
        <div className="space-y-1">
          {todayTasks.map((task) => (
            <IdeaItem key={task.id} task={task} />
          ))}
          {yesterdayTasks.length > 0 && (
            <>
              <div className="h-px bg-border-subtle my-3" />
              <p className="text-xs text-text-muted uppercase tracking-wide mb-2">
                From Yesterday
              </p>
              {yesterdayTasks.map((task) => (
                <IdeaItem key={task.id} task={task} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
