import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { isAdminRole } from "@/lib/platform/access";
import { PrintCertificateButton } from "@/components/certificates/PrintCertificateButton";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const { certificateId } = await params;
  const [viewer, certificate] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    }),
    prisma.courseCertificate.findUnique({
      where: { certificateId },
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);

  if (!viewer || !certificate) {
    notFound();
  }

  if (certificate.userId !== viewer.id && !isAdminRole(viewer.role)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-5xl justify-end gap-3 print:hidden">
        <Link
          href="/platform/dashboard"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold"
        >
          Dashboard
        </Link>
        <PrintCertificateButton />
      </div>

      <section className="mx-auto grid aspect-[1.414/1] max-w-5xl place-items-center border-[14px] border-blue-950 bg-white p-10 shadow-2xl print:max-w-none print:border-[10px] print:shadow-none">
        <div className="h-full w-full border-2 border-amber-400 p-10 text-center">
          <div className="mx-auto flex items-center justify-center gap-4">
            <Image
              src="/nexus-ai-logo.png"
              alt="Nexus Talenta Indonesia"
              width={72}
              height={72}
              className="h-16 w-16 object-contain"
            />
            <div className="text-left">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-800">
                Nexus Talenta Indonesia Academy
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Delivered by Nexus Talenta Indonesia Academy
              </p>
            </div>
          </div>

          <p className="mt-12 text-sm font-black uppercase tracking-[0.32em] text-amber-600">
            Diploma Certificate
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-normal text-blue-950">
            Certificate of Completion
          </h1>
          <p className="mt-8 text-sm text-slate-600">This certificate is proudly presented to</p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">
            {certificate.displayName}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-slate-600">
            for successfully completing the academy course
          </p>
          <p className="mt-3 text-2xl font-black text-blue-900">
            {certificate.courseName}
          </p>

          <div className="mt-12 grid grid-cols-3 items-end gap-8 text-sm">
            <div>
              <p className="border-t border-slate-400 pt-2 font-bold">
                {formatDate(certificate.issuedAt)}
              </p>
              <p className="text-xs text-slate-500">Completion date</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-2 font-bold">
                {certificate.certificateId}
              </p>
              <p className="text-xs text-slate-500">Certificate ID</p>
            </div>
            <div>
              <p className="border-t border-slate-400 pt-2 font-bold">
                Nexus Talenta Indonesia Academy
              </p>
              <p className="text-xs text-slate-500">Institution</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
