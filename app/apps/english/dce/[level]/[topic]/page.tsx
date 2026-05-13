import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { findModule, getNextEnglishCourseItem } from "@/lib/english/dce";
import { DceLessonClient } from "@/components/apps/english/dce/DceLessonClient";

export const dynamic = "force-dynamic";

type Params = Promise<{ level: string; topic: string }>;

export default async function DceModulePage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const { level: levelId, topic } = await params;
  const lookup = findModule(levelId, topic);
  if (!lookup) notFound();

  const nextItem = getNextEnglishCourseItem(lookup.level.level, lookup.module.slug);

  return <DceLessonClient level={lookup.level} module={lookup.module} nextItem={nextItem} />;
}
