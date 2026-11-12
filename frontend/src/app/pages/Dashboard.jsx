import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import InteractiveGlobe from "../components/InteractiveGlobe.jsx";
import MiniRadar from "../components/MiniRadar.jsx";

/* =========================================================
   ASTRA MODEL METRICS
========================================================= */

const MODEL_METRICS = {
  r2: 76.6,
  mae: 3.2,
  rmse: 4.78,
  highRiskRecall: 77.96,
  weightedF1: 86.06,
};

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value, digits = 4) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toFixed(digits);
};

const formatFeatureName = (name) => {
  return String(name || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* =========================================================
   KPI CARD
========================================================= */

function KPI({
  label,
  value,
  description,
  icon,
  accentColor,
}) {
  return (
    <div className="card kpi hud-card">
      <div className="k-label">
        <span>{label}</span>

        {icon && (
          <span
            className="k-icon"
            style={{
              color: accentColor || "var(--accent)",
            }}
          >
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>

      <div
        className="k-value"
        style={{
          color: accentColor || "#ffffff",
        }}
      >
        {value}
      </div>

      {description && (
        <div
          style={{
            fontSize: "10.5px",
            color: "var(--text-muted)",
            marginTop: "4px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SHAP EXPLAINABILITY OVERVIEW
========================================================= */

function SHAPOverview() {
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const loadPrediction = () => {
      try {
        const saved = localStorage.getItem(
          "astra_latest_cdm_prediction"
        );

        setPrediction(saved ? JSON.parse(saved) : null);
      } catch (error) {
        console.error(
          "Unable to load latest SHAP prediction:",
          error
        );

        setPrediction(null);
      }
    };

    loadPrediction();

    window.addEventListener("focus", loadPrediction);

    return () => {
      window.removeEventListener("focus", loadPrediction);
    };
  }, []);

  const explanation = prediction?.explanation;

  const contributions = useMemo(() => {
    if (!Array.isArray(explanation?.contributions)) {
      return [];
    }

    return [...explanation.contributions]
      .filter((item) =>
        Number.isFinite(Number(item.shap_value))
      )
      .sort(
        (a, b) =>
          Math.abs(Number(b.shap_value)) -
          Math.abs(Number(a.shap_value))
      );
  }, [explanation]);

  const topFeatures = contributions.slice(0, 5);

  const positiveCount = contributions.filter(
    (item) => Number(item.shap_value) > 0
  ).length;

  const negativeCount = contributions.filter(
    (item) => Number(item.shap_value) < 0
  ).length;

  const negligibleCount = contributions.filter(
    (item) => Number(item.shap_value) === 0
  ).length;

  const maxImpact = Math.max(
    ...topFeatures.map((item) =>
      Math.abs(Number(item.shap_value))
    ),
    0.000001
  );

  const hasPrediction = Boolean(prediction);

  const hasExplanation = contributions.length > 0;

  const additivityVerified =
    explanation?.additivity_verified === true;

  const finalPrediction =
    explanation?.model_prediction ??
    explanation?.final_prediction ??
    prediction?.log10Probability;

  return (
    <div className="card hud-card">
      {/* HEADER */}

      <div className="card-head">
        <h3>
          <Icon
            name="activity"
            size={18}
            style={{ color: "var(--accent)" }}
          />

          SHAP Explainability Overview
        </h3>

        <span className="chip info">
          MODEL INTERPRETABILITY
        </span>
      </div>

      {!hasPrediction ? (
        <div
          style={{
            padding: "35px 15px",
            textAlign: "center",
          }}
        >
          <Icon
            name="activity"
            size={35}
            style={{ color: "var(--accent)" }}
          />

          <h3 style={{ marginTop: 12 }}>
            No Prediction Available
          </h3>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            Upload a CDM dataset to view its prediction
            and SHAP feature contributions.
          </p>

          <button
            className="btn primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/upload")}
          >
            <Icon name="upload" size={14} />
            Upload CDM Dataset
          </button>
        </div>
      ) : (
        <>
          {/* PREDICTION SUMMARY */}

          <div
            className="grid cols-3"
            style={{ marginBottom: 20 }}
          >
            <div>
              <span className="k-label">
                LATEST RISK
              </span>

              <h2
                style={{
                  marginTop: 10,
                  color:
                    prediction.classification === "High Risk"
                      ? "var(--danger)"
                      : prediction.classification === "Medium Risk"
                      ? "var(--warning)"
                      : "var(--success)",
                  fontSize: 20,
                }}
              >
                {prediction.classification || "N/A"}
              </h2>
            </div>

            <div>
              <span className="k-label">
                RISK SCORE
              </span>

              <h2 style={{ marginTop: 10 }}>
                {formatNumber(prediction.riskScore, 2)}
              </h2>
            </div>

            <div>
              <span className="k-label">
                FEATURES ANALYSED
              </span>

              <h2 style={{ marginTop: 10 }}>
                {hasExplanation
                  ? contributions.length
                  : "N/A"}
              </h2>
            </div>
          </div>

          {/* DATASET INFORMATION */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "12px 15px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 20,
            }}
          >
            <span>
              DATASET:{" "}
              <b style={{ color: "var(--text)" }}>
                {prediction.fileName || "N/A"}
              </b>
            </span>

            <span>
              MODEL:{" "}
              <b style={{ color: "var(--text)" }}>
                CatBoostRegressor
              </b>
            </span>
          </div>

          {!hasExplanation ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            >
              SHAP contributions are not available for
              this prediction.
            </div>
          ) : (
            <>
              {/* SHAP VERIFICATION AND FINAL PREDICTION */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 15,
                  paddingBottom: 18,
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 18,
                }}
              >
                <div>
                  <span className="k-label">
                    SHAP ADDITIVITY
                  </span>

                  <div style={{ marginTop: 8 }}>
                    <span
                      className={`chip ${
                        additivityVerified
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {additivityVerified
                        ? "VERIFIED"
                        : "NOT VERIFIED"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="k-label">
                    FINAL MODEL PREDICTION
                  </span>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(finalPrediction, 6)}
                  </h3>
                </div>
              </div>

              {/* CONTRIBUTION COUNTS */}

              <div
                className="grid cols-3"
                style={{ marginBottom: 22 }}
              >
                <div
                  style={{
                    padding: 13,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}
                  >
                    POSITIVE CONTRIBUTIONS
                  </span>

                  <h2
                    style={{
                      color: "var(--danger)",
                      marginTop: 7,
                    }}
                  >
                    {positiveCount}
                  </h2>

                  <small style={{ color: "var(--text-muted)" }}>
                    Increase prediction
                  </small>
                </div>

                <div
                  style={{
                    padding: 13,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}
                  >
                    NEGATIVE CONTRIBUTIONS
                  </span>

                  <h2
                    style={{
                      color: "var(--success)",
                      marginTop: 7,
                    }}
                  >
                    {negativeCount}
                  </h2>

                  <small style={{ color: "var(--text-muted)" }}>
                    Decrease prediction
                  </small>
                </div>

                <div
                  style={{
                    padding: 13,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}
                  >
                    NO CONTRIBUTION
                  </span>

                  <h2
                    style={{
                      color: "var(--accent)",
                      marginTop: 7,
                    }}
                  >
                    {negligibleCount}
                  </h2>

                  <small style={{ color: "var(--text-muted)" }}>
                    Zero SHAP value
                  </small>
                </div>
              </div>

              {/* TOP FIVE FEATURES */}

              <div className="card-head">
                <h3 style={{ fontSize: 14 }}>
                  Top Contributing Features
                </h3>

                <span className="chip info">
                  TOP 5
                </span>
              </div>

              {topFeatures.map((item, index) => {
                const value = Number(item.shap_value);

                const width =
                  (Math.abs(value) / maxImpact) * 100;

                const isPositive = value > 0;

                return (
                  <div
                    key={`${item.feature}-${index}`}
                    style={{ marginBottom: 15 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 11,
                        marginBottom: 7,
                      }}
                    >
                      <b>
                        {formatFeatureName(item.feature)}
                      </b>

                      <span
                        className="mono"
                        style={{
                          color: isPositive
                            ? "var(--danger)"
                            : value < 0
                            ? "var(--success)"
                            : "var(--accent)",
                        }}
                      >
                        {value > 0 ? "+" : ""}
                        {formatNumber(value, 6)}
                      </span>
                    </div>

                    <div
                      style={{
                        height: 8,
                        background: "var(--border)",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${width}%`,
                          height: "100%",
                          background: isPositive
                            ? "var(--danger)"
                            : value < 0
                            ? "var(--success)"
                            : "var(--accent)",
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* INTERPRETATION */}

              <div
                style={{
                  marginTop: 20,
                  padding: 14,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 11,
                  lineHeight: 1.7,
                  color: "var(--text-muted)",
                }}
              >
                <b style={{ color: "var(--accent)" }}>
                  Interpretation:
                </b>{" "}
                {explanation.interpretation ||
                  "Positive SHAP values increase the model's predicted log10(Pc), while negative SHAP values decrease it. SHAP contributions explain model behaviour, not physical causation."}
              </div>
            </>
          )}

          {/* OPEN FULL SHAP PAGE */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <button
              className="btn primary glow-btn"
              onClick={() => navigate("/explainability")}
            >
              <Icon name="activity" size={14} />
              View Complete SHAP Analysis
              <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-head">
        <div>
          <h1>Mission Control Dashboard</h1>

          <p>
            Machine-Learning Early-Warning System · ASTRA
          </p>
        </div>

        <div className="actions">
          <button
            className="btn ghost light-theme-action"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Icon name="refresh" size={14} />

            {refreshing
              ? "Refreshing..."
              : "Refresh Screening"}
          </button>

          <button
            className="btn primary glow-btn"
            onClick={() => navigate("/alerts")}
          >
            <Icon name="bell" size={14} />
            View Risk Alerts
          </button>
        </div>
      </div>

      {/* =================================================
          MODEL PERFORMANCE KPIs
      ================================================= */}

      <div className="grid cols-4">
        <KPI
          label="R²"
          value={`${MODEL_METRICS.r2}%`}
          description="Explained variance"
          icon="activity"
          accentColor="var(--accent)"
        />

        <KPI
          label="MAE"
          value={MODEL_METRICS.mae.toFixed(2)}
          description="Mean absolute error"
          icon="target"
          accentColor="var(--success)"
        />

        <KPI
          label="RMSE"
          value={MODEL_METRICS.rmse.toFixed(2)}
          description="Root mean squared error"
          icon="database"
          accentColor="var(--warning)"
        />

        <KPI
          label="High-Risk Recall"
          value={`${MODEL_METRICS.highRiskRecall}%`}
          description="High-risk detection recall"
          icon="bell"
          accentColor="var(--danger)"
        />
      </div>

      {/* =================================================
          ORBITAL GLOBE + CONJUNCTION RADAR
          SIDE BY SIDE
      ================================================= */}

      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.35fr 1fr",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {/* ORBITAL GLOBE */}

        <div
          className="card hud-card"
          style={{
            minHeight: 440,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={18}
                style={{ color: "var(--accent)" }}
              />
              Orbital Globe
            </h3>

            <div
              style={{
                display: "flex",
                gap: 8,
              }}
            >
              <span className="chip info">
                VISUALIZATION
              </span>

              <span className="chip success">
                ORBITAL VIEW
              </span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 360,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InteractiveGlobe />
          </div>
        </div>

        {/* CONJUNCTION SCREENING RADAR */}

        <div
          className="card hud-card"
          style={{
            minHeight: 440,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={18}
                style={{ color: "var(--accent)" }}
              />
              Conjunction Screening Radar
            </h3>

            <span className="chip success">
              VISUALIZATION
            </span>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MiniRadar />
          </div>
        </div>
      </div>

      {/* =================================================
          SHAP EXPLAINABILITY OVERVIEW
      ================================================= */}

      <SHAPOverview />

      {/* =================================================
          FOOTNOTE
      ================================================= */}

      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-muted)",
          padding: "2px 2px 12px",
          lineHeight: 1.6,
        }}
      >
        Dashboard metrics represent evaluated ASTRA model
        results. The SHAP overview explains the latest
        uploaded dataset's first-row prediction. Orbital
        globe and radar components are interface
        visualizations and are not live satellite telemetry.
      </div>
    </div>
  );
}