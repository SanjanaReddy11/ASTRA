import { useState } from "react";
import Icon from "../components/Icon.jsx";

const SAMPLE_PREDICTIONS = [
  {
    id: "CONJ-9012",
    objectType: "Orbital Debris",
    target: "SATELLITE-A",
    currentRisk: "-10.84",
    predictedRisk: "-11.42",
    level: "High",
    status: "Prediction Complete",
  },
  {
    id: "CONJ-8941",
    objectType: "Rocket Body",
    target: "SATELLITE-B",
    currentRisk: "-18.62",
    predictedRisk: "-19.14",
    level: "Medium",
    status: "Prediction Complete",
  },
  {
    id: "CONJ-8890",
    objectType: "Unknown Object",
    target: "SATELLITE-C",
    currentRisk: "-24.31",
    predictedRisk: "-23.87",
    level: "Low",
    status: "Prediction Complete",
  },
];

function getRiskClass(level) {
  if (level === "High") return "danger";
  if (level === "Medium") return "warning";
  return "success";
}

function getRiskColor(level) {
  if (level === "High") return "var(--danger)";
  if (level === "Medium") return "var(--warning)";
  return "var(--success)";
}

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] =
    useState(SAMPLE_PREDICTIONS[0]);

  const [predictionStatus, setPredictionStatus] =
    useState("READY");

  const handleRefresh = () => {
    setPredictionStatus("READY");
  };

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>Future Risk Predictions</h1>

          <p>
            CatBoost-based prediction of future conjunction risk from
            Conjunction Data Message sequences.
          </p>
        </div>

        <div className="actions">
          <button
            className="btn ghost light-theme-action"
            onClick={handleRefresh}
          >
            <Icon name="refresh" size={14} />
            Refresh Predictions
          </button>
        </div>
      </div>

      {/* -------------------- MODEL STATUS -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginBottom: "20px",
          borderColor: "var(--accent-border)",
        }}
      >
        <div className="card-head">
          <h3>
            <Icon
              name="activity"
              size={16}
              style={{ color: "var(--accent)" }}
            />{" "}
            Prediction Engine
          </h3>

          <span className="chip success">
            {predictionStatus}
          </span>
        </div>

        <div
          className="grid cols-4"
          style={{ marginTop: "10px" }}
        >
          <div>
            <div className="k-label">
              ML Model
            </div>

            <div
              className="mono"
              style={{
                marginTop: "6px",
                color: "var(--accent)",
                fontWeight: "700",
              }}
            >
              CatBoostRegressor
            </div>
          </div>

          <div>
            <div className="k-label">
              Prediction Horizon
            </div>

            <div
              className="mono"
              style={{
                marginTop: "6px",
                color: "var(--text)",
                fontWeight: "700",
              }}
            >
              +1 CDM
            </div>
          </div>

          <div>
            <div className="k-label">
              R²
            </div>

            <div
              className="mono"
              style={{
                marginTop: "6px",
                color: "var(--accent)",
                fontWeight: "700",
              }}
            >
              76.6%
            </div>
          </div>

          <div>
            <div className="k-label">
              High-Risk Recall
            </div>

            <div
              className="mono"
              style={{
                marginTop: "6px",
                color: "var(--warning)",
                fontWeight: "700",
              }}
            >
              77.96%
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- MAIN CONTENT -------------------- */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.4fr 1fr",
          gap: "20px",
        }}
      >
        {/* -------------------- PREDICTION TABLE -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={16}
                style={{ color: "var(--accent)" }}
              />{" "}
              Conjunction Predictions
            </h3>

            <span className="chip info">
              FUTURE RISK
            </span>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Object Type</th>
                  <th>Target</th>
                  <th>Current Risk</th>
                  <th>Future Risk</th>
                  <th>Classification</th>
                </tr>
              </thead>

              <tbody>
                {SAMPLE_PREDICTIONS.map((prediction) => (
                  <tr
                    key={prediction.id}
                    onClick={() =>
                      setSelectedPrediction(prediction)
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <td
                      className="mono"
                      style={{
                        color: "var(--accent)",
                        fontWeight: "700",
                      }}
                    >
                      {prediction.id}
                    </td>

                    <td>
                      <b>{prediction.objectType}</b>
                    </td>

                    <td
                      className="mono"
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      {prediction.target}
                    </td>

                    <td className="mono">
                      {prediction.currentRisk}
                    </td>

                    <td
                      className="mono"
                      style={{
                        color: getRiskColor(
                          prediction.level
                        ),
                        fontWeight: "700",
                      }}
                    >
                      {prediction.predictedRisk}
                    </td>

                    <td>
                      <span
                        className={`chip ${getRiskClass(
                          prediction.level
                        )}`}
                      >
                        {prediction.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "14px",
              padding: "10px 12px",
              borderTop:
                "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            Select a conjunction event to view its
            prediction details.
          </div>
        </div>

        {/* -------------------- SELECTED PREDICTION -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="activity"
                size={16}
                style={{ color: "var(--accent)" }}
              />{" "}
              Prediction Details
            </h3>

            <span
              className={`chip ${getRiskClass(
                selectedPrediction.level
              )}`}
            >
              {selectedPrediction.level} RISK
            </span>
          </div>

          {/* Event ID */}
          <div className="light-theme-panel prediction-detail-panel">
            <div className="k-label">
              CONJUNCTION EVENT
            </div>

            <div
              className="mono"
              style={{
                marginTop: "5px",
                color: "var(--accent)",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              {selectedPrediction.id}
            </div>
          </div>

          {/* Risk Comparison */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div className="light-theme-panel prediction-detail-panel">
              <div className="k-label">
                CURRENT RISK
              </div>

              <div
                className="mono"
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginTop: "5px",
                }}
              >
                {selectedPrediction.currentRisk}
              </div>
            </div>

            <div className="light-theme-panel prediction-detail-panel">
              <div className="k-label">
                PREDICTED +1 CDM
              </div>

              <div
                className="mono"
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginTop: "5px",
                  color: getRiskColor(
                    selectedPrediction.level
                  ),
                }}
              >
                {selectedPrediction.predictedRisk}
              </div>
            </div>
          </div>

          {/* Classification */}
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "7px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color:
                    "var(--text-secondary)",
                }}
              >
                Future Risk Classification
              </span>

              <span
                className={`chip ${getRiskClass(
                  selectedPrediction.level
                )}`}
              >
                {selectedPrediction.level}
              </span>
            </div>

            <div className="progress">
              <span
                style={{
                  width:
                    selectedPrediction.level ===
                    "High"
                      ? "85%"
                      : selectedPrediction.level ===
                        "Medium"
                        ? "55%"
                        : "25%",
                  background:
                    getRiskColor(
                      selectedPrediction.level
                    ),
                }}
              />
            </div>
          </div>

          {/* Input Information */}
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            <div className="telemetry-item">
              <div>
                <b>Object Type</b>

                <small
                  style={{
                    display: "block",
                    color:
                      "var(--text-muted)",
                    fontSize: "10.5px",
                  }}
                >
                  CDM object classification
                </small>
              </div>

              <span className="chip info">
                {selectedPrediction.objectType}
              </span>
            </div>

            <div className="telemetry-item">
              <div>
                <b>Target</b>

                <small
                  style={{
                    display: "block",
                    color:
                      "var(--text-muted)",
                    fontSize: "10.5px",
                  }}
                >
                  Associated satellite
                </small>
              </div>

              <span className="chip">
                {selectedPrediction.target}
              </span>
            </div>

            <div className="telemetry-item">
              <div>
                <b>Prediction Status</b>

                <small
                  style={{
                    display: "block",
                    color:
                      "var(--text-muted)",
                    fontSize: "10.5px",
                  }}
                >
                  Model inference state
                </small>
              </div>

              <span className="chip success">
                {selectedPrediction.status}
              </span>
            </div>

            <div className="telemetry-item">
              <div>
                <b>Prediction Model</b>

                <small
                  style={{
                    display: "block",
                    color:
                      "var(--text-muted)",
                    fontSize: "10.5px",
                  }}
                >
                  Regression model
                </small>
              </div>

              <span
                className="chip info"
                style={{
                  fontSize: "10px",
                }}
              >
                CatBoostRegressor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- MODEL PERFORMANCE -------------------- */}
      <div
        className="grid cols-2"
        style={{
          marginTop: "20px",
        }}
      >
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="activity"
                size={16}
              />{" "}
              Model Performance
            </h3>

            <span className="chip">
              VALIDATION
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              ["R²", "76.6%", "var(--accent)"],
              ["MAE", "3.20", null],
              ["RMSE", "4.78", null],
              ["HIGH-RISK RECALL", "77.96%", "var(--warning)"],
            ].map(([label, value, valueColor]) => (
              <div
                key={label}
                className="light-theme-panel"
              >
                <div className="k-label">
                  {label}
                </div>

                <div
                  className="k-value"
                  style={{
                    fontSize: "24px",
                    color: valueColor || undefined,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------- CLASSIFICATION PERFORMANCE -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={16}
              />{" "}
              Risk Classification
            </h3>

            <span className="chip info">
              FUTURE RISK
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "14px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                <span>Low Risk</span>
                <b className="mono">
                  50.56%
                </b>
              </div>

              <div className="progress success">
                <span
                  style={{
                    width: "50.56%",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                <span>Medium Risk</span>
                <b className="mono">
                  17.17%
                </b>
              </div>

              <div className="progress">
                <span
                  style={{
                    width: "17.17%",
                    background:
                      "var(--warning)",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "5px",
                  fontSize: "12px",
                }}
              >
                <span>High Risk</span>
                <b className="mono">
                  32.27%
                </b>
              </div>

              <div className="progress danger">
                <span
                  style={{
                    width: "32.27%",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                paddingTop: "10px",
                borderTop:
                  "1px solid var(--border)",
                fontSize: "11px",
                color:
                  "var(--text-muted)",
              }}
            >
              Thresholds used for the future-risk
              classification are based on the
              project evaluation configuration.
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- NOTE -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginTop: "20px",
          borderColor:
            "var(--accent-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <Icon
            name="info"
            size={18}
            style={{
              color: "var(--accent)",
              marginTop: "2px",
            }}
          />

          <div>
            <b
              style={{
                color: "var(--text)",
              }}
            >
              Prediction workflow
            </b>

            <p
              style={{
                marginTop: "5px",
                marginBottom: 0,
                fontSize: "11.5px",
                lineHeight: 1.5,
                color:
                  "var(--text-secondary)",
              }}
            >
              Upload a CDM dataset through the
              Data Intake page to run the actual
              CatBoost prediction pipeline. This
              page displays the prediction structure
              and model evaluation information; it
              does not generate a fabricated
              prediction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}