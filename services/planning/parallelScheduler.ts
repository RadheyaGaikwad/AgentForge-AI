import { buildDependencyGraph, type DependencyGraph, type PlannedTaskNode } from "@/services/planning/dependencyGraph";

export interface ScheduledTaskState {
  taskId: string;
  status: "Running" | "Waiting" | "Blocked" | "Completed";
  ready: boolean;
  dependencyCount: number;
  parallelGroup: number;
}

export interface ScheduledExecutionPlan {
  graph: DependencyGraph;
  scheduledTasks: ScheduledTaskState[];
  readyTasks: string[];
  blockedTasks: string[];
  waitingTasks: string[];
}

export class ParallelScheduler {
  schedule(tasks: PlannedTaskNode[], completedTaskIds: string[] = []): ScheduledExecutionPlan {
    const graph = buildDependencyGraph(tasks);
    const completed = new Set(completedTaskIds);
    const scheduledTasks: ScheduledTaskState[] = [];

    graph.tasks.forEach((task, index) => {
      const dependencyCount = task.dependsOn.length;
      const isCompleted = completed.has(task.id);
      const isReady = task.dependsOn.every((dependencyId) => completed.has(dependencyId));
      const parallelGroup = graph.parallelGroups.findIndex((group) => group.includes(task.id));

      let status: ScheduledTaskState["status"] = "Waiting";

      if (isCompleted) {
        status = "Completed";
      } else if (isReady && !isCompleted) {
        status = "Running";
      } else if (task.dependsOn.some((dependencyId) => graph.blockers.includes(dependencyId))) {
        status = "Blocked";
      }

      scheduledTasks.push({
        taskId: task.id,
        status,
        ready: isReady,
        dependencyCount,
        parallelGroup: parallelGroup >= 0 ? parallelGroup : index,
      });
    });

    const readyTasks = graph.tasks.filter((task) => !completed.has(task.id) && task.dependsOn.every((dependencyId) => completed.has(dependencyId))).map((task) => task.id);
    const waitingTasks = graph.tasks.filter((task) => !completed.has(task.id) && !readyTasks.includes(task.id) && !graph.blockers.includes(task.id)).map((task) => task.id);
    const blockedTasks = graph.tasks.filter((task) => !completed.has(task.id) && graph.blockers.includes(task.id)).map((task) => task.id);

    return {
      graph,
      scheduledTasks,
      readyTasks,
      blockedTasks,
      waitingTasks,
    };
  }
}

export const parallelScheduler = new ParallelScheduler();
