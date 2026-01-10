"use client";

import { useEffect, useRef, useState } from "react";
import type { SignedVideo } from "@/features/videos/services/getSignedVideos";
import {
  getCachedVideoBlob,
  fetchAndCacheVideo,
} from "@/features/videos/utils/videoBlobCache";

export enum GalleryType {
  Favorite = "favorite",
  Recent = "recent",
}

export type VideoGalleryProps = {
  galleryType: GalleryType;
  videoCount: number;
  videos: SignedVideo[];
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

type VideoCardProps = {
  video: SignedVideo;
};

function VideoCard({ video }: VideoCardProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasTriggeredCache, setHasTriggeredCache] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check IndexedDB for cached blob on mount, then set src
  useEffect(() => {
    let cancelled = false;

    const initializeSrc = async () => {
      const cachedUrl = await getCachedVideoBlob(video.key);
      if (cancelled) return;

      if (cachedUrl) {
        setSrc(cachedUrl);
        setHasTriggeredCache(true);
      } else {
        setSrc(video.signedUrl);
      }
      setIsReady(true);
    };

    void initializeSrc();

    return () => {
      cancelled = true;
    };
  }, [video.key, video.signedUrl]);

  // On play, fetch and cache blob in background (non-blocking)
  const handlePlay = () => {
    if (hasTriggeredCache) return;
    setHasTriggeredCache(true);

    // Fetch and cache in background - don't block playback
    void fetchAndCacheVideo(video.key, video.signedUrl).then((blobUrl) => {
      if (blobUrl.startsWith("blob:")) {
        setSrc(blobUrl);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: "16 / 9" }}
      >
        {isReady && src ? (
          <video
            ref={videoRef}
            className="block h-full w-full bg-black object-contain"
            src={src}
            controls
            preload="metadata"
            onPlay={handlePlay}
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <div className="px-3 py-3 text-xs">
        <div className="text-gray-400">
          {formatDateTime(video.lastModified)}
        </div>
      </div>
    </div>
  );
}

export default function VideoGallery({
  galleryType,
  videoCount,
  videos,
}: VideoGalleryProps) {
  const displayVideos = videos.slice(0, videoCount);
  const emptyStateText =
    galleryType === GalleryType.Favorite
      ? "No favorite videos to display."
      : "No videos to display.";

  if (displayVideos.length === 0) {
    return <div className="text-sm text-gray-400">{emptyStateText}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {displayVideos.map((video) => (
        <VideoCard key={video.key} video={video} />
      ))}
    </div>
  );
}
