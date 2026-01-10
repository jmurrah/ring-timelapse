"use client";

import { LogOut } from "lucide-react";
import { signOutFromApp } from "../services/authClient";

type SignOutButtonProps = {
  ariaLabel?: string;
};

export default function SignOutButton({
  ariaLabel = "Sign out",
}: SignOutButtonProps) {
  const handleClick = async () => {
    try {
      await signOutFromApp();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="flex items-center text-[var(--text)] cursor-pointer hover:text-[var(--primary)]"
    >
      <LogOut aria-hidden size={20} />
    </button>
  );
}
