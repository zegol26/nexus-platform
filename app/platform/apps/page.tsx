import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { platformApps } from "@/lib/platform/app-registry";

function formatDate(date?: Date | null) {
  if (!date) return "No expiry set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function PlatformAppsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      appAccess: {
        include: { app: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const accessBySlug = new Map(
    user.appAccess.map((access) => [access.app.slug, access])
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
          Nexus apps
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Your app access
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Apps only become usable after admin grant or a validated payment.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {platformApps.map((app) => {
          const access = accessBySlug.get(app.slug);
          const isActive = access?.status === "ACTIVE";
          return (
            <article
              key={app.slug}
              className="flex min-h-72 flex-col rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-xl shadow-slate-950/[0.04] backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isActive ? "Active" : app.status.replace("_", " ")}
                </span>
                {access && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {access.billingPlan}
                  </span>
                )}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-950">
                {app.name}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {app.description}
              </p>
              <p className="mt-5 text-sm font-semibold text-slate-500">
                Expires:{" "}
                <span className="text-slate-950">
                  {formatDate(access?.accessExpiresAt)}
                </span>
              </p>
              <Link
                href={isActive || app.status === "coming_soon" ? app.href : "/platform/dashboard"}
                className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {isActive ? "Open app" : "View status"}
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
