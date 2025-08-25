"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      organization: e.target.organization.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        e.target.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        padding: "2rem",
        background: "var(--white)",
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
      }}
    >
      <h1 style={{ color: "var(--dark-carolina)", marginBottom: "1.5rem" }}>
        Contact Blue Liberty Analytics
      </h1>
      <p style={{ color: "var(--dark-carolina)", marginBottom: "1.5rem" }}>Schedule a meeting or reach out to our team to get start with Blue Liberty Analytics!</p>

      {/* 📅 Schedule a Meeting Button */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <a
          href="https://calendly.com/bluelibertyanalytics/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="schedule-btn"
        >
          📅 Schedule a Meeting
        </a>
      </div>

      {/* Contact Form */}
      <form id="contactForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <input type="text" name="name" placeholder="Your Name" required />
        </div>
        <div className="form-group">
          <input type="email" name="email" placeholder="Your Email" required />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="organization"
            placeholder="Campaign/Organization"
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="message"
            placeholder="Tell us about your campaign and analytics needs..."
            required
          />
        </div>
        <button type="submit" className="submit-btn" style={{ marginTop: "1rem" }}>
          Send Inquiry
        </button>
      </form>

      {status === "loading" && <p>Sending...</p>}
      {status === "success" && (
        <p style={{ color: "green" }}>Thank you! Your inquiry was sent.</p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>There was an error. Please try again.</p>
      )}

      {/* Inline CSS for hover effect */}
      <style jsx>{`
        .schedule-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: var(--dark-carolina);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          transition: background 0.2s ease-in-out, transform 0.15s ease-in-out;
        }
        .schedule-btn:hover {
          background: #003366; /* slightly darker shade */
          transform: translateY(-2px); /* lift effect */
        }
        .schedule-btn:active {
          transform: translateY(0); /* reset when pressed */
        }
      `}</style>
    </main>
  );
}
