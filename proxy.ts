import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes (sign-in and sign-up paths)
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Named export 'proxy' is standard for Next.js 16
export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isRoot = req.nextUrl.pathname === "/";

  // Redirect authenticated users visiting the root page '/' to '/editor'
  if (userId && isRoot) {
    return NextResponse.redirect(new URL("/editor", req.url));
  }

  // Protect all other routes unless they are public auth pages
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Matcher configuration for route interception
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[^?]+$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// Also export as default for maximum compatibility with both conventions
export default proxy;
