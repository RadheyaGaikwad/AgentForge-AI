"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const projectTypes = [
  {
    title: "Web Application",
    icon: "🌐",
    description: "AgentForge generates complete production-ready full-stack web applications.",
  },
  {
    title: "Desktop Application",
    icon: "Desktop",
    description: "AgentForge generates polished desktop application projects with a focused engineering workflow.",
  },
];

const defaultTeam = [
  "Project Manager Agent",
  "Architecture Agent",
  "Frontend Engineer Agent",
  "Backend Engineer Agent",
  "Database Engineer Agent",
  "DevOps Engineer Agent",
  "QA Engineer Agent",
  "Documentation Agent",
  "Deployment Agent",
];

const steps = [
  { title: "Project Name", description: "Give the build a clear name and short brief." },
  { title: "Project Type", description: "Choose a web or desktop application for the engineering team to build." },
  { title: "Review & Launch", description: "Confirm the plan and launch the AI team." },
];

export function NewProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState(projectTypes[0].title);
  const [selectedTeam] = useState<string[]>(defaultTeam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusSteps] = useState([
    "Preparing engineering team...",
    "Creating architecture...",
    "Assigning agents...",
    "Generating workspace...",
  ]);

  const stepProgress = useMemo(() => Math.round((currentStep / steps.length) * 100), [currentStep]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      name: projectName || "Untitled Project",
      description,
      type: selectedType,
      stack: [],
      team: selectedTeam,
    };

    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: payload.name, prompt: payload.description, projectType: payload.type }) });
    if (!response.ok) {
      setIsSubmitting(false);
      return;
    }
    const project = await response.json() as { id: string };
    window.sessionStorage.setItem("new-project", JSON.stringify({ ...payload, id: project.id }));
    router.push("/workspace");
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((value) => value + 1);
      return;
    }

    void handleSubmit();
  };

  const handleBack = () => {
    setCurrentStep((value) => Math.max(1, value - 1));
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_30%)]" />

        <div className="relative mx-auto flex max-w-5xl flex-col px-4 py-4 sm:px-6 lg:px-6 lg:py-6">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  New Project
                </div>
                <h1 className="mt-4 text-[clamp(2rem,3.4vw,2.7rem)] font-semibold tracking-[-0.03em] text-white">
                  Create the project once. Let the AI team do the rest.
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-white/55 sm:text-[16px]">
                  This is the only place where the project brief is captured. After launch, the workspace takes over.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/70 transition-all hover:bg-white/[0.08]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Step {currentStep} / {steps.length}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stepProgress}%</p>
                </div>
              </div>
            </div>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mt-6 rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-sm font-semibold text-white">
                {currentStep}
              </div>
              <div>
                <p className="text-sm font-medium text-white/40">Step {currentStep}</p>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">{steps[currentStep - 1].title}</h2>
                <p className="mt-1 text-sm text-white/45">{steps[currentStep - 1].description}</p>
              </div>
            </div>

            {currentStep === 1 ? (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-white/60">Project Name</label>
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="e.g. Northstar CRM"
                    className="mt-2 w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-[16px] text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white/60">Description</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the experience you want the AI team to build."
                    className="mt-2 min-h-[160px] w-full resize-none rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-[16px] leading-8 text-white outline-none placeholder:text-white/35"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-white/60">Project Type</p>
                  <div className="mt-3 grid gap-3">
                    {projectTypes.map((type) => (
                      <button
                        key={type.title}
                        type="button"
                        onClick={() => setSelectedType(type.title)}
                        className="rounded-[24px] border border-cyan-400/30 bg-cyan-400/10 p-4 text-left transition-all"
                      >
                        <div className="text-2xl">{type.icon}</div>
                        <div className="mt-3 text-[15px] font-semibold text-white">{type.title}</div>
                        <div className="mt-1 text-sm leading-7 text-cyan-50/90">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-medium text-white/40">Project summary</p>
                  <div className="mt-4 space-y-3 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
                      <span>Name</span>
                      <span className="font-semibold text-white">{projectName || "Untitled Project"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
                      <span>Focus</span>
                      <span className="font-semibold text-white">{selectedType}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
                      <span>Stack</span>
                      <span className="font-semibold text-white">Selected by Architecture Agent</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
                  Once launched, the workspace will start the AI team and guide you through the build with clear milestones and approvals.
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-all hover:bg-white/[0.08]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(99,102,241,0.25)]"
              >
                {currentStep === steps.length ? (isSubmitting ? "Launching workspace..." : "Launch AI Team") : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {isSubmitting ? (
              <div className="mt-4 space-y-2 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                {statusSteps.map((step) => (
                  <div key={step} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
