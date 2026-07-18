"use client";

import { motion } from "framer-motion";
import { AGENTS } from "@/constants/agents";
import { cn } from "@/lib/cn";

const ORBIT_RADIUS = 200;
const CENTER = 250;

function orbitPosition(angle: number, radius = ORBIT_RADIUS) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function AgentOrbitCard({
  agent,
  index,
}: {
  agent: (typeof AGENTS)[number];
  index: number;
}) {
  const pos = orbitPosition(agent.angle, ORBIT_RADIUS);
  const Icon = agent.icon;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${(pos.x / 500) * 100}%`,
        top: `${(pos.y / 500) * 100}%`,
        width: 104,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { delay: 0.8 + index * 0.08, duration: 0.6 },
        scale: { delay: 0.8 + index * 0.08, duration: 0.6, type: "spring" },
        y: { duration: 3 + index * 0.3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
      }}
    >
      <div
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0B1020]/90 px-2.5 py-2 backdrop-blur-xl"
        style={{ boxShadow: `0 0 20px ${agent.glow}` }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${agent.color}18` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: agent.color }} strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium text-white/80">{agent.role.split(" ")[0]}</p>
          <p className="truncate text-[9px] text-white/30">{agent.name}</p>
        </div>
        <div
          className={cn(
            "ml-auto h-1.5 w-1.5 shrink-0 rounded-full",
            agent.status === "active" && "animate-pulse bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
            agent.status === "thinking" && "animate-pulse bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]",
            agent.status === "ready" && "bg-cyan-400/60"
          )}
        />
      </div>
    </motion.div>
  );
}

export function AICoreVisualization() {
  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[500px] lg:h-[560px] lg:max-w-[560px]">
      {/* Connection lines SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 500 500"
        aria-hidden
      >
        <defs>
          <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {AGENTS.map((agent, i) => {
          const pos = orbitPosition(agent.angle, ORBIT_RADIUS);
          return (
            <motion.line
              key={agent.id}
              x1={CENTER}
              y1={CENTER}
              x2={pos.x}
              y2={pos.y}
              stroke="url(#beam)"
              strokeWidth="0.8"
              filter="url(#lineGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2] }}
              transition={{
                pathLength: { duration: 1.5, delay: 0.3 + i * 0.05 },
                opacity: { duration: 2.5, repeat: Infinity, delay: i * 0.2 },
              }}
            />
          );
        })}

        {/* Rotating ring */}
        <motion.ellipse
          cx={CENTER}
          cy={CENTER}
          rx={ORBIT_RADIUS}
          ry={ORBIT_RADIUS * 0.35}
          fill="none"
          stroke="rgba(99,102,241,0.15)"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />
      </svg>

      {/* Platform */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2">
        <motion.div
          className="relative"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Platform glow */}
          <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="h-3 w-48 rounded-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent blur-sm" />
          <div className="mx-auto h-1.5 w-36 rounded-full bg-gradient-to-r from-indigo-500/20 via-cyan-400/40 to-purple-500/20" />
        </motion.div>
      </div>

      {/* AI Core Crystal */}
      <div
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: "800px" }}
      >
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotateY: [0, 360],
          }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-28 w-28"
        >
          {/* Core glow */}
          <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-indigo-500/30 via-cyan-400/20 to-purple-500/30 blur-3xl" />

          {/* Crystal faces */}
          {[
            { rotateY: 0, bg: "from-indigo-500/40 to-blue-600/30" },
            { rotateY: 90, bg: "from-cyan-500/40 to-indigo-500/30" },
            { rotateY: 180, bg: "from-purple-500/40 to-indigo-500/30" },
            { rotateY: 270, bg: "from-blue-500/40 to-cyan-500/30" },
          ].map((face, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-br backdrop-blur-sm",
                face.bg
              )}
              style={{
                transform: `rotateY(${face.rotateY}deg) translateZ(56px)`,
                backfaceVisibility: "hidden",
              }}
            />
          ))}

          {/* Inner core */}
          <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md">
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: "radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)",
              }}
            />
          </div>

          {/* Pulse rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-2xl border border-cyan-400/20"
              animate={{ scale: [1, 1.8 + ring * 0.3], opacity: [0.4, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: ring * 0.8,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Agent orbit cards */}
      <div className="absolute inset-0">
        {AGENTS.map((agent, i) => (
          <AgentOrbitCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>

      {/* Ambient particles around core */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-400/60"
          style={{
            left: `${40 + (i * 17) % 60}%`,
            top: `${25 + (i * 23) % 50}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
