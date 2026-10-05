import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import InteractiveGlobe from "../components/InteractiveGlobe.jsx";
import MiniRadar from "../components/MiniRadar.jsx";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

/* =========================================================
   ASTRA MODEL METRICS
   These values are taken from the evaluated project model.
   ========================================================= */

const MODEL_METRICS = {
  r2: 76.6,
  mae: 3.2,
  rmse: 4.78,
  highRiskRecall: 77.96,
  weightedF1: 86.06,

  validationEvents: 2586,
  actualHighRiskEvents: 1621,
  predictedHighRiskEvents: 1414,
  earlyWarningEvents: 27,

  highRiskShare: 32.27,
  mediumRiskShare: 17.17,
  lowRiskShare: 50.56,
};

/* -------------------- Sparkline Helper -------------------- */

function Sparkline({
  data,
  color = "var(--accent)",
  height = 40,
}) {
  const chartData = data.map((v, i) => ({
    i,
    v,
  }));

  const gradientId = `grad-${color.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}`;

  return (
    <div
      style={{
        width: "100%",
        height,
      }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={chartData}
          margin={{
            top: 2,
            right: 2,
            left: 2,
            bottom: 2,
          }}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={0.4}
              />

              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------- KPI Card Helper -------------------- */

function KPI({
  label,
  value,
  description,
  icon,
  sparkData,
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
            color: "var(--text-muted)",
            marginTop: "4px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}

      {sparkData && (
        <Sparkline
          data={sparkData}
          color={
            accentColor ||
            "var(--accent)"
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   MODEL EVALUATION PANEL
   ========================================================= */

function ModelEvaluationPanel() {
  return (
    <div className="card hud-card">
      <div className="card-head">
        <h3>
          <Icon
            name="activity"
            size={18}
            style={{
              color:
                "var(--accent)",
            }}
          />{" "}
          Model Evaluation
        </h3>

        <span className="chip info">
          VALIDATION RESULTS
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "140px 1fr",
          gap: "20px",
          alignItems: "center",
        }}
      >
        {/* R² Gauge */}
        <div
          style={{
            position: "relative",
            width: "140px",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
          >
            <circle
              cx="70"
              cy="70"
              r="65"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
            />

            <circle
              cx="70"
              cy="70"
              r="65"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="10"
              strokeDasharray={
                2 * Math.PI * 65
              }
              strokeDashoffset={
                2 *
                  Math.PI *
                  65 -
                (MODEL_METRICS.r2 /
                  100) *
                  (2 *
                    Math.PI *
                    65)
              }
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>

          <div
            style={{
              position: "absolute",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "800",
                fontFamily:
                  "JetBrains Mono",
                color:
                  "var(--accent)",
                lineHeight: 1,
              }}
            >
              {MODEL_METRICS.r2}%
            </div>

            <div
              style={{
                fontSize: "9px",
                textTransform:
                  "uppercase",
                letterSpacing:
                  "0.08em",
                color:
                  "var(--text-muted)",
                marginTop: "5px",
              }}
            >
              R²
            </div>
          </div>
        </div>

        {/* Model Metrics */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: "12px",
                marginBottom:
                  "4px",
                color:
                  "var(--text-secondary)",
              }}
            >
              <span>
                Model
              </span>

              <b
                className="mono"
                style={{
                  color:
                    "var(--text)",
                }}
              >
                CatBoostRegressor
              </b>
            </div>

            <div className="progress success">
              <span
                style={{
                  width: "100%",
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
                fontSize: "12px",
                marginBottom:
                  "4px",
                color:
                  "var(--text-secondary)",
              }}
            >
              <span>
                High-Risk Recall
              </span>

              <b
                className="mono"
                style={{
                  color:
                    "var(--danger)",
                }}
              >
                {
                  MODEL_METRICS.highRiskRecall
                }
                %
              </b>
            </div>

            <div className="progress danger">
              <span
                style={{
                  width: `${MODEL_METRICS.highRiskRecall}%`,
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
                fontSize: "12px",
                marginBottom:
                  "4px",
                color:
                  "var(--text-secondary)",
              }}
            >
              <span>
                Weighted F1
              </span>

              <b
                className="mono"
                style={{
                  color:
                    "var(--accent)",
                }}
              >
                {
                  MODEL_METRICS.weightedF1
                }
                %
              </b>
            </div>

            <div className="progress">
              <span
                style={{
                  width: `${MODEL_METRICS.weightedF1}%`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              paddingTop: "8px",
              borderTop:
                "1px solid var(--border)",
              display: "flex",
              justifyContent:
                "space-between",
              fontSize: "11.5px",
            }}
          >
            <span>
              Evaluation Events
            </span>

            <b className="mono">
              {
                MODEL_METRICS.validationEvents
              }
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RISK DISTRIBUTION PANEL
   ========================================================= */

function RiskDistributionPanel() {
  const segments = [
    {
      label: "High",
      value:
        MODEL_METRICS.highRiskShare,
      color: "#FF4D4D",
    },
    {
      label: "Medium",
      value:
        MODEL_METRICS.mediumRiskShare,
      color: "#FFB300",
    },
    {
      label: "Low",
      value:
        MODEL_METRICS.lowRiskShare,
      color: "#4EA8FF",
    },
  ];

  return (
    <div className="card hud-card">
      <div className="card-head">
        <h3>
          <Icon
            name="target"
            size={18}
            style={{
              color:
                "var(--accent)",
            }}
          />{" "}
          Risk Distribution
        </h3>

        <span className="chip">
          EVALUATED DATA
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          gap: "24px",
          padding:
            "10px 0 16px",
        }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 42 42"
        >
          <circle
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />

          {segments.reduce(
            (acc, segment, index) => {
              const offset =
                acc.total;

              acc.total +=
                segment.value;

              acc.elements.push(
                <circle
                  key={segment.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={
                    segment.color
                  }
                  strokeWidth="6"
                  strokeDasharray={`${segment.value} ${100 - segment.value}`}
                  strokeDashoffset={
                    100 - offset
                  }
                  transform="rotate(-90 21 21)"
                />
              );

              return acc;
            },
            {
              total: 0,
              elements: [],
            }
          ).elements}

          <text
            x="21"
            y="20"
            textAnchor="middle"
            fontSize="5"
            fill="#fff"
            fontWeight="700"
          >
            100%
          </text>

          <text
            x="21"
            y="26"
            textAnchor="middle"
            fontSize="2.6"
            fill="#5F708A"
          >
            distribution
          </text>
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "12px",
            minWidth: "120px",
          }}
        >
          {segments.map(
            (segment) => (
              <div
                key={
                  segment.label
                }
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "14px",
                  fontSize:
                    "12px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius:
                        "50%",
                      background:
                        segment.color,
                    }}
                  />

                  {segment.label}
                </span>

                <b className="mono">
                  {segment.value}%
                </b>
              </div>
            )
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: "10.5px",
          color:
            "var(--text-muted)",
          borderTop:
            "1px solid var(--border)",
          paddingTop: "10px",
        }}
      >
        Distribution of evaluated
        conjunction-risk classes.
      </div>
    </div>
  );
}

/* =========================================================
   EVALUATION SUMMARY
   ========================================================= */

const EVALUATION_SUMMARY = [
  {
    label: "Validation Events",
    value:
      MODEL_METRICS.validationEvents,
    description:
      "Event-level validation set",
    icon: "activity",
    color: "var(--accent)",
  },
  {
    label: "Actual High-Risk Events",
    value:
      MODEL_METRICS.actualHighRiskEvents,
    description:
      "Ground-truth high-risk events",
    icon: "target",
    color: "var(--danger)",
  },
  {
    label: "Predicted High-Risk Events",
    value:
      MODEL_METRICS.predictedHighRiskEvents,
    description:
      "Events classified as high risk",
    icon: "bell",
    color: "var(--warning)",
  },
  {
    label: "Early-Warning Events",
    value:
      MODEL_METRICS.earlyWarningEvents,
    description:
      "Events warned before first high-risk step",
    icon: "clock",
    color: "var(--electric)",
  },
];

/* =========================================================
   RISK CLASSIFICATION SUMMARY
   ========================================================= */

const RISK_CLASSIFICATION = [
  {
    label: "High",
    value:
      MODEL_METRICS.highRiskShare,
    color: "#FF4D4D",
  },
  {
    label: "Medium",
    value:
      MODEL_METRICS.mediumRiskShare,
    color: "#FFB300",
  },
  {
    label: "Low",
    value:
      MODEL_METRICS.lowRiskShare,
    color: "#4EA8FF",
  },
];

/* =========================================================
   SCREENING TREND
   This is explicitly presented as an illustrative view.
   It is not presented as live operational telemetry.
   ========================================================= */

const SCREENING_TREND = [
  {
    label: "Validation",
    value:
      MODEL_METRICS.validationEvents,
  },
  {
    label: "Actual High",
    value:
      MODEL_METRICS.actualHighRiskEvents,
  },
  {
    label: "Predicted High",
    value:
      MODEL_METRICS.predictedHighRiskEvents,
  },
  {
    label: "Early Warning",
    value:
      MODEL_METRICS.earlyWarningEvents,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [refreshing, setRefreshing] =
    useState(false);

  const handleRefreshScreening = () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const handleAlertDispatch = () => {
    navigate("/alerts");
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
      {/* =====================================================
          MISSION BANNER
      ===================================================== */}

      <div className="mission-banner live-hud-banner">
        <div>
          <div
            className="m-title"
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >
            <span className="pulse-dot-red" />

            <span>
              CONJUNCTION RISK
              SCREENING
            </span>

            <span className="chip danger glow-chip">
              {refreshing
                ? "REFRESHING..."
                : "MODEL READY"}
            </span>
          </div>

          <div
            className="m-status"
            style={{
              marginTop: "4px",
            }}
          >
            <span className="pulse-dot" />{" "}
            ASTRA uses CatBoostRegressor
            to estimate future conjunction
            risk from CDM-derived features.
          </div>
        </div>

        <div className="m-meta">
          <div>
            <small>
              Model
            </small>

            <b className="mono">
              CatBoostRegressor
            </b>
          </div>

          <div>
            <small>
              R²
            </small>

            <b
              style={{
                color:
                  "var(--accent)",
              }}
            >
              {MODEL_METRICS.r2}%
            </b>
          </div>

          <div>
            <small>
              High-Risk Recall
            </small>

            <b
              style={{
                color:
                  "var(--danger)",
              }}
            >
              {
                MODEL_METRICS.highRiskRecall
              }
              %
            </b>
          </div>

          <div>
            <small>
              Validation Events
            </small>

            <b>
              {
                MODEL_METRICS.validationEvents
              }
            </b>
          </div>
        </div>

        {/* Working Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            className="btn ghost"
            onClick={
              handleRefreshScreening
            }
            disabled={refreshing}
            style={{
              opacity:
                refreshing
                  ? 0.7
                  : 1,
              cursor:
                refreshing
                  ? "wait"
                  : "pointer",
            }}
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
            onClick={
              handleAlertDispatch
            }
          >
            <Icon
              name="target"
              size={14}
            />

            View Risk Alerts
          </button>
        </div>
      </div>

      {/* =====================================================
          KPI METRICS
      ===================================================== */}

      <div className="grid cols-4">
        <KPI
          label="Validation Events"
          value={
            MODEL_METRICS.validationEvents
          }
          description="Event-level evaluation set"
          icon="activity"
          sparkData={[
            2180,
            2290,
            2410,
            2510,
            2586,
          ]}
          accentColor="var(--accent)"
        />

        <KPI
          label="Actual High-Risk"
          value={
            MODEL_METRICS.actualHighRiskEvents
          }
          description="Ground-truth high-risk events"
          icon="target"
          sparkData={[
            1410,
            1480,
            1535,
            1580,
            1621,
          ]}
          accentColor="var(--danger)"
        />

        <KPI
          label="Predicted High-Risk"
          value={
            MODEL_METRICS.predictedHighRiskEvents
          }
          description="Model high-risk classifications"
          icon="bell"
          sparkData={[
            1220,
            1280,
            1330,
            1380,
            1414,
          ]}
          accentColor="var(--warning)"
        />

        <KPI
          label="Early-Warning Events"
          value={
            MODEL_METRICS.earlyWarningEvents
          }
          description="Warned before first high-risk step"
          icon="clock"
          sparkData={[
            12,
            16,
            18,
            23,
            27,
          ]}
          accentColor="var(--electric)"
        />
      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className="grid dash-main-grid"
        style={{
          gridTemplateColumns:
            "1.4fr 1fr",
        }}
      >
        {/* SATELLITE / ORBIT VIEW */}

        <div className="card hud-card centerpiece-globe-card">
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={18}
                style={{
                  color:
                    "var(--accent)",
                }}
              />{" "}
              Satellite Orbit &
              Conjunction Overview
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

          <InteractiveGlobe />
        </div>

        {/* MODEL + RISK STATUS */}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "20px",
          }}
        >
          <ModelEvaluationPanel />

          <RiskDistributionPanel />
        </div>
      </div>

      {/* =====================================================
          EVALUATION SUMMARY
      ===================================================== */}

      <div className="grid cols-4">
        {EVALUATION_SUMMARY.map(
          (item) => (
            <div
              className="card hud-card"
              key={item.label}
            >
              <div className="card-head">
                <h3
                  style={{
                    fontSize:
                      "13px",
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                    style={{
                      color:
                        item.color,
                    }}
                  />{" "}
                  {item.label}
                </h3>
              </div>

              <div
                style={{
                  fontSize:
                    "28px",
                  fontWeight:
                    "800",
                  fontFamily:
                    "JetBrains Mono",
                  color:
                    item.color,
                  lineHeight: 1,
                  marginBottom:
                    "8px",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize:
                    "10.5px",
                  color:
                    "var(--text-muted)",
                  lineHeight: 1.4,
                }}
              >
                {item.description}
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================
          MODEL PERFORMANCE + RISK CLASSIFICATION
      ===================================================== */}

      <div
        className="grid cols-2"
        style={{
          gridTemplateColumns:
            "1.2fr 1fr",
        }}
      >
        {/* Model Performance */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="database"
                size={16}
              />{" "}
              Model Performance
            </h3>

            <span className="chip">
              CATBOOST
            </span>
          </div>

          {[
            [
              "R²",
              MODEL_METRICS.r2,
              `${MODEL_METRICS.r2}%`,
            ],
            [
              "High-Risk Recall",
              MODEL_METRICS.highRiskRecall,
              `${MODEL_METRICS.highRiskRecall}%`,
            ],
            [
              "Weighted F1",
              MODEL_METRICS.weightedF1,
              `${MODEL_METRICS.weightedF1}%`,
            ],
          ].map(
            ([
              name,
              barValue,
              displayValue,
            ]) => (
              <div
                className="fi-row"
                key={name}
              >
                <div className="fi-name">
                  {name}
                </div>

                <div className="fi-bar">
                  <span
                    style={{
                      width: `${barValue}%`,
                    }}
                  />
                </div>

                <div className="fi-val">
                  {displayValue}
                </div>
              </div>
            )
          )}

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop:
                "1px solid var(--border)",
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                }}
              >
                MAE
              </small>

              <div className="mono">
                {MODEL_METRICS.mae}
              </div>
            </div>

            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                }}
              >
                RMSE
              </small>

              <div className="mono">
                {MODEL_METRICS.rmse}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Classification */}

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
              MODEL OUTPUT
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "18px",
            }}
          >
            {RISK_CLASSIFICATION.map(
              (item) => (
                <div
                  key={item.label}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      fontSize:
                        "12px",
                      marginBottom:
                        "6px",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "7px",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius:
                            "50%",
                          background:
                            item.color,
                        }}
                      />

                      {item.label}
                    </span>

                    <b
                      className="mono"
                    >
                      {item.value}%
                    </b>
                  </div>

                  <div className="progress">
                    <span
                      style={{
                        width: `${item.value}%`,
                        background:
                          item.color,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div
            style={{
              marginTop: "18px",
              paddingTop: "12px",
              borderTop:
                "1px solid var(--border)",
              fontSize:
                "10.5px",
              color:
                "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            Risk classes are derived
            from the project-defined
            Low, Medium and High
            future-risk thresholds.
          </div>
        </div>
      </div>

      {/* =====================================================
          EVALUATION COMPARISON
      ===================================================== */}

      <div className="grid cols-2">
        {/* Evaluation Overview */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="activity"
                size={16}
              />{" "}
              Evaluation Overview
            </h3>

            <span className="chip">
              VALIDATION SET
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: 220,
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  SCREENING_TREND
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="label"
                  stroke="#808080"
                  fontSize={10}
                />

                <YAxis
                  stroke="#808080"
                  fontSize={10}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#121214",
                    border:
                      "1px solid var(--accent-border)",
                    borderRadius:
                      "6px",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="var(--accent)"
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              fontSize:
                "10.5px",
              color:
                "var(--text-muted)",
              marginTop:
                "4px",
            }}
          >
            Evaluation counts from
            the event-level validation
            results.
          </div>
        </div>

        {/* Future Risk Prediction */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={16}
              />{" "}
              Future Risk Prediction
            </h3>

            <span className="chip">
              +1 CDM
            </span>
          </div>

          <div className="chart-box">
            <svg
              viewBox="0 0 560 220"
              className="chart-svg"
              preserveAspectRatio="none"
              style={{
                width: "100%",
                height: "220px",
              }}
            >
              {/* Grid */}

              <g
                className="chart-grid"
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              >
                {[40, 90, 140, 180].map(
                  (y) => (
                    <line
                      key={y}
                      x1="30"
                      x2="550"
                      y1={y}
                      y2={y}
                    />
                  )
                )}
              </g>

              {/* Axes */}

              <line
                x1="30"
                y1="190"
                x2="530"
                y2="190"
                stroke="#888"
                strokeWidth="1"
              />

              <line
                x1="30"
                y1="30"
                x2="30"
                y2="190"
                stroke="#888"
                strokeWidth="1"
              />

              {/* Illustrative Shape
                  The chart is explicitly labelled
                  illustrative so it is not presented
                  as raw event-level observations. */}

              <polyline
                fill="none"
                stroke="#4EA8FF"
                strokeWidth="3"
                points="
                  30,170
                  110,130
                  190,110
                  270,90
                  350,70
                  430,60
                  510,50
                "
              />

              <polyline
                fill="none"
                stroke="#FFB300"
                strokeWidth="3"
                strokeDasharray="8 4"
                points="
                  30,160
                  110,140
                  190,120
                  270,100
                  350,80
                  430,70
                  510,60
                "
              />

              {/* Legend */}

              <rect
                x="350"
                y="35"
                width="15"
                height="6"
                fill="#4EA8FF"
              />

              <text
                x="370"
                y="40"
                fill="#fff"
                fontSize="10"
                alignmentBaseline="middle"
              >
                Actual Future Risk
              </text>

              <rect
                x="350"
                y="55"
                width="15"
                height="6"
                fill="#FFB300"
              />

              <text
                x="370"
                y="60"
                fill="#fff"
                fontSize="10"
                alignmentBaseline="middle"
              >
                Predicted Future Risk
              </text>
            </svg>
          </div>

          <div
            style={{
              fontSize:
                "10.5px",
              color:
                "var(--text-muted)",
              marginTop:
                "4px",
            }}
          >
            Illustrative visualization
            of actual versus predicted
            future-risk behavior for the
            +1 CDM model.
          </div>
        </div>
      </div>

      {/* =====================================================
          CONJUNCTION SCREENING RADAR + SYSTEM STATUS
      ===================================================== */}

      <div className="grid cols-2">
        {/* Screening Radar */}

        <div
          className="card hud-card"
          style={{
            display: "flex",
            flexDirection:
              "column",
            justifyContent:
              "space-between",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon
                name="target"
                size={16}
              />{" "}
              Conjunction Screening
              Radar
            </h3>

            <span className="chip success">
              VISUALIZATION
            </span>
          </div>

          <MiniRadar />

          <div
            style={{
              padding: "10px",
              background:
                "rgba(10, 10, 12, 0.8)",
              borderRadius:
                "6px",
              border:
                "1px solid var(--border)",
              marginTop:
                "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: "11px",
              }}
            >
              <span>
                CDM Input
              </span>

              <b
                style={{
                  color:
                    "var(--success)",
                }}
              >
                SUPPORTED
              </b>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: "11px",
                marginTop:
                  "4px",
              }}
            >
              <span>
                Model Inference
              </span>

              <b
                style={{
                  color:
                    "var(--accent)",
                }}
              >
                CatBoost
              </b>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: "11px",
                marginTop:
                  "4px",
              }}
            >
              <span>
                Prediction Target
              </span>

              <b
                style={{
                  color:
                    "var(--warning)",
                }}
              >
                FUTURE RISK
              </b>
            </div>
          </div>
        </div>

        {/* System / Model Status */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="database"
                size={16}
              />{" "}
              Model Status &
              Evaluation
            </h3>

            <span className="chip success">
              READY
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
                  fontSize:
                    "12px",
                  marginBottom:
                    "4px",
                }}
              >
                <span>
                  Model
                </span>

                <b
                  className="mono"
                  style={{
                    color:
                      "var(--success)",
                  }}
                >
                  CatBoostRegressor
                </b>
              </div>

              <div className="progress success">
                <span
                  style={{
                    width: "100%",
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
                  fontSize:
                    "12px",
                  marginBottom:
                    "4px",
                }}
              >
                <span>
                  R²
                </span>

                <b className="mono">
                  {MODEL_METRICS.r2}%
                </b>
              </div>

              <div className="progress success">
                <span
                  style={{
                    width: `${MODEL_METRICS.r2}%`,
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
                  fontSize:
                    "12px",
                  marginBottom:
                    "4px",
                }}
              >
                <span>
                  High-Risk Recall
                </span>

                <b className="mono">
                  {
                    MODEL_METRICS.highRiskRecall
                  }
                  %
                </b>
              </div>

              <div className="progress danger">
                <span
                  style={{
                    width: `${MODEL_METRICS.highRiskRecall}%`,
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
                  fontSize:
                    "12px",
                  marginBottom:
                    "4px",
                }}
              >
                <span>
                  Weighted F1
                </span>

                <b className="mono">
                  {
                    MODEL_METRICS.weightedF1
                  }
                  %
                </b>
              </div>

              <div className="progress">
                <span
                  style={{
                    width: `${MODEL_METRICS.weightedF1}%`,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                paddingTop: "10px",
                borderTop:
                  "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "10px",
                fontSize:
                  "11.5px",
              }}
            >
              <div>
                <span
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  MAE
                </span>

                <b
                  className="mono"
                  style={{
                    display:
                      "block",
                    marginTop:
                      "3px",
                  }}
                >
                  {MODEL_METRICS.mae}
                </b>
              </div>

              <div>
                <span
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  RMSE
                </span>

                <b
                  className="mono"
                  style={{
                    display:
                      "block",
                    marginTop:
                      "3px",
                  }}
                >
                  {MODEL_METRICS.rmse}
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTNOTE
      ===================================================== */}

      <div
        style={{
          fontSize: "10.5px",
          color:
            "var(--text-muted)",
          padding:
            "4px 2px 12px",
          lineHeight: 1.5,
        }}
      >
        Dashboard metrics represent the
        evaluated ASTRA model and validation
        results. Visual orbit and chart
        components are interface
        visualizations and should not be
        interpreted as live satellite
        telemetry.
      </div>
    </div>
  );
}