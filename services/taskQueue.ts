import type { Task, TaskStatus } from "@/types/task";

export interface IExecutionTaskQueue {
  enqueue(input: Omit<Task, "id" | "createdAt" | "completedAt" | "progress" | "status">): Task;
  startNext(agentId?: string): Task | null;
  markStatus(taskId: string, status: TaskStatus, progress?: number): Task | null;
  retry(taskId: string): Task | null;
  cancel(taskId: string): Task | null;
  getTasks(): Task[];
  reset(): void;
}

export class ExecutionTaskQueue implements IExecutionTaskQueue {
  private tasks: Task[] = [];

  enqueue(input: Omit<Task, "id" | "createdAt" | "completedAt" | "progress" | "status">): Task {
    const task: Task = {
      id: `task-${Math.random().toString(36).slice(2, 10)}`,
      title: input.title,
      description: input.description,
      assignedAgent: input.assignedAgent,
      priority: input.priority ?? "Medium",
      status: "Pending",
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this.tasks = [task, ...this.tasks];
    return { ...task };
  }

  startNext(agentId?: string): Task | null {
    const pendingTask = this.tasks.find((task) => {
      if (task.status === "Pending" || task.status === "Retry") {
        return !agentId || task.assignedAgent === agentId;
      }

      return false;
    });

    if (!pendingTask) {
      return null;
    }

    const nextTask = {
      ...pendingTask,
      status: "Running" as TaskStatus,
      progress: 60,
      completedAt: null,
    };

    this.tasks = this.tasks.map((task) => (task.id === pendingTask.id ? nextTask : task));
    return { ...nextTask };
  }

  markStatus(taskId: string, status: TaskStatus, progress = 0): Task | null {
    const task = this.tasks.find((entry) => entry.id === taskId);

    if (!task) {
      return null;
    }

    const nextTask = {
      ...task,
      status,
      progress,
      completedAt: status === "Completed" ? new Date().toISOString() : task.completedAt,
    };

    this.tasks = this.tasks.map((entry) => (entry.id === taskId ? nextTask : entry));
    return { ...nextTask };
  }

  retry(taskId: string): Task | null {
    const task = this.tasks.find((entry) => entry.id === taskId);

    if (!task) {
      return null;
    }

    const nextTask = {
      ...task,
      status: "Retry" as TaskStatus,
      progress: 0,
      completedAt: null,
    };

    this.tasks = this.tasks.map((entry) => (entry.id === taskId ? nextTask : entry));
    return { ...nextTask };
  }

  cancel(taskId: string): Task | null {
    return this.markStatus(taskId, "Cancelled", 0);
  }

  getTasks(): Task[] {
    return this.tasks.map((task) => ({ ...task }));
  }

  reset(): void {
    this.tasks = [];
  }
}
