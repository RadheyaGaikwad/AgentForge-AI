"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      setError(body.error ?? "Unable to sign in.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#05060B] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1020]/85 p-7 shadow-[0_25px_90px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400"><Sparkles className="h-4 w-4" /></div>
        <p className="mt-6 text-sm text-white/50">AgentForge</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Sign in to your workspace</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">Use your workspace credentials to continue.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm text-white/70">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50" placeholder="you@company.com" /></label>
          <label className="block text-sm text-white/70">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50" placeholder="Enter your password" /></label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#05060B] transition hover:bg-cyan-100">Continue <ArrowRight className="h-4 w-4" /></button>
        </form>
      </div>
    </main>
  );
}
