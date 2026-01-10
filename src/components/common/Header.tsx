import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "@/features/auth/components/SignOutButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="mb-4 w-full">
      <div className="w-fill flex items-center justify-between">
        <Link href="/" className="text-3xl text-[var(--primary)]">
          <h1>analemma</h1>
        </Link>
        {session && (
          <div className="flex items-center justify-center gap-8 text-lg">
            <Link href="/" className="link-underline">
              Home
            </Link>
            <Link href="/sunsets" className="link-underline">
              Sunsets
            </Link>
            <SignOutButton />
          </div>
        )}
      </div>
    </header>
  );
}
