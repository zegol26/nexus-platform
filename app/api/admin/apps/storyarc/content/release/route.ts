import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  checkStoryArcCanonicalRelease,
  publishStoryArcCanonicalRelease,
} from "@/lib/storyarc/content/release";

export const maxDuration = 300;

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const action = body?.action;
  if (action === "check") {
    const result = await checkStoryArcCanonicalRelease(admin.id);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  }
  if (action !== "publish") {
    return NextResponse.json({ error: "Action must be check or publish." }, { status: 400 });
  }
  if (body?.confirmation !== "PUBLISH_STORYARC_90") {
    return NextResponse.json(
      { error: "Publication confirmation is required." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await publishStoryArcCanonicalRelease(admin.id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "StoryArc publication failed." },
      { status: 409 },
    );
  }
}
