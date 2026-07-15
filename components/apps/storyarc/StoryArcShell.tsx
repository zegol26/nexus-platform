"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const BASE_NAV_ITEMS = [
  ["▣", "Learn", "/apps/storyarc/learn"],
  ["✦", "Story", "/apps/storyarc/story"],
  ["⚑", "Quests", "/apps/storyarc/quests"],
  ["⚗", "Exam Lab", "/apps/storyarc/exam-lab"],
  ["▤", "Digital Library", "/apps/storyarc/library"],
  ["AI", "AI John", "/apps/storyarc/john"],
] as const;

export function StoryArcShell({ children, playerName, role }: { children: ReactNode; playerName: string; role: string }) {
  const pathname = usePathname();
  const staff = role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN";
  const navItems = [...BASE_NAV_ITEMS, ["▦", staff ? "Teacher Classroom" : "My Assignments", "/apps/storyarc/classroom"]] as const;
  const roleLabel = staff ? "Teacher" : "Student";

  return (
    <div className="storyarc-shell min-h-screen text-slate-100">
      <aside className="storyarc-desktop-rail" aria-label="StoryArc main navigation">
        <Link href="/apps/storyarc" className="storyarc-arcade-logo"><span>✦ NEXUS</span><strong>STORY<span>ARC</span></strong><b>Campus Arcade</b></Link>
        <Link href="/platform/dashboard" className="mx-3 mb-2 flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-300/[0.12]">← Nexus Platform</Link>
        <nav>{navItems.map(([icon, label, href]) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}><span aria-hidden="true">{icon}</span><strong>{label}</strong></Link>)}</nav>
        <Link href="/apps/storyarc/profile" className="storyarc-rail-player">
          <div className="storyarc-player-avatar">{playerName.slice(0, 1).toUpperCase()}</div><strong>{playerName}</strong><span>{roleLabel}</span>
          <div><i style={{ width: staff ? "100%" : "62%" }} /></div><small>{staff ? "Classroom ready" : "1,240 / 2,000 XP"}</small>
          <ul><li>★ <b>1,250</b></li><li>◆ <b>86</b></li></ul>
        </Link>
      </aside>
      <header className="storyarc-topbar"><div className="storyarc-topbar-inner"><Link href="/apps/storyarc" className="storyarc-brand" aria-label="Nexus StoryArc home"><span className="storyarc-brand-kicker">✦ NEXUS</span><span className="storyarc-brand-title">STORY<span>ARC</span></span><span className="storyarc-brand-subtitle">Campus Arcade / English through Indonesian school stories</span></Link><div className="storyarc-player-bar"><div className="storyarc-player-avatar">{playerName.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><strong className="block truncate text-sm text-white">{playerName}</strong><span className="text-[10px] uppercase tracking-[0.16em] text-cyan-200">{roleLabel} mode</span></div><span className="storyarc-hud-chip"><b>⚡</b> 120/120</span><Link href="/platform/dashboard" className="storyarc-icon-link" aria-label="Back to Nexus Platform">←</Link></div></div></header>
      <main className="storyarc-main-content relative min-w-0 px-2 pb-28 pt-3 sm:px-4 lg:px-5">{children}</main>
      <nav aria-label="StoryArc sections" className="storyarc-bottom-nav">{navItems.map(([icon, label, href]) => <Link key={href} href={href} className="storyarc-bottom-link" aria-current={pathname.startsWith(href) ? "page" : undefined}><span aria-hidden="true">{icon}</span><strong>{label === "Teacher Classroom" ? "Classroom" : label === "My Assignments" ? "Assignments" : label === "Digital Library" ? "Library" : label}</strong></Link>)}</nav>
    </div>
  );
}
