import { NextResponse } from "next/server";
import { signR2GetObjectUrl } from "@/lib/r2/signGetObject";
import { isValidVideoKey } from "@/features/videos/utils/validateVideoKey";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

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
    // Get signed URL for the video
    const { url } = await signR2GetObjectUrl(key, 300); // 5 minute expiry

    // Get Range header from client (iOS Safari sends this for video playback)
    const rangeHeader = request.headers.get("range");

    // Fetch the video from R2, passing through Range header
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(url, {
      headers: fetchHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body from R2");
    }

    // Check if this is a download request or view request
    const forceDownload = searchParams.get("download") === "1";

    // Build response headers
    const responseHeaders: HeadersInit = {
      "Content-Type": "video/mp4",
      "Content-Disposition": forceDownload
        ? `attachment; filename="${key}"`
        : `inline; filename="${key}"`,
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": "bytes",
    };

    // Pass through content length
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    // Pass through Content-Range for 206 responses (critical for iOS)
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    // Use the same status code as R2 response (200 or 206)
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Failed to download video", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 },
    );
  }
}
