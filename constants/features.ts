import {
  Activity,
  Code2,
  Layers,
  Rocket,
  Terminal,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  span: "sm" | "md" | "lg" | "wide" | "tall";
  variant: "stat" | "terminal" | "graph" | "code" | "deploy" | "network" | "default";
  stat?: { value: number; suffix: string; label: string };
  terminalLines?: string[];
  codeSnippet?: string;
  graphData?: number[];
}

export const BENTO_ITEMS: BentoItem[] = [
  {
    id: "collaboration",
    title: "Multi-Agent Collaboration",
    description: "10 specialized AI engineers working in parallel, communicating in real-time.",
    icon: Users,
    span: "lg",
    variant: "network",
    stat: { value: 10, suffix: "", label: "Active Agents" },
  },
  {
    id: "speed",
    title: "10x Faster Delivery",
    description: "From prompt to production in hours, not months.",
    icon: Zap,
    span: "sm",
    variant: "stat",
    stat: { value: 10, suffix: "x", label: "Faster than traditional" },
  },
  {
    id: "terminal",
    title: "Live Engineering Feed",
    description: "Watch agents write code in real-time.",
    icon: Terminal,
    span: "wide",
    variant: "terminal",
    terminalLines: [
      "$ agentforge deploy --team full-stack",
      "→ Initializing 10 AI agents...",
      "→ Frontend Engineer: Building React components",
      "→ Backend Engineer: Creating REST API endpoints",
      "→ Database Engineer: Designing PostgreSQL schema",
      "✓ Project scaffolded in 47 seconds",
    ],
  },
  {
    id: "architecture",
    title: "Auto Architecture",
    description: "System design generated before a single line of code.",
    icon: Layers,
    span: "md",
    variant: "graph",
    graphData: [20, 45, 30, 60, 55, 80, 75, 95],
  },
  {
    id: "code",
    title: "Production Code",
    description: "Enterprise-grade code with best practices baked in.",
    icon: Code2,
    span: "md",
    variant: "code",
    codeSnippet: `export async function createPatient(data: PatientDTO) {
  const validated = schema.parse(data);
  return db.patient.create({ data: validated });
}`,
  },
  {
    id: "deploy",
    title: "Instant Export",
    description: "Automated CI/CD to production.",
    icon: Rocket,
    span: "wide",
    variant: "deploy",
  },
  {
    id: "tracking",
    title: "Real-Time Tracking",
    description: "Full transparency into every agent's progress.",
    icon: Activity,
    span: "sm",
    variant: "stat",
    stat: { value: 99, suffix: ".9%", label: "Uptime SLA" },
  },
];
