"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentList } from "@/components/workspace/AgentList";
import { ApprovalCheckpointCard } from "@/components/workspace/ApprovalCheckpointCard";
import { ProgressTracker } from "@/components/workspace/ProgressTracker";
import { ProjectTimeline } from "@/components/workspace/ProjectTimeline";
import { SidebarNav } from "@/components/workspace/SidebarNav";
import { PreviewManifestPanel } from "@/components/workspace/PreviewManifestPanel";
import { OrchestrationRuntime } from "@/services/orchestrationRuntime";
import { AIOrchestratorEngine } from "@/services/engines/aiOrchestratorEngine";
import { projectBuilder } from "@/services/projectBuilder";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import { zipExportService } from "@/services/export/zipExportService";
import { useAgentsStore, type WorkspaceAgent } from "@/stores/agentsStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTasksStore } from "@/stores/tasksStore";
import { useTimelineStore } from "@/stores/timelineStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import type { Agent } from "@/types/agent";
import { ArrowLeft, Bot, Download } from "lucide-react";
import { BrainCircuit, Code2, Database, Layers3, MonitorPlay, ShieldCheck, Workflow, Zap } from "lucide-react";

const createDefaultProject = () => ({
  id: "project-1",
  name: "AgentForge Workspace",
  description: "A modular orchestration experience for future agent execution.",
  projectType: "Web Application",
  techStack: ["Next.js", "TypeScript", "Zustand"],
  status: "Planning" as const,
  progress: 0,
  createdAt: new Date().toISOString(),
});

const approvalMilestones = [
  {
    title: "Architecture complete",
    description: "The architecture has been reviewed. Approve to continue into implementation.",
    matches: (agents: Agent[]) => agents.some((agent) => agent.role === "System Architect" && agent.status === "Completed"),
  },
  {
    title: "Frontend Ready",
    description: "The frontend has been generated successfully. Please review the generated application before continuing.",
    matches: (agents: Agent[]) => agents.some((agent) => agent.role === "Frontend Engineer" && agent.status === "Completed"),
  },
  {
    title: "Backend complete",
    description: "The backend foundation is ready for review. Approve to continue.",
    matches: (agents: Agent[]) => agents.some((agent) => agent.role === "Backend Engineer" && agent.status === "Completed"),
  },
  {
    title: "Database complete",
    description: "The data layer is ready. Approve to progress to delivery preparation.",
    matches: (agents: Agent[]) => agents.some((agent) => agent.role === "Database Engineer" && agent.status === "Completed"),
  },
  {
    title: "Before completion",
    description: "The build is ready for review. Approve to proceed to completion.",
    matches: (agents: Agent[]) => agents.some((agent) => agent.role === "DevOps Engineer" && agent.status === "Completed"),
  },
];

const getPendingApproval = (snapshot: { agents: Agent[] }, approvalCursor: number) => {
  const milestone = approvalMilestones[approvalCursor];
  if (!milestone || !milestone.matches(snapshot.agents)) {
    return null;
  }

  return {
    title: milestone.title,
    description: milestone.description,
    milestone: milestone.title,
  };
};

const mapAgentToWorkspaceAgent = (agent: Agent): WorkspaceAgent => ({
  id: agent.id,
  name: agent.name,
  task: agent.currentTask ?? `Awaiting ${agent.role.toLowerCase()} work`,
  progress: agent.progress,
  status: agent.status,
  icon: agent.role.includes("Frontend")
    ? Code2
    : agent.role.includes("Backend")
      ? Workflow
      : agent.role.includes("Database")
        ? Database
        : agent.role.includes("QA")
          ? MonitorPlay
          : agent.role.includes("DevOps")
            ? Zap
            : agent.role.includes("Architect")
              ? BrainCircuit
              : agent.role.includes("Project")
                ? Layers3
                : ShieldCheck,
  accent: agent.role.includes("Frontend")
    ? "from-amber-400/80 to-orange-500/80"
    : agent.role.includes("Backend")
      ? "from-emerald-400/80 to-cyan-500/80"
      : agent.role.includes("Database")
        ? "from-sky-500/80 to-blue-500/80"
        : agent.role.includes("QA")
          ? "from-pink-500/80 to-rose-500/80"
          : agent.role.includes("DevOps")
            ? "from-indigo-400/80 to-cyan-400/80"
            : agent.role.includes("Architect")
              ? "from-violet-500/80 to-fuchsia-500/80"
              : agent.role.includes("Project")
                ? "from-cyan-500/80 to-indigo-500/80"
                : "from-lime-500/80 to-emerald-500/80",
  initials: agent.role
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2),
});

