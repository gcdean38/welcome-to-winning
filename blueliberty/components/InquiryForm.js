"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, organization, message }),
      });

      if (res.ok) {
        setToast({ type: "success", message: "✅ Thanks! We’ll be in touch." });
        setName("");
        setEmail("");
        setOrganization("");
        setMessage("");
      } else {
        setToast({ type: "error", message: "⚠️ Something went wrong." });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "⚠️ Network error." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000); // auto-hide
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="contact-form">
        <h3>Ready to Get Started? Reach Out Today!</h3>

        <div className="form-group">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
        </div>

        <div className="form-group">
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            className={`toast ${toast.type === "error" ? "toast--error" : "toast--success"}`}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            <span className="toast__icon">{toast.type === "error" ? "⚠️" : "✅"}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
