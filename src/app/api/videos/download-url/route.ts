import { NextResponse } from "next/server";
import { signR2GetObjectUrl } from "@/lib/r2/signGetObject";
import { isValidVideoKey } from "@/features/videos/utils/validateVideoKey";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

/**
 * Generates a short-lived download URL for a video
 * This allows mobile devices to download without exposing long-lived credentials
 */
export async function GET(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Missing key parameter" },
      { status: 400 },
    );
  }

  if (!isValidVideoKey(key)) {
    return NextResponse.json({ error: "Invalid video key" }, { status: 400 });
  }

  try {
    // Generate a short-lived presigned URL (5 minutes)
    const { url } = await signR2GetObjectUrl(key, 300);

    return NextResponse.json({ downloadUrl: url });
  } catch (error) {
    console.error("Failed to generate download URL", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}
