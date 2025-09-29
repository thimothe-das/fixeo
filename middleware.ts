import { signToken, verifyToken } from "@/lib/auth/session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Route protection configuration
const protectedRoutes = ["/workspace", "/account", "workspace/dashboard"];

// Get the production URL - this should be your actual domain in production
function getProductionUrl(): string {
  // In production, this should be your actual domain
  // You can set PRODUCTION_URL environment variable or use VERCEL_URL
  return (
    process.env.PRODUCTION_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  );
}

// Check if we should replace localhost URLs
function shouldReplaceLocalhostUrl(request: NextRequest): boolean {
  const isProduction = process.env.NODE_ENV === "production";
  const hasLocalhostInUrl = request.url.includes("localhost:3000");
  const productionUrl = getProductionUrl();

  return (
    isProduction &&
    hasLocalhostInUrl &&
    !productionUrl.includes("localhost:3000")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle localhost URL replacement in production
  if (shouldReplaceLocalhostUrl(request)) {
    const productionUrl = getProductionUrl();
    const newUrl = request.url.replace(
      /http:\/\/localhost:3000/g,
      productionUrl
    );

    console.log(
      `[Middleware] Redirecting localhost URL to production: ${request.url} -> ${newUrl}`
    );
    return NextResponse.redirect(newUrl);
  }

  const sessionCookie = request.cookies.get("session");
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Basic authentication check
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      // Refresh session token
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};
