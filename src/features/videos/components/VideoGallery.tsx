"use client";

import type { SignedVideo } from "@/features/videos/services/getSignedVideos";
import { useFavorites } from "@/features/favorites/hooks/useFavorites";
import { VideoCard } from "@/features/videos/components/VideoCard";

export type VideoGalleryProps = {
  videos: SignedVideo[];
  emptyMessage?: string;
};

export default function VideoGallery({
  videos,
  emptyMessage = "No videos to display.",
}: VideoGalleryProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (videos.length === 0) {
    return (
      <div className="text-sm text-[var(--text-muted)]">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3">
      {videos.map((video) => (
        <VideoCard
          key={video.key}
          video={video}
          isFavorited={isFavorite(video.key)}
          onToggleFavorite={() => toggleFavorite(video.key)}
        />
      ))}
    </div>
  );
}
