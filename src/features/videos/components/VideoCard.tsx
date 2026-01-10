"use client";

import { useState } from "react";
import { ArrowDownToLine, Star } from "lucide-react";
import type { SignedVideo } from "@/features/videos/services/getSignedVideos";
import { fetchAndCacheVideo } from "@/features/videos/utils/videoBlobCache";
import { VideoPlayer } from "@/features/videos/components/VideoPlayer";

type VideoCardProps = {
  video: SignedVideo;
  isFavorited: boolean;
  onToggleFavorite: () => void;
};

const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function VideoCard({
  video,
  isFavorited,
  onToggleFavorite,
}: VideoCardProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      const existingUrl = resolvedSrc;
      const downloadUrl =
        existingUrl && existingUrl.startsWith("blob:")
          ? existingUrl
          : await fetchAndCacheVideo(video.key, video.signedUrl);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = video.key.split("/").pop() ?? "sunset.mp4";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download video", error);
    }
  };

  return (
    <div className="w-full max-w-xs overflow-hidden">
      <VideoPlayer video={video} onSourceReady={setResolvedSrc} />
      <div
        className="flex items-center justify-between px-2 pt-1 pb-2 border-t border-[var(--primary)] rounded-b-lg"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--primary) 10%, transparent) 30%, color-mix(in srgb, var(--bg) 80%, transparent) 100%)",
        }}
      >
        <div className="text-sm text-[var(--text-muted)]">
          {formatDateTime(video.lastModified)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="group rounded cursor-pointer"
            aria-label="Download video"
          >
            <ArrowDownToLine
              size={18}
              className="text-[var(--text)] group-hover:text-[var(--primary)]"
            />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className="group rounded cursor-pointer"
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Star
              size={18}
              className={
                isFavorited
                  ? "text-[var(--primary-glow)]"
                  : "text-[var(--text)] group-hover:text-[var(--primary-glow)]"
              }
              fill={isFavorited ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
