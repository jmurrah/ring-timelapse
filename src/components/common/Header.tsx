import Link from "next/link";
import SignOutButton from "@/features/auth/components/SignOutButton";

export default function Header() {
  return (
    <header className="w-full mb-4">
      <div className="w-fill flex justify-between items-center">
        <Link href="/" className="text-[var(--primary)] text-3xl">
          <h1>analemma</h1>
        </Link>
        <div className="flex justify-center gap-8 text-lg items-center">
          <Link href="/" className="link-underline">
            Home
          </Link>
          <Link href="/sunsets" className="link-underline">
            Sunsets
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
