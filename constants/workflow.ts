import {
  Brain,
  Database,
  Layout,
  Layers,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface WorkflowStage {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: "prompt", title: "Prompt", subtitle: "Natural language input", icon: Sparkles },
  { id: "planning", title: "Planning", subtitle: "Requirements analysis", icon: Brain },
  { id: "architecture", title: "Architecture", subtitle: "System design", icon: Layers },
  { id: "frontend", title: "Frontend", subtitle: "UI development", icon: Layout },
  { id: "backend", title: "Backend", subtitle: "API & services", icon: Server },
  { id: "database", title: "Database", subtitle: "Schema & models", icon: Database },
  { id: "testing", title: "Testing", subtitle: "QA & security", icon: Shield },
  { id: "deployment", title: "Deployment", subtitle: "CI/CD pipeline", icon: Rocket },
  { id: "production", title: "Production", subtitle: "Live & monitored", icon: Zap },
];
