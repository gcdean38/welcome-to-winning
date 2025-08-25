// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const { pathname } = req.nextUrl;

    // Protect /admin
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect /client
    if (pathname.startsWith("/client") && token.role !== "client") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Ensure the token is available in middleware
      authorized: ({ token }) => !!token,
    },
  }
);

// Apply only to these routes
export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
};
