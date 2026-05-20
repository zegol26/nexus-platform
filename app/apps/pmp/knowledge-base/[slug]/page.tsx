import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code class="kb-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderArticleContent(content: string): string {
  const lines = escapeHtml(content).split("\n");
  const out: string[] = [];
  let inList = false;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      out.push("</tbody></table></div>");
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      closeList();
      closeTable();
      continue;
    }

    // Headings
    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      closeTable();
      const level = Math.min(heading[1].length, 4);
      out.push(`<h${level} class="kb-h${level}">${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    // Tables
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isSeparator = cells.every((c) => /^:?-{2,}:?$/.test(c));
      if (!inTable && !isSeparator) {
        closeList();
        inTable = true;
        out.push(
          `<div class="kb-table-wrap"><table class="kb-table"><thead><tr>${cells
            .map((c) => `<th>${renderInline(c)}</th>`)
            .join("")}</tr></thead><tbody>`
        );
        continue;
      }
      if (inTable && isSeparator) continue;
      if (inTable) {
        out.push(
          `<tr>${cells.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`
        );
        continue;
      }
    } else if (inTable) {
      closeTable();
    }

    // Bullets
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul class="kb-list">');
        inList = true;
      }
      out.push(`<li>${renderInline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    } else if (inList) {
      closeList();
    }

    // Paragraph
    out.push(`<p class="kb-p">${renderInline(line)}</p>`);
  }

  closeList();
  closeTable();
  return out.join("\n");
}

export default async function PmpKnowledgeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.pmpKnowledgeArticle.findUnique({ where: { slug } });
  if (!article || !article.isActive) notFound();

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <Link href="/apps/pmp/knowledge-base" className="text-sm font-semibold text-cyan-300">
        ← Back to Knowledge Base
      </Link>
      <header className="rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-950/40 via-slate-900 to-cyan-950/30 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-200">
          {article.category} / {article.examVersion}
          {article.domain ? ` · ${article.domain}` : ""}
          {article.approach && article.approach !== "general" ? ` · ${article.approach}` : ""}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{article.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{article.summary}</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div
          className="kb-content"
          dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }}
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
        <h2 className="font-semibold text-white">Key Takeaways</h2>
        <ul className="mt-3 grid gap-2">
          {article.keyTakeaways.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-cyan-100">
              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {article.studyTip ? (
          <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/[0.06] p-4 text-sm font-semibold text-amber-100">
            <span className="mr-2 uppercase tracking-[0.18em] text-amber-200/80">Andromeda tip ✦</span>
            {article.studyTip}
          </p>
        ) : null}
      </section>

      <style>{`
        .kb-content .kb-h2 { font-size: 1.35rem; font-weight: 600; color: #fff; margin: 1.4rem 0 0.6rem; }
        .kb-content .kb-h3 { font-size: 1.1rem; font-weight: 600; color: #fff; margin: 1rem 0 0.4rem; }
        .kb-content .kb-h4 { font-size: 0.98rem; font-weight: 600; color: rgb(226 232 240); margin: 0.8rem 0 0.3rem; }
        .kb-content .kb-p { color: rgb(203 213 225); font-size: 0.95rem; line-height: 1.75; margin: 0.5rem 0; }
        .kb-content .kb-list { color: rgb(203 213 225); font-size: 0.95rem; line-height: 1.75; margin: 0.5rem 0 0.5rem 1.2rem; list-style: disc; }
        .kb-content .kb-list li { margin: 0.25rem 0; }
        .kb-content .kb-code { background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85em; color: #f0abfc; }
        .kb-content strong { color: #fff; }
        .kb-content em { color: rgb(226 232 240); font-style: italic; }
        .kb-content .kb-table-wrap { margin: 0.8rem 0; overflow-x: auto; }
        .kb-content .kb-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .kb-content .kb-table th, .kb-content .kb-table td { padding: 0.5rem 0.7rem; border: 1px solid rgba(255,255,255,0.1); text-align: left; color: rgb(226 232 240); vertical-align: top; }
        .kb-content .kb-table th { background: rgba(167,139,250,0.12); color: #fff; font-weight: 600; }
      `}</style>
    </article>
  );
}
