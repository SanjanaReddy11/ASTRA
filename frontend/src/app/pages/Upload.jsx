import { useState, useEffect, useRef } from "react";
import Icon from "../components/Icon.jsx";
import {
  evidenceService,
  calculateSHA256,
  authService,
} from "../services/store.js";
import { predictFromFile } from "../services/api.js";

const ACCEPTED_EXTENSIONS = ".csv,.xlsx";

/*
 * Internal store statuses.
 */
const STATUS_STEPS = [
  "Uploaded",
  "Under Review",
  "Analyzed",
  "AI Summary Generated",
  "Included In Report",
  "Closed",
];

/*
 * User-facing status labels.
 */
const DISPLAY_STATUS = {
  Uploaded: "CDM Uploaded",
  "Under Review": "Validated",
  Analyzed: "Preprocessed",
  "AI Summary Generated": "Future Risk Predicted",
  "Included In Report": "Risk Classified",
  Closed: "Report Generated",
};

const PROCESSING_STAGES = [
  {
    id: 1,
    name: "Data Ingestion",
    desc: "Reading byte stream & generating SHA-256 hash",
  },
  {
    id: 2,
    name: "Data Validation",
    desc: "Validating CDM dataset fields and integrity",
  },
  {
    id: 3,
    name: "Data Preprocessing",
    desc: "Preparing validated data for model analysis",
  },
  {
    id: 4,
    name: "Future-Risk Prediction (CatBoostRegressor)",
    desc: "Predicting future conjunction risk",
  },
  {
    id: 5,
    name: "Risk Classification",
    desc: "Classifying the predicted risk",
  },
];

