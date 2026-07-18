import { TimelineService } from "@/services/timelineService";
import { TaskQueueService } from "@/services/taskQueueService";
import { executionLogService } from "@/services/executionLogService";
import { sharedContextService } from "@/services/sharedContextService";
import { BuildValidator } from "@/services/codeExecution/buildValidator";
import { ErrorAnalyzer } from "@/services/codeExecution/errorAnalyzer";
import { RepairLoop } from "@/services/codeExecution/repairLoop";
import { TaskCompletionService } from "@/services/codeExecution/taskCompletionService";
import type { Task } from "@/types/task";

export interface CodeTaskExecutionInput {
  task: Task;
  projectDirectory: string;
  taskQueue: TaskQueueService;
  timelineService: TimelineService;
}

export interface CodeTaskExecutionResult {
  task: Task | null;
  buildSucceeded: boolean;
  attempts: number;
  validationOutput: string;
}

export class CodeTaskExecutor {
  async executeSequential(input: CodeTaskExecutionInput): Promise<CodeTaskExecutionResult> {
    const validator = new BuildValidator();
    const analyzer = new ErrorAnalyzer();
    const repairLoop = new RepairLoop();
    const completionService = new TaskCompletionService();

    const queue = input.taskQueue;
    const timeline = input.timelineService;

    queue.startNext(input.task.assignedAgent ?? undefined);
    timeline.addEvent({
      title: "Coding",
      description: `Executing coding task ${input.task.title}.`,
      timestamp: new Date().toISOString(),
      actor: "Code Execution Engine",
      status: "Progress",
    });

    const validation = await validator.validate(input.projectDirectory);
    if (validation.success) {
      const updatedTask = completionService.completeTask({
        taskId: input.task.id,
        taskQueue: queue,
        timelineService: timeline,
        projectDirectory: input.projectDirectory,
        validationResult: validation,
      });

      timeline.addEvent({
        title: "Build Passed",
        description: `Build succeeded for ${input.projectDirectory}.`,
        timestamp: new Date().toISOString(),
        actor: "Code Execution Engine",
        status: "Completed",
      });

      sharedContextService.markTaskCompleted(input.task.id);

      return {
        task: updatedTask,
        buildSucceeded: true,
        attempts: 1,
        validationOutput: validation.output,
      };
    }

    timeline.addEvent({
      title: "Fixing Errors",
      description: `Repairing validation issues for ${input.task.title}.`,
      timestamp: new Date().toISOString(),
      actor: "Code Execution Engine",
      status: "Warning",
    });

    const repairResult = await repairLoop.repair({
      projectDirectory: input.projectDirectory,
      maxAttempts: 3,
    });

    const revalidation = await validator.validate(input.projectDirectory);
    const analysis = analyzer.analyze(revalidation.output, input.projectDirectory);

    if (revalidation.success) {
      const updatedTask = completionService.completeTask({
        taskId: input.task.id,
        taskQueue: queue,
        timelineService: timeline,
        projectDirectory: input.projectDirectory,
        validationResult: revalidation,
      });

      timeline.addEvent({
        title: "Task Completed",
        description: `Task ${input.task.title} completed after validation succeeded.`,
        timestamp: new Date().toISOString(),
        actor: "Code Execution Engine",
        status: "Completed",
      });

      executionLogService.add({
        level: "success",
        actor: "Code Execution Engine",
        message: `Task ${input.task.title} passed build validation after ${repairResult.attempts} repair attempt(s).`,
        metadata: { analysis: analysis.summary, repairedFiles: repairResult.repairedFiles },
      });

      return {
        task: updatedTask,
        buildSucceeded: true,
        attempts: repairResult.attempts,
        validationOutput: revalidation.output,
      };
    }

    queue.fail(input.task.id);
    timeline.addEvent({
      title: "Task Completed",
      description: `Task ${input.task.title} failed after ${repairResult.attempts} repair attempt(s).`,
      timestamp: new Date().toISOString(),
      actor: "Code Execution Engine",
      status: "Warning",
    });

    return {
      task: queue.getTasks().find((task) => task.id === input.task.id) ?? null,
      buildSucceeded: false,
      attempts: repairResult.attempts,
      validationOutput: revalidation.output,
    };
  }
}

export async function executeCodeTask(input: CodeTaskExecutionInput): Promise<CodeTaskExecutionResult> {
  const executor = new CodeTaskExecutor();
  return await executor.executeSequential(input);
}
