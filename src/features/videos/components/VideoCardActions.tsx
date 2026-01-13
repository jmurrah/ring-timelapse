import { ArrowDownToLine, Star } from "lucide-react";
import { useState } from "react";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleView = async () => {
    try {
      const existingUrl = resolvedSrc;
      const blobUrl =
        existingUrl && existingUrl.startsWith("blob:")
          ? existingUrl
          : await fetchAndCacheVideo(video.key, video.signedUrl);

      window.open(blobUrl, "_blank");
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Failed to view video", error);
    }
  };

  const handleDownload = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        setShowMobileMenu(true);
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

  const handleMobileDownload = () => {
    const downloadUrl = `/api/videos/download?key=${encodeURIComponent(video.key)}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = video.key;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowMobileMenu(false);
  };

  return (
    <>
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

      {showMobileMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--background)] rounded-t-xl shadow-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold">Video Options</h3>
            </div>
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleView}
                className="w-full p-4 text-left hover:bg-[var(--surface)] transition-colors border-b border-[var(--border)]"
              >
                <div className="text-base font-medium">View Video</div>
                <div className="text-sm text-[var(--text-muted)]">
                  Open in new tab
                </div>
              </button>
              <button
                type="button"
                onClick={handleMobileDownload}
                className="w-full p-4 text-left hover:bg-[var(--surface)] transition-colors"
              >
                <div className="text-base font-medium">Download Video</div>
                <div className="text-sm text-[var(--text-muted)]">
                  Save to device
                </div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileMenu(false)}
              className="w-full p-4 text-center font-medium text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
