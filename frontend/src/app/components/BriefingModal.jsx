import { evidenceService, reportService } from "../services/store.js";

export default function BriefingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const evidenceList = evidenceService.getEvidenceList();
  const reports = reportService.getReports();

  const totalDatasets = evidenceList.length;
  const totalReports = reports.length;

  const pendingProcessing = evidenceList.filter(
    (item) =>
      item.status === "Uploaded" ||
      item.status === "Validated" ||
      item.status === "Analyzed"
  ).length;

  const completedProcessing = evidenceList.filter(
    (item) =>
      item.status === "Included In Report" ||
      item.status === "Closed" ||
      item.status === "Completed"
  ).length;

  return (
    <div
      className="cmd-overlay"
      onClick={onClose}
      style={{ zIndex: 100 }}
    >
      <div
        className="card hud-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "24px",
          border: "1px solid var(--accent-border)",
          boxShadow:
            "var(--glow-cyan), var(--shadow-lg)",
        }}
      >
        {/* -------------------- HEADER -------------------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom:
              "1px solid var(--border)",
            paddingBottom: "12px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              Astra Project Briefing
            </h2>

            <p
              style={{
                fontSize: "11.5px",
                color: "var(--accent-glow)",
              }}
            >
              Conjunction Risk Screening Overview
            </p>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close briefing"
          >
            ✕
          </button>
        </div>

        {/* -------------------- SUMMARY -------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* CDM DATASETS */}
          <div
            style={{
              padding: "12px",
              background:
                "rgba(10, 10, 14, 0.8)",
              borderRadius:
                "var(--radius-sm)",
              border:
                "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform:
                  "uppercase",
              }}
            >
              CDM Datasets
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--accent)",
                marginTop: "2px",
              }}
            >
              {totalDatasets}
            </div>
          </div>

          {/* REPORTS */}
          <div
            style={{
              padding: "12px",
              background:
                "rgba(10, 10, 14, 0.8)",
              borderRadius:
                "var(--radius-sm)",
              border:
                "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform:
                  "uppercase",
              }}
            >
              Reports Generated
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--success)",
                marginTop: "2px",
              }}
            >
              {totalReports}
            </div>
          </div>

          {/* PROCESSING */}
          <div
            style={{
              padding: "12px",
              background:
                "rgba(10, 10, 14, 0.8)",
              borderRadius:
                "var(--radius-sm)",
              border:
                "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform:
                  "uppercase",
              }}
            >
              Processing
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--warning)",
                marginTop: "2px",
              }}
            >
              {pendingProcessing}
            </div>
          </div>

          {/* COMPLETED */}
          <div
            style={{
              padding: "12px",
              background:
                "rgba(10, 10, 14, 0.8)",
              borderRadius:
                "var(--radius-sm)",
              border:
                "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform:
                  "uppercase",
              }}
            >
              Completed
            </div>

            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--accent)",
                marginTop: "2px",
              }}
            >
              {completedProcessing}
            </div>
          </div>
        </div>

        {/* -------------------- MODEL STATUS -------------------- */}
        <div
          style={{
            padding: "14px",
            background:
              "rgba(78, 168, 255, 0.06)",
            borderRadius:
              "var(--radius-sm)",
            border:
              "1px solid var(--accent-border)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span className="pulse-dot" />

            <b
              style={{
                fontSize: "13px",
                color: "var(--text)",
              }}
            >
              Model Status: CatBoostRegressor
            </b>
          </div>

          <p
            style={{
              fontSize: "12px",
              color:
                "var(--text-secondary)",
              lineHeight: "1.5",
            }}
          >
            Astra processes Conjunction Data
            Messages (CDMs) and uses current
            conjunction information to predict
            numerical future risk at the next CDM.
            The predicted risk is then classified
            as Low, Medium, or High for conjunction
            screening and prioritization.
          </p>
        </div>

        {/* -------------------- MODEL METRICS -------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {[
            ["Model R²", "76.6%"],
            ["MAE", "3.20"],
            ["High-Risk Recall", "77.96%"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: "10px",
                background:
                  "rgba(10, 10, 14, 0.65)",
                border:
                  "1px solid var(--border)",
                borderRadius:
                  "var(--radius-sm)",
              }}
            >
              <div
                style={{
                  fontSize: "9.5px",
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                }}
              >
                {label}
              </div>

              <div
                className="mono"
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  marginTop: "4px",
                  color:
                    label ===
                    "High-Risk Recall"
                      ? "var(--warning)"
                      : "var(--accent)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* -------------------- WORKFLOW -------------------- */}
        <div
          style={{
            padding: "14px",
            background:
              "rgba(10, 10, 14, 0.65)",
            borderRadius:
              "var(--radius-sm)",
            border:
              "1px solid var(--border)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              textTransform:
                "uppercase",
              marginBottom: "10px",
            }}
          >
            Screening Workflow
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "7px",
              alignItems: "center",
            }}
          >
            {[
              "CDM Upload",
              "Validation",
              "Preprocessing",
              "CatBoost",
              "Risk Classification",
              "Alert / Report",
            ].map((step, index) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    padding:
                      "5px 8px",
                    border:
                      "1px solid var(--border)",
                    borderRadius:
                      "var(--radius-sm)",
                    fontSize: "10.5px",
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  {index + 1}. {step}
                </span>

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

        {/* -------------------- PROJECT NOTE -------------------- */}
        <div
          style={{
            padding: "12px 14px",
            background:
              "rgba(78, 168, 255, 0.04)",
            border:
              "1px solid var(--accent-border)",
            borderRadius:
              "var(--radius-sm)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              textTransform:
                "uppercase",
              marginBottom: "5px",
            }}
          >
            Project Focus
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "11.5px",
              lineHeight: 1.5,
              color:
                "var(--text-secondary)",
            }}
          >
            ASTRA focuses on machine-learning
            based future-risk prediction from CDM
            data, helping identify and prioritize
            potentially important satellite
            conjunction events.
          </p>
        </div>

        {/* -------------------- CLOSE -------------------- */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            className="btn primary"
            onClick={onClose}
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
}