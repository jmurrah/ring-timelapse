import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AUTH_ROUTES } from "@/constants/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Sign-in page: redirect authenticated users to home
  if (pathname === AUTH_ROUTES.signIn) {
    if (isAuthenticated) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Protected routes: redirect unauthenticated users to sign-in
  if (!isAuthenticated) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = AUTH_ROUTES.signIn;
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except:
    // - api/auth (NextAuth routes)
    // - _next/static, _next/image (Next.js internals)
    // - Static files (favicon, images, logos)
    "/((?!api/auth|_next/static|_next/image|favicon.ico|logos|icons|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
