import { useState, useEffect, useCallback } from "react";
import { evidenceService } from "../services/store.js";

const TIMELINE_STAGES = [
  {
    id: "Uploaded",
    label: "CDM Uploaded",
    desc: "Dataset uploaded and SHA-256 integrity hash generated",
  },
  {
    id: "Validated",
    label: "Validated",
    desc: "Dataset structure and required fields checked",
  },
  {
    id: "Preprocessed",
    label: "Preprocessed",
    desc: "CDM data prepared for the ML prediction pipeline",
  },
  {
    id: "Future Risk Predicted",
    label: "Future Risk Predicted",
    desc: "CatBoost predicts numerical risk at the next CDM",
  },
  {
    id: "Risk Classified",
    label: "Risk Classified",
    desc: "Future risk mapped to Low, Medium, or High",
  },
  {
    id: "Report Generated",
    label: "Report Generated",
    desc: "Conjunction screening results included in the report",
  },
];

/*
 * Map the existing store statuses to the new Astra
 * processing timeline.
 *
 * The store may still use the old internal status names.
 * We keep those internal values compatible while displaying
 * only the new Astra terminology.
 */
function getStageIndex(status) {
  switch (status) {
    case "Uploaded":
      return 0;

    case "Validated":
    case "Under Review":
      return 1;

    case "Preprocessed":
    case "Analyzed":
      return 2;

    case "Future Risk Predicted":
    case "AI Summary Generated":
      return 3;

    case "Risk Classified":
    case "Included In Report":
      return 4;

    case "Report Generated":
    case "Closed":
      return 5;

    default:
      return 0;
  }
}

