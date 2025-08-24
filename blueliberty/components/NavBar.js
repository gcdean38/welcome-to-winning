"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoginModal from "./LoginModal";

export default function NavBar() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="header">
      {/* Logo + Title clickable together */}
      <Link href="/" className="flex items-center space-x-2 logo" style={{ textDecoration: "none" }}>
        <img 
          src="/blue_liberty_logo_navy.png" 
          alt="Blue Liberty Analytics Navy Logo" 
          style={{ height: "40px" }}
        />
        <span style={{ color: "var(--dark-carolina)", fontWeight: "bold", fontSize: "1.2rem" }}>
          Blue Liberty Analytics
        </span>
      </Link>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <Link href="/" className={`nav-tab ${pathname === "/" ? "active" : ""}`}>
          Home
        </Link>
        <Link href="/services" className={`nav-tab ${pathname === "/services" ? "active" : ""}`}>
          Services
        </Link>
        <Link href="/about" className={`nav-tab ${pathname === "/about" ? "active" : ""}`}>
          About Us
        </Link>
        {/* Client Login styled the same */}
        <button 
          className="nav-tab" 
          onClick={() => setIsLoginOpen(true)}
        >
          Client Login
        </button>
      </nav>

      {/* Modal in center */}
      {isLoginOpen && (
        <LoginModal onClose={() => setIsLoginOpen(false)} />
      )}
    </header>
  );
}
