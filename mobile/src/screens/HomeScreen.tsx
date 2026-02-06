import { useRef, useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Header, IdeasBottomSheet } from '../components/layout';
import { TaskList, QuickCaptureInput } from '../components/tasks';
import { FocusMode } from '../components/focus';
import { EmptyState } from '../components/ui';
import { useTasks, useCompleteTask, usePromoteTask, useDeleteTask } from '../hooks';
import { useUserStore } from '../stores/userStore';
import type { Task } from '../types/task';

export function HomeScreen() {
  const { data: tasks, isLoading } = useTasks();
  const completeTask = useCompleteTask();
  const promoteTask = usePromoteTask();
  const deleteTask = useDeleteTask();
  const profile = useUserStore((state) => state.profile);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  // Filter tasks by status
  const activeTasks = tasks
    ?.filter((t) => t.status === 'active')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99)) ?? [];
  const ideaTasks = tasks?.filter((t) => t.status === 'idea') ?? [];
  const doneTasks = tasks?.filter((t) => t.status === 'done') ?? [];

  // Check if all tasks for today are completed
  const allDone = activeTasks.length === 0 && doneTasks.length > 0;

  const handleComplete = useCallback((id: string) => {
    completeTask.mutate(id);
  }, [completeTask]);

  const handlePromote = useCallback((id: string) => {
    promoteTask.mutate({ id });
  }, [promoteTask]);

  const handleDelete = useCallback((id: string) => {
    deleteTask.mutate(id);
  }, [deleteTask]);

  const handleTaskPress = useCallback((task: Task) => {
    setFocusedTask(task);
  }, []);

  const handleFocusClose = useCallback(() => {
    setFocusedTask(null);
  }, []);

  const handleMenuPress = useCallback(() => {
    // TODO: Navigate to settings
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header onMenuPress={handleMenuPress} />

      {/* Main content */}
      {activeTasks.length === 0 ? (
        <EmptyState
          type={allDone ? 'all-done' : 'no-tasks'}
          streakCount={profile?.streak_count ?? 0}
        />
      ) : (
        <TaskList
          tasks={activeTasks}
          onComplete={handleComplete}
          onPress={handleTaskPress}
        />
      )}

      {/* Quick Capture Input */}
      <QuickCaptureInput autoFocus={activeTasks.length === 0} />

      {/* Ideas Bottom Sheet */}
      <IdeasBottomSheet
        ref={bottomSheetRef}
        ideas={ideaTasks}
        onPromote={handlePromote}
        onDelete={handleDelete}
      />

      {/* Focus Mode */}
      <FocusMode
        task={focusedTask}
        visible={focusedTask !== null}
        onClose={handleFocusClose}
        onComplete={handleComplete}
      />
    </View>
  );
}
