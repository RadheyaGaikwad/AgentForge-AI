"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Bot, KeyRound, Save, SlidersHorizontal, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { providerFactory } from "@/lib/providers/providerFactory";
import { configurationService } from "@/services/configurationService";

const providerOptions = [
  { id: "mock", label: "Mock" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "deepseek", label: "DeepSeek" },
];

const modelMap: Record<string, string[]> = {
  mock: ["Mock Agent"],
  openrouter: ["anthropic/claude-sonnet", "openai/gpt-4.1", "deepseek/deepseek-chat", "google/gemini-2.5-pro"],
  openai: ["openai/gpt-4.1"],
  anthropic: ["anthropic/claude-sonnet"],
  gemini: ["google/gemini-2.5-pro"],
  deepseek: ["deepseek/deepseek-chat"],
};

export default function SettingsPage() {
  const router = useRouter();
  const initialSettings = configurationService.getSettings();
  const [provider, setProvider] = useState(initialSettings.provider.toLowerCase());
  const [model, setModel] = useState(initialSettings.model);
  const [apiKey, setApiKey] = useState(initialSettings.apiKey);
  const [temperature, setTemperature] = useState(initialSettings.temperature);
  const [maxTokens, setMaxTokens] = useState(initialSettings.maxTokens);
  const [streaming, setStreaming] = useState(initialSettings.streaming);
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"Connected" | "Disconnected" | "Unknown">("Unknown");
  const [providerHealth, setProviderHealth] = useState("Not checked");

  const availableModels = useMemo(() => modelMap[provider] ?? ["Mock Agent"], [provider]);

  const handleProviderChange = (nextProvider: string) => {
    setProvider(nextProvider);
    setModel(modelMap[nextProvider]?.[0] ?? "Mock Agent");
    setConnectionStatus("Unknown");
    setProviderHealth("Not checked");
    setSaved(false);
  };

  const handleSave = () => {
    configurationService.updateSettings({
      provider,
      model,
      apiKey,
      temperature,
      maxTokens,
      streaming,
      baseUrl: configurationService.getSettings().baseUrl,
    });
    setSaved(true);
  };

  const handleValidateApiKey = async () => {
    const providerInstance = providerFactory.createProvider(provider);
    const isValid = await providerInstance.validateKey?.() ?? false;
    setConnectionStatus(isValid ? "Connected" : "Disconnected");
    setProviderHealth(isValid ? "Key validated" : "Key validation failed");
  };

  const handleCheckProviderHealth = async () => {
    const providerInstance = providerFactory.createProvider(provider);
    const isHealthy = await providerInstance.healthCheck?.() ?? false;
    setConnectionStatus(isHealthy ? "Connected" : "Disconnected");
    setProviderHealth(isHealthy ? "Healthy" : "Unavailable");
  };

  return (
    <main className="min-h-screen bg-[#05060B] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_30%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Settings
                </div>
                <h1 className="mt-4 text-[clamp(2rem,3.8vw,3.2rem)] font-semibold tracking-[-0.03em] text-white">
                  Configure your provider workspace
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-8 text-white/55 sm:text-[16px]">
                  Configure the provider, validate the key, and use the OpenRouter routing layer for the first live AI integration path.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.history.length > 1) {
                      router.back();
                      return;
                    }

                    router.push("/dashboard");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/70 transition-all hover:bg-white/[0.08]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Status</p>
                  <p className="mt-2 text-lg font-semibold text-white">Local only</p>
                </div>
              </div>
            </div>
          </motion.header>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/40">Provider Setup</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">Primary configuration</h2>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-white/60">AI Provider</label>
                  <select
                    value={provider}
                    onChange={(event) => handleProviderChange(event.target.value)}
                    className="mt-2 w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none"
                  >
                    {providerOptions.map((option) => (
                      <option key={option.id} value={option.id} className="bg-[#05060B] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/60">Model</label>
                  <select
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    disabled={provider === "mock"}
                    className="mt-2 w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {availableModels.map((option) => (
                      <option key={option} value={option} className="bg-[#05060B] text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/60">API Key</label>
                  <div className="mt-2 flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <KeyRound className="h-4.5 w-4.5 text-white/50" />
                    <input
                      type="password"
                      placeholder="sk-placeholder"
                      value={apiKey}
                      onChange={(event) => {
                        setApiKey(event.target.value);
                        setSaved(false);
                      }}
                      className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/40">Behavior</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">Execution controls</h2>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm font-medium text-white/60">
                    <label>Temperature</label>
                    <span className="text-cyan-300">{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(event) => {
                      setTemperature(Number(event.target.value));
                      setSaved(false);
                    }}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
                  />
                  <div className="mt-2 flex justify-between text-[12px] uppercase tracking-[0.2em] text-white/35">
                    <span>0</span>
                    <span>2</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/60">Maximum Tokens</label>
                  <input
                    type="number"
                    min="128"
                    step="128"
                    value={maxTokens}
                    onChange={(event) => {
                      setMaxTokens(Number(event.target.value));
                      setSaved(false);
                    }}
                    className="mt-2 w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-white">Streaming</p>
                    <p className="mt-1 text-sm text-white/45">Enable live token streaming</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStreaming((value) => !value);
                      setSaved(false);
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.04] p-2"
                  >
                    {streaming ? <ToggleRight className="h-6 w-6 text-cyan-300" /> : <ToggleLeft className="h-6 w-6 text-white/50" />}
                  </button>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Connection</p>
                    <p className="mt-2 text-lg font-semibold text-white">{connectionStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Current model</p>
                    <p className="mt-2 text-sm text-cyan-300">{model}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleValidateApiKey}
                    className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
                  >
                    Validate API Key
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckProviderHealth}
                    className="rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-3 text-sm text-violet-200 transition hover:bg-violet-400/15"
                  >
                    Check Provider Health
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-white/10 bg-[#05060B]/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Status</p>
                    <p className="mt-2 text-sm text-white/75">{providerHealth}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-[#05060B]/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Usage placeholder</p>
                    <p className="mt-2 text-sm text-white/75">Pending runtime usage</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-violet-500 px-5 py-4 text-[15px] font-semibold text-white shadow-[0_0_35px_rgba(99,102,241,0.25)]"
              >
                <Save className="h-4 w-4" />
                {saved ? "Saved locally" : "Save Settings"}
              </button>
            </motion.section>
          </div>

        </div>
      </div>
    </main>
  );
}
