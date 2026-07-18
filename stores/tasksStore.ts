import { create } from "zustand";
import type { Task } from "@/types/task";
import { TaskQueueService } from "@/services/taskQueueService";

interface TasksState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  createTask: (input: { title: string; description: string; assignedAgentId: string; priority?: Task["priority"] }) => Task;
  advanceTask: (taskId: string) => Task | null;
  resetTasks: () => void;
}

const queueService = new TaskQueueService();

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  createTask: (input) => {
    const task = queueService.createTask(input);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },
  advanceTask: (taskId) => {
    const advancedTask = queueService.advanceTask(taskId);
    if (!advancedTask) {
      return null;
    }

    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? advancedTask : task)),
    }));

    return advancedTask;
  },
  resetTasks: () => {
    queueService.reset();
    set({ tasks: [] });
  },
}));
