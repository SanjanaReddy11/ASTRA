import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";

export default function Home() {
  return (
    <div
      className="landing"
      style={{
        margin: "-24px -28px",
        overflow: "hidden",
      }}
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        className="hero"
        style={{
          position: "relative",
          padding: "80px 48px",
          background:
            "radial-gradient(ellipse at center, rgba(0,243,255,0.08) 0%, #050505 85%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="hero-inner"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              className="hero-eyebrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: "rgba(0,243,255,0.1)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              <span className="pulse-dot" />
              Machine-Learning Early-Warning System · ASTRA
            </span>

            <h1
              style={{
                fontSize: "48px",
                lineHeight: "1.1",
                fontWeight: "800",
                marginBottom: "20px",
              }}
            >
              Satellite Conjunction
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Risk Intelligence.
              </span>
            </h1>

            <p
              className="lead"
              style={{
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginBottom: "32px",
                maxWidth: "620px",
              }}
            >
              ASTRA is a machine-learning based early-warning triage
              system for high-risk satellite debris conjunctions. It uses
              Conjunction Data Messages (CDMs) and a CatBoostRegressor to
              predict future numerical risk at the next CDM.
            </p>

            <div
              className="hero-ctas"
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              <Link
                to="/dashboard"
                className="btn primary glow-btn"
                style={{
                  padding: "12px 28px",
                  fontSize: "15px",
                }}
              >
                Open Mission Dashboard
                <Icon name="arrowRight" size={18} />
              </Link>

              <Link
                to="/mission"
                className="btn"
                style={{
                  padding: "12px 24px",
                  fontSize: "15px",
                }}
              >
                View Project Scope
              </Link>
            </div>

            {/* REAL PROJECT METRICS */}
            <div
              className="hero-stats"
              style={{
                display: "flex",
                gap: "32px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
                flexWrap: "wrap",
              }}
            >
              <div className="s">
                <small
                  style={{
                    display: "block",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Training CDMs
                </small>

                <b
                  className="mono"
                  style={{
                    fontSize: "24px",
                    color: "var(--text)",
                  }}
                >
                  162,634
                </b>
              </div>

              <div className="s">
                <small
                  style={{
                    display: "block",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Model R²
                </small>

                <b
                  className="mono"
                  style={{
                    fontSize: "24px",
                    color: "var(--accent)",
                  }}
                >
                  0.766
                </b>
              </div>

              <div className="s">
                <small
                  style={{
                    display: "block",
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  High-Risk Recall
                </small>

                <b
                  className="mono"
                  style={{
                    fontSize: "24px",
                    color: "var(--success)",
                  }}
                >
                  77.96%
                </b>
              </div>
            </div>
          </div>

          {/* ORBIT VISUAL */}
          <div
            className="orbit-vis"
            aria-hidden="true"
            style={{
              position: "relative",
              height: "380px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, #0d121c, #050505)",
                boxShadow:
                  "0 0 60px rgba(0, 243, 255, 0.25), inset 0 0 40px rgba(0,0,0,0.9)",
                border:
                  "1px solid rgba(0, 243, 255, 0.4)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "340px",
                height: "340px",
                borderRadius: "50%",
                border:
                  "1px dashed rgba(0, 243, 255, 0.3)",
                animation: "spin 20s linear infinite",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "420px",
                height: "420px",
                borderRadius: "50%",
                border:
                  "1px solid rgba(255,51,68,0.25)",
                animation:
                  "spin 35s linear infinite reverse",
              }}
            />

            <div
              className="sat o1"
              style={{
                position: "absolute",
                top: "40px",
                right: "60px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow:
                  "0 0 16px var(--accent)",
              }}
            />

            <div
              className="sat o2"
              style={{
                position: "absolute",
                bottom: "60px",
                left: "80px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "var(--danger)",
                boxShadow:
                  "0 0 16px var(--danger)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform:
                  "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: "34px",
                  fontWeight: "800",
                  color: "var(--accent)",
                }}
              >
                +1
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                CDM Prediction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CAPABILITIES
      ========================================================= */}
      <section
        className="section"
        style={{
          padding: "64px 48px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div className="section-inner">
          <div
            className="section-title"
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            <div
              className="eyebrow"
              style={{
                color: "var(--accent)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "700",
              }}
            >
              Capabilities
            </div>

            <h2
              style={{
                fontSize: "32px",
                marginTop: "8px",
              }}
            >
              From CDM data to future-risk assessment
            </h2>

            <p
              style={{
                maxWidth: "650px",
                margin: "12px auto 0",
              }}
            >
              ASTRA combines validated CDM data, machine-learning
              prediction and risk classification into a single
              conjunction-screening workflow.
            </p>
          </div>

          <div
            className="feature-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {[
              {
                i: "activity",
                t: "Future-Risk Prediction",
                d: "CatBoostRegressor predicts numerical risk at the next CDM using information from the current conjunction state.",
              },
              {
                i: "target",
                t: "CDM Data Processing",
                d: "Upload, validate and preprocess Conjunction Data Message datasets before sending them through the prediction pipeline.",
              },
              {
                i: "bell",
                t: "Risk Classification",
                d: "Predicted future risk is mapped into Low, Medium or High categories to support conjunction screening and prioritization.",
              },
              {
                i: "chart",
                t: "Model Analytics",
                d: "Review regression performance, risk distributions and screening trends using the project's evaluated CatBoost model metrics.",
              },
              {
                i: "clock",
                t: "Processing Timeline",
                d: "Track a dataset from CDM upload and validation through preprocessing, future-risk prediction and classification.",
              },
              {
                i: "database",
                t: "Dataset Integrity",
                d: "Uploaded datasets can be verified using SHA-256 integrity hashing before they enter the screening workflow.",
              },
            ].map((f) => (
              <div
                className="card hud-card"
                key={f.t}
                style={{
                  padding: "28px",
                }}
              >
                <div
                  className="f-ic"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background:
                      "rgba(78,168,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    marginBottom: "16px",
                  }}
                >
                  <Icon
                    name={f.i}
                    size={22}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  {f.t}
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WORKFLOW
      ========================================================= */}
      <section
        className="section"
        style={{
          padding: "64px 48px",
          background:
            "rgba(10,10,12,0.7)",
          borderTop:
            "1px solid var(--border)",
          borderBottom:
            "1px solid var(--border)",
        }}
      >
        <div
          className="section-inner"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <div
            className="section-title"
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            <div
              className="eyebrow"
              style={{
                color: "var(--accent)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "700",
              }}
            >
              Workflow
            </div>

            <h2
              style={{
                fontSize: "32px",
                marginTop: "8px",
              }}
            >
              From CDM upload to conjunction alert
            </h2>
          </div>

          <div
            className="workflow"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(5, 1fr)",
              gap: "16px",
            }}
          >
            {[
              [
                "01",
                "Upload",
                "CDM dataset intake",
              ],
              [
                "02",
                "Validate",
                "Structure and integrity checks",
              ],
              [
                "03",
                "Preprocess",
                "Prepare model features",
              ],
              [
                "04",
                "Predict",
                "CatBoost future-risk prediction",
              ],
              [
                "05",
                "Classify",
                "Low / Medium / High risk",
              ],
            ].map(([n, t, d]) => (
              <div
                className="card hud-card"
                key={n}
                style={{
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  className="wf-num mono"
                  style={{
                    fontSize: "11px",
                    color:
                      "var(--accent-glow)",
                    letterSpacing:
                      "0.08em",
                    marginBottom: "8px",
                  }}
                >
                  STEP {n}
                </div>

                <h4
                  style={{
                    fontSize: "16px",
                    marginBottom: "6px",
                  }}
                >
                  {t}
                </h4>

                <p
                  style={{
                    fontSize: "12px",
                  }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECT OBJECTIVES + ARCHITECTURE
      ========================================================= */}
      <section
        className="section"
        style={{
          padding: "64px 48px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div className="section-inner">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "48px",
            }}
          >
            {/* PROJECT OBJECTIVES */}
            <div>
              <div
                className="eyebrow"
                style={{
                  color: "var(--accent)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: "700",
                }}
              >
                Project Objectives
              </div>

              <h2
                style={{
                  marginBottom: "20px",
                  marginTop: "8px",
                }}
              >
                Earlier identification of important conjunction risk.
              </h2>

              <ul
                style={{
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {[
                  "Use current CDM information to predict numerical risk at the next CDM.",
                  "Classify future conjunction risk into Low, Medium and High categories.",
                  "Support screening and prioritization of potentially important conjunction events.",
                  "Provide dataset integrity verification through SHA-256 hashing.",
                  "Maintain processing, alert and report information for operational review.",
                ].map((o) => (
                  <li
                    key={o}
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems:
                        "flex-start",
                    }}
                  >
                    <span
                      style={{
                        marginTop: "6px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          "var(--accent-glow)",
                        boxShadow:
                          "0 0 10px var(--accent)",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        color:
                          "var(--text-secondary)",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      {o}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ARCHITECTURE */}
            <div>
              <div
                className="eyebrow"
                style={{
                  color: "var(--accent)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: "700",
                }}
              >
                Architecture Preview
              </div>

              <h2
                style={{
                  marginBottom: "20px",
                  marginTop: "8px",
                }}
              >
                CDM-driven ML screening pipeline.
              </h2>

              <div
                className="arch-preview"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  [
                    "Data Intake",
                    "CSV · XLSX · CDM datasets",
                  ],
                  [
                    "Integrity",
                    "SHA-256 verification",
                  ],
                  [
                    "Preprocessing",
                    "Validated model features",
                  ],
                  [
                    "ML Core",
                    "CatBoostRegressor",
                  ],
                  [
                    "Risk Output",
                    "Future numerical risk",
                  ],
                  [
                    "Classification",
                    "Low · Medium · High",
                  ],
                  [
                    "Alerts",
                    "Conjunction risk alerts",
                  ],
                  [
                    "Reports",
                    "Screening reports · PDF/TXT",
                  ],
                ].map(
                  ([title, desc]) => (
                    <div
                      key={title}
                      className="card"
                      style={{
                        padding: "14px",
                      }}
                    >
                      <b
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color:
                            "var(--text)",
                        }}
                      >
                        {title}
                      </b>

                      <small
                        style={{
                          fontSize: "11px",
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        {desc}
                      </small>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MODEL SUMMARY
      ========================================================= */}
      <section
        className="section"
        style={{
          padding: "0 48px 72px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <div
          className="card hud-card"
          style={{
            padding: "28px",
            borderColor:
              "var(--accent-border)",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon
                name="activity"
                size={16}
              />{" "}
              CatBoost Model Summary
            </h3>

            <span className="chip success">
              +1 CDM
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "24px",
              marginTop: "20px",
            }}
          >
            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                  fontSize: "10px",
                }}
              >
                Model
              </small>

              <div
                className="mono"
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                  color:
                    "var(--accent)",
                }}
              >
                CatBoostRegressor
              </div>
            </div>

            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                  fontSize: "10px",
                }}
              >
                R²
              </small>

              <div
                className="mono"
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                }}
              >
                0.766
              </div>
            </div>

            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                  fontSize: "10px",
                }}
              >
                MAE
              </small>

              <div
                className="mono"
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                }}
              >
                3.20
              </div>
            </div>

            <div>
              <small
                style={{
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                  fontSize: "10px",
                }}
              >
                High-Risk Recall
              </small>

              <div
                className="mono"
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                  color:
                    "var(--success)",
                }}
              >
                77.96%
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}