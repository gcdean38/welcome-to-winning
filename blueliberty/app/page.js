import Image from "next/image";
import styles from "./page.module.css";
import InquiryForm from "../components/InquiryForm"; // 👈 import form

export default function HomePage() {
  return (
    <main className="main-content">
      <div id="home" className="page active">
        <div className="hero">
          <img
            src="/blue_liberty_logo_blue.png"
            alt="Blue Liberty Analytics Blue Logo"
            className="cover-logo"
          />
          <h1>Welcome to Winning</h1>
          <p>
            Advanced analytics consulting for political campaigns. 
            Get the inside edge you need to win your race.
          </p>
        </div>
      </div>

      {/* 👇 Contact Form at bottom */}
      <div id="contact" style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--dark-carolina)" }}>
          Get in Touch
        </h2>
        <InquiryForm />
      </div>
    </main>
  );
}
