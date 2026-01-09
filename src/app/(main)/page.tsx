import SignOutButton from "@/features/auth/components/SignOutButton";

export default function HomePage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1>ring-timelapse</h1>
      <p>Next.js app scaffold. Add your UI here.</p>
      <SignOutButton />
    </div>
  );
}
