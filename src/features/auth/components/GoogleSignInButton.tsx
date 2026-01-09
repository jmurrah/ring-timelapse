"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "../services/authClient";

type GoogleSignInButtonProps = {
  onStarted?: () => void;
  onSettled?: () => void;
};

export default function GoogleSignInButton({
  onStarted,
  onSettled,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setErrorMessage(null);
      onStarted?.();
      await signInWithGoogle();
      router.replace("/");
    } catch (error) {
      setErrorMessage("Failed to sign in with Google. Please try again.");
      console.error("Google sign-in failed", error);
    } finally {
      onSettled?.();
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleClick}
        variant="accent"
        className="flex flex-wrap w-full gap-2 justify-center items-center cursor-pointer h-12"
      >
        <img
          src="/logos/google.svg"
          alt="Google logo"
          width={26}
          height={26}
          aria-hidden="true"
          className="bg-[var(--text)] p-0.5 rounded-sm shrink-0"
        />
        <p className="text-lg text-center text-wrap">Continue with Google</p>
      </Button>
      {errorMessage ? (
        <p className="mt-2 text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
