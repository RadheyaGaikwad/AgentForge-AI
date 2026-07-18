import {
  Brain,
  Bug,
  Database,
  Layout,
  Layers,
  Rocket,
  Server,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  specialization: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  angle: number;
  status: "active" | "ready" | "thinking";
}

export const AGENTS: Agent[] = [
  {
    id: "pm",
    name: "Project Manager Agent",
    role: "Project Manager Agent",
    description: "Coordinates all agents and ensures on-time delivery.",
    specialization: "Agile · Sprint Planning",
    icon: Users,
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.35)",
    angle: 0,
    status: "active",
  },
  {
    id: "architect",
    name: "Architecture Agent",
    role: "Architecture Agent",
    description: "Designs system architecture and technology decisions.",
    specialization: "System Design · Patterns",
    icon: Layers,
    color: "#818CF8",
    glow: "rgba(129,140,248,0.4)",
    angle: 40,
    status: "thinking",
  },
  {
    id: "frontend",
    name: "Frontend Engineer Agent",
    role: "Frontend Engineer Agent",
    description: "Crafts pixel-perfect React interfaces with fluid animations.",
    specialization: "React · Next.js · Tailwind",
    icon: Layout,
    color: "#6366F1",
    glow: "rgba(99,102,241,0.4)",
    angle: 80,
    status: "active",
  },
  {
    id: "backend",
    name: "Backend Engineer Agent",
    role: "Backend Engineer Agent",
    description: "Architects scalable APIs and microservices at enterprise scale.",
    specialization: "Node.js · GraphQL · REST",
    icon: Server,
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.4)",
    angle: 120,
    status: "active",
  },
  {
    id: "database",
    name: "Database Engineer Agent",
    role: "Database Engineer Agent",
    description: "Designs optimized PostgreSQL schemas and query strategies.",
    specialization: "PostgreSQL · Redis · Prisma",
    icon: Database,
    color: "#06B6D4",
    glow: "rgba(6,182,212,0.4)",
    angle: 160,
    status: "ready",
  },
  {
    id: "security",
    name: "DevOps Engineer Agent",
    role: "DevOps Engineer Agent",
    description: "Automates delivery readiness and deployment workflows.",
    specialization: "CI/CD · Delivery · Automation",
    icon: Shield,
    color: "#34D399",
    glow: "rgba(52,211,153,0.4)",
    angle: 200,
    status: "active",
  },
  {
    id: "qa",
    name: "QA Engineer Agent",
    role: "QA Engineer Agent",
    description: "Runs comprehensive test suites and quality assurance.",
    specialization: "E2E · Unit · Integration",
    icon: Bug,
    color: "#F472B6",
    glow: "rgba(244,114,182,0.35)",
    angle: 240,
    status: "ready",
  },
  {
    id: "ai",
    name: "Documentation Agent",
    role: "Documentation Agent",
    description: "Produces clear technical documentation and implementation guidance.",
    specialization: "Docs · Standards · Handoffs",
    icon: Brain,
    color: "#A855F7",
    glow: "rgba(168,85,247,0.4)",
    angle: 280,
    status: "thinking",
  },
  {
    id: "devops",
    name: "Deployment Agent",
    role: "Deployment Agent",
    description: "Handles delivery, packaging, and release coordination.",
    specialization: "Deployment · ZIP · Release",
    icon: Rocket,
    color: "#22D3EE",
    glow: "rgba(34,211,238,0.4)",
    angle: 320,
    status: "active",
  },
];

export const BUILDER_AVATARS = [
  { initials: "AK", color: "#6366F1" },
  { initials: "MR", color: "#06B6D4" },
  { initials: "JL", color: "#A855F7" },
  { initials: "TS", color: "#3B82F6" },
  { initials: "DP", color: "#EC4899" },
];
