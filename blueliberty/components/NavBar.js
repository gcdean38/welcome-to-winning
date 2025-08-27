"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="header">
      {/* Logo + Title */}
      <Link
        href="/"
        className="flex items-center space-x-2 logo"
        style={{ textDecoration: "none" }}
      >
        <img
          src="/blue_liberty_logo_navy.png"
          alt="Blue Liberty Analytics Navy Logo"
          style={{ height: "40px" }}
        />
        <span
          style={{
            color: "var(--dark-carolina)",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          Blue Liberty Analytics
        </span>
      </Link>

      {/* If not signed in → normal nav */}
      {!session ? (
        <>
          <nav className="nav-tabs">
            <Link
              href="/"
              className={`nav-tab ${pathname === "/" ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`nav-tab ${
                pathname === "/services" ? "active" : ""
              }`}
            >
              Services
            </Link>
            <Link
              href="/about"
              className={`nav-tab ${pathname === "/about" ? "active" : ""}`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className={`nav-tab ${pathname === "/contact" ? "active" : ""}`}
            >
              Contact
            </Link>
          </nav>
          <button className="login-btn" onClick={() => signIn("cognito")}>
            Login
          </button>
          
        </>
      ) : (
        // If signed in → show greeting + sign out
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span style={{ color: "var(--white)", fontWeight: "600" }}>
            Hi, {session.user?.firstName || session.user?.email}!
          </span>
          <button className="login-btn" onClick={() => signOut({ 
            callbackUrl: "/",
            redirect: true 
          })}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
