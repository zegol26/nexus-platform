import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { JohnChatClient } from "@/components/apps/english/john/JohnChatClient";
import { findModule, findPersona } from "@/lib/english/dce";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  level?: string;
  module?: string;
  roleplay?: string;
}>;

export default async function JohnChatPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const params = await searchParams;
  let initialRoleplay = undefined;

  if (params.level && params.module && params.roleplay) {
    const lookup = findModule(params.level, params.module);
    if (lookup) {
      const roleplay = lookup.module.roleplay.find(
        (rp) => rp.id === params.roleplay
      );
      const persona = roleplay ? findPersona(roleplay.personaSlug) : undefined;
      if (roleplay && persona) {
        initialRoleplay = {
          personaSlug: persona.slug,
          personaName: persona.name,
          scenario: roleplay.scenario,
          goal: roleplay.goal,
          cefrLevel: lookup.level.level === "C1" ? "C1" : lookup.level.level === "B1_B2" ? "B2" : "A2",
        };
      }
    }
  }

  return <JohnChatClient initialRoleplay={initialRoleplay} />;
}
