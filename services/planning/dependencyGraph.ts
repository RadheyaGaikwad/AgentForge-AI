import type { TaskPriority } from "@/types/task";

export type PlannedTaskStatus = "Pending" | "Running" | "Waiting" | "Completed" | "Blocked";

export interface PlannedTaskNode {
  id: string;
  title: string;
  description: string;
  role: string;
  milestone: string;
  dependsOn: string[];
  priority: TaskPriority;
  parallelizable: boolean;
  status: PlannedTaskStatus;
}

export interface DependencyGraph {
  tasks: PlannedTaskNode[];
  levels: string[][];
  roots: string[];
  leaves: string[];
  parallelGroups: string[][];
  blockers: string[];
}

export class DependencyGraphBuilder {
  build(tasks: PlannedTaskNode[]): DependencyGraph {
    const normalizedTasks = tasks.map((task) => ({
      ...task,
      dependsOn: this.resolveDependencies(task, tasks),
    }));

    const taskMap = new Map(normalizedTasks.map((task) => [task.id, task]));
    const indegree = new Map(normalizedTasks.map((task) => [task.id, task.dependsOn.length]));
    const dependents = new Map<string, string[]>();

    normalizedTasks.forEach((task) => {
      dependents.set(task.id, []);
    });

    normalizedTasks.forEach((task) => {
      task.dependsOn.forEach((dependencyId) => {
        const dependentsList = dependents.get(dependencyId) ?? [];
        dependentsList.push(task.id);
        dependents.set(dependencyId, dependentsList);
      });
    });

    const pending = normalizedTasks.filter((task) => indegree.get(task.id) === 0);
    const levels: string[][] = [];
    const allProcessed = new Set<string>();

    while (pending.length > 0) {
      const currentLevel = pending.map((task) => task.id);
      levels.push(currentLevel);

      const nextBatch: PlannedTaskNode[] = [];

      pending.forEach((task) => {
        allProcessed.add(task.id);
        const children = dependents.get(task.id) ?? [];

        children.forEach((childId) => {
          const nextInDegree = (indegree.get(childId) ?? 0) - 1;
          indegree.set(childId, nextInDegree);

          if (nextInDegree === 0) {
            const childTask = taskMap.get(childId);
            if (childTask) {
              nextBatch.push(childTask);
            }
          }
        });
      });

      const uniqueBatch = nextBatch.filter((task, index, array) => array.findIndex((entry) => entry.id === task.id) === index);
      uniqueBatch.sort((left, right) => left.title.localeCompare(right.title));
      pending.splice(0, pending.length, ...uniqueBatch);
    }

    const unresolved = normalizedTasks
      .filter((task) => !allProcessed.has(task.id))
      .map((task) => task.id);

    const roots = normalizedTasks.filter((task) => task.dependsOn.length === 0).map((task) => task.id);
    const leaves = normalizedTasks.filter((task) => (dependents.get(task.id) ?? []).length === 0).map((task) => task.id);

    return {
      tasks: normalizedTasks,
      levels,
      roots,
      leaves,
      parallelGroups: levels,
      blockers: unresolved,
    };
  }

  private resolveDependencies(task: PlannedTaskNode, tasks: PlannedTaskNode[]): string[] {
    const registeredIds = new Set(tasks.map((entry) => entry.id));
    return task.dependsOn.filter((dependencyId) => registeredIds.has(dependencyId));
  }
}

export function buildDependencyGraph(tasks: PlannedTaskNode[]): DependencyGraph {
  return new DependencyGraphBuilder().build(tasks);
}
