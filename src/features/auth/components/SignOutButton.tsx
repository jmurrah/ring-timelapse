"use client";

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
      className="sign-out-icon flex items-center"
    >
      <span aria-hidden className="sign-out-icon" />
    </button>
  );
}