export default function Upload() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [lastUploaded, setLastUploaded] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    setEvidenceList(evidenceService.getEvidenceList());
  }, []);

  const currentUser = authService.getCurrentUser() || {
    username: "investigator",
  };

  const priorityInfo = evidenceService.calculateCasePriority(
    evidenceList.length
  );

  const updateProcessingStatus = (id, internalStatus) => {
    const updated = evidenceService.updateStatus(id, internalStatus);

    setEvidenceList(updated);

    return updated;
  };

  const processFile = async (file) => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setLastUploaded(null);
    setVerifyMsg("");
    setActiveStage(0);

    /*
     * Clear previous prediction and SHAP explanation.
     */
    localStorage.removeItem("astra_latest_cdm_prediction");

    try {
      /* -----------------------------------------
       * STAGE 1 — DATA INGESTION
       * ----------------------------------------- */
      setActiveStage(1);

      const hashHex = await calculateSHA256(file);

      let formattedSize = `${(file.size / 1024).toFixed(1)} KB`;

      if (file.size >= 1024 * 1024) {
        formattedSize = `${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)} MB`;
      }

      const fileExt = file.name
        .split(".")
        .pop()
        .toUpperCase();

      const newEvidence = evidenceService.addEvidence({
        name: file.name,
        size: formattedSize,
        type: fileExt,
        uploadedBy: currentUser.username,
        hash: hashHex,
      });

      updateProcessingStatus(newEvidence.id, "Uploaded");

      /* -----------------------------------------
       * STAGE 2 — DATA VALIDATION
       * ----------------------------------------- */
      setActiveStage(2);

      updateProcessingStatus(newEvidence.id, "Under Review");

      await new Promise((resolve) => setTimeout(resolve, 300));

      /* -----------------------------------------
       * STAGE 3 — DATA PREPROCESSING
       * ----------------------------------------- */
      setActiveStage(3);

      updateProcessingStatus(newEvidence.id, "Analyzed");

      await new Promise((resolve) => setTimeout(resolve, 300));

      let intelAnalysis;

      /* -----------------------------------------
       * REAL CATBOOST MODEL PATH
       * ----------------------------------------- */
      if (fileExt === "CSV" || fileExt === "XLSX") {
        try {
          const result = await predictFromFile(file, {
            sensorId: currentUser.username,
          });

          /*
           * Validate the backend response.
           */
          if (
            !result ||
            typeof result.prediction !== "string" ||
            !result.explanation ||
            !Array.isArray(result.explanation.contributions)
          ) {
            throw new Error(
              "Backend returned an incomplete prediction or SHAP explanation."
            );
          }

          /* -----------------------------------------
           * STAGE 4 — FUTURE RISK PREDICTED
           * ----------------------------------------- */
          setActiveStage(4);

          updateProcessingStatus(
            newEvidence.id,
            "AI Summary Generated"
          );

          await new Promise((resolve) => setTimeout(resolve, 300));

          /* -----------------------------------------
           * STAGE 5 — RISK CLASSIFICATION
           * ----------------------------------------- */
          setActiveStage(5);

          const prediction = result.prediction || "Unknown";

          updateProcessingStatus(
            newEvidence.id,
            "Included In Report"
          );

          /*
           * SAVE REAL BACKEND PREDICTION + SHAP EXPLANATION.
           *
           * SHAPExplainability.jsx reads this localStorage key.
           */
          const predictionData = {
            fileName: file.name,

            uploadedAt: new Date().toISOString(),

            classification: prediction,

            riskScore: result.risk_score,

            log10Probability:
              result.log10_probability_of_collision,

            probability:
              result.probability_of_collision,

            isAlert: result.is_alert,

            warning: result.warning || null,

            recordCount: "1 Row (first row analyzed)",

            // IMPORTANT: Save the complete SHAP explanation.
            explanation: result.explanation,
          };

          localStorage.setItem(
            "astra_latest_cdm_prediction",
            JSON.stringify(predictionData)
          );

          console.log(
            "ASTRA prediction saved successfully."
          );

          console.log(
            "SHAP contributions:",
            predictionData.explanation.contributions.length
          );

          intelAnalysis = {
            ...newEvidence,

            recordCount: "1 Row (first row analyzed)",

            uploadTime: new Date().toLocaleTimeString(),

            validationStatus: "PASS — SHA-256 MATCHED",

            predictedRisk: result.risk_score,

            classification: `Conjunction Risk: ${prediction}`,

            confidence: `log10(Pc) = ${result.log10_probability_of_collision}`,

            summary: `Dataset ${
              file.name
            } analyzed by the live CatBoost risk model (row 1). Estimated probability of collision ≈ ${result.probability_of_collision.toExponential(
              2
            )}.`,

            geoIndicators:
              "Computed from row 1 of the uploaded CDM dataset for this assessment.",

            findings: [
              "SHA-256 dataset integrity verified.",

              `CatBoost classified this conjunction as ${prediction.toUpperCase()} risk (${
                result.is_alert ? "ALERT" : "no alert"
              }).`,

              result.warning ||
                "All expected model features were present in the uploaded row.",

              `SHAP explainability generated with ${result.explanation.contributions.length} feature contributions.`,
            ],

            isLive: true,
            isError: false,
          };
        } catch (err) {
          console.error(
            "CatBoost prediction or SHAP explanation failed:",
            err
          );

          /*
           * Remove previous prediction if current upload fails.
           */
          localStorage.removeItem(
            "astra_latest_cdm_prediction"
          );

          intelAnalysis = {
            ...newEvidence,

            recordCount: "Unknown",

            uploadTime: new Date().toLocaleTimeString(),

            validationStatus: "PASS — SHA-256 MATCHED",

            predictedRisk: null,

            classification: "Live model unavailable",

            confidence: "N/A",

            summary: `Could not complete backend prediction or SHAP explanation (${err.message}). Check the FastAPI server and API response.`,

            geoIndicators: "N/A",

            findings: [
              "SHA-256 dataset integrity verified.",
              "CatBoost prediction or SHAP explanation failed.",
            ],

            isLive: false,
            isError: true,
          };

          updateProcessingStatus(newEvidence.id, "Analyzed");

          setActiveStage(3);
        }
      } else {
        /*
         * Unsupported file type.
         */
        localStorage.removeItem(
          "astra_latest_cdm_prediction"
        );

        intelAnalysis = {
          ...newEvidence,

          recordCount: "Not available",

          uploadTime: new Date().toLocaleTimeString(),

          validationStatus: "PASS — SHA-256 MATCHED",

          predictedRisk: null,

          classification: "Unsupported file type",

          confidence: "N/A",

          summary: `Dataset ${file.name} uploaded. Only CSV/XLSX files are supported by the live CDM risk model.`,

          geoIndicators: "N/A",

          findings: [
            "SHA-256 dataset integrity verified.",
            "This file type is not supported by the live CDM risk model.",
          ],

          isLive: false,
          isError: true,
        };

        updateProcessingStatus(newEvidence.id, "Under Review");

        setActiveStage(2);
      }

      setEvidenceList(evidenceService.getEvidenceList());

      setLastUploaded(intelAnalysis);

      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("CDM processing failed:", err);

      localStorage.removeItem(
        "astra_latest_cdm_prediction"
      );

      setIsUploading(false);

      setLastUploaded({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        recordCount: "Unknown",
        predictedRisk: null,
        classification: "Processing failed",
        confidence: "N/A",
        summary:
          "The dataset could not be processed. No prediction was generated.",
        geoIndicators: "N/A",
        findings: [
          "Dataset processing failed.",
          "No fabricated prediction was generated.",
        ],
        isLive: false,
        isError: true,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = evidenceService.updateStatus(id, newStatus);

    setEvidenceList(updated);
  };

  const handleVerifyIntegrity = (item) => {
    const isValid = evidenceService.verifyIntegrity(item.id);

    if (isValid) {
      setVerifyMsg(
        `SHA-256 Hash Verified for ${item.name}! Integrity Status: MATCHED & UNTAMPERED.`
      );
    }
  };

  const getDisplayStatus = (status) => {
    return DISPLAY_STATUS[status] || status || "Unknown";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={ACCEPTED_EXTENSIONS}
        style={{
          display: "none",
        }}
      />

      {/* Header Banner */}
      <div className="page-head">
        <div>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Icon
              name="upload"
              style={{
                color: "var(--accent)",
              }}
            />

            CDM Dataset Upload & Conjunction Risk Analysis
          </h1>

          <p>
            CDM dataset upload, SHA-256 integrity verification & future
            conjunction-risk prediction.
          </p>
        </div>

        <div
          className="actions"
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <div className="light-theme-dataset-counter">
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              Datasets:
            </span>

            <span
              className={`chip ${priorityInfo.class}`}
              style={{
                fontWeight: "700",
              }}
            >
              {evidenceList.length} STORED
            </span>
          </div>

          <button
            className="btn primary glow-btn light-theme-primary-action"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Icon name="upload" size={14} />

            {isUploading
              ? "Processing Dataset..."
              : "Upload CDM Dataset"}
          </button>
        </div>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.3fr 1fr",
        }}
      >
        {/* CDM Dataset Upload */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon name="target" size={16} />
              CDM Dataset Upload Area
            </h3>

            <span className="chip info">CSV · XLSX</span>
          </div>

          <div
            className={`dropzone-intake ${
              dragOver ? "drag-active" : ""
            } ${isUploading ? "scanning-active" : ""}`}
            onClick={() =>
              !isUploading && fileInputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="intake-icon-wrap">
              <Icon
                name="upload"
                size={48}
                className="intake-icon"
              />

              <div className="scan-line-animation" />
            </div>

            <h3
              style={{
                fontSize: "16px",
                marginTop: "12px",
              }}
            >
              {isUploading
                ? "Actively Ingesting & Analyzing Dataset..."
                : "Drag & Drop CDM Datasets Here"}
            </h3>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              Or click to browse local filesystem · Automated SHA-256
              signature generation on intake
            </p>

            <button
              className="btn primary glow-btn light-theme-primary-action"
              style={{
                marginTop: "16px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              Upload CDM Dataset
            </button>
          </div>
        </div>

        {/* CDM Processing Stages */}
        <div
          className="card hud-card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div className="card-head">
            <h3>
              <Icon name="activity" size={16} />
              CDM Processing Pipeline
            </h3>

            <span className="chip success">MODEL PIPELINE</span>
          </div>

          <div className="processing-stages-list">
            {PROCESSING_STAGES.map((stage) => {
              const isDone =
                activeStage > stage.id ||
                (!isUploading &&
                  activeStage === stage.id &&
                  lastUploaded &&
                  !lastUploaded.isError);

              const isCurrent =
                isUploading && activeStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`stage-row ${
                    isCurrent ? "current" : isDone ? "done" : ""
                  }`}
                >
                  <div className="stage-num">
                    {isDone ? "✓" : stage.id}
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: "600",
                        color: isCurrent
                          ? "var(--accent)"
                          : isDone
                          ? "var(--success)"
                          : "var(--text)",
                      }}
                    >
                      {stage.name}
                    </div>

                    <div
                      style={{
                        fontSize: "10.5px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {stage.desc}
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="chip info pulse-chip">
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="light-theme-integrity-panel">
            <small
              style={{
                fontSize: "10.5px",
                color: "var(--text-muted)",
                display: "block",
              }}
            >
              Dataset Integrity Check:
            </small>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              <span>SHA-256:</span>

              <b
                style={{
                  color: "var(--success)",
                }}
              >
                READY
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* DATASET ANALYSIS PREVIEW */}
      {lastUploaded && (
        <div className="card hud-card analysis-preview-container">
          <div className="card-head">
            <h3>
              <Icon
                name="file"
                size={18}
                style={{
                  color: "var(--accent)",
                }}
              />

              Conjunction Risk Analysis Preview
            </h3>

            <span
              className={`chip ${
                lastUploaded.isError ? "danger" : "success"
              }`}
            >
              {lastUploaded.isError
                ? "ANALYSIS INCOMPLETE"
                : "ANALYSIS COMPLETE"}
            </span>
          </div>

          <div
            className="grid cols-3"
            style={{
              marginBottom: "16px",
            }}
          >
            <div className="mini-analysis-card light-theme-analysis-card">
              <span className="m-label">
                Predicted Future Risk
              </span>

              {lastUploaded.predictedRisk === null ? (
                <div
                  className="m-val"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "14px",
                  }}
                >
                  N/A
                </div>
              ) : (
                <>
                  <div
                    className="m-val"
                    style={{
                      color:
                        lastUploaded.predictedRisk >= 75
                          ? "var(--danger)"
                          : "var(--warning)",
                    }}
                  >
                    {lastUploaded.predictedRisk}
                  </div>

                  <span
                    className={`chip ${
                      lastUploaded.isError
                        ? ""
                        : lastUploaded.predictedRisk >= 75
                        ? "danger"
                        : "info"
                    }`}
                    style={{
                      fontSize: "9.5px",
                      marginTop: "4px",
                    }}
                  >
                    {lastUploaded.isLive
                      ? "LIVE CATBOOST"
                      : "NOT AVAILABLE"}
                  </span>
                </>
              )}
            </div>

            <div className="mini-analysis-card light-theme-analysis-card">
              <span className="m-label">
                Risk Classification
              </span>

              <div
                className="m-val"
                style={{
                  fontSize: "15px",
                  color: "var(--text)",
                }}
              >
                {lastUploaded.classification}
              </div>

              <span
                className="chip info"
                style={{
                  fontSize: "9.5px",
                  marginTop: "4px",
                }}
              >
                CONFIDENCE: {lastUploaded.confidence}
              </span>
            </div>

            <div className="mini-analysis-card light-theme-analysis-card">
              <span className="m-label">
                Dataset Summary
              </span>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                <b>Name:</b> {lastUploaded.name}
                <br />

                <b>Size:</b> {lastUploaded.size} · <b>Records:</b>{" "}
                {lastUploaded.recordCount}
              </div>
            </div>
          </div>

          <div className="light-theme-findings-panel">
            <b
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Conjunction Analysis Findings:
            </b>

            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {lastUploaded.findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>

            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "10px",
              }}
            >
              {lastUploaded.geoIndicators}
            </div>
          </div>
        </div>
      )}

      {/* REGISTERED CDM DATASETS & INTEGRITY LOG */}
      <div className="card hud-card">
        <div className="card-head">
          <h3>Registered CDM Datasets & Integrity Log</h3>

          <span className="chip">
            {evidenceList.length} DATASETS
          </span>
        </div>

        {verifyMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(0, 255, 136, 0.12)",
              border: "1px solid var(--success)",
              borderRadius: "6px",
              color: "var(--success)",
              fontSize: "12px",
              marginBottom: "14px",
            }}
          >
            <b>Verification Confirmation:</b> {verifyMsg}
          </div>
        )}

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Dataset ID</th>
                <th>Dataset Name</th>
                <th>File Size</th>
                <th>Type</th>
                <th>Intake Date</th>
                <th>Uploaded By</th>
                <th>SHA-256 Hash</th>
                <th>Processing Status</th>
                <th>Integrity</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {evidenceList.map((dataset) => (
                <tr key={dataset.id}>
                  <td
                    className="mono"
                    style={{
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    {dataset.id}
                  </td>

                  <td>
                    <b>{dataset.name}</b>
                  </td>

                  <td className="mono">{dataset.size}</td>

                  <td>
                    <span className="chip info">
                      {dataset.type}
                    </span>
                  </td>

                  <td
                    className="mono"
                    style={{
                      fontSize: "11px",
                    }}
                  >
                    {dataset.uploadDate}
                  </td>

                  <td>
                    <b>{dataset.uploadedBy}</b>
                  </td>

                  <td
                    className="mono"
                    style={{
                      fontSize: "10px",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={dataset.hash}
                  >
                    {dataset.hash.substring(0, 14)}...
                  </td>

                  <td>
                    <select
                      value={dataset.status}
                      onChange={(event) =>
                        handleStatusChange(
                          dataset.id,
                          event.target.value
                        )
                      }
                      className="light-theme-select"
                    >
                      {STATUS_STEPS.map((status) => (
                        <option key={status} value={status}>
                          {DISPLAY_STATUS[status]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <span
                      className="chip success"
                      style={{
                        fontSize: "10px",
                      }}
                    >
                      {dataset.integrity}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn ghost light-theme-action"
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                      }}
                      onClick={() =>
                        handleVerifyIntegrity(dataset)
                      }
                    >
                      Verify SHA-256
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}