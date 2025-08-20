export default function ExperiencePage() {
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
          Experience & Qualifications
        </h2>
        <p style={{ textAlign: "center", color: "var(--dark-carolina)", marginBottom: "2rem" }}>
          View my background in data science, data engineering, and campaign
          analytics:
        </p>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a
            href="https://github.com/gcdean38/welcome-to-winning/raw/main/resume.pdf"
            target="_blank"
            rel="noopener"
            className="resume-link"
          >
            📄 Download Resume (PDF)
          </a>
        </div>

        {/* Your real resume content */}
        <div
          className="resume-experience"
          style={{ maxWidth: "700px", margin: "0 auto", color: "var(--black)" }}
        >
          <h3 style={{ color: "var(--dark-carolina)", marginBottom: "1rem" }}>
            Geoffrey Carlos Dean
          </h3>
          <p>
            <strong>Email:</strong> bluelibertyanalytics@gmail.com
          </p>

          <h4 style={{ color: "var(--dark-carolina)", marginTop: "2rem" }}>
            Education
          </h4>
          <ul>
            <li>
              <strong>University of Missouri ‘24</strong> — BS Statistics | BJ
              Strategic Communication
            </li>
            <li>
              <strong>Georgia Institute of Technology ‘26</strong> — MS
              Analytics
            </li>
          </ul>

          <h4 style={{ color: "var(--dark-carolina)", marginTop: "2rem" }}>
            Skills
          </h4>
          <ul>
            <li>
              <strong>Programming/Languages:</strong> Python, R, SQL, PySpark,
              ML Flow, Scikit-Learn, XGBoost
            </li>
            <li>
              <strong>Platforms:</strong> Databricks, Snowflake, Microsoft
              Azure, SAS, Tableau, Excel
            </li>
            <li>
              <strong>Core Competencies:</strong> Data Engineering (ETL, Pipeline
              Construction), Machine Learning, Advanced Analytics, Data Analysis,
              Data Visualization, Agile Methodologies
            </li>
          </ul>

          <h4 style={{ color: "var(--dark-carolina)", marginTop: "2rem" }}>
            Experience
          </h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "1.5rem" }}>
              <strong>Various Candidates</strong>, Advanced Analytics and Data
              Science Volunteer<br />
              <em>April 2025–Present</em>
              <br />
              Working with nine campaigns across the country ... (etc.)
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <strong>AT&amp;T</strong>, Senior Data/AI Engineer - Data Insights
              Team<br />
              <em>June 2025–Present</em>
              <br />
              Responsible for constructing and automating ETL data pipelines ...
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <strong>AT&amp;T</strong>, Technology Development Program - Data
              Analyst I<br />
              <em>July 2024–May 2025</em>
              <br />
              Utilizing Python, PySpark, and SQL to construct Databricks ETL
              workflows ...
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <strong>AT&amp;T</strong>, Technology Development Program Intern –
              Data Analyst<br />
              <em>June 2023–August 2023</em>
              <br />
              Developed models to forecast agent attrition at call centers ...
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <strong>Sydney Batch Campaign for NC House</strong>, Data Analysis
              Intern<br />
              <em>June 2020–November 2020</em>
              <br />
              Responsible for conducting electoral research on the district ...
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
