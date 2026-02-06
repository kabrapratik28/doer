'use client';

import { useState, useCallback, useEffect } from 'react';
import { TwoColumnLayout } from '@/components/layout/TwoColumnLayout';
import { PrimeTaskCard } from '@/components/tasks/PrimeTaskCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { QuickCaptureInput } from '@/components/tasks/QuickCaptureInput';
import { IdeaList } from '@/components/tasks/IdeaList';
import { FocusMode } from '@/components/focus/FocusMode';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShredderEffect } from '@/components/animations/ShredderEffect';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { TASK_CONSTRAINTS } from '@/types';

export default function HomePage() {
  const tasks = useTaskStore((state) => state.tasks);
  const getActiveTasks = useTaskStore((state) => state.getActiveTasks);
  const getIdeaTasks = useTaskStore((state) => state.getIdeaTasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const promoteTask = useTaskStore((state) => state.promoteTask);

  const focusedTaskId = useUIStore((state) => state.focusedTaskId);
  const setFocusedTask = useUIStore((state) => state.setFocusedTask);
  const streakCount = useUIStore((state) => state.streakCount);
  const incrementStreak = useUIStore((state) => state.incrementStreak);

  const [shredderActive, setShredderActive] = useState(false);
  const [shredderOrigin, setShredderOrigin] = useState<DOMRect | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const activeTasks = getActiveTasks();
  const ideaTasks = getIdeaTasks();
  const primeTask = activeTasks[0];
  const secondaryTasks = activeTasks.slice(1);
  const focusedTask = tasks.find((t) => t.id === focusedTaskId) ?? null;
  const allDone = tasks.length > 0 && activeTasks.length === 0 && tasks.some(t => t.status === 'done');

  const handleComplete = useCallback((id: string, element?: HTMLElement) => {
    if (element) {
      setShredderOrigin(element.getBoundingClientRect());
    }
    setCompletingTaskId(id);
    setShredderActive(true);
  }, []);

  const handleShredderComplete = useCallback(() => {
    if (completingTaskId) {
      completeTask(completingTaskId);
      incrementStreak();
      setCompletingTaskId(null);
    }
    setShredderActive(false);
    setShredderOrigin(null);
  }, [completingTaskId, completeTask, incrementStreak]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + D to complete focused task
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && focusedTask) {
        e.preventDefault();
        handleComplete(focusedTask.id);
        setFocusedTask(null);
      }
      // Escape to close focus mode
      if (e.key === 'Escape' && focusedTask) {
        setFocusedTask(null);
      }
      // Enter to complete in focus mode
      if (e.key === 'Enter' && focusedTask && !(e.target instanceof HTMLInputElement)) {
        handleComplete(focusedTask.id);
        setFocusedTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTask, handleComplete, setFocusedTask]);

  return (
    <>
      <TwoColumnLayout sidebar={<IdeaList tasks={ideaTasks} />}>
        {activeTasks.length === 0 ? (
          <EmptyState type={allDone ? 'all-done' : 'no-tasks'} streakCount={streakCount} />
        ) : (
          <div className="space-y-4">
            {/* Prime Task */}
            {primeTask && (
              <PrimeTaskCard
                task={primeTask}
                onComplete={(id) => handleComplete(id)}
                onClick={() => setFocusedTask(primeTask.id)}
              />
            )}

            {/* Secondary Tasks */}
            {secondaryTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(id) => handleComplete(id)}
                onClick={() => setFocusedTask(task.id)}
              />
            ))}

            {/* Add to Today CTA (if < 3 active) */}
            {activeTasks.length < TASK_CONSTRAINTS.MAX_ACTIVE_TASKS && ideaTasks.length > 0 && (
              <button
                onClick={() => {
                  const nextIdea = ideaTasks[0];
                  if (nextIdea) promoteTask(nextIdea.id);
                }}
                className="w-full h-14 border-2 border-dashed border-border rounded-xl
                           text-text-muted hover:border-text-muted hover:text-text-secondary
                           transition-colors duration-200"
              >
                + Add from Ideas ({ideaTasks.length} available)
              </button>
            )}
          </div>
        )}

        {/* Quick Capture - Fixed at bottom on mobile, inline on desktop */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border
                        md:static md:mt-8 md:border-none md:p-0">
          <div className="max-w-[1200px] mx-auto md:max-w-none">
            <QuickCaptureInput />
          </div>
        </div>
      </TwoColumnLayout>

      {/* Focus Mode Overlay */}
      <FocusMode
        task={focusedTask}
        onClose={() => setFocusedTask(null)}
        onComplete={(id) => {
          handleComplete(id);
          setFocusedTask(null);
        }}
      />

      {/* Shredder Effect */}
      <ShredderEffect
        isActive={shredderActive}
        onComplete={handleShredderComplete}
        originRect={shredderOrigin}
      />
    </>
  );
}
