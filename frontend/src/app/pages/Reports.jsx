import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import Icon from "../components/Icon.jsx";
import {
  reportService,
  evidenceService,
  authService,
} from "../services/store.js";

const MODEL_METRICS = {
  r2: "76.6%",
  mae: "3.20",
  rmse: "4.78",
  highRiskRecall: "77.96%",
  weightedF1: "86.06%",
};

const RISK_DISTRIBUTION = {
  low: "50.56%",
  medium: "17.17%",
  high: "32.27%",
};

/*
 * Only these two report types belong to the
 * current ASTRA reporting workflow.
 *
 * Legacy/mock reports with other titles are
 * intentionally excluded from the UI.
 */
const VALID_REPORT_TITLES = [
  "Conjunction Screening Brief",
  "Comprehensive Conjunction Risk Report",
];

function getLatestPrediction() {
  try {
    const raw = localStorage.getItem(
      "astra_latest_cdm_prediction"
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Could not read latest CDM prediction:",
      error
    );

    return null;
  }
}

function formatProbability(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return numericValue.toExponential(6);
}

function formatRiskScore(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return String(Math.round(numericValue));
}

function getRiskLabel(prediction) {
  if (!prediction) {
    return "NO PREDICTION";
  }

  const value = String(
    prediction.classification || ""
  ).toUpperCase();

  if (value.includes("HIGH")) {
    return "HIGH";
  }

  if (value.includes("MEDIUM")) {
    return "MEDIUM";
  }

  if (value.includes("LOW")) {
    return "LOW";
  }

  return value || "UNKNOWN";
}

function getRiskColor(doc, classification) {
  const risk = String(
    classification || ""
  ).toUpperCase();

  if (risk === "HIGH") {
    doc.setTextColor(210, 55, 55);
    return;
  }

  if (risk === "MEDIUM") {
    doc.setTextColor(190, 125, 20);
    return;
  }

  if (risk === "LOW") {
    doc.setTextColor(35, 145, 85);
    return;
  }

  doc.setTextColor(80, 80, 80);
}

