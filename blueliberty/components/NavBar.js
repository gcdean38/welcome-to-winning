"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="logo">
        <img src="/blue_liberty_logo_navy.png" alt="Blue Liberty Analytics Navy Logo" />
        <span style={{ color: "var(--black)" }}>Blue Liberty Analytics</span>
      </div>
      <nav className="nav-tabs">
        <Link href="/" className={`nav-tab ${pathname === "/" ? "active" : ""}`}>
          Home
        </Link>
        <Link href="/services" className={`nav-tab ${pathname === "/services" ? "active" : ""}`}>
          Services
        </Link>
        <Link href="/experience" className={`nav-tab ${pathname === "/experience" ? "active" : ""}`}>
          Experience
        </Link>
      </nav>
      <LoginModal /> {/* 👈 replaces old Login button */}
    </header>
  );
}
