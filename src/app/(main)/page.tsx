import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUTH_ROUTES } from "@/constants/auth";
import { locationEnv } from "@/config/env.server";
import SunsetCountdown from "@/features/sunlight/components/SunsetCountdown";
import ServerVideoGallery from "@/features/videos/components/ServerVideoGallery";
import { GalleryType } from "@/features/videos/components/VideoGallery";
import { getSignedVideos } from "@/features/videos/services/getSignedVideos";
import { getTimes } from "@/utils/astronomy/solarLunar";

export default async function HomePage() {
  const session = await auth();
  if (!session) {
    redirect(AUTH_ROUTES.signIn);
  }

  const sunTimes = getTimes(
    new Date(),
    locationEnv.latitude,
    locationEnv.longitude,
  );
  const sunsetTime = sunTimes.sunset;

  if (!(sunsetTime instanceof Date)) {
    throw new Error("Unable to determine today's sunset time");
  }

  const signedVideos = await getSignedVideos({ pageSize: 5 });

  return (
    <div className="w-full h-full flex flex-col gap-12">
      <SunsetCountdown
        location={locationEnv}
        sunsetIso={sunsetTime.toISOString()}
      />
      <div className="w-full text-center">
        <h1 className="text-3xl">Live View</h1>
        <div>
          <p>this is where the live view is</p>
        </div>
      </div>
      <div className="flex flex-col gap-12">
        <div className="w-full text-center">
          <h1 className="text-2xl">Recent Sunsets</h1>
          <ServerVideoGallery
            galleryType={GalleryType.Recent}
            videoCount={5}
            videos={signedVideos}
          />
        </div>
      </div>
    </div>
  );
}
