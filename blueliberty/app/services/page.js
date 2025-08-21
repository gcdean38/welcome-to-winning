import InquiryForm from "../../components/InquiryForm";  // 👈 import your component

export default function ServicesPage() {
  return (
    <main className="main-content">
      <div className="contact-form">
        {/* Replace raw <form> with the component */}
        <InquiryForm />
      </div>

      <div className="services-content">
        <h2 style={{ textAlign: "center", color: "var(--dark-carolina)", marginBottom: "2rem" }}>
          Our Services
        </h2>

        <div className="service-card">
          <h4>🎯 Lead Scoring & Donation Analytics</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            Maximize your fundraising potential with advanced lead scoring algorithms.
          </p>
        </div>

        <div className="service-card">
          <h4>📊 Voter Contact Optimization</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            Transform your voter outreach with precision targeting and contact scoring.
          </p>
        </div>

        <div className="service-card">
          <h4>🗺️ Precinct Analysis & Strategy</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            Gain strategic advantage with deep-dive precinct analysis.
          </p>
        </div>

        <div className="service-card">
          <h4>🏆 Campaign Strategy Consulting</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            From city council to US House races, we provide the analytical backbone for your strategy.
          </p>
        </div>
      </div>
    </main>
  );
}
