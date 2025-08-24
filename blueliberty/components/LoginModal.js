"use client";

import { signIn } from "next-auth/react";

export default function LoginModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Client Login</h2>

        <button 
          className="login-button" 
          onClick={() => signIn("cognito")}
        >
          Login with Magic Link
        </button>

        {/* Calendly link */}
        <a 
          href="https://calendly.com/bluelibertyanalytics/30min" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="calendly-link"
        >
          Schedule a Meeting
        </a>
      </div>
    </div>
  );
}
