import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUTH_ROUTES } from "@/constants/auth";
import ServerVideoGallery from "@/features/videos/components/ServerVideoGallery";
import { GalleryType } from "@/features/videos/components/VideoGallery";
import { getSignedVideos } from "@/features/videos/services/getSignedVideos";

export default async function SunsetsPage() {
  const session = await auth();
  if (!session) {
    redirect(AUTH_ROUTES.signIn);
  }

  const signedVideos = await getSignedVideos({ pageSize: 24 });

  return (
    <div className="w-full h-full flex flex-col gap-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl">Sunsets</h1>
        <p className="text-gray-400">Browse the archive of captured sunsets.</p>
      </div>

      <ServerVideoGallery
        galleryType={GalleryType.Recent}
        videoCount={24}
        videos={signedVideos}
      />
    </div>
  );
}