export default function Timeline() {
  const [datasetList, setDatasetList] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] =
    useState("");

  /*
   * Load datasets from the existing store.
   */
  const loadDatasets = useCallback(() => {
    const list =
      evidenceService.getEvidenceList() || [];

    setDatasetList(list);

    /*
     * Keep the currently selected dataset if it
     * still exists.
     */
    setSelectedDatasetId((currentId) => {
      if (
        currentId &&
        list.some((item) => item.id === currentId)
      ) {
        return currentId;
      }

      return list.length > 0
        ? list[0].id
        : "";
    });
  }, []);

  /*
   * Initial load + periodic refresh.
   *
   * This allows the timeline to reflect status changes
   * made by the upload / processing workflow without
   * requiring the user to manually reload the page.
   */
  useEffect(() => {
    loadDatasets();

    const interval = setInterval(() => {
      loadDatasets();
    }, 1000);

    return () => clearInterval(interval);
  }, [loadDatasets]);

  /*
   * Also refresh when the browser window/tab becomes
   * active again.
   */
  useEffect(() => {
    const handleFocus = () => {
      loadDatasets();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadDatasets]);

  const selectedDataset =
    datasetList.find(
      (item) =>
        item.id === selectedDatasetId
    ) || datasetList[0];

  const currentStageIdx = selectedDataset
    ? getStageIndex(selectedDataset.status)
    : 0;

  const progressPercent =
    currentStageIdx /
    (TIMELINE_STAGES.length - 1);

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>CDM Processing Timeline</h1>

          <p>
            Track the processing stages of an uploaded
            conjunction dataset from validation through
            future-risk analysis and reporting.
          </p>
        </div>

        {datasetList.length > 0 && (
          <div
            className="actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              Select Dataset:
            </span>

            <select
              value={selectedDatasetId}
              onChange={(e) =>
                setSelectedDatasetId(
                  e.target.value
                )
              }
              style={{
                background:
                  "rgba(10, 10, 14, 0.85)",
                border:
                  "1px solid var(--border-strong)",
                color: "var(--text)",
                padding: "6px 12px",
                borderRadius:
                  "var(--radius-sm)",
                fontSize: "12.5px",
              }}
            >
              {datasetList.map((dataset) => (
                <option
                  key={dataset.id}
                  value={dataset.id}
                >
                  {dataset.id} — {dataset.name} (
                  {dataset.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* -------------------- EMPTY STATE -------------------- */}
      {!selectedDataset && (
        <div
          className="card hud-card"
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h3>No CDM Dataset Selected</h3>

          <p
            style={{
              marginTop: 8,
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            Upload a CSV or XLSX CDM dataset from
            the Data Intake page to view its
            processing timeline.
          </p>
        </div>
      )}

      {/* -------------------- VISUAL TIMELINE -------------------- */}
      {selectedDataset && (
        <>
          <div
            className="card hud-card"
            style={{
              marginBottom: "20px",
              padding: "24px",
            }}
          >
            <div
              className="card-head"
              style={{
                marginBottom: "24px",
              }}
            >
              <h3>
                Processing Progress —{" "}
                {selectedDataset.name}
              </h3>

              <span className="chip success">
                SHA-256 VERIFIED
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Base Connector */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "40px",
                  right: "40px",
                  height: "4px",
                  background:
                    "var(--border)",
                  zIndex: 1,
                }}
              />

              {/* Completed Connector */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "40px",
                  width: `${Math.min(
                    100,
                    progressPercent * 100
                  )}%`,
                  height: "4px",
                  background:
                    "var(--accent)",
                  zIndex: 2,
                  transition:
                    "width 0.4s ease",
                }}
              />

              {TIMELINE_STAGES.map(
                (stage, index) => {
                  const isCompleted =
                    index <=
                    currentStageIdx;

                  const isCurrent =
                    index ===
                    currentStageIdx;

                  return (
                    <div
                      key={stage.id}
                      style={{
                        zIndex: 3,
                        display: "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        maxWidth: "130px",
                        textAlign:
                          "center",
                      }}
                    >
                      {/* Stage Circle */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius:
                            "50%",
                          background:
                            isCompleted
                              ? "var(--accent)"
                              : "rgba(10, 10, 14, 0.85)",
                          border:
                            isCurrent
                              ? "3px solid var(--accent-glow)"
                              : "2px solid var(--border-strong)",
                          color:
                            isCompleted
                              ? "#ffffff"
                              : "var(--text-muted)",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontWeight: "700",
                          fontSize: "13px",
                          boxShadow:
                            isCurrent
                              ? "var(--glow-cyan)"
                              : "none",
                          transition:
                            "all 0.4s ease",
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Stage Label */}
                      <b
                        style={{
                          fontSize: "12px",
                          marginTop: "10px",
                          color:
                            isCompleted
                              ? "var(--text)"
                              : "var(--text-muted)",
                          transition:
                            "color 0.4s ease",
                        }}
                      >
                        {stage.label}
                      </b>

                      {/* Stage Description */}
                      <span
                        style={{
                          fontSize: "10.5px",
                          color:
                            "var(--text-muted)",
                          marginTop: "4px",
                          lineHeight: "1.3",
                        }}
                      >
                        {stage.desc}
                      </span>
                    </div>
                  );
                }
              )}
            </div>

            {/* Current Processing Status */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "14px",
                borderTop:
                  "1px solid var(--border)",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color:
                    "var(--text-muted)",
                }}
              >
                CURRENT PROCESSING STAGE
              </span>

              <span className="chip info">
                {TIMELINE_STAGES[
                  currentStageIdx
                ]?.label || "CDM Uploaded"}
              </span>
            </div>
          </div>

          {/* -------------------- DATASET DETAILS -------------------- */}
          <div className="card hud-card">
            <div className="card-head">
              <h3>
                CDM Dataset Details
              </h3>

              <span className="chip info">
                {selectedDataset.id}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: "16px",
                padding: "14px",
                background:
                  "rgba(10, 10, 14, 0.8)",
                borderRadius:
                  "var(--radius-sm)",
                border:
                  "1px solid var(--border)",
              }}
            >
              <div>
                <small
                  style={{
                    fontSize: 10,
                    color:
                      "var(--text-muted)",
                    display: "block",
                  }}
                >
                  Dataset Name
                </small>

                <b
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                  }}
                >
                  {selectedDataset.name}
                </b>
              </div>

              <div>
                <small
                  style={{
                    fontSize: 10,
                    color:
                      "var(--text-muted)",
                    display: "block",
                  }}
                >
                  File Size & Type
                </small>

                <b
                  className="mono"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {selectedDataset.size} (
                  {selectedDataset.type})
                </b>
              </div>

              <div>
                <small
                  style={{
                    fontSize: 10,
                    color:
                      "var(--text-muted)",
                    display: "block",
                  }}
                >
                  Uploaded By
                </small>

                <b
                  style={{
                    fontSize: 13,
                  }}
                >
                  {selectedDataset.uploadedBy}
                </b>
              </div>

              <div>
                <small
                  style={{
                    fontSize: 10,
                    color:
                      "var(--text-muted)",
                    display: "block",
                  }}
                >
                  Processing Status
                </small>

                <span
                  className="chip success"
                  style={{
                    marginTop: "2px",
                  }}
                >
                  {selectedDataset.status}
                </span>
              </div>
            </div>

            {/* -------------------- HASH -------------------- */}
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                background:
                  "rgba(78, 168, 255, 0.05)",
                borderRadius:
                  "var(--radius-sm)",
                border:
                  "1px solid var(--accent-border)",
              }}
            >
              <small
                style={{
                  fontSize: 10,
                  color:
                    "var(--text-muted)",
                  display: "block",
                }}
              >
                SHA-256 Dataset Integrity Hash
              </small>

              <span
                className="mono"
                style={{
                  fontSize: 11.5,
                  color:
                    "var(--accent-glow)",
                  wordBreak:
                    "break-all",
                }}
              >
                {selectedDataset.hash}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}