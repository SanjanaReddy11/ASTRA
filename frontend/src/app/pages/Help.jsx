export default function Help() {
  const topics = [
    [
      "Getting Started",
      "Upload a supported CDM dataset, validate the data, and run the CatBoost future-risk prediction pipeline.",
    ],
    [
      "Understanding Risk",
      "Learn how Astra converts predicted numerical future risk into Low, Medium, and High risk categories.",
    ],
    [
      "CDM Data",
      "Understand the Conjunction Data Message fields used by the preprocessing and machine-learning pipeline.",
    ],
    [
      "Model Results",
      "Review CatBoost prediction results, model metrics, and the predicted future risk for a conjunction event.",
    ],
    [
      "Alerts & Reports",
      "Review generated conjunction alerts and create reports summarizing prediction and risk-classification results.",
    ],
    [
      "Activity & Audit History",
      "Track CDM uploads, prediction activity, report generation, and other recorded system events.",
    ],
  ];

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>Help & Documentation</h1>

          <p>
            Guidance for CDM data intake, future-risk prediction,
            risk classification, alerts, reports, and system activity.
          </p>
        </div>

        <button className="btn primary light-theme-primary-action">
          Project Support
        </button>
      </div>

      {/* -------------------- HELP TOPICS -------------------- */}
      <div className="grid cols-3">
        {topics.map(([title, description], index) => (
          <div
            className="card hud-card"
            key={title}
          >
            <div
              className="mono"
              style={{
                color: "var(--accent)",
                fontSize: 11,
                marginBottom: 8,
              }}
            >
              0{index + 1}
            </div>

            <h3
              style={{
                fontSize: 16,
                color: "var(--text)",
              }}
            >
              {title}
            </h3>

            <p
              style={{
                fontSize: 13,
                marginTop: 8,
                lineHeight: "1.6",
              }}
            >
              {description}
            </p>

            <button
              className="btn ghost light-theme-action"
              style={{
                marginTop: 16,
                padding: "6px 12px",
                fontSize: 12,
              }}
            >
              View Guide →
            </button>
          </div>
        ))}
      </div>

      {/* -------------------- QUICK REFERENCE -------------------- */}
      <div
        className="card hud-card"
        style={{ marginTop: 20 }}
      >
        <div className="card-head">
          <h3>Quick Reference</h3>

          <span className="chip info">
            ASTRA
          </span>
        </div>

        <div
          className="grid cols-3"
          style={{ gap: 12 }}
        >
          <div>
            <div className="k-label">
              INPUT
            </div>

            <div
              className="mono"
              style={{
                marginTop: 5,
                fontSize: 14,
                color: "var(--accent)",
              }}
            >
              CSV / XLSX
            </div>

            <p
              style={{
                fontSize: 12,
                marginTop: 5,
              }}
            >
              Supported CDM dataset formats.
            </p>
          </div>

          <div>
            <div className="k-label">
              MODEL
            </div>

            <div
              className="mono"
              style={{
                marginTop: 5,
                fontSize: 14,
                color: "var(--accent)",
              }}
            >
              CatBoostRegressor
            </div>

            <p
              style={{
                fontSize: 12,
                marginTop: 5,
              }}
            >
              Predicts numerical future risk.
            </p>
          </div>

          <div>
            <div className="k-label">
              OUTPUT
            </div>

            <div
              className="mono"
              style={{
                marginTop: 5,
                fontSize: 14,
                color: "var(--accent)",
              }}
            >
              LOW / MEDIUM / HIGH
            </div>

            <p
              style={{
                fontSize: 12,
                marginTop: 5,
              }}
            >
              Risk classification from predicted future risk.
            </p>
          </div>
        </div>
      </div>

      {/* -------------------- WORKFLOW -------------------- */}
      <div
        className="card hud-card"
        style={{ marginTop: 20 }}
      >
        <div className="card-head">
          <h3>Basic Workflow</h3>

          <span className="chip success">
            ACTIVE
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          {[
            "Upload CDM",
            "Validate",
            "Preprocess",
            "CatBoost Prediction",
            "Risk Classification",
            "Alert / Report",
          ].map((step, index) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div className="light-theme-workflow-step">
                <span
                  className="mono"
                  style={{
                    color: "var(--accent)",
                    marginRight: 7,
                  }}
                >
                  {index + 1}
                </span>

                {step}
              </div>

              {index < 5 && (
                <span
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- NOTE -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginTop: 20,
          borderColor:
            "var(--accent-border)",
        }}
      >
        <div className="card-head">
          <h3>Project Note</h3>
        </div>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          Astra is an academic machine-learning project
          focused on conjunction-risk triage. Prediction
          results should be interpreted as model outputs and
          not as autonomous maneuver or collision-avoidance
          decisions.
        </p>
      </div>
    </div>
  );
}