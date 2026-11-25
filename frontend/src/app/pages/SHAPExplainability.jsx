import { useEffect, useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "astra_latest_cdm_prediction";

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value, digits = 6) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return number.toFixed(digits);
};

const formatFeatureValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value.toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : "N/A";
  }

  return String(value);
};

const formatFeatureName = (name) => {
  return String(name)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString();
};

/* =========================================================
   SHAP EXPLAINABILITY PAGE
========================================================= */

export default function SHAPExplainability() {
  const [prediction, setPrediction] = useState(null);

  /* =========================================================
     LOAD LATEST PREDICTION
  ========================================================= */

  useEffect(() => {
    const loadPrediction = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
          setPrediction(null);
          return;
        }

        const parsed = JSON.parse(saved);

        setPrediction(parsed);
      } catch (error) {
        console.error(
          "Unable to load ASTRA prediction:",
          error
        );

        setPrediction(null);
      }
    };

    loadPrediction();

    window.addEventListener("focus", loadPrediction);

    window.addEventListener("storage", loadPrediction);

    return () => {
      window.removeEventListener("focus", loadPrediction);

      window.removeEventListener("storage", loadPrediction);
    };
  }, []);

  /* =========================================================
     SHAP DATA
  ========================================================= */

  const explanation = prediction?.explanation;

  const contributions = useMemo(() => {
    if (!Array.isArray(explanation?.contributions)) {
      return [];
    }

    return [...explanation.contributions]
      .filter((item) => {
        return Number.isFinite(Number(item.shap_value));
      })
      .sort((a, b) => {
        return (
          Math.abs(Number(b.shap_value)) -
          Math.abs(Number(a.shap_value))
        );
      });
  }, [explanation]);

  const positiveContributions = useMemo(() => {
    return contributions
      .filter((item) => Number(item.shap_value) > 0)
      .sort(
        (a, b) =>
          Number(b.shap_value) -
          Number(a.shap_value)
      );
  }, [contributions]);

  const negativeContributions = useMemo(() => {
    return contributions
      .filter((item) => Number(item.shap_value) < 0)
      .sort(
        (a, b) =>
          Number(a.shap_value) -
          Number(b.shap_value)
      );
  }, [contributions]);

  const hasExplanation = Boolean(
    explanation &&
    contributions.length > 0
  );

  const baseline = Number(explanation?.base_value);

  const finalPrediction = Number(
    explanation?.final_prediction
  );

  const reconstructedPrediction = Number(
    explanation?.reconstructed_prediction
  );

  const shapSum = Number(
    explanation?.sum_of_shap_values
  );

  const absoluteDifference = Number(
    explanation?.absolute_difference
  );

  const tolerance = Number(
    explanation?.additivity_tolerance
  );

  const maxShapMagnitude = useMemo(() => {
    return Math.max(
      ...contributions.map((item) =>
        Math.abs(Number(item.shap_value))
      ),
      0.000001
    );
  }, [contributions]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* HEADER */}

      <div className="page-head">
        <div>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon
              name="activity"
              style={{
                color: "var(--accent)",
              }}
            />

            SHAP Explainability
          </h1>

          <p>
            Interpretable AI analysis of satellite
            conjunction risk predictions using
            SHAP feature attribution.
          </p>
        </div>

        <span className="chip info">
          CATBOOST MODEL
        </span>
      </div>

      {/* NO PREDICTION */}

      {!prediction && (
        <div className="card hud-card">
          <div
            style={{
              textAlign: "center",
              padding: 45,
            }}
          >
            <Icon
              name="activity"
              size={42}
              style={{
                color: "var(--accent)",
              }}
            />

            <h3 style={{ marginTop: 15 }}>
              No Prediction Available
            </h3>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                marginTop: 8,
              }}
            >
              Upload and analyze a CDM dataset
              to generate a prediction and its
              SHAP explanation.
            </p>
          </div>
        </div>
      )}

      {/* PREDICTION DETAILS */}

      {prediction && (
        <>
          {/* PREDICTION OVERVIEW */}

          <div className="grid cols-3">
            <div className="card hud-card">
              <span className="k-label">
                RISK CATEGORY
              </span>

              <h2
                style={{
                  marginTop: 12,
                  color: "var(--accent)",
                }}
              >
                {prediction.classification || "N/A"}
              </h2>
            </div>

            <div className="card hud-card">
              <span className="k-label">
                RISK SCORE
              </span>

              <h2 style={{ marginTop: 12 }}>
                {formatNumber(prediction.riskScore, 4)}
              </h2>
            </div>

            <div className="card hud-card">
              <span className="k-label">
                LOG10(Pc)
              </span>

              <h2 style={{ marginTop: 12 }}>
                {formatNumber(
                  prediction.log10Probability,
                  6
                )}
              </h2>
            </div>
          </div>

          {/* DATASET INFORMATION */}

          <div className="card hud-card">
            <div className="card-head">
              <h3>
                <Icon name="file" size={16} />
                Prediction Information
              </h3>
            </div>

            <div className="grid cols-3">
              <div>
                <span className="k-label">
                  DATASET
                </span>

                <p style={{ marginTop: 8 }}>
                  {prediction.fileName || "N/A"}
                </p>
              </div>

              <div>
                <span className="k-label">
                  UPLOAD TIME
                </span>

                <p style={{ marginTop: 8 }}>
                  {formatDate(prediction.uploadedAt)}
                </p>
              </div>

              <div>
                <span className="k-label">
                  MODEL
                </span>

                <p style={{ marginTop: 8 }}>
                  CatBoostRegressor
                </p>
              </div>
            </div>
          </div>

          {/* SHAP SUMMARY */}

          <div className="card hud-card">
            <div className="card-head">
              <h3>
                <Icon name="activity" size={16} />
                SHAP Summary
              </h3>

              <span className="chip info">
                FEATURE ATTRIBUTION
              </span>
            </div>

            {!hasExplanation ? (
              <div
                style={{
                  padding: 25,
                  textAlign: "center",
                }}
              >
                <h3>
                  SHAP Explanation Not Available
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    marginTop: 10,
                  }}
                >
                  The prediction is available, but
                  the backend explanation response
                  does not contain valid feature
                  contribution data.
                </p>
              </div>
            ) : (
              <div className="grid cols-3">
                <div>
                  <span className="k-label">
                    BASELINE PREDICTION
                  </span>

                  <h2 style={{ marginTop: 10 }}>
                    {formatNumber(baseline)}
                  </h2>
                </div>

                <div>
                  <span className="k-label">
                    FINAL PREDICTION
                  </span>

                  <h2 style={{ marginTop: 10 }}>
                    {formatNumber(finalPrediction)}
                  </h2>
                </div>

                <div>
                  <span className="k-label">
                    FEATURE COUNT
                  </span>

                  <h2 style={{ marginTop: 10 }}>
                    {contributions.length}
                  </h2>
                </div>
              </div>
            )}
          </div>

          {/* SHAP CONTENT */}

          {hasExplanation && (
            <>
              {/* COMPLETE FEATURE CONTRIBUTIONS */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    Complete Feature Contributions
                  </h3>

                  <span className="chip info">
                    RANKED BY IMPACT
                  </span>
                </div>

                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Feature</th>
                        <th>Original Value</th>
                        <th>SHAP Value</th>
                        <th>Impact</th>
                      </tr>
                    </thead>

                    <tbody>
                      {contributions.map((item, index) => {
                        const value = Number(item.shap_value);

                        return (
                          <tr
                            key={`${item.feature}-${index}`}
                          >
                            <td className="mono">
                              {index + 1}
                            </td>

                            <td>
                              <b>
                                {formatFeatureName(
                                  item.feature
                                )}
                              </b>
                            </td>

                            <td className="mono">
                              {formatFeatureValue(
                                item.feature_value
                              )}
                            </td>

                            <td className="mono">
                              {formatNumber(value)}
                            </td>

                            <td>
                              <span
                                className={`chip ${
                                  value > 0
                                    ? "danger"
                                    : value < 0
                                    ? "success"
                                    : "info"
                                }`}
                              >
                                {value > 0
                                  ? "Increases Prediction"
                                  : value < 0
                                  ? "Decreases Prediction"
                                  : "No Contribution"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* POSITIVE CONTRIBUTIONS */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    Positive Contributions
                  </h3>

                  <span className="chip danger">
                    INCREASES PREDICTION
                  </span>
                </div>

                {positiveContributions.map((item, index) => (
                  <div
                    key={`${item.feature}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 15,
                      padding: "12px 0",
                      borderBottom:
                        "1px solid var(--border)",
                    }}
                  >
                    <span>
                      {formatFeatureName(item.feature)}
                    </span>

                    <b
                      className="mono"
                      style={{
                        color: "var(--danger)",
                      }}
                    >
                      +{formatNumber(item.shap_value)}
                    </b>
                  </div>
                ))}

                {positiveContributions.length === 0 && (
                  <p>No positive contributions.</p>
                )}
              </div>

              {/* NEGATIVE CONTRIBUTIONS */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    Negative Contributions
                  </h3>

                  <span className="chip success">
                    DECREASES PREDICTION
                  </span>
                </div>

                {negativeContributions.map((item, index) => (
                  <div
                    key={`${item.feature}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 15,
                      padding: "12px 0",
                      borderBottom:
                        "1px solid var(--border)",
                    }}
                  >
                    <span>
                      {formatFeatureName(item.feature)}
                    </span>

                    <b
                      className="mono"
                      style={{
                        color: "var(--success)",
                      }}
                    >
                      {formatNumber(item.shap_value)}
                    </b>
                  </div>
                ))}

                {negativeContributions.length === 0 && (
                  <p>No negative contributions.</p>
                )}
              </div>

              {/* SHAP FEATURE IMPACT CHART */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    SHAP Feature Impact Chart
                  </h3>

                  <span className="chip info">
                    ALL FEATURES
                  </span>
                </div>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 12,
                    marginBottom: 18,
                  }}
                >
                  Bar length represents the absolute
                  magnitude of each feature's SHAP
                  contribution.
                </p>

                {contributions.map((item, index) => {
                  const value = Number(item.shap_value);

                  const width =
                    (Math.abs(value) / maxShapMagnitude) *
                    100;

                  return (
                    <div
                      key={`${item.feature}-${index}`}
                      style={{
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          fontSize: 12,
                          marginBottom: 6,
                        }}
                      >
                        <b>
                          {formatFeatureName(item.feature)}
                        </b>

                        <span className="mono">
                          {value > 0 ? "+" : ""}
                          {formatNumber(value)}
                        </span>
                      </div>

                      <div
                        style={{
                          height: 10,
                          background: "var(--border)",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${width}%`,
                            height: "100%",
                            background:
                              value > 0
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
              </div>

              {/* ADDITIVITY VERIFICATION */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    SHAP Additivity Verification
                  </h3>
                </div>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  The baseline prediction plus the sum
                  of all SHAP contributions should
                  reconstruct the final CatBoost model
                  prediction.
                </p>

                <div
                  style={{
                    marginTop: 15,
                    padding: 15,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    overflowX: "auto",
                  }}
                >
                  <p className="k-label">
                    BASELINE + SHAP SUM
                  </p>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(baseline)} +{" "}
                    {formatNumber(shapSum)}
                  </h3>

                  <p
                    className="k-label"
                    style={{ marginTop: 15 }}
                  >
                    RECONSTRUCTED PREDICTION
                  </p>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(reconstructedPrediction)}
                  </h3>

                  <p
                    className="k-label"
                    style={{ marginTop: 15 }}
                  >
                    ACTUAL MODEL PREDICTION
                  </p>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(
                      explanation.model_prediction
                    )}
                  </h3>

                  <p
                    className="k-label"
                    style={{ marginTop: 15 }}
                  >
                    ABSOLUTE DIFFERENCE
                  </p>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(absoluteDifference, 12)}
                  </h3>

                  <p
                    className="k-label"
                    style={{ marginTop: 15 }}
                  >
                    ALLOWED TOLERANCE
                  </p>

                  <h3
                    className="mono"
                    style={{ marginTop: 8 }}
                  >
                    {formatNumber(tolerance, 8)}
                  </h3>
                </div>

                <span
                  className={`chip ${
                    explanation.additivity_verified
                      ? "success"
                      : "danger"
                  }`}
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                  }}
                >
                  {explanation.additivity_verified
                    ? "ADDITIVITY VERIFIED"
                    : "ADDITIVITY NOT VERIFIED"}
                </span>
              </div>

              {/* AUTOMATIC INTERPRETATION */}

              <div className="card hud-card">
                <div className="card-head">
                  <h3>
                    Model Interpretation
                  </h3>

                  <span className="chip info">
                    SHAP ANALYSIS
                  </span>
                </div>

                <p
                  style={{
                    lineHeight: 1.8,
                    color: "var(--text-secondary)",
                  }}
                >
                  {explanation.interpretation ||
                    "Interpretation is not available from the backend."}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}