export default function MissionOverview() {
  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>Mission Overview & Project Scope</h1>

          <p>
            ASTRA — Machine-Learning Early-Warning Triage
            for High-Risk Satellite Debris Conjunctions.
          </p>
        </div>

        <span className="chip success">
          Active · ML Screening
        </span>
      </div>

      {/* -------------------- PROJECT METRICS -------------------- */}
      <div
        className="grid cols-3"
        style={{ marginBottom: 20 }}
      >
        {[
          [
            "Training CDMs",
            "162,634",
            "13,154 conjunction events",
          ],
          [
            "Test CDMs",
            "24,484",
            "2,167 conjunction events",
          ],
          [
            "Prediction Horizon",
            "+1 CDM",
            "Future-risk prediction",
          ],
        ].map(([label, value, subtext]) => (
          <div
            className="card hud-card"
            key={label}
          >
            <div className="card-head">
              <h3>{label}</h3>
            </div>

            <div
              className="mono"
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "var(--accent-glow)",
              }}
            >
              {value}
            </div>

            <p
              style={{
                fontSize: 12.5,
                marginTop: 6,
              }}
            >
              {subtext}
            </p>
          </div>
        ))}
      </div>

      {/* -------------------- PROJECT OVERVIEW -------------------- */}
      <div className="grid cols-2">
        <div className="card hud-card">
          <div className="card-head">
            <h3>Project Scope</h3>

            <span className="chip info">
              ASTRA
            </span>
          </div>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
            }}
          >
            ASTRA is a machine-learning based early-warning
            system for triaging high-risk satellite debris
            conjunction events. The system works with
            Conjunction Data Messages (CDMs) and uses
            information from the current conjunction state to
            predict the numerical risk at the next CDM.
          </p>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              marginTop: 12,
            }}
          >
            The predicted future risk is then mapped into
            Low, Medium or High risk categories to support
            earlier identification and prioritization of
            potentially important conjunction events.
          </p>
        </div>

        {/* -------------------- ML PIPELINE -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>Machine Learning Pipeline</h3>

            <span className="chip success">
              CATBOOST
            </span>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              [
                "01",
                "CDM Data",
                "Input conjunction data",
              ],
              [
                "02",
                "Preprocessing",
                "Feature preparation and validation",
              ],
              [
                "03",
                "CatBoost",
                "Future numerical risk prediction",
              ],
              [
                "04",
                "Classification",
                "Low / Medium / High risk",
              ],
              [
                "05",
                "Alert",
                "Generate alerts from classified risk",
              ],
            ].map(([step, title, description]) => (
              <li
                key={step}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "48px 140px 1fr",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom:
                    "1px solid var(--border)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  {step}
                </span>

                <b>{title}</b>

                <span
                  style={{
                    color:
                      "var(--text-secondary)",
                    fontSize: 13,
                  }}
                >
                  {description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* -------------------- MODEL PERFORMANCE -------------------- */}
      <div
        className="grid cols-2"
        style={{ marginTop: 20 }}
      >
        <div className="card hud-card">
          <div className="card-head">
            <h3>Model Performance · +1 CDM</h3>

            <span className="chip info">
              INTERNAL TEST
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 12,
            }}
          >
            {[
              ["R²", "76.6%"],
              ["MAE", "3.20"],
              ["RMSE", "4.78"],
              ["High-Risk Recall", "77.96%"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="light-theme-panel"
              >
                <div className="k-label">
                  {label}
                </div>

                <div
                  className="mono"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    marginTop: 5,
                    color:
                      label === "High-Risk Recall"
                        ? "var(--warning)"
                        : "var(--accent)",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------------------- RISK CLASSIFICATION -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>Future-Risk Classification</h3>

            <span className="chip">
              +1 CDM
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize: 12,
                  marginBottom: 5,
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
                  fontSize: 12,
                  marginBottom: 5,
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
                  fontSize: 12,
                  marginBottom: 5,
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
          </div>
        </div>
      </div>

      {/* -------------------- DATASET INFORMATION -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginTop: 20,
        }}
      >
        <div className="card-head">
          <h3>Dataset & Prediction Context</h3>

          <span className="chip info">
            ESA CDM DATA
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {[
            [
              "CDM",
              "Conjunction Data Message",
            ],
            [
              "Target",
              "Future Numerical Risk",
            ],
            [
              "Model",
              "CatBoostRegressor",
            ],
            [
              "Output",
              "Low / Medium / High",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="light-theme-panel"
            >
              <div className="k-label">
                {label}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    label === "Model"
                      ? "var(--accent)"
                      : "var(--text)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- WORKFLOW -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginTop: 20,
          borderColor:
            "var(--accent-border)",
        }}
      >
        <div className="card-head">
          <h3>Operational Workflow</h3>

          <span className="chip success">
            ACTIVE
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(6, 1fr)",
            gap: 8,
          }}
        >
          {[
            "Upload CDM",
            "Validate",
            "Preprocess",
            "Predict +1 CDM",
            "Classify Risk",
            "Generate Alert",
          ].map((step, index) => (
            <div
              key={step}
              className="light-theme-panel workflow-panel"
            >
              <div
                className="mono"
                style={{
                  color:
                    "var(--accent)",
                  fontSize: 10,
                  marginBottom: 6,
                }}
              >
                0{index + 1}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}