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
            Maximize your fundraising potential with advanced lead scoring algorithms that identify your most promising donor prospects. Our data-driven approach analyzes donor behavior patterns, demographic data, and engagement metrics to help you focus your efforts where they'll have the greatest impact.
          </p>
        </div>

        <div className="service-card">
          <h4>📊 Voter Contact Optimization</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            Transform your voter outreach with precision targeting and contact scoring. We analyze voter history, demographic trends, and engagement patterns to help you identify the most persuadable voters and optimize your contact strategy for maximum effectiveness.
          </p>
        </div>

        <div className="service-card">
          <h4>🗺️ Precinct Analysis & Strategy</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            Gain the strategic advantage with deep-dive precinct analysis that reveals hidden opportunities in your district. Our comprehensive analysis examines voting patterns, demographic shifts, and turnout trends to help you devise a winning strategy that maximizes your resources and impact.
          </p>
        </div>

        <div className="service-card">
          <h4>🏆 Campaign Strategy Consulting</h4>
          <p style={{ color: "var(--dark-carolina)" }}>
            From city council to US House races, we provide the analytical backbone for your campaign strategy. Our advanced analytics give you the inside edge needed to make informed decisions, allocate resources effectively, and build a path to victory.
          </p>
        </div>
      </div>
    </main>
  );
}
