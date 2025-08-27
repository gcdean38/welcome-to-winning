"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginModal({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("cognito", {
        callbackUrl: "/",
        redirect: false,
      });
      
      if (result?.error) {
        if (result.error === "Invalid input: invalid challenge transition") {
          setError("Authentication session expired. Please try again.");
          // Force clear any cached state
          localStorage.removeItem("next-auth.session-token");
          sessionStorage.clear();
        } else {
          setError("Authentication failed. Please try again.");
        }
      } else if (result?.ok) {
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Client Login</h2>

        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button 
          className="login-button" 
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Login with Magic Link"}
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
