export default function ServicesPage() {
  return (
    <main className="main-content">
      <div className="contact-form">
        <h3>Ready to Get Started? Reach Out Today!</h3>
        <form id="contactForm">
          <div className="form-group">
            <input type="text" name="name" placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Your Email" required />
          </div>
          <div className="form-group">
            <input type="text" name="organization" placeholder="Campaign/Organization" required />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              placeholder="Tell us about your campaign and analytics needs..."
              required
            ></textarea>
          </div>
          <button type="submit" className="submit-btn">Send Inquiry</button>
        </form>
      </div>

      <div className="services-content">
        <h2 style={{ textAlign: "center", color: "var(--dark-carolina)", marginBottom: "2rem" }}>
          Our Services
        </h2>

        <div className="service-card">
          <h4>🎯 Lead Scoring & Donation Analytics</h4>
          <p style = {{color: "var(--dark-carolina)"}}>Maximize your fundraising potential with advanced lead scoring algorithms.</p>
        </div>

        <div className="service-card">
          <h4>📊 Voter Contact Optimization</h4>
          <p style = {{color: "var(--dark-carolina)"}}>Transform your voter outreach with precision targeting and contact scoring.</p>
        </div>

        <div className="service-card">
          <h4>🗺️ Precinct Analysis & Strategy</h4>
          <p style = {{color: "var(--dark-carolina)"}}>Gain strategic advantage with deep-dive precinct analysis.</p>
        </div>

        <div className="service-card">
          <h4>🏆 Campaign Strategy Consulting</h4>
          <p style = {{color: "var(--dark-carolina)"}}>From city council to US House races, we provide the analytical backbone for your strategy.</p>
        </div>
      </div>
    </main>
  );
}
