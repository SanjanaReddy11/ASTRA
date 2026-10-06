import { useState } from "react";
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
              color:
                accentColor ||
                "var(--accent)",
            }}
          >
            <Icon
              name={icon}
              size={16}
            />
          </span>
        )}
      </div>

      <div
        className="k-value"
        style={{
          color:
            accentColor ||
            "#ffffff",
        }}
      >
        {value}
      </div>

      {description && (
        <div
          style={{
            fontSize: "10.5px",
            color:
              "var(--text-muted)",
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
   MODEL EVALUATION
========================================================= */

function ModelEvaluation() {
  const metrics = [
    {
      label: "R²",
      value: `${MODEL_METRICS.r2}%`,
      width: MODEL_METRICS.r2,
      color: "var(--accent)",
    },

    {
      label: "MAE",
      value: MODEL_METRICS.mae.toFixed(2),
      width: 64,
      color: "var(--success)",
    },

    {
      label: "RMSE",
      value: MODEL_METRICS.rmse.toFixed(2),
      width: 72,
      color: "var(--warning)",
    },

    {
      label: "High-Risk Recall",
      value: `${MODEL_METRICS.highRiskRecall}%`,
      width:
        MODEL_METRICS.highRiskRecall,
      color: "var(--danger)",
    },

    {
      label: "Weighted F1",
      value: `${MODEL_METRICS.weightedF1}%`,
      width:
        MODEL_METRICS.weightedF1,
      color: "var(--accent)",
    },
  ];

  return (
    <div
      className="card hud-card"
      style={{
        height: "100%",
      }}
    >
      <div className="card-head">
        <h3>
          <Icon
            name="activity"
            size={18}
            style={{
              color:
                "var(--accent)",
            }}
          />

          {" "}

          Model Evaluation
        </h3>

        <span className="chip info">
          VALIDATED MODEL
        </span>
      </div>

      {/* MODEL NAME */}
      <div
        style={{
          padding:
            "4px 0 18px",
          borderBottom:
            "1px solid var(--border)",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color:
              "var(--text-muted)",
            textTransform:
              "uppercase",
            letterSpacing:
              "0.12em",
          }}
        >
          Machine Learning Model
        </div>

        <div
          className="mono"
          style={{
            marginTop: "5px",
            fontSize: "16px",
            fontWeight: 700,
            color:
              "var(--accent)",
          }}
        >
          CatBoostRegressor
        </div>
      </div>

      {/* METRICS */}
      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "15px",
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "6px",
                fontSize: "12px",
              }}
            >
              <span>
                {metric.label}
              </span>

              <strong
                className="mono"
                style={{
                  color:
                    metric.color,
                }}
              >
                {metric.value}
              </strong>
            </div>

            <div
              style={{
                height: "5px",
                background:
                  "rgba(255,255,255,0.07)",
                borderRadius:
                  "999px",
                overflow:
                  "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.min(
                    metric.width,
                    100
                  )}%`,
                  background:
                    metric.color,
                  borderRadius:
                    "999px",
                  boxShadow:
                    `0 0 10px ${metric.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MODEL NOTE */}
      <div
        style={{
          marginTop: "22px",
          paddingTop: "14px",
          borderTop:
            "1px solid var(--border)",
          fontSize: "10.5px",
          color:
            "var(--text-muted)",
          lineHeight: 1.5,
        }}
      >
        R² represents explained
        variance. MAE and RMSE
        are reported on the
        model risk scale.
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [refreshing, setRefreshing] =
    useState(false);

  const handleRefresh =
    () => {
      if (refreshing) {
        return;
      }

      setRefreshing(true);

      setTimeout(() => {
        window.location.reload();
      }, 700);
    };

  return (
    <div
      style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "20px",
      }}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-head">
        <div>
          <h1>
            Mission Control
            Dashboard
          </h1>

          <p>
            Machine-Learning
            Early-Warning System
            · ASTRA
          </p>
        </div>

        <div className="actions">
          <button
            className="btn ghost light-theme-action"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing
            }
          >
            <Icon
              name="refresh"
              size={14}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Screening"}
          </button>

          <button
            className="btn primary glow-btn"
            onClick={() =>
              navigate(
                "/alerts"
              )
            }
          >
            <Icon
              name="bell"
              size={14}
            />

            View Risk Alerts
          </button>
        </div>
      </div>

      {/* =================================================
          FOUR PRIMARY KPIs
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
          value={MODEL_METRICS.mae.toFixed(
            2
          )}
          description="Mean absolute error"
          icon="target"
          accentColor="var(--success)"
        />

        <KPI
          label="RMSE"
          value={MODEL_METRICS.rmse.toFixed(
            2
          )}
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
          GLOBE + MODEL EVALUATION
      ================================================= */}

      <div
        className="grid"
        style={{
          gridTemplateColumns:
            "1.4fr 1fr",
          gap: "20px",
          alignItems:
            "stretch",
        }}
      >
        {/* ORBITAL GLOBE */}

        <div
          className="card hud-card"
          style={{
            minHeight:
              "500px",
            display: "flex",
            flexDirection:
              "column",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={18}
                style={{
                  color:
                    "var(--accent)",
                }}
              />

              {" "}

              Orbital Globe
            </h3>

            <div
              style={{
                display: "flex",
                gap: "8px",
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
              minHeight:
                "420px",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <InteractiveGlobe />
          </div>
        </div>

        {/* MODEL EVALUATION */}

        <ModelEvaluation />
      </div>

      {/* =================================================
          CONJUNCTION SCREENING RADAR
      ================================================= */}

      <div
        className="card hud-card"
        style={{
          minHeight:
            "360px",
        }}
      >
        <div className="card-head">
          <h3>
            <Icon
              name="target"
              size={18}
              style={{
                color:
                  "var(--accent)",
              }}
            />

            {" "}

            Conjunction Screening
            / Radar
          </h3>

          <span className="chip success">
            VISUALIZATION
          </span>
        </div>

        <div
          style={{
            minHeight:
              "280px",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <MiniRadar />
        </div>
      </div>

      {/* =================================================
          FOOTNOTE
      ================================================= */}

      <div
        style={{
          fontSize: "10.5px",
          color:
            "var(--text-muted)",
          padding:
            "2px 2px 12px",
          lineHeight: 1.5,
        }}
      >
        Dashboard metrics represent
        evaluated ASTRA model results.
        Orbital globe and radar
        components are interface
        visualizations and are not
        live satellite telemetry.
      </div>
    </div>
  );
}