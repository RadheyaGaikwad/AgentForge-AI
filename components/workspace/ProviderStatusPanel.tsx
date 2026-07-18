"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { providerFactory } from "@/lib/providers/providerFactory";

const providers = providerFactory.listProviders();

export function ProviderStatusPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Provider Layer</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Architecture-only adapters</h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[12px] font-medium text-cyan-300">
          Interface-based
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-white/70">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">{provider.name}</p>
                <p className="text-[13px] text-white/45">{provider.model}</p>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/45">
              Ready
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
