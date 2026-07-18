"use client";

import Link from "next/link";
import { FolderKanban, LayoutGrid, LogOut, Plus, Settings, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "New project", href: "/new-project", icon: Plus },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.sessionStorage.removeItem("new-project");
    router.push("/login");
  };

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[240px]">
      <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0B1020]/80 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.3)] backdrop-blur-2xl">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400"><Sparkles className="h-4 w-4" /></div>
          <span className="font-semibold tracking-[-0.02em]">AgentForge</span>
        </Link>

        <nav className="mt-7 space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-white/[0.09] text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}><Icon className="h-4 w-4" />{label}</Link>;
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center gap-3 px-3 text-sm text-white/60"><FolderKanban className="h-4 w-4" /> Project workspace</div>
          <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"><LogOut className="h-4 w-4" />Log out</button>
        </div>
      </div>
    </aside>
  );
}
