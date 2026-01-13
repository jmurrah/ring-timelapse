import { ArrowDownToLine, Star } from "lucide-react";
import type { SignedVideo } from "@/features/videos/services/getSignedVideos";
import { fetchAndCacheVideo } from "@/features/videos/utils/videoBlobCache";

type VideoCardActionsProps = {
  video: SignedVideo;
  resolvedSrc: string | null;
  isFavorited: boolean;
  onToggleFavorite: () => void;
};

export function VideoCardActions({
  video,
  resolvedSrc,
  isFavorited,
  onToggleFavorite,
}: VideoCardActionsProps) {
  const handleDownload = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, generate a short-lived download URL (5 minutes)
        // This works with iOS Safari's download/view dialog
        const response = await fetch(
          `/api/videos/download-url?key=${encodeURIComponent(video.key)}`,
          {
            credentials: "same-origin",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to get download URL: ${response.status}`);
        }

        const { downloadUrl } = await response.json();

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = video.key;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const existingUrl = resolvedSrc;
      const downloadUrl =
        existingUrl && existingUrl.startsWith("blob:")
          ? existingUrl
          : await fetchAndCacheVideo(video.key, video.signedUrl);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = video.key;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download video", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
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
  );
}
