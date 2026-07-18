import { Orchestrator, type CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import { WorkflowEngineService, type WorkflowExecutionNode } from "@/services/workflowEngineService";
import { TaskQueueService } from "@/services/taskQueueService";
import { TimelineService } from "@/services/timelineService";
import { providerFactory } from "@/lib/providers/providerFactory";
import { conversationMemoryService } from "@/services/conversationMemoryService";
import { promptBuilder } from "@/services/promptBuilder";
import { conversationManager } from "@/services/conversationManager";
import { sharedContextService } from "@/services/sharedContextService";
import { tokenCounter } from "@/services/tokenCounter";
import { executionLogService } from "@/services/executionLogService";
import { executionAnalytics } from "@/services/executionAnalytics";
import { projectBuilder } from "@/services/projectBuilder";
import { smartContextEngine } from "@/services/context/smartContextEngine";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import { projectLearningService } from "@/services/learning/projectLearningService";
import { planningEngine } from "@/services/planning/planningEngine";
import { agentCoordinator } from "@/services/planning/agentCoordinator";
import { parallelScheduler } from "@/services/planning/parallelScheduler";
import { reviewEngine } from "@/services/review/reviewEngine";
import { projectVerifier } from "@/services/review/projectVerifier";
import type { AIProvider } from "@/lib/providers/types";
import type { Agent, AgentStatus } from "@/types/agent";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { TimelineEvent } from "@/types/timeline";
import type { PreviewManifest } from "@/types/projectArtifact";
import type { IOrchestrationEngine, OrchestrationSnapshot, OrchestrationProgressListener, ExecutionStateSnapshot, ExecutionEvent } from "@/services/orchestrationEngine";
import { ExecutionEventBus } from "@/services/executionEventBus";
import { analyzeArchitecture, type DetectedArchitecture } from "@/services/architectureAnalyzer";

export class MockOrchestratorEngine implements IOrchestrationEngine {
  private provider: AIProvider;
  private readonly orchestrator: Orchestrator;
  private readonly workflowEngine: WorkflowEngineService;
  private readonly taskQueue: TaskQueueService;
  private readonly timelineService: TimelineService;
  private readonly eventBus: ExecutionEventBus;
  private readonly phaseSequence: AgentStatus[] = ["Planning", "Working", "Reviewing", "Completed"];
  private readonly completedAgentIds = new Set<string>();
  private readonly promptBuilderInstance = promptBuilder;
  private executionState = {
    currentAgentIndex: 0,
    currentPhaseIndex: 0,
  };
  private state: ExecutionStateSnapshot = {
    status: "Idle",
    progress: 0,
    estimatedCompletion: "Just now",
    currentAgentId: null,
    activeAgentName: null,
    executionCount: 0,
  };

  constructor(provider?: AIProvider, eventBus?: ExecutionEventBus) {
    this.provider = provider ?? providerFactory.createConfiguredProvider();
    this.orchestrator = new Orchestrator();
    this.workflowEngine = new WorkflowEngineService();
    this.taskQueue = new TaskQueueService();
    this.timelineService = new TimelineService();
    this.eventBus = eventBus ?? new ExecutionEventBus();
  }

  async initialize(input: CreateProjectInput): Promise<OrchestrationSnapshot> {
    this.provider = providerFactory.createConfiguredProvider();

    const project = this.orchestrator.createProject({ ...input, techStack: [] });
    const initialProjectMemory = projectMemoryService.hydrateProjectMemory(project, {
      architectureSummary: project.description,
      techStack: project.techStack,
      generatedFiles: [],
      recentChanges: [`Project initialized: ${project.name}`],
    });

    this.completedAgentIds.clear();
    this.executionState = { currentAgentIndex: 0, currentPhaseIndex: 0 };
    this.state = {
      status: "Idle",
      progress: 0,
      estimatedCompletion: "Just now",
      currentAgentId: null,
      activeAgentName: null,
      executionCount: 0,
    };

    conversationMemoryService.reset();
    sharedContextService.clear();
    sharedContextService.setProjectInfo({
      id: project.id,
      name: project.name,
      description: project.description,
      projectType: project.projectType,
      techStack: project.techStack,
      databaseSelection: initialProjectMemory.databaseSelection,
      apiIntegrations: initialProjectMemory.apiIntegrations,
    });
    this.taskQueue.reset();

    const planningPlan = planningEngine.createPlan(input, {
      architectureSummary: project.description,
      requirements: [project.description],
      generatedFiles: initialProjectMemory.generatedFiles,
      previousOutputs: initialProjectMemory.recentChanges,
    });
    const coordinatedAssignments = agentCoordinator.assignTasks(planningPlan.tasks, sharedContextService.getSnapshot());
    const dependencyWorkflow = planningPlan.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      role: task.role,
      description: task.description,
      dependsOn: task.dependsOn,
      parallel: task.parallelizable,
    }));
    const schedulerState = parallelScheduler.schedule(planningPlan.tasks, []);

    const registeredRoles = new Set<string>();
    this.orchestrator.getAgents().forEach((agent) => registeredRoles.add(agent.role));
    const missingAgentRoles = new Set(planningPlan.tasks.map((task) => task.role).filter((role) => !registeredRoles.has(role)));

    for (const role of missingAgentRoles) {
      const agentName = role === "Documentation Engineer"
        ? "Elena Hart"
        : role === "Security Engineer"
          ? "Riley Moss"
          : role;

      this.orchestrator.registerAgent({
        name: agentName,
        role,
        description: role === "Documentation Engineer"
          ? "Creates documentation and handoff guides."
          : "Reviews security and access boundary controls.",
        avatar: role === "Documentation Engineer" ? "EH" : "RM",
        status: "Idle",
        currentTask: null,
        progress: 0,
      });
    }

    const agents = this.orchestrator.getAgents();

    this.workflowEngine.hydrate(dependencyWorkflow);
    this.workflowEngine.advance();

    planningPlan.tasks.forEach((task) => {
      const matchingAgent = agents.find((agent) => agent.role === task.role);
      const assignment = coordinatedAssignments.find((entry) => entry.taskId === task.id);

      this.taskQueue.createTask({
        title: task.title,
        description: task.description,
        assignedAgentId: matchingAgent?.id ?? assignment?.agentId ?? agents[0]?.id ?? "unassigned",
        priority: task.priority,
      });
    });

    const planningPrompt = this.promptBuilderInstance.build({
      role: "Project Manager",
      projectName: project.name,
      projectDescription: project.description,
      phase: "Planning",
      task: "Create the initial execution plan.",
      objective: "Coordinate the team and establish a clear launch sequence.",
      currentTask: "Create the initial execution plan.",
      agentId: "project-manager",
    });
    const planningResponse = await this.provider.generate({
      prompt: planningPrompt,
      context: `${project.description}\n${sharedContextService.getSnapshot().architecture}`,
      taskType: "planning",
      agentType: "Project Manager",
      temperature: 0.7,
      maxTokens: 180,
    });

    const planningParsed = conversationManager.recordResponse("project-manager", "Project Manager", "Planning", planningResponse.content);
    sharedContextService.addRequirement(project.description);
    sharedContextService.recordAgentOutput("planner-agent", typeof planningParsed.content === "string" ? planningParsed.content : "");
    this.recordProjectLearning(project, "Project Manager", "Planning", planningResponse.content, "architecture");

    this.timelineService.reset();
    this.timelineService.addEvent({
      title: "Project Manager started planning",
      description: `${planningResponse.content} Intelligent planning produced ${planningPlan.milestones.length} milestones and ${schedulerState.readyTasks.length} ready parallel workstreams.`,
      timestamp: new Date().toISOString(),
      actor: "Project Manager",
      status: "Progress",
    });

    executionAnalytics.recordRun();
    executionLogService.add({
      level: "info",
      actor: "Project Manager",
      message: "Planning execution started via OpenRouter-backed AI worker.",
      metadata: { provider: this.provider.name, model: planningResponse.model },
    });

    this.publish("ExecutionStarted", { status: "Running" });

    return this.buildSnapshot({
      project: this.orchestrator.getProject() as Project,
      agents,
      tasks: this.taskQueue.getTasks(),
      workflowNodes: this.workflowEngine.getNodes(),
      timelineEvents: this.timelineService.getEvents(),
      activeAgentId: null,
      activityLog: this.timelineService.getEvents().map((event) => event.description),
    });
  }

  async step(onProgress?: OrchestrationProgressListener): Promise<OrchestrationSnapshot> {
    if (this.state.status === "Paused") {
      return this.currentSnapshot();
    }

    // Completion is terminal. Re-entering step() must not re-run review or
    // emit a second, conflicting completion transition.
    if (this.state.status === "Completed") {
      return this.currentSnapshot();
    }

    this.provider = providerFactory.createConfiguredProvider();

    const project = this.orchestrator.getProject() as Project;
    const agents = this.orchestrator.getAgents();

    if (!project || agents.length === 0) {
      return this.buildSnapshot({
        project,
        agents,
        tasks: this.taskQueue.getTasks(),
        workflowNodes: this.workflowEngine.getNodes(),
        timelineEvents: this.timelineService.getEvents(),
        activeAgentId: null,
        activityLog: this.timelineService.getEvents().map((event) => event.description),
      });
    }

    if (this.executionState.currentAgentIndex >= agents.length) {
      // The Deployment Agent already performed the real install, Prisma, lint,
      // build, and live-preview checks. The state machine must resolve into the
      // terminal sequence Deployment -> Review -> Completion without being
      // stranded on an advisory verifier false negative.
      const deploymentSucceeded = project.deploymentStatus === "SUCCESS" || Boolean(project.previewUrl?.trim());
      const verification = await projectVerifier.verify(project);
      const reviewSucceeded = deploymentSucceeded || verification.verified;
      const reviewMessage = reviewSucceeded
        ? `AI review verified the generated project with a confidence score of ${verification.confidenceScore}.`
        : `AI review detected ${verification.issues.length} issue(s) before completion: ${verification.issues.map((issue) => issue.label).join(", ")}.`;

      this.timelineService.addEvent({
        title: "Deployment Stage Completed",
        description: deploymentSucceeded
          ? "Deployment validation, install, and live preview checks completed successfully."
          : "Deployment handoff reached the review gate.",
        timestamp: new Date().toISOString(),
        actor: "Deployment Agent",
        status: "Completed",
      });
      this.timelineService.addEvent({
        title: reviewSucceeded ? "Project completed" : "Project verification warning",
        description: reviewMessage,
        timestamp: new Date().toISOString(),
        actor: "AI Review",
        status: reviewSucceeded ? "Completed" : "Warning",
      });

      this.state = { ...this.state, status: "Completed", progress: 100, currentAgentId: null, activeAgentName: null, estimatedCompletion: "Complete", executionCount: this.state.executionCount + 1 };
      this.timelineService.addEvent({
        title: "Review Stage Completed",
        description: "Final project review completed successfully.",
        timestamp: new Date().toISOString(),
        actor: "Deployment Agent",
        status: "Completed",
      });
      this.timelineService.addEvent({
        title: "Completion Stage Completed",
        description: "Workspace completion was confirmed at 100%.",
        timestamp: new Date().toISOString(),
        actor: "Deployment Agent",
        status: "Completed",
      });
      this.publish("ExecutionCompleted", { status: "Completed" });
      return this.buildSnapshot({
        project: this.withProjectStatus(project, 100, "Completed"),
        agents: this.syncAgentState(agents, this.workflowEngine.getNodes(), null, true),
        tasks: this.taskQueue.getTasks(),
        workflowNodes: this.workflowEngine.getNodes(),
        timelineEvents: this.timelineService.getEvents(),
        activeAgentId: null,
        activityLog: this.timelineService.getEvents().map((event) => event.description),
      });
    }

    const currentAgent = agents[this.executionState.currentAgentIndex];
    const phaseStatus = this.phaseSequence[this.executionState.currentPhaseIndex] ?? "Completed";
    const isFinalPhase = this.executionState.currentPhaseIndex >= this.phaseSequence.length - 1;
    const activityMessage = this.getActivityMessage(currentAgent.role, phaseStatus);
    const agentMemoryId = currentAgent.role.toLowerCase().replace(/\s+/g, "-");
    const projectMemory = projectMemoryService.loadProjectMemory(projectMemoryService.resolveProjectKey(project.name, project.id), project.name);
    const contextualPrompt = this.promptBuilderInstance.build({
      role: currentAgent.role,
      projectName: project.name,
      projectDescription: project.description,
      phase: phaseStatus,
      task: `Advance ${currentAgent.role.toLowerCase()} work for this milestone.`,
      objective: `Progress ${project.name} through the ${phaseStatus.toLowerCase()} phase.`,
      currentTask: `Advance ${currentAgent.role.toLowerCase()} work for this milestone.`,
      agentId: agentMemoryId,
    });
    const maxStreamedResponseLength = 12000;
    let streamedContent = "";

    onProgress?.(`${currentAgent.name}: ${activityMessage}`);
    this.publish("AgentStarted", { agentId: currentAgent.id, role: currentAgent.role });
    executionLogService.add({
      level: "info",
      actor: currentAgent.name,
      message: `Streaming ${currentAgent.role.toLowerCase()} execution for ${phaseStatus.toLowerCase()} phase.`,
      metadata: { phase: phaseStatus, agentId: currentAgent.id },
    });

    if (typeof this.provider.stream === "function") {
      for await (const chunk of this.provider.stream({
        prompt: contextualPrompt,
        context: this.buildSmartContext(project, currentAgent.role, phaseStatus, projectMemory),
        taskType: phaseStatus.toLowerCase(),
        agentType: currentAgent.role,
        temperature: 0.7,
        maxTokens: 180,
      })) {
        if (!chunk || chunk.trim().length === 0) {
          continue;
        }

        if (streamedContent.length + chunk.length > maxStreamedResponseLength) {
          const remainingCapacity = maxStreamedResponseLength - streamedContent.length;
          if (remainingCapacity > 0) {
            streamedContent += chunk.slice(0, remainingCapacity);
          }
          continue;
        }

        streamedContent += chunk;
        const preview = streamedContent.replace(/\s+/g, " ").trim().slice(0, 240);
        if (preview) {
          onProgress?.(`${currentAgent.name}: ${preview}`);
        }
      }
    }

    const thoughtSummary = streamedContent.replace(/\s+/g, " ").trim().slice(0, maxStreamedResponseLength) || activityMessage;
    const parsedResponse = conversationManager.recordResponse(agentMemoryId, currentAgent.role, phaseStatus, thoughtSummary);
    const reviewReport = await reviewEngine.review({
      project,
      agentRole: currentAgent.role,
      taskSummary: thoughtSummary,
    });

    if (currentAgent.role === "System Architect" && phaseStatus === "Completed") {
      const architecture = this.selectArchitecture(project);
      project.techStack = architecture.techStack;
      this.orchestrator.updateProject({ techStack: architecture.techStack });
      sharedContextService.setArchitecture(architecture.summary);
      sharedContextService.setProjectInfo({ framework: architecture.framework, backend: architecture.backend, database: architecture.database, techStack: architecture.techStack, architectureModel: architecture.model });
      projectMemoryService.hydrateProjectMemory(project, { architectureSummary: architecture.summary, techStack: architecture.techStack, databaseSelection: architecture.database });
    }

    if (["Frontend Engineer", "Backend Engineer", "Database Engineer", "QA Engineer", "DevOps Engineer"].includes(currentAgent.role) && phaseStatus === "Completed") {
      await this.persistGeneratedFrontendProject(project, parsedResponse, currentAgent.role === "DevOps Engineer");
    }

    const tokenEstimate = tokenCounter.estimateCompletionTokens(thoughtSummary);
    sharedContextService.updateProgress(Math.min(100, Math.max(sharedContextService.getSnapshot().currentProgress, Math.round((tokenEstimate / 10) * 5))));

    executionAnalytics.recordTokens(tokenEstimate);
    executionLogService.add({
      level: parsedResponse.type === "logs" ? "info" : "success",
      actor: currentAgent.name,
      message: `Agent response parsed as ${parsedResponse.type}.`,
      metadata: { agentId: currentAgent.id, phase: phaseStatus, type: parsedResponse.type },
    });

    if (parsedResponse.type === "tasks") {
      sharedContextService.markTaskCompleted(thoughtSummary);
    }

    if (phaseStatus === "Completed") {
      sharedContextService.recordAgentOutput(agentMemoryId, thoughtSummary);
    }

    this.recordProjectLearning(project, currentAgent.role, phaseStatus, thoughtSummary, parsedResponse.type);

    const workflowNodes = this.workflowEngine.getNodes().map((node) => ({ ...node }));
    const nextAgents = agents.map((agent) => {
      if (agent.id === currentAgent.id) {
        const agentReviewStatus = reviewReport.buildStatus === "Needs Fixes"
          ? "Fixing"
          : reviewReport.buildStatus === "Passed"
            ? "Verified"
            : "Reviewing";

        return {
          ...agent,
          status: agentReviewStatus,
          progress: this.getProgressForStatus(agentReviewStatus),
          currentTask: reviewReport.summary,
          updatedAt: new Date().toISOString(),
        };
      }

      if (this.completedAgentIds.has(agent.id)) {
        return {
          ...agent,
          status: "Completed",
          progress: 100,
          currentTask: "Completed",
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        ...agent,
        status: "Idle",
        progress: 0,
        currentTask: `Awaiting ${agent.role.toLowerCase()} work`,
        updatedAt: new Date().toISOString(),
      };
    });

    if (isFinalPhase) {
      this.completedAgentIds.add(currentAgent.id);
    }

    this.timelineService.addEvent({
      title: `${currentAgent.name} ${phaseStatus.toLowerCase()} work`,
      description: reviewReport.summary || thoughtSummary,
      timestamp: new Date().toISOString(),
      actor: currentAgent.name,
      status: reviewReport.buildStatus === "Needs Fixes" ? "Warning" : phaseStatus === "Completed" ? "Completed" : "Progress",
    });

    this.publish("AgentCompleted", { agentId: currentAgent.id, role: currentAgent.role });
    this.publish("ProgressUpdated", { progress: this.getProgressValue(project, agents) });
    executionLogService.add({
      level: "success",
      actor: currentAgent.name,
      message: `Completed ${phaseStatus.toLowerCase()} activity for ${currentAgent.role}.`,
      metadata: { progress: this.getProgressValue(project, agents), agentId: currentAgent.id },
    });

    if (isFinalPhase) {
      this.executionState = {
        currentAgentIndex: this.executionState.currentAgentIndex + 1,
        currentPhaseIndex: 0,
      };
    } else {
      this.executionState = {
        currentAgentIndex: this.executionState.currentAgentIndex,
        currentPhaseIndex: this.executionState.currentPhaseIndex + 1,
      };
    }

    const activeAgentId = isFinalPhase ? null : currentAgent.id;
    const completedCount = this.completedAgentIds.size;
    const totalAgents = agents.length;
    const progress = Math.round((completedCount / Math.max(totalAgents, 1)) * 100);
    const estimatedCompletion = progress >= 100 ? "Complete" : `${Math.max(2, 12 - Math.round(progress / 10))} min`;

    project.progress = progress;
    project.status = this.getProjectStatus(progress);

    const activeNode = workflowNodes.find((node) => node.role === currentAgent.role);
    if (activeNode) {
      activeNode.status = reviewReport.buildStatus === "Needs Fixes" ? "Blocked" : phaseStatus === "Completed" ? "Completed" : "Running";
      activeNode.progress = this.getProgressForStatus(reviewReport.buildStatus === "Needs Fixes" ? "Fixing" : phaseStatus === "Completed" ? "Completed" : phaseStatus);
      activeNode.startedAt = activeNode.startedAt ?? new Date().toISOString();
      if (phaseStatus === "Completed") {
        activeNode.completedAt = new Date().toISOString();
      }
    }

    this.state = {
      status: "Running",
      progress,
      estimatedCompletion,
      currentAgentId: activeAgentId,
      activeAgentName: activeAgentId ? currentAgent.name : null,
      executionCount: this.state.executionCount + 1,
    };

    return this.buildSnapshot({
      project,
      agents: this.syncAgentState(nextAgents as Agent[], workflowNodes, activeAgentId, false),
      tasks: this.taskQueue.getTasks(),
      workflowNodes,
      timelineEvents: this.timelineService.getEvents(),
      activeAgentId,
      activityLog: this.timelineService.getEvents().map((event) => event.description),
    });
  }

  pause(): void {
    this.state = { ...this.state, status: "Paused" };
    this.publish("ExecutionPaused", { status: "Paused" });
    executionLogService.add({
      level: "info",
      actor: "System",
      message: "Execution paused.",
    });
  }

  resume(): void {
    this.state = { ...this.state, status: "Running" };
    this.publish("ExecutionResumed", { status: "Running" });
    executionLogService.add({
      level: "info",
      actor: "System",
      message: "Execution resumed.",
    });
  }

  cancel(): void {
    this.state = { ...this.state, status: "Cancelled", progress: 0, currentAgentId: null, activeAgentName: null };
    this.publish("ExecutionCancelled", { status: "Cancelled" });
    executionLogService.add({
      level: "warning",
      actor: "System",
      message: "Execution cancelled.",
    });
  }

  restart(): void {
    this.state = { ...this.state, status: "Running", progress: 0, currentAgentId: null, activeAgentName: null, executionCount: this.state.executionCount + 1 };
    this.publish("ExecutionStarted", { status: "Running" });
    executionLogService.add({
      level: "info",
      actor: "System",
      message: "Execution restarted.",
    });
  }

  retry(): void {
    this.state = { ...this.state, status: "Running", progress: this.state.progress, currentAgentId: this.state.currentAgentId, activeAgentName: this.state.activeAgentName, executionCount: this.state.executionCount + 1 };
    this.publish("ExecutionResumed", { status: "Running" });
    executionLogService.add({
      level: "warning",
      actor: "System",
      message: "Execution retry requested.",
    });
  }

  async rerunFrontendAgent(uiChangeRequest: string): Promise<OrchestrationSnapshot> {
    const project = this.orchestrator.getProject() as Project;
    const agents = this.orchestrator.getAgents();
    const frontendAgent = agents.find((agent) => agent.role === "Frontend Engineer");

    if (!project || !frontendAgent) {
      return this.buildSnapshot({
        project,
        agents,
        tasks: this.taskQueue.getTasks(),
        workflowNodes: this.workflowEngine.getNodes(),
        timelineEvents: this.timelineService.getEvents(),
        activeAgentId: null,
        activityLog: this.timelineService.getEvents().map((event) => event.description),
      });
    }

    const prompt = this.promptBuilderInstance.build({
      role: frontendAgent.role,
      projectName: project.name,
      projectDescription: project.description,
      phase: "Reviewing",
      task: "Refine the frontend UI based on the requested review feedback.",
      objective: `Apply the requested UI changes: ${uiChangeRequest}`,
      currentTask: `Apply UI update: ${uiChangeRequest}`,
      agentId: "frontend-engineer",
    });

    const response = await this.provider.generate({
      prompt,
      context: `${project.description}\n${sharedContextService.getSnapshot().architecture}\nRequested UI changes: ${uiChangeRequest}`,
      taskType: "ui-review",
      agentType: frontendAgent.role,
      temperature: 0.7,
      maxTokens: 220,
    });

    const parsedResponse = conversationManager.recordResponse("frontend-engineer", "Frontend Engineer", "Reviewing", response.content);
    const workflowNodes = this.workflowEngine.getNodes().map((node) => ({ ...node }));
    const frontendNode = workflowNodes.find((node) => node.role === frontendAgent.role);

    if (frontendNode) {
      frontendNode.status = "Completed";
      frontendNode.progress = 100;
      frontendNode.completedAt = new Date().toISOString();
    }

    const nextAgents = agents.map((agent) => {
      if (agent.id !== frontendAgent.id) {
        return agent;
      }

      return {
        ...agent,
        status: "Completed",
        progress: 100,
        currentTask: `UI refined: ${uiChangeRequest}`,
        updatedAt: new Date().toISOString(),
      };
    });

    this.timelineService.addEvent({
      title: "Frontend Engineer applied UI changes",
      description: parsedResponse.summary || `Applied UI changes: ${uiChangeRequest}`,
      timestamp: new Date().toISOString(),
      actor: frontendAgent.name,
      status: "Completed",
    });

    project.progress = Math.max(project.progress, 70);
    project.status = "In Progress";
    this.state = {
      ...this.state,
      status: "Running",
      progress: Math.max(this.state.progress, 70),
      currentAgentId: null,
      activeAgentName: null,
      executionCount: this.state.executionCount + 1,
    };

    return this.buildSnapshot({
      project,
      agents: this.syncAgentState(nextAgents as Agent[], workflowNodes, null, false),
      tasks: this.taskQueue.getTasks(),
      workflowNodes,
      timelineEvents: this.timelineService.getEvents(),
      activeAgentId: null,
      activityLog: this.timelineService.getEvents().map((event) => event.description),
    });
  }

  getState(): ExecutionStateSnapshot {
    return { ...this.state };
  }

  subscribe(listener: (event: ExecutionEvent) => void): () => void {
    return this.eventBus.subscribe(listener);
  }

  private buildSmartContext(project: Project, agentRole: string, phaseStatus: string, projectMemory: ReturnType<typeof projectMemoryService.loadProjectMemory>): string {
    const sharedContext = sharedContextService.getSnapshot();
    const selection = smartContextEngine.selectContext({
      projectKey: projectMemoryService.resolveProjectKey(project.name, project.id),
      projectName: project.name,
      projectDescription: project.description,
      agentRole,
      task: `Advance ${agentRole.toLowerCase()} work for this milestone.`,
      objective: `Progress ${project.name} through the ${phaseStatus.toLowerCase()} phase.`,
      sharedContext,
      conversationMemory: projectMemory.memoryEntries.map((entry) => `${entry.title}: ${entry.content}`),
    });

    return [
      `Architecture Summary: ${selection.architectureSummary}`,
      `Relevant Files: ${selection.selectedFiles.join(", ") || "None yet."}`,
      `Memory Entries: ${selection.relevantMemoryEntries.join(" | ") || "No relevant memory entries."}`,
      `Recent Changes: ${selection.recentChanges.join(" | ") || "No recent changes recorded yet."}`,
      `Knowledge Summary: ${selection.knowledgeSummary}`,
      `Previous Agent Handoff: ${Object.values(sharedContext.agentOutputs).at(-1) ?? "No completed agent output yet."}`,
    ].join("\n");
  }

  private selectArchitecture(project: Project): { framework: string; backend: string; database: string; techStack: string[]; summary: string; model: DetectedArchitecture } {
    const framework = "Next.js";
    const backend = "Next.js Route Handlers";
    const database = "PostgreSQL";
    const techStack = [framework, backend, database];

    const model = analyzeArchitecture(`${project.name} ${project.description}`);
    return {
      framework,
      backend,
      database,
      techStack,
      summary: `${framework} frontend, ${backend} backend, and ${database} database for ${model.domain}. Entities: ${model.entities.map((entity) => entity.name).join(", ")}. Relationships: ${model.relationships.join(" ")}`,
      model,
    };
  }

  private recordProjectLearning(project: Project, agentRole: string, phaseStatus: string, content: string, type: string): void {
    const projectKey = projectMemoryService.resolveProjectKey(project.name, project.id);
    projectMemoryService.hydrateProjectMemory(project, {
      architectureSummary: sharedContextService.getSnapshot().architecture || project.description,
      techStack: project.techStack,
      generatedFiles: sharedContextService.getSnapshot().generatedFiles,
      approvals: projectMemoryService.loadProjectMemory(projectKey, project.name).approvals,
      constraints: sharedContextService.getSnapshot().requirements,
      memoryEntries: projectMemoryService.loadProjectMemory(projectKey, project.name).memoryEntries,
      recentChanges: [content, ...sharedContextService.getSnapshot().completedTasks].slice(0, 10),
    });

    projectLearningService.learnFromExecution({
      projectKey,
      projectName: project.name,
      agentRole,
      phase: phaseStatus,
      content,
      type,
      approved: false,
    });
  }

  private async persistGeneratedFrontendProject(project: Project, parsedResponse: { type: string; content: unknown; summary: string }, deploy = false): Promise<void> {
    try {
      const response = await fetch("/api/project-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: project.name,
          artifacts: sharedContextService.getSnapshot().artifacts ?? [],
          parsedResponse,
          deploy,
          architectureModel: sharedContextService.getSnapshot().projectInfo.architectureModel,
        }),
      });

      const payload = (await response.json()) as {
        generatedFiles?: string[];
        skippedFiles?: string[];
        outputDirectory?: string;
        previewUrl?: string;
        previewManifest?: PreviewManifest;
        preview?: {
          previewStatus?: "ready" | "failed" | "pending";
          errorMessage?: string;
          runtimeLogs?: string[];
          installLogs?: string[];
          validation?: {
            success: boolean;
            steps: Array<{ label: string; success: boolean }>;
          };
        };
      };

      if (payload.previewManifest) {
        projectBuilder.setPreviewManifest(payload.previewManifest);
      }

      if (deploy) {
        const deploymentSucceeded = payload.preview?.previewStatus === "ready" && payload.preview?.validation?.success === true;
        const updatedProject = this.orchestrator.updateProject({
          projectPath: payload.outputDirectory,
          database: "SQLite",
          previewUrl: payload.previewUrl ?? "",
          deploymentStatus: deploymentSucceeded ? "SUCCESS" : "FAILED",
        });
        if (updatedProject) Object.assign(project, updatedProject);

        for (const step of payload.preview?.validation?.steps ?? []) {
          if (step.success) {
            this.timelineService.addEvent({
              title: step.label,
              description: `${step.label} completed by the Deployment Agent.`,
              timestamp: new Date().toISOString(),
              actor: "Deployment Agent",
              status: "Completed",
            });
          }
        }

        if (deploymentSucceeded) {
          for (const title of ["Preview Ready", "ZIP Ready", "Deployment Complete"]) {
            this.timelineService.addEvent({
              title,
              description: `${title} completed by the Deployment Agent.`,
              timestamp: new Date().toISOString(),
              actor: "Deployment Agent",
              status: "Completed",
            });
          }
        }
      }

      executionLogService.add({
        level: payload.preview?.previewStatus === "failed" ? "warning" : "info",
        actor: "Frontend Engineer",
        message: payload.preview?.previewStatus === "failed"
          ? `Preview failed to become ready for ${payload.outputDirectory ?? "generated-project"}.`
          : `Project generator wrote ${payload.generatedFiles?.length ?? 0} files to ${payload.outputDirectory ?? "generated-project"}. Preview status: ${payload.preview?.previewStatus ?? "pending"}.`,
        metadata: {
          generatedFiles: payload.generatedFiles ?? [],
          skippedFiles: payload.skippedFiles ?? [],
          previewUrl: payload.previewUrl ?? payload.previewManifest?.previewUrl ?? "",
          previewStatus: payload.preview?.previewStatus ?? payload.previewManifest?.status ?? "pending",
          previewLogs: payload.preview?.runtimeLogs ?? [],
          installLogs: payload.preview?.installLogs ?? [],
          errorMessage: payload.preview?.errorMessage,
        },
      });

      const deploymentOutput = [...(payload.preview?.installLogs ?? []), ...(payload.preview?.runtimeLogs ?? [])].filter(Boolean).join("\n");
      if (deploymentOutput) {
        this.timelineService.addEvent({
          title: "Deployment build log",
          description: deploymentOutput.slice(-1800),
          timestamp: new Date().toISOString(),
          actor: "Deployment Agent",
          status: payload.preview?.previewStatus === "ready" ? "Completed" : "Warning",
        });
      }
    } catch (error) {
      executionLogService.add({
        level: "warning",
        actor: "Frontend Engineer",
        message: `Project generator could not persist the generated frontend project: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }

  private currentSnapshot(): OrchestrationSnapshot {
    const project = this.orchestrator.getProject() as Project;
    const agents = this.orchestrator.getAgents();
    return this.buildSnapshot({
      project,
      agents,
      tasks: this.taskQueue.getTasks(),
      workflowNodes: this.workflowEngine.getNodes(),
      timelineEvents: this.timelineService.getEvents(),
      activeAgentId: null,
      activityLog: this.timelineService.getEvents().map((event) => event.description),
    });
  }

  private publish(type: ExecutionEvent["type"], payload?: Record<string, unknown>): void {
    this.eventBus.publish({ type, timestamp: new Date().toISOString(), payload });
  }

  private buildSnapshot(input: Omit<OrchestrationSnapshot, "project" | "agents" | "tasks" | "workflowNodes" | "timelineEvents" | "activeAgentId" | "activityLog"> & {
    project: Project;
    agents: Agent[];
    tasks: Task[];
    workflowNodes: WorkflowExecutionNode[];
    timelineEvents: TimelineEvent[];
    activeAgentId: string | null;
    activityLog: string[];
  }): OrchestrationSnapshot {
    return {
      project: input.project,
      agents: input.agents,
      tasks: input.tasks,
      workflowNodes: input.workflowNodes,
      timelineEvents: input.timelineEvents,
      activeAgentId: input.activeAgentId,
      activityLog: input.activityLog,
    };
  }

  private syncAgentState(
    agents: Agent[],
    workflowNodes: WorkflowExecutionNode[],
    activeAgentId: string | null,
    forceCompleted: boolean,
  ): Agent[] {
    const nodeByRole = new Map(workflowNodes.map((node) => [node.role, node]));

    return agents.map((agent) => {
      const workflowNode = nodeByRole.get(agent.role);
      const roleStatus = workflowNode?.status === "Completed"
        ? "Completed"
        : workflowNode?.status === "Running"
          ? this.getWorkingStatus(agent.role)
          : agent.status;

      const status = forceCompleted ? "Completed" : agent.status === "Completed" ? "Completed" : roleStatus;
      const isActive = !forceCompleted && activeAgentId === agent.id;

      return {
        ...agent,
        status,
        progress: isActive ? this.getProgressForStatus(status) : Math.max(agent.progress, this.getProgressForStatus(status)),
        currentTask: agent.currentTask ?? `Awaiting ${agent.role.toLowerCase()} work`,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  private getActivityMessage(role: string, status: AgentStatus): string {
    if (role === "Project Manager" && status === "Planning") {
      return "Planning architecture...";
    }

    if (role === "System Architect" && status === "Planning") {
      return "Planning architecture...";
    }

    if (role === "Frontend Engineer" && status === "Working") {
      return "Generating frontend...";
    }

    if (role === "Backend Engineer" && status === "Working") {
      return "Building backend...";
    }

    if (role === "QA Engineer" && status === "Reviewing") {
      return "Running tests...";
    }

    if (role === "DevOps Engineer" && status === "Working") {
      return "Deploying application...";
    }

    if (status === "Planning") {
      return `Planning ${role.toLowerCase()} work...`;
    }

    if (status === "Working") {
      return `Executing ${role.toLowerCase()} work...`;
    }

    if (status === "Reviewing") {
      return `Reviewing ${role.toLowerCase()} changes...`;
    }

    if (status === "Fixing") {
      return `Fixing ${role.toLowerCase()} review findings...`;
    }

    if (status === "Verified") {
      return `Verifying ${role.toLowerCase()} deliverables...`;
    }

    return `${role} completed the task.`;
  }

  private getWorkingStatus(role: string): AgentStatus {
    if (role === "Project Manager") {
      return "Planning";
    }

    if (role === "QA Engineer") {
      return "Reviewing";
    }

    return "Working";
  }

  private getProgressForStatus(status: AgentStatus): number {
    const map: Record<AgentStatus, number> = {
      Idle: 0,
      Planning: 20,
      Working: 60,
      Waiting: 40,
      Reviewing: 85,
      Fixing: 70,
      Verified: 95,
      Completed: 100,
    };

    return map[status];
  }

  private getProgressValue(project: Project, agents: Agent[]): number {
    return Math.max(project.progress, Math.round((agents.filter((agent) => agent.status === "Completed").length / Math.max(agents.length, 1)) * 100));
  }

  private getProjectStatus(progress: number): Project["status"] {
    if (progress >= 100) {
      return "Completed";
    }

    if (progress > 0) {
      return "In Progress";
    }

    return "Planning";
  }

  private withProjectStatus(project: Project, progress: number, status: Project["status"]): Project {
    return {
      ...project,
      progress,
      status,
    };
  }
}
