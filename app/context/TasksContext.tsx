import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

interface TasksContextProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  editTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTaskLeft: (id: string) => void;
  moveTaskRight: (id: string) => void;
}

const TasksContext = createContext<TasksContextProps | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => setTasks(prev => [task, ...prev]);

  const editTask = (task: Task) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const moveTaskLeft = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? {
            ...task,
            status:
              task.status === 'IN_PROGRESS'
                ? 'TODO'
                : task.status === 'DONE'
                ? 'IN_PROGRESS'
                : task.status,
          }
        : task
    ));
  };

  const moveTaskRight = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id
        ? {
            ...task,
            status:
              task.status === 'TODO'
                ? 'IN_PROGRESS'
                : task.status === 'IN_PROGRESS'
                ? 'DONE'
                : task.status,
          }
        : task
    ));
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, editTask, deleteTask, moveTaskLeft, moveTaskRight }}>
      {children}
    </TasksContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used within a TasksProvider');
  return context;
} 