export function WorkspacePage() {
  const runtime = useMemo(() => new OrchestrationRuntime(new AIOrchestratorEngine()), []);
  const router = useRouter();
  const { tick, advanceTick } = useWorkspaceStore();
  const { agents, setAgents } = useAgentsStore();
  const { setTasks } = useTasksStore();
  const { events, setEvents } = useTimelineStore();
  const { setNodes } = useWorkflowStore();
  const { project, setProject, updateProject } = useProjectStore();
  const isStepInFlight = useRef(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<null | { title: string; description: string; milestone: string }>(null);
  const [approvalCursor, setApprovalCursor] = useState(0);
  const [notification, setNotification] = useState<{ tone: "success" | "warning" | "error"; message: string } | null>(null);
  const [builderSnapshot, setBuilderSnapshot] = useState(() => projectBuilder.getSnapshot());

  useEffect(() => {
    if (!isBootstrapped || project?.status === "Completed" || pendingApproval) {
      return;
    }

    const intervalId = window.setInterval(() => {
      advanceTick();
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [advanceTick, isBootstrapped, pendingApproval, project?.status]);

  useEffect(() => {
    const initializeWorkspace = async () => {
      if (typeof window === "undefined") {
        return;
      }

      try {
        const storedProject = window.sessionStorage.getItem("new-project");

        if (!storedProject) {
          setProject(createDefaultProject());
          setEvents([
            {
              id: "event-initialized",
              title: "Project initialized",
              description: "The workspace is ready for orchestration.",
              timestamp: new Date().toISOString(),
              actor: "System",
              status: "Informational",
            },
          ]);
          setIsBootstrapped(true);
          return;
        }

        const payload = JSON.parse(storedProject) as {
          name: string;
          description: string;
          type: string;
          stack: string[];
        };

        const snapshot = await runtime.initialize({
          name: payload.name ?? "Untitled Project",
          description: payload.description ?? "",
          projectType: payload.type ?? "Web Application",
          techStack: payload.stack ?? [],
        });

        setProject(snapshot.project);
        setAgents(snapshot.agents.map(mapAgentToWorkspaceAgent));
        setTasks(snapshot.tasks);
        setNodes(snapshot.workflowNodes);
        setEvents(snapshot.timelineEvents);
        setBuilderSnapshot(projectBuilder.getSnapshot());
        setActiveAgentId(null);
        setIsBootstrapped(true);
      } catch (error) {
        setNotification({
          tone: "error",
          message: error instanceof Error ? error.message : "The workspace could not finish bootstrapping.",
        });
      }
    };

    void initializeWorkspace();
  }, [runtime, setAgents, setEvents, setNodes, setProject, setTasks]);

  useEffect(() => {
    if (!isBootstrapped || tick === 0 || pendingApproval || project?.status === "Completed") {
      return;
    }

    let isCancelled = false;

    const runStep = async () => {
      if (isStepInFlight.current) {
        return;
      }

      isStepInFlight.current = true;

      try {
        const snapshot = await runtime.step();

        if (isCancelled) {
          return;
        }

        setProject(snapshot.project);
        setAgents(snapshot.agents.map(mapAgentToWorkspaceAgent));
        setTasks(snapshot.tasks);
        setNodes(snapshot.workflowNodes);
        setEvents(snapshot.timelineEvents);
        setActiveAgentId(snapshot.activeAgentId);
        setBuilderSnapshot(projectBuilder.getSnapshot());

        const approvalResponse = getPendingApproval(snapshot, approvalCursor);
        if (approvalResponse) {
          updateProject({ status: "Blocked" });
          setPendingApproval(approvalResponse);
          setApprovalCursor((current) => current + 1);
        }
      } catch (error) {
        setNotification({
          tone: "error",
          message: error instanceof Error ? error.message : "Agent execution step failed unexpectedly.",
        });
      } finally {
        if (!isCancelled) {
          isStepInFlight.current = false;
        }
      }
    };

    void runStep();

    return () => {
      isCancelled = true;
      isStepInFlight.current = false;
    };
  }, [approvalCursor, isBootstrapped, pendingApproval, project?.status, runtime, setAgents, setEvents, setNodes, setProject, setTasks, tick, updateProject]);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotification(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const activeAgentName: string | null = activeAgentId ? agents.find((agent) => agent.id === activeAgentId)?.name ?? null : null;
  const currentAgent = agents.find((agent) => agent.id === activeAgentId) ?? agents.find((agent) => agent.status === "Working") ?? agents[0];
  const isPreviewReady = builderSnapshot.previewManifest.status === "ready" && Boolean(builderSnapshot.previewManifest.previewUrl) && builderSnapshot.previewManifest.previewUrl !== "about:blank" && builderSnapshot.previewManifest.previewUrl !== "http://localhost:3000";

  const runWithRetry = async <T,>(operation: () => Promise<T>, retries = 2): Promise<T> => {
    let attempt = 0;

    while (attempt <= retries) {
      try {
        return await operation();
      } catch (error) {
        if (attempt >= retries) {
          throw error;
        }
        attempt += 1;
        await new Promise((resolve) => window.setTimeout(resolve, 250 * attempt));
      }
    }

    throw new Error("Retry loop exhausted.");
  };

  const handleReviewFrontend = async () => {
    if (!isPreviewReady || !builderSnapshot.previewManifest.previewUrl || builderSnapshot.previewManifest.previewUrl === "about:blank") {
      setNotification({ tone: "warning", message: "The generated frontend preview is not ready yet." });
      return;
    }

    try {
      const payload = await runWithRetry(async () => {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Preview request failed.");
        }

        return (await response.json()) as { previewUrl?: string };
      });

      const previewUrl = payload.previewUrl ?? builderSnapshot.previewManifest.previewUrl;

      if (!previewUrl || previewUrl === "about:blank" || previewUrl === "http://localhost:3000") {
        setNotification({ tone: "warning", message: "Preview failed to start. The generated app is not ready to review." });
        return;
      }

      const popup = window.open("", "_blank", "noopener,noreferrer");

      if (popup) {
        popup.location.href = previewUrl;
      } else {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }

      setNotification({ tone: "success", message: `Reviewing frontend at ${previewUrl}.` });
    } catch {
      setNotification({ tone: "error", message: "Unable to resolve the frontend preview URL automatically." });
    }
  };

  const handleApproveCheckpoint = () => {
    const projectKey = project?.id ? projectMemoryService.resolveProjectKey(project.name, project.id) : projectMemoryService.resolveProjectKey("AgentForge Workspace");
    projectMemoryService.rememberApproval(projectKey, pendingApproval?.title ?? "Checkpoint approved", project?.name ?? "AgentForge Workspace");
    setPendingApproval(null);
    updateProject({ status: "In Progress" });
    setNotification({ tone: "success", message: "Execution resumed with the backend stage." });
    advanceTick();
  };

  const handleRequestChanges = async () => {
    const requestedChanges = window.prompt("Describe the UI changes you want the Frontend Agent to apply.");

    if (!requestedChanges?.trim()) {
      setNotification({ tone: "warning", message: "No UI change request was provided." });
      return;
    }

    try {
      const nextSnapshot = await runtime.rerunFrontendAgent(requestedChanges.trim());
      setProject(nextSnapshot.project);
      setAgents(nextSnapshot.agents.map(mapAgentToWorkspaceAgent));
      setTasks(nextSnapshot.tasks);
      setNodes(nextSnapshot.workflowNodes);
      setEvents(nextSnapshot.timelineEvents);
      setBuilderSnapshot(projectBuilder.getSnapshot());
      setNotification({ tone: "success", message: "Frontend regeneration requested. Review the updated UI and continue when ready." });
    } catch (error) {
      setNotification({ tone: "error", message: error instanceof Error ? error.message : "Frontend regeneration could not be completed." });
    }
  };

  const handleDownloadProject = async () => {
    if (!project) {
      setNotification({ tone: "warning", message: "A generated project is not available yet." });
      return;
    }

    try {
      await zipExportService.download(builderSnapshot, project);
      setNotification({ tone: "success", message: "Project ZIP download started." });
    } catch (error) {
      setNotification({ tone: "error", message: error instanceof Error ? error.message : "Unable to create the project ZIP." });
    }
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-6 lg:py-6">
          <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
            <SidebarNav />

            <div className="space-y-6">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6">
                <div>
                  <p className="text-sm font-medium text-white/45">Project workspace</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">{project?.name ?? "Preparing project"}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/70 transition-all hover:bg-white/[0.08]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </header>

              <ProgressTracker
                progress={project?.progress ?? 0}
                activeAgentName={activeAgentName}
                statusLabel={pendingApproval ? "Awaiting approval" : project?.status ?? "Preparing execution"}
              />

              <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <p className="text-sm font-medium text-white/40">Current agent</p>
                  {currentAgent ? (
                    <div className="mt-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${currentAgent.accent}`}><currentAgent.icon className="h-5 w-5" /></div>
                        <div><h2 className="text-lg font-semibold">{currentAgent.name}</h2><p className="text-sm text-cyan-200">{currentAgent.status}</p></div>
                      </div>
                      <p className="mt-5 text-sm leading-7 text-white/60">{currentAgent.task}</p>
                      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${currentAgent.progress}%` }} /></div>
                    </div>
                  ) : <div className="mt-5 flex items-center gap-3 text-sm text-white/50"><Bot className="h-4 w-4" />Assigning the first agent…</div>}
                </motion.article>
                <AgentList agents={agents} activeAgentId={activeAgentId} />
              </section>

              {pendingApproval ? (
                <ApprovalCheckpointCard
                  title={pendingApproval.title}
                  description={pendingApproval.description}
                  status="✓ Frontend Generated"
                  isPreviewReady={isPreviewReady}
                  onReviewFrontend={handleReviewFrontend}
                  onRequestChanges={handleRequestChanges}
                  onContinue={handleApproveCheckpoint}
                />
              ) : null}

              {notification ? (
                <div className={`rounded-[24px] border px-4 py-3 text-sm ${notification.tone === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : notification.tone === "warning" ? "border-amber-400/20 bg-amber-400/10 text-amber-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
                  {notification.message}
                </div>
              ) : null}

              <ProjectTimeline events={events} progress={project?.progress ?? 0} activeAgentName={activeAgentName} statusLabel={pendingApproval ? "Awaiting approval" : project?.status ?? "Preparing execution"} isCompleted={project?.status === "Completed"} />

              <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <PreviewManifestPanel manifest={builderSnapshot.previewManifest} />
                <div id="delivery-actions" className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <p className="text-sm font-medium text-white/40">Delivery</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">Export and publish</h2>
                  <p className="mt-3 text-sm leading-7 text-white/55">Download the generated project archive when the build is ready.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => void handleDownloadProject()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85"><Download className="h-4 w-4" />Download ZIP</button>
                  </div>
                </div>
              </section>


              {/*
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Suspense fallback={<div className="rounded-[28px] border border-white/10 bg-[#060811]/70 p-5 text-sm text-white/60">Loading project explorer…</div>}>
                  <ProjectExplorerLazy
                    files={builderSnapshot.files}
                    validationReport={builderSnapshot.validationReport}
                    projectSummary={builderSnapshot.projectSummary}
                    selectedFilePath={activeSelectedFilePath}
                    onSelectFile={setSelectedFilePath}
                  />
                </Suspense>
                <Suspense fallback={<div className="rounded-[28px] border border-white/10 bg-[#060811]/70 p-5 text-sm text-white/60">Loading file preview…</div>}>
                  <FilePreviewPaneLazy file={selectedFile} />
                </Suspense>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
