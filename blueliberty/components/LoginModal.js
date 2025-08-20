"use client";

import { useState } from "react";

export default function LoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Login Button */}
      <button className="login-btn" onClick={() => setIsOpen(true)}>
        Login
      </button>

      {/* Debug message */}
      {isOpen && <p style={{ color: "red" }}>Modal Open ✅</p>}

      {/* Modal */}
      {isOpen && (
        <div className="modal" onClick={() => setIsOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // stop closing when clicking inside
          >
            <span className="close" onClick={() => setIsOpen(false)}>
              &times;
            </span>
            <h2 style={{ textAlign: "center", color: "var(--dark-carolina)" }}>
              Client Login
            </h2>
            <form className="login-form">
              <input type="email" placeholder="Email Address" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
            <a
              href="https://calendly.com/bluelibertyanalytics/30min"
              target="_blank"
              className="schedule-link"
            >
              📅 Schedule a Meeting
            </a>
          </div>
        </div>
      )}
    </>
  );
}
