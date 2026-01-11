import { signIn, signOut } from "next-auth/react";
import { AUTH_ROUTES } from "@/constants/auth";

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", {
    callbackUrl: "/",
    redirect: true, // Explicitly use redirect flow for Safari compatibility
  });
}

export async function signOutFromApp(): Promise<void> {
  await signOut({ callbackUrl: AUTH_ROUTES.signIn });
}