function getRelevantReports() {
  const allReports =
    reportService.getReports() || [];

  /*
   * Remove all legacy/mock report types.
   * Only ASTRA's two current report types remain.
   */
  return allReports
    .filter((report) =>
      VALID_REPORT_TITLES.includes(
        report.title
      )
    )
    .slice(0, 2);
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] =
    useState(null);
  const [datasetList, setDatasetList] =
    useState([]);
  const [latestPrediction, setLatestPrediction] =
    useState(null);

  useEffect(() => {
    setReports(getRelevantReports());

    setDatasetList(
      evidenceService.getEvidenceList() || []
    );

    setLatestPrediction(
      getLatestPrediction()
    );
  }, []);

  const refreshReports = () => {
    setReports(getRelevantReports());

    setDatasetList(
      evidenceService.getEvidenceList() || []
    );

    setLatestPrediction(
      getLatestPrediction()
    );
  };

  /*
   * ------------------------------------------------------------
   * GENERATE SCREENING BRIEF
   * ------------------------------------------------------------
   */

  const handleGenerateBrief = () => {
    const prediction =
      getLatestPrediction();

    const risk =
      getRiskLabel(prediction);

    const title =
      "Conjunction Screening Brief";

    const predictionSection =
      prediction
        ? `UPLOADED CDM PREDICTION\n` +
          `File: ${prediction.fileName}\n` +
          `Risk Classification: ${risk}\n` +
          `Risk Score: ${formatRiskScore(
            prediction.riskScore
          )}\n` +
          `log10(Pc): ${
            prediction.log10Probability ??
            "N/A"
          }\n` +
          `Collision Probability: ${formatProbability(
            prediction.probability
          )}\n` +
          `Prediction Horizon: +1 CDM\n` +
          `Alert Triggered: ${
            prediction.isAlert
              ? "YES"
              : "NO"
          }\n\n`
        : `UPLOADED CDM PREDICTION\n` +
          `No uploaded CDM prediction is currently available.\n\n`;

    const summary =
      `ASTRA CONJUNCTION SCREENING BRIEF\n\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      predictionSection +
      `MODEL\n` +
      `Model: CatBoostRegressor\n` +
      `Prediction Horizon: +1 CDM\n` +
      `Output: Future Numerical Risk\n` +
      `Classification: Low / Medium / High\n\n` +
      `MODEL PERFORMANCE\n` +
      `R²: ${MODEL_METRICS.r2}\n` +
      `MAE: ${MODEL_METRICS.mae}\n` +
      `RMSE: ${MODEL_METRICS.rmse}\n` +
      `High-Risk Recall: ${MODEL_METRICS.highRiskRecall}\n` +
      `Weighted F1: ${MODEL_METRICS.weightedF1}`;

    const newReport =
      reportService.addReport(
        title,
        "TXT",
        summary
      );

    setReports(getRelevantReports());

    setActiveReport(newReport);

    setLatestPrediction(
      getLatestPrediction()
    );
  };

  /*
   * ------------------------------------------------------------
   * GENERATE COMPREHENSIVE REPORT
   * ------------------------------------------------------------
   */

  const handleGenerateReport = () => {
    const prediction =
      getLatestPrediction();

    const risk =
      getRiskLabel(prediction);

    const title =
      "Comprehensive Conjunction Risk Report";

    const predictionSection =
      prediction
        ? `UPLOADED CDM PREDICTION\n` +
          `Uploaded Dataset: ${prediction.fileName}\n` +
          `Risk Classification: ${risk}\n` +
          `Risk Score: ${formatRiskScore(
            prediction.riskScore
          )}\n` +
          `log10(Pc): ${
            prediction.log10Probability ??
            "N/A"
          }\n` +
          `Collision Probability: ${formatProbability(
            prediction.probability
          )}\n` +
          `Prediction Horizon: +1 CDM\n` +
          `Alert Triggered: ${
            prediction.isAlert
              ? "YES"
              : "NO"
          }\n\n`
        : `UPLOADED CDM PREDICTION\n` +
          `No uploaded CDM prediction is currently available.\n\n`;

    const summary =
      `ASTRA COMPREHENSIVE CONJUNCTION RISK REPORT\n\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `DATA INTAKE\n` +
      `CDM datasets available: ${datasetList.length}\n` +
      `Dataset integrity: SHA-256 verification supported\n\n` +
      `PREDICTION MODEL\n` +
      `Model: CatBoostRegressor\n` +
      `Prediction target: Future numerical risk\n` +
      `Prediction horizon: +1 CDM\n\n` +
      `MODEL PERFORMANCE\n` +
      `R²: ${MODEL_METRICS.r2}\n` +
      `MAE: ${MODEL_METRICS.mae}\n` +
      `RMSE: ${MODEL_METRICS.rmse}\n` +
      `High-Risk Recall: ${MODEL_METRICS.highRiskRecall}\n` +
      `Weighted F1: ${MODEL_METRICS.weightedF1}\n\n` +
      predictionSection +
      `OVERALL EVALUATED RISK DISTRIBUTION\n` +
      `Low: ${RISK_DISTRIBUTION.low}\n` +
      `Medium: ${RISK_DISTRIBUTION.medium}\n` +
      `High: ${RISK_DISTRIBUTION.high}`;

    const newReport =
      reportService.addReport(
        title,
        "PDF",
        summary
      );

    setReports(getRelevantReports());

    setActiveReport(newReport);

    setLatestPrediction(
      getLatestPrediction()
    );
  };

  /*
   * ------------------------------------------------------------
   * CREATE ONE-PAGE PDF
   * ------------------------------------------------------------
   */

  const createPDF = (
    report,
    currentUser
  ) => {
    const prediction =
      getLatestPrediction();

    const risk =
      getRiskLabel(prediction);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const margin = 18;

    const contentWidth =
      pageWidth - margin * 2;

    let y = 18;

    /*
     * ----------------------------------------------------------
     * HEADER
     * ----------------------------------------------------------
     */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.setTextColor(
      30,
      90,
      180
    );

    doc.text(
      "ASTRA",
      margin,
      y
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(12);

    doc.setTextColor(
      30,
      30,
      30
    );

    doc.text(
      "Conjunction Risk Report",
      margin,
      y
    );

    y += 8;

    doc.setDrawColor(
      60,
      130,
      230
    );

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 8;

    /*
     * ----------------------------------------------------------
     * REPORT INFORMATION
     * ----------------------------------------------------------
     */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      30,
      30,
      30
    );

    doc.text(
      "REPORT INFORMATION",
      margin,
      y
    );

    y += 5;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.text(
      `Report ID: ${report.id}`,
      margin,
      y
    );

    y += 4.5;

    doc.text(
      `Title: ${report.title}`,
      margin,
      y
    );

    y += 4.5;

    doc.text(
      `Generated: ${report.date}`,
      margin,
      y
    );

    y += 4.5;

    doc.text(
      `Generated By: ${currentUser}`,
      margin,
      y
    );

    y += 8;

    /*
     * ----------------------------------------------------------
     * UPLOADED CDM PREDICTION
     * ----------------------------------------------------------
     */

    const predictionBoxHeight =
      prediction ? 55 : 38;

    doc.setFillColor(
      242,
      247,
      253
    );

    doc.setDrawColor(
      60,
      130,
      230
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      predictionBoxHeight,
      3,
      3,
      "FD"
    );

    const boxStartY = y;

    y += 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      30,
      70,
      130
    );

    doc.text(
      "UPLOADED CDM PREDICTION",
      margin + 5,
      y
    );

    y += 6;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.setTextColor(
      30,
      30,
      30
    );

    if (prediction) {
      doc.text(
        `Dataset: ${prediction.fileName}`,
        margin + 5,
        y
      );

      y += 4.5;

      doc.text(
        "Prediction Horizon: +1 CDM",
        margin + 5,
        y
      );

      y += 6;

      /*
       * Risk label and value are deliberately
       * placed on separate lines.
       */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        30,
        30,
        30
      );

      doc.text(
        "RISK CLASSIFICATION",
        margin + 5,
        y
      );

      y += 5;

      doc.setFontSize(12);

      getRiskColor(
        doc,
        risk
      );

      doc.text(
        risk,
        margin + 5,
        y
      );

      y += 7;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        30,
        30,
        30
      );

      doc.text(
        `Risk Score: ${formatRiskScore(
          prediction.riskScore
        )}`,
        margin + 5,
        y
      );

      y += 4.5;

      doc.text(
        `log10(Pc): ${
          prediction.log10Probability ??
          "N/A"
        }`,
        margin + 5,
        y
      );

      y += 4.5;

      doc.text(
        `Collision Probability: ${formatProbability(
          prediction.probability
        )}`,
        margin + 5,
        y
      );

      y += 4.5;

      doc.text(
        `Alert Triggered: ${
          prediction.isAlert
            ? "YES"
            : "NO"
        }`,
        margin + 5,
        y
      );
    } else {
      doc.setTextColor(
        90,
        90,
        90
      );

      doc.text(
        "No uploaded CDM prediction is currently available.",
        margin + 5,
        y
      );
    }

    /*
     * Make sure the next section begins
     * below the actual prediction box.
     */

    y =
      boxStartY +
      predictionBoxHeight +
      8;

    /*
     * ----------------------------------------------------------
     * MODEL SUMMARY
     * ----------------------------------------------------------
     */

    doc.setFillColor(
      245,
      248,
      252
    );

    doc.setDrawColor(
      210,
      220,
      235
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      30,
      2,
      2,
      "FD"
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      30,
      30,
      30
    );

    doc.text(
      "MODEL SUMMARY",
      margin + 5,
      y
    );

    y += 5.5;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.text(
      "Model: CatBoostRegressor",
      margin + 5,
      y
    );

    y += 4.5;

    doc.text(
      "Prediction Horizon: +1 CDM",
      margin + 5,
      y
    );

    y += 4.5;

    doc.text(
      "Target: Future Numerical Risk",
      margin + 5,
      y
    );

    y += 4.5;

    doc.text(
      "Classification: Low / Medium / High",
      margin + 5,
      y
    );

    y += 8;

    /*
     * ----------------------------------------------------------
     * TWO-COLUMN LOWER SECTION
     * ----------------------------------------------------------
     */

    const columnGap = 8;

    const columnWidth =
      (contentWidth - columnGap) /
      2;

    const leftX = margin;

    const rightX =
      margin +
      columnWidth +
      columnGap;

    /*
     * LEFT: MODEL PERFORMANCE
     */

    doc.setFillColor(
      248,
      250,
      253
    );

    doc.setDrawColor(
      220,
      225,
      235
    );

    doc.roundedRect(
      leftX,
      y,
      columnWidth,
      47,
      2,
      2,
      "FD"
    );

    let leftY = y + 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      30,
      30,
      30
    );

    doc.text(
      "MODEL PERFORMANCE",
      leftX + 5,
      leftY
    );

    leftY += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    const metrics = [
      `R²: ${MODEL_METRICS.r2}`,
      `MAE: ${MODEL_METRICS.mae}`,
      `RMSE: ${MODEL_METRICS.rmse}`,
      `High-Risk Recall: ${MODEL_METRICS.highRiskRecall}`,
      `Weighted F1: ${MODEL_METRICS.weightedF1}`,
    ];

    metrics.forEach(
      (metric) => {
        doc.text(
          metric,
          leftX + 5,
          leftY
        );

        leftY += 6;
      }
    );

    /*
     * RIGHT: RISK DISTRIBUTION
     */

    doc.roundedRect(
      rightX,
      y,
      columnWidth,
      47,
      2,
      2,
      "FD"
    );

    let rightY = y + 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      30,
      30,
      30
    );

    doc.text(
      "EVALUATED RISK DISTRIBUTION",
      rightX + 5,
      rightY
    );

    rightY += 8;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.text(
      `Low Risk: ${RISK_DISTRIBUTION.low}`,
      rightX + 5,
      rightY
    );

    rightY += 7;

    doc.text(
      `Medium Risk: ${RISK_DISTRIBUTION.medium}`,
      rightX + 5,
      rightY
    );

    rightY += 7;

    doc.text(
      `High Risk: ${RISK_DISTRIBUTION.high}`,
      rightX + 5,
      rightY
    );

    /*
     * ----------------------------------------------------------
     * REPORT RESULT / ACTION
     * ----------------------------------------------------------
     */

    y += 55;

    doc.setFillColor(
      242,
      247,
      253
    );

    doc.setDrawColor(
      60,
      130,
      230
    );

    doc.roundedRect(
      margin,
      y,
      contentWidth,
      32,
      2,
      2,
      "FD"
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
      30,
      70,
      130
    );

    doc.text(
      "ASSESSMENT RESULT",
      margin + 5,
      y
    );

    y += 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.setTextColor(
      30,
      30,
      30
    );

    if (prediction) {
      const assessmentText =
        risk === "HIGH"
          ? "High-risk conjunction detected. Review the uploaded CDM assessment and associated orbital data."
          : risk === "MEDIUM"
          ? "Medium-risk conjunction detected. Further monitoring and review are recommended."
          : "Low-risk conjunction detected based on the current uploaded CDM assessment.";

      const wrapped =
        doc.splitTextToSize(
          assessmentText,
          contentWidth - 10
        );

      doc.text(
        wrapped,
        margin + 5,
        y
      );
    } else {
      doc.text(
        "Upload a CDM dataset and run the live CatBoost prediction to generate an assessment.",
        margin + 5,
        y
      );
    }

    /*
     * ----------------------------------------------------------
     * FOOTER
     * ----------------------------------------------------------
     */

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
      100,
      100,
      100
    );

    doc.text(
      "ASTRA • Satellite Conjunction Early-Warning System",
      margin,
      pageHeight - 10
    );

    doc.text(
      "Page 1",
      pageWidth -
        margin -
        12,
      pageHeight - 10
    );

    /*
     * IMPORTANT:
     * There is intentionally no addPage()
     * anywhere in this PDF generator.
     * The report is always one page.
     */

    return doc;
  };

  /*
   * ------------------------------------------------------------
   * DOWNLOAD TXT / PDF
   * ------------------------------------------------------------
   */

  const handleDownload = (
    report,
    format
  ) => {
    const currentUser =
      authService.getCurrentUser()
        ?.name || "Astra User";

    const prediction =
      getLatestPrediction();

    const risk =
      getRiskLabel(prediction);

    if (format === "PDF") {
      const doc = createPDF(
        report,
        currentUser
      );

      const filename =
        `${report.id.toLowerCase()}_` +
        `${report.title
          .toLowerCase()
          .replace(
            /[^a-z0-9]/g,
            "_"
          )}` +
        `.pdf`;

      doc.save(filename);

      return;
    }

    const content =
      `===========================================================\n` +
      `ASTRA CONJUNCTION RISK REPORT\n` +
      `===========================================================\n\n` +
      `Report ID: ${report.id}\n` +
      `Title: ${report.title}\n` +
      `Date: ${report.date}\n` +
      `Format: TXT\n` +
      `Generated By: ${currentUser}\n\n` +
      `-----------------------------------------------------------\n` +
      `UPLOADED CDM PREDICTION\n` +
      `-----------------------------------------------------------\n\n` +
      `${
        prediction
          ? `Dataset: ${prediction.fileName}\n` +
            `Risk Classification: ${risk}\n` +
            `Risk Score: ${formatRiskScore(
              prediction.riskScore
            )}\n` +
            `log10(Pc): ${
              prediction.log10Probability ??
              "N/A"
            }\n` +
            `Collision Probability: ${formatProbability(
              prediction.probability
            )}\n` +
            `Prediction Horizon: +1 CDM\n` +
            `Alert Triggered: ${
              prediction.isAlert
                ? "YES"
                : "NO"
            }\n`
          : "No uploaded CDM prediction is currently available.\n"
      }\n\n` +
      `-----------------------------------------------------------\n` +
      `MODEL\n` +
      `-----------------------------------------------------------\n\n` +
      `Model: CatBoostRegressor\n` +
      `Prediction Horizon: +1 CDM\n` +
      `Target: Future Numerical Risk\n` +
      `Classification: Low / Medium / High\n\n` +
      `-----------------------------------------------------------\n` +
      `MODEL PERFORMANCE\n` +
      `-----------------------------------------------------------\n\n` +
      `R²: ${MODEL_METRICS.r2}\n` +
      `MAE: ${MODEL_METRICS.mae}\n` +
      `RMSE: ${MODEL_METRICS.rmse}\n` +
      `High-Risk Recall: ${MODEL_METRICS.highRiskRecall}\n` +
      `Weighted F1: ${MODEL_METRICS.weightedF1}\n\n` +
      `-----------------------------------------------------------\n` +
      `OVERALL EVALUATED RISK DISTRIBUTION\n` +
      `-----------------------------------------------------------\n\n` +
      `Low Risk: ${RISK_DISTRIBUTION.low}\n` +
      `Medium Risk: ${RISK_DISTRIBUTION.medium}\n` +
      `High Risk: ${RISK_DISTRIBUTION.high}\n\n` +
      `===========================================================\n` +
      `END OF ASTRA CONJUNCTION RISK REPORT\n` +
      `===========================================================`;

    const filename =
      `${report.id.toLowerCase()}_` +
      `${report.title
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          "_"
        )}` +
      `.txt`;

    reportService.downloadFile(
      content,
      filename,
      "text/plain"
    );
  };

  return (
    <div>
      {/* ------------------------------------------------------ */}
      {/* PAGE HEADER                                            */}
      {/* ------------------------------------------------------ */}

      <div className="page-head">
        <div>
          <h1>Conjunction Reports</h1>

          <p>
            Generate, review and download
            ASTRA CDM risk assessment
            reports.
          </p>
        </div>

        <div
          className="actions"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn ghost light-theme-action"
            onClick={
              handleGenerateBrief
            }
          >
            <Icon
              name="file"
              size={14}
            />
            Generate Brief
          </button>

          <button
            className="btn primary light-theme-primary-action"
            onClick={
              handleGenerateReport
            }
          >
            <Icon
              name="plus"
              size={14}
            />
            Generate Risk Report
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* REPORT GENERATORS                                      */}
      {/* ------------------------------------------------------ */}

      <div
        className="grid cols-2"
        style={{
          marginBottom: 20,
        }}
      >
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              Conjunction Screening
              Brief
            </h3>

            <span className="chip info">
              TXT
            </span>
          </div>

          <p
            style={{
              fontSize: 13,
              marginTop: 6,
              lineHeight: "1.6",
            }}
          >
            Generates a concise report
            containing the actual
            uploaded CDM prediction,
            risk classification and
            model information.
          </p>

          <button
            className="btn primary light-theme-primary-action"
            style={{
              marginTop: 16,
              width: "100%",
            }}
            onClick={
              handleGenerateBrief
            }
          >
            Generate Screening Brief
          </button>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              Comprehensive Risk
              Report
            </h3>

            <span className="chip success">
              PDF
            </span>
          </div>

          <p
            style={{
              fontSize: 13,
              marginTop: 6,
              lineHeight: "1.6",
            }}
          >
            Generates a one-page PDF
            containing the actual
            uploaded CDM risk result,
            model performance and
            assessment summary.
          </p>

          <button
            className="btn primary light-theme-primary-action"
            style={{
              marginTop: 16,
              width: "100%",
            }}
            onClick={
              handleGenerateReport
            }
          >
            Generate Risk Report
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* LATEST PREDICTION                                     */}
      {/* ------------------------------------------------------ */}

      <div
        className="card hud-card"
        style={{
          marginBottom: 20,
          borderColor:
            latestPrediction
              ? "var(--accent)"
              : "var(--border)",
        }}
      >
        <div className="card-head">
          <h3>
            <Icon
              name="activity"
              size={16}
            />{" "}
            Uploaded CDM Prediction
          </h3>

          <span
            className={`chip ${
              latestPrediction
                ? getRiskLabel(
                    latestPrediction
                  ).toLowerCase()
                : "info"
            }`}
          >
            {latestPrediction
              ? getRiskLabel(
                  latestPrediction
                )
              : "NO PREDICTION"}
          </span>
        </div>

        {latestPrediction ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                minWidth: 0,
              }}
            >
              <div className="k-label">
                DATASET
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  overflowWrap:
                    "anywhere",
                }}
              >
                {
                  latestPrediction.fileName
                }
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div className="k-label">
                RISK CLASSIFICATION
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {getRiskLabel(
                  latestPrediction
                )}
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div className="k-label">
                LOG10(Pc)
              </div>

              <div
                className="mono"
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  overflowWrap:
                    "anywhere",
                }}
              >
                {
                  latestPrediction.log10Probability
                }
              </div>
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div className="k-label">
                COLLISION PROBABILITY
              </div>

              <div
                className="mono"
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  overflowWrap:
                    "anywhere",
                }}
              >
                {formatProbability(
                  latestPrediction.probability
                )}
              </div>
            </div>
          </div>
        ) : (
          <p
            style={{
              color:
                "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            No uploaded CDM prediction
            is currently available.
            Upload a CSV/XLSX CDM dataset
            and run the live CatBoost
            model first.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------ */}
      {/* ACTIVE REPORT PREVIEW                                  */}
      {/* ------------------------------------------------------ */}

      {activeReport && (
        <div
          className="card hud-card"
          style={{
            marginBottom: 20,
            border:
              "1px solid var(--accent)",
          }}
        >
          <div className="card-head">
            <h3>
              Report Preview:{" "}
              {activeReport.title}
            </h3>

            <span className="chip success">
              {activeReport.id}
            </span>
          </div>

          <pre
            className="light-theme-code-panel"
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap:
                "anywhere",
              wordBreak: "break-word",
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {activeReport.summary}
          </pre>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "14px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn primary light-theme-primary-action"
              onClick={() =>
                handleDownload(
                  activeReport,
                  "TXT"
                )
              }
            >
              <Icon
                name="download"
                size={14}
              />
              Download TXT
            </button>

            <button
              className="btn primary light-theme-primary-action"
              onClick={() =>
                handleDownload(
                  activeReport,
                  "PDF"
                )
              }
            >
              <Icon
                name="download"
                size={14}
              />
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* SAVED REPORTS                                          */}
      {/* ------------------------------------------------------ */}

      <div className="card hud-card">
        <div className="card-head">
          <h3>
            Saved Conjunction Reports
          </h3>

          <span className="chip">
            {reports.length} REPORTS
          </span>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Date Generated</th>
                <th>Format</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding: "30px",
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    No ASTRA reports
                    generated yet.
                  </td>
                </tr>
              ) : (
                reports.map(
                  (report) => (
                    <tr
                      key={report.id}
                    >
                      <td
                        className="mono"
                        style={{
                          fontWeight: 700,
                          color:
                            "var(--accent)",
                        }}
                      >
                        {report.id}
                      </td>

                      <td>
                        <b>
                          {
                            report.title
                          }
                        </b>
                      </td>

                      <td className="mono">
                        {report.date}
                      </td>

                      <td>
                        <span className="chip info">
                          {
                            report.format
                          }
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "6px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            className="btn ghost light-theme-action"
                            style={{
                              padding:
                                "5px 9px",
                              fontSize: 11,
                            }}
                            onClick={() =>
                              setActiveReport(
                                report
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="btn ghost light-theme-action"
                            style={{
                              padding:
                                "5px 9px",
                              fontSize: 11,
                            }}
                            onClick={() =>
                              handleDownload(
                                report,
                                "TXT"
                              )
                            }
                          >
                            TXT
                          </button>

                          <button
                            className="btn primary light-theme-primary-action"
                            style={{
                              padding:
                                "5px 9px",
                              fontSize: 11,
                            }}
                            onClick={() =>
                              handleDownload(
                                report,
                                "PDF"
                              )
                            }
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* REPORT PIPELINE                                        */}
      {/* ------------------------------------------------------ */}

      <div
        className="card hud-card"
        style={{
          marginTop: 20,
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
            Report Generation Pipeline
          </h3>

          <span className="chip info">
            ASTRA
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {[
            "CDM Upload",
            "Validation",
            "CatBoost Prediction",
            "Risk Classification",
            "Report",
          ].map(
            (step, index) => (
              <div
                key={step}
                className="light-theme-panel"
                style={{
                  minWidth: 0,
                }}
              >
                <div className="k-label">
                  0{index + 1}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {step}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}