export default function AboutPage() {
  return (
    <main className="main-content">
      <div className="services-content">
        <h2
          style={{
            textAlign: "center",
            color: "var(--dark-carolina)",
            marginBottom: "2rem",
          }}
        >
          About Us
        </h2>

        {/* Company blurb */}
        <p
          style={{
            textAlign: "center",
            color: "var(--black)",
            marginBottom: "2rem",
            maxWidth: "800px",
            marginInline: "auto",
            lineHeight: "1.6",
          }}
        >
          Founded in 2025, <strong>Blue Liberty Analytics</strong> was created to help elect 
          Democrats at every level of government across the country. Through advanced analytics 
          and predictive modeling, we empower campaigns to expand their reach, operate more 
          efficiently, and integrate actionable insights into their strategy to maximize impact.
        </p>

        {/* Personal section */}
        <div
          className="resume-experience"
          style={{ maxWidth: "700px", margin: "0 auto", color: "var(--black)" }}
        >
          <h3 style={{ color: "var(--dark-carolina)", marginBottom: "0.5rem" }}>
            Geoffrey Dean
          </h3>
          <p style={{ marginBottom: "1rem" }}>
            <em>Founder & Principal Data Scientist</em>
          </p>
          <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
            I specialize in data engineering, machine learning, and campaign analytics — 
            helping Democratic campaigns unlock the full potential of their data. With 
            experience spanning both the private sector and political campaigns, I bring 
            technical expertise and strategic insight to ensure your campaign has the 
            tools it needs to win.
          </p>

          {/* Resume link */}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="resume-link"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "var(--carolina-blue)",
                color: "white",
                borderRadius: "25px",
                fontWeight: "bold",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
            >
              📄 Download Resume (PDF)
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
