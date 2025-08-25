// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const { pathname } = req.nextUrl;

    // Protect /admin
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect /client
    if (pathname.startsWith("/client") && token?.role !== "client") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow requests that *have a token*
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply only to protected routes
export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
