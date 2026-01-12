"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Maximize2, Pause, Play } from "lucide-react";
import type { SignedVideo } from "@/features/videos/services/getSignedVideos";
import {
  getCachedVideoBlob,
  fetchAndCacheVideo,
} from "@/features/videos/utils/videoBlobCache";
import { generatePosterFromVideo } from "@/features/videos/utils/generatePoster";

// Extend HTMLVideoElement to include webkit fullscreen methods
interface WebKitHTMLVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
}

type VideoPlayerProps = {
  video: SignedVideo;
  onSourceReady?: (src: string) => void;
};

export function VideoPlayer({ video, onSourceReady }: VideoPlayerProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasTriggeredCache, setHasTriggeredCache] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const initializeSrc = async () => {
      try {
        const cachedUrl = await getCachedVideoBlob(video.key);
        if (cancelled) return;

        const resolved = cachedUrl || video.signedUrl;
        // Only add #t=0.001 fragment to signed URLs (not blob URLs) to hint Safari to load first frame
        const srcWithFragment =
          resolved.startsWith("blob:") || resolved.includes("#")
            ? resolved
            : `${resolved}#t=0.001`;
        setSrc(srcWithFragment);
        setIsReady(true);
        onSourceReady?.(resolved);
      } catch (error) {
        console.error("Failed to initialize video src:", error);
        // Fallback to signed URL on error
        if (!cancelled) {
          const fallbackSrc = video.signedUrl.includes("#")
            ? video.signedUrl
            : `${video.signedUrl}#t=0.001`;
          setSrc(fallbackSrc);
          setIsReady(true);
          onSourceReady?.(video.signedUrl);
        }
      }
    };

    void initializeSrc();

    return () => {
      cancelled = true;
    };
  }, [onSourceReady, video.key, video.signedUrl]);

  // Generate poster image when we have a blob URL and metadata is loaded
  useEffect(() => {
    if (!src || !src.startsWith("blob:") || !isReady || duration === 0) {
      return;
    }

    let cancelled = false;

    const generatePoster = async () => {
      try {
        // Wait a bit to ensure video has fully loaded before generating poster
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (cancelled) return;

        const response = await fetch(src);
        const blob = await response.blob();
        if (cancelled) return;

        const poster = await generatePosterFromVideo(blob);
        if (cancelled) return;

        if (poster) {
          setPosterImage(poster);
        }
      } catch (error) {
        console.error("Failed to generate poster:", error);
      }
    };

    void generatePoster();

    return () => {
      cancelled = true;
    };
  }, [src, isReady, duration]);

  // Cleanup blob URL on unmount only (not on src change)
  useEffect(() => {
    const currentSrc = src;
    return () => {
      if (currentSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(currentSrc);
      }
    };
  }, []); // Only run on mount/unmount

  const togglePlayback = () => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      // Trigger caching in background for future use (but don't switch src mid-playback)
      if (!hasTriggeredCache) {
        setHasTriggeredCache(true);
        void fetchAndCacheVideo(video.key, video.signedUrl);
      }

      // Play immediately from current src
      void element.play().catch((error) => {
        console.error("Unable to start playback", error);
      });
    } else {
      element.pause();
    }
  };

  const handleLoadedMetadata = () => {
    const element = videoRef.current;
    if (!element) return;
    setDuration(element.duration || 0);
  };

  const handleTimeUpdate = () => {
    const element = videoRef.current;
    if (!element) return;
    setCurrentTime(element.currentTime);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const element = videoRef.current;
    if (!element) return;

    const newTime = Number(event.target.value);
    element.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    const video = videoRef.current as WebKitHTMLVideoElement | null;
    if (!video) return;

    // iOS Safari requires webkitEnterFullscreen on the video element
    if (
      "webkitEnterFullscreen" in video &&
      typeof video.webkitEnterFullscreen === "function"
    ) {
      try {
        video.webkitEnterFullscreen();
        return;
      } catch (error) {
        console.error("webkitEnterFullscreen failed:", error);
      }
    }

    // Standard fullscreen API for other browsers
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void container.requestFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      {isReady && src ? (
        <video
          ref={videoRef}
          className="block h-full w-full bg-black object-contain"
          src={src}
          poster={posterImage || undefined}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => {
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            const videoElement = e.currentTarget;
            const errorDetails = {
              code: videoElement.error?.code,
              message: videoElement.error?.message,
              src: src,
              networkState: videoElement.networkState,
              readyState: videoElement.readyState,
            };
            console.error("Video error details:", errorDetails);

            // MediaError codes: 1=ABORTED, 2=NETWORK, 3=DECODE, 4=NOT_SUPPORTED
            if (videoElement.error?.code) {
              console.error(`Media error code ${videoElement.error.code}`);
            }

            // Try to recover by using signed URL if blob fails
            if (src.startsWith("blob:")) {
              console.log("Blob URL failed, attempting fallback to signed URL");
              const fallbackSrc = video.signedUrl.includes("#")
                ? video.signedUrl
                : `${video.signedUrl}#t=0.001`;
              setSrc(fallbackSrc);
            }
          }}
          preload="metadata"
          playsInline
        />
      ) : (
        <div className="h-full w-full" />
      )}
      {/* Click-to-play overlay - stops before control bar */}
      <div
        className="absolute inset-x-0 top-0 cursor-pointer"
        style={{ bottom: "56px", transform: "translateZ(1px)" }}
        onPointerUp={togglePlayback}
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      />

      {/* Center play button */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 20, transform: "translateZ(2px)" }}
        >
          <div
            onPointerUp={togglePlayback}
            className="pointer-events-auto flex items-center justify-center rounded-full p-4 text-[var(--text)] hover:text-[var(--primary)] cursor-pointer"
            style={{
              backgroundColor: "var(--surface2)",
              transform: "translateZ(1px)",
            }}
            role="button"
            tabIndex={0}
            aria-label="Play video"
          >
            <Play size={28} />
          </div>
        </div>
      )}

      {/* Control bar */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-2"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--surface) 80%, transparent) 40%, var(--surface) 100%)",
          zIndex: 20,
          transform: "translateZ(2px)",
        }}
      >
        <div
          onPointerUp={togglePlayback}
          className="flex shrink-0 items-center justify-center rounded-full text-[var(--text)] hover:text-[var(--primary)] cursor-pointer"
          style={{
            width: "32px",
            height: "40px",
          }}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full cursor-pointer"
          style={{ accentColor: "var(--primary)" }}
        />
        <div
          onPointerUp={handleFullscreen}
          className="flex shrink-0 items-center justify-center rounded-full text-[var(--text)] hover:text-[var(--primary)] cursor-pointer"
          style={{
            width: "32px",
            height: "40px",
          }}
          role="button"
          tabIndex={0}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={18} />
        </div>
      </div>
    </div>
  );
}
