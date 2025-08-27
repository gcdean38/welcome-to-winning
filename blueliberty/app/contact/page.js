"use client";

import InquiryForm from "../../components/InquiryForm";

export default function ContactPage() {
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
      <p style={{ color: "var(--dark-carolina)", marginBottom: "1.5rem" }}>
        Schedule a meeting or reach out to our team to get started with Blue Liberty Analytics!
      </p>

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

      {/* 👇 Replaced inline form with InquiryForm component */}
      <InquiryForm />

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
