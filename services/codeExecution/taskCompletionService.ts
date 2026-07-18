import { TaskQueueService } from "@/services/taskQueueService";
import { TimelineService } from "@/services/timelineService";
import { sharedContextService } from "@/services/sharedContextService";
import { executionLogService } from "@/services/executionLogService";
import type { Task } from "@/types/task";
import type { BuildValidationResult } from "@/services/codeExecution/buildValidator";

export interface CompleteTaskOptions {
  taskId: string;
  taskQueue: TaskQueueService;
  timelineService: TimelineService;
  projectDirectory: string;
  validationResult: BuildValidationResult;
}

export class TaskCompletionService {
  completeTask(options: CompleteTaskOptions): Task | null {
    if (!options.validationResult.success) {
      return null;
    }

    const updatedTask = options.taskQueue.markStatus(options.taskId, "Completed", 100);
    options.timelineService.addEvent({
      title: "Task Completed",
      description: `Completed task ${options.taskId} after build validation succeeded in ${options.projectDirectory}.`,
      timestamp: new Date().toISOString(),
      actor: "Task Completion Service",
      status: "Completed",
    });

    sharedContextService.markTaskCompleted(options.taskId);

    executionLogService.add({
      level: "success",
      actor: "Task Completion Service",
      message: `Marked task ${options.taskId} as completed after build validation succeeded.`,
      metadata: { taskId: options.taskId, projectDirectory: options.projectDirectory },
    });

    return updatedTask;
  }
}

export function completeTask(options: CompleteTaskOptions): Task | null {
  const service = new TaskCompletionService();
  return service.completeTask(options);
}
