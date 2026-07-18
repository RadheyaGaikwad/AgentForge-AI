import type { Task, TaskStatus } from "@/types/task";

export interface TaskQueueAgent {
  id: string;
  name: string;
  role: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  assignedAgentId: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
}

export class TaskQueueService {
  private tasks: Task[] = [];
  private readonly agents: TaskQueueAgent[];

  constructor(agents: TaskQueueAgent[] = []) {
    this.agents = agents;
  }

  createTask(input: CreateTaskInput): Task {
    const task: Task = {
      id: this.createId(),
      title: input.title,
      description: input.description,
      assignedAgent: input.assignedAgentId,
      priority: input.priority ?? "Medium",
      status: "Pending",
      progress: 0,
      createdAt: this.createTimestamp(),
      completedAt: null,
    };

    this.tasks = [task, ...this.tasks];
    return this.getTask(task.id);
  }

  generateProjectManagerTask(agentId?: string): Task {
    const owner = this.findAgent(agentId);
    const taskCount = this.tasks.length + 1;

    return this.createTask({
      title: `Project task ${taskCount}`,
      description: `Captured by the Project Manager for ${owner?.name ?? "the team"}.`,
      assignedAgentId: owner?.id ?? this.agents[0]?.id ?? "unassigned",
      priority: taskCount % 2 === 0 ? "High" : "Medium",
    });
  }

  advanceTask(taskId: string): Task | null {
    const task = this.tasks.find((item) => item.id === taskId);

    if (!task) {
      return null;
    }

    const nextStatus: TaskStatus | null = this.getNextStatus(task.status);

    if (!nextStatus) {
      return task;
    }

    const updatedTask: Task = {
      ...task,
      status: nextStatus,
      progress: this.getProgress(nextStatus),
      completedAt: nextStatus === "Completed" ? this.createTimestamp() : null,
    };

    this.tasks = this.tasks.map((item) => (item.id === taskId ? updatedTask : item));
    return this.getTask(taskId);
  }

  startNext(agentId?: string): Task | null {
    const candidate = this.tasks.find((task) => {
      if (task.status === "Pending" || task.status === "Retry") {
        return !agentId || task.assignedAgent === agentId;
      }

      return false;
    });

    if (!candidate) {
      return null;
    }

    const updatedTask = {
      ...candidate,
      status: "Running" as TaskStatus,
      progress: 60,
      completedAt: null,
    };

    this.tasks = this.tasks.map((task) => (task.id === candidate.id ? updatedTask : task));
    return this.getTask(candidate.id);
  }

  markStatus(taskId: string, status: TaskStatus, progress = 0): Task | null {
    const task = this.tasks.find((item) => item.id === taskId);

    if (!task) {
      return null;
    }

    const updatedTask: Task = {
      ...task,
      status,
      progress,
      completedAt: status === "Completed" ? this.createTimestamp() : null,
    };

    this.tasks = this.tasks.map((item) => (item.id === taskId ? updatedTask : item));
    return this.getTask(taskId);
  }

  retry(taskId: string): Task | null {
    return this.markStatus(taskId, "Retry", 0);
  }

  cancel(taskId: string): Task | null {
    return this.markStatus(taskId, "Cancelled", 0);
  }

  fail(taskId: string): Task | null {
    return this.markStatus(taskId, "Failed", 0);
  }

  getTasks(): Task[] {
    return this.tasks.map((task) => ({ ...task }));
  }

  reset(): void {
    this.tasks = [];
  }

  private getTask(taskId: string): Task {
    const task = this.tasks.find((item) => item.id === taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    return { ...task };
  }

  private findAgent(agentId?: string) {
    if (!agentId) {
      return this.agents.find((agent) => agent.role !== "Project Manager") ?? this.agents[0];
    }

    return this.agents.find((agent) => agent.id === agentId);
  }

  private getNextStatus(status: TaskStatus): TaskStatus | null {
    const sequence: TaskStatus[] = ["Pending", "Assigned", "Running", "Waiting", "Completed"];
    const currentIndex = sequence.indexOf(status);

    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      if (status === "Retry") {
        return "Running";
      }

      return null;
    }

    return sequence[currentIndex + 1];
  }

  private getProgress(status: TaskStatus): number {
    const progressMap: Record<TaskStatus, number> = {
      Pending: 0,
      Assigned: 25,
      Running: 60,
      Waiting: 40,
      Blocked: 10,
      Completed: 100,
      Failed: 0,
      Cancelled: 0,
      Retry: 0,
    };

    return progressMap[status];
  }

  private createId(): string {
    return `task-${Math.random().toString(36).slice(2, 10)}`;
  }

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
