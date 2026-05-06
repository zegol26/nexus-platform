import { readFile } from "fs/promises";
import path from "path";
import type { ReactNode } from "react";
import { AdminSection } from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] font-semibold text-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    listItems = [];
    nodes.push(
      <ul key={`list-${nodes.length}`} className="my-4 list-disc space-y-2 pl-6 text-sm leading-6 text-slate-700">
        {items.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
  };

  const flushCode = () => {
    const code = codeLines.join("\n");
    codeLines = [];
    nodes.push(
      <pre key={`code-${nodes.length}`} className="my-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        <code>{code}</code>
      </pre>,
    );
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode();
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (!line.trim()) return;

    if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={`h1-${nodes.length}`} className="text-3xl font-semibold tracking-tight text-slate-950">
          {renderInline(line.slice(2))}
        </h1>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="mt-8 border-t border-slate-200 pt-6 text-xl font-semibold text-slate-950">
          {renderInline(line.slice(3))}
        </h2>,
      );
      return;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="mt-6 text-base font-semibold text-slate-950">
          {renderInline(line.slice(4))}
        </h3>,
      );
      return;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} className="my-4 text-sm leading-7 text-slate-700">
        {renderInline(line)}
      </p>,
    );
  });

  flushList();
  if (inCodeBlock) flushCode();

  return nodes;
}

export default async function AdminArchitecturePage() {
  const architecturePath = path.join(process.cwd(), "app", "admin", "architecture", "NEXUS_ARCHITECTURE.md");
  const releaseNotesPath = path.join(process.cwd(), "app", "admin", "architecture", "RELEASE_NOTES.md");
  const [architectureMarkdown, releaseNotesMarkdown] = await Promise.all([
    readFile(architecturePath, "utf8"),
    readFile(releaseNotesPath, "utf8"),
  ]);

  return (
    <AdminSection title="Architecture" description="Codebase architecture, backend boundaries, and UI map for Nexus Platform operations.">
      <div className="space-y-4">
        <details className="rounded-2xl border border-slate-200 bg-slate-50" open>
          <summary className="cursor-pointer list-none px-5 py-4">
            <div>
              <p className="text-base font-semibold text-slate-950">Release Notes</p>
              <p className="mt-1 text-sm text-slate-500">Current release gate status and deployment checklist.</p>
            </div>
          </summary>
          <article className="border-t border-slate-200 bg-white px-5 py-4">{renderMarkdown(releaseNotesMarkdown)}</article>
        </details>

        <details className="rounded-2xl border border-slate-200 bg-slate-50">
          <summary className="cursor-pointer list-none px-5 py-4">
            <div>
              <p className="text-base font-semibold text-slate-950">Architecture Markdown</p>
              <p className="mt-1 text-sm text-slate-500">Backend, UI, admin, billing, trial, and deployment architecture.</p>
            </div>
          </summary>
          <article className="border-t border-slate-200 bg-white px-5 py-4">{renderMarkdown(architectureMarkdown)}</article>
        </details>
      </div>
    </AdminSection>
  );
}
