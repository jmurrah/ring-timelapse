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
        // Try native share API first (best iOS experience)
        if (navigator.share) {
          try {
            // Fetch the video as a blob so we can share it
            const response = await fetch(video.signedUrl);
            const blob = await response.blob();
            const file = new File([blob], video.key, { type: "video/mp4" });

            await navigator.share({
              files: [file],
              title: video.key,
            });
            return;
          } catch (shareError) {
            // User cancelled or share failed, fall through to link approach
            console.log("Share cancelled or failed:", shareError);
          }
        }

        // Fallback: Show a link for user to tap (required for iOS download dialog)
        const link = document.createElement("a");
        link.href = video.signedUrl;
        link.download = video.key;
        link.textContent = "Tap to download";
        link.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          background: var(--background);
          color: var(--text);
          padding: 16px 24px;
          border-radius: 8px;
          border: 2px solid var(--primary);
          font-size: 18px;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        const backdrop = document.createElement("div");
        backdrop.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
        `;

        const cleanup = () => {
          link.remove();
          backdrop.remove();
        };

        backdrop.onclick = cleanup;
        link.onclick = () => {
          setTimeout(cleanup, 100);
        };

        document.body.appendChild(backdrop);
        document.body.appendChild(link);
        return;
      }

      // Desktop: use cached blob for efficiency
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
