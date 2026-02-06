import { View } from 'react-native';
import type { Task } from '../../types/task';
import { PrimeTaskCard } from './PrimeTaskCard';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onPress: (task: Task) => void;
}

export function TaskList({ tasks, onComplete, onPress }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  const primeTask = tasks[0];
  const secondaryTasks = tasks.slice(1);

  return (
    <View className="flex-1 gap-4 pt-4">
      {/* Prime Task (The Big One) */}
      {primeTask && (
        <PrimeTaskCard
          task={primeTask}
          onComplete={onComplete}
          onPress={() => onPress(primeTask)}
        />
      )}

      {/* Secondary Tasks */}
      {secondaryTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onPress={() => onPress(task)}
        />
      ))}
    </View>
  );
}
