import VideoGallery, {
  GalleryType,
} from "@/features/videos/components/VideoGallery";
import type { SignedVideo } from "@/features/videos/services/getSignedVideos";

type ServerVideoGalleryProps = {
  videos: SignedVideo[];
  videoCount: number;
  galleryType: GalleryType;
};

export default function ServerVideoGallery({
  videos,
  videoCount,
  galleryType,
}: ServerVideoGalleryProps) {
  return (
    <VideoGallery
      videos={videos}
      videoCount={videoCount}
      galleryType={galleryType}
    />
  );
}
