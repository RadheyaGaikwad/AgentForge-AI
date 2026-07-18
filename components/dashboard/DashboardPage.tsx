"use client";

import Link from "next/link";
import { ArrowUpRight, FolderKanban, Plus, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export function DashboardPage() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; prompt: string; status: string; createdAt: string }>>([]);

  useEffect(() => {
    void fetch("/api/projects").then(async (response) => response.ok ? response.json() : []).then(setProjects).catch(() => setProjects([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_32%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:py-6">
          <Sidebar />

          <main className="min-w-0 flex-1">
            <header className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7">
              <div>
                <p className="text-sm font-medium text-white/45">Workspace</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your projects</h1>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/55">Create a project, then continue its work in the workspace.</p>
              </div>
              <Link href="/new-project" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#05060B] transition hover:bg-cyan-100">
                <Plus className="h-4 w-4" />
                New project
              </Link>
            </header>

            <section className="pt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/45">Recent projects</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Continue where you left off</h2>
                </div>
              </div>

              {projects.length > 0 ? (
                <div className="mt-5 space-y-4">
                {projects.map((project) => (
                <article key={project.id} className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.22)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200"><FolderKanban className="h-5 w-5" /></div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{project.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">{project.prompt || "No description provided."}</p>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
                          <span>Created {formatDate(project.createdAt)}</span>
                          <span className="text-cyan-200">{project.status}</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/workspace" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]">
                      Open workspace
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
                ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center">
                  <FolderKanban className="mx-auto h-6 w-6 text-white/35" />
                  <h3 className="mt-4 text-lg font-semibold">No recent projects</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">Your active project will appear here after you create it.</p>
                  <Link href="/new-project" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.09]">
                    <Plus className="h-4 w-4" /> Create a project
                  </Link>
                </div>
              )}
            </section>

            <section className="mt-8 border-t border-white/10 pt-8">
              <p className="text-sm font-medium text-white/45">Workspace settings</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div>
                  <h2 className="text-base font-semibold">Provider and repository preferences</h2>
                  <p className="mt-1 text-sm text-white/50">Manage the local settings used by your existing services.</p>
                </div>
                <Link href="/settings" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm text-white/80 transition hover:bg-white/[0.06]"><Settings className="h-4 w-4" /> Settings</Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
