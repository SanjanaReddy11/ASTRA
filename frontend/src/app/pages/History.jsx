import { useState, useEffect } from "react";
import Icon from "../components/Icon.jsx";
import {
  auditService,
  evidenceService,
  reportService,
} from "../services/store.js";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setLogs(auditService.getLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const text = `
      ${log.id}
      ${log.timestamp}
      ${log.user}
      ${log.action}
      ${log.result}
    `.toLowerCase();

    return text.includes(q.toLowerCase());
  });

  /* -------------------- EXPORT CSV -------------------- */
  const handleExportCSV = () => {
    const uploads =
      evidenceService.getEvidenceList();

    const reports =
      reportService.getReports();

    const auditLogs =
      auditService.getLogs();

    let csvContent =
      "TYPE,ID,TIMESTAMP/DATE,USER/AUTHOR,DETAILS,EXTRA\n";

    auditLogs.forEach((log) => {
      csvContent +=
        `AUDIT,${log.id},"${log.timestamp}",` +
        `"${log.user}","${log.action}",` +
        `"${log.result}"\n`;
    });

    uploads.forEach((upload) => {
      csvContent +=
        `CDM_UPLOAD,${upload.id},"${upload.uploadDate}",` +
        `"${upload.uploadedBy}","${upload.name}",` +
        `"SHA-256: ${upload.hash}"\n`;
    });

    reports.forEach((report) => {
      csvContent +=
        `REPORT,${report.id},"${report.date}",` +
        `"System","${report.title}",` +
        `"Format: ${report.format}"\n`;
    });

    reportService.downloadFile(
      csvContent,
      "prahari_activity_export.csv",
      "text/csv"
    );
  };

  /* -------------------- EXPORT JSON -------------------- */
  const handleExportJSON = () => {
    const uploads =
      evidenceService.getEvidenceList();

    const reports =
      reportService.getReports();

    const auditLogs =
      auditService.getLogs();

    const exportData = {
      system:
        "ASTRA Conjunction Risk Screening System",

      exportTimestamp:
        new Date().toISOString(),

      uploads,
      reports,
      auditLogs,
    };

    const jsonString =
      JSON.stringify(
        exportData,
        null,
        2
      );

    reportService.downloadFile(
      jsonString,
      "prahari_activity_export.json",
      "application/json"
    );
  };

  /* -------------------- ACTION CHIP -------------------- */
  const getActionChip = (action = "") => {
    const normalized =
      action.toLowerCase();

    if (
      normalized.includes("login")
    ) {
      return "info";
    }

    if (
      normalized.includes("upload") ||
      normalized.includes("dataset") ||
      normalized.includes("prediction")
    ) {
      return "success";
    }

    if (
      normalized.includes("report")
    ) {
      return "info";
    }

    if (
      normalized.includes("delete") ||
      normalized.includes("error") ||
      normalized.includes("failed")
    ) {
      return "danger";
    }

    return "warn";
  };

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>Activity & Audit History</h1>

          <p>
            Track CDM uploads, predictions, report
            generation, account activity and system
            events.
          </p>
        </div>

        <div
          className="actions"
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <div
            className="header-search"
            style={{
              maxWidth: 240,
              margin: 0,
            }}
          >
            <Icon
              name="search"
              size={14}
            />

            <input
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Search activity..."
            />
          </div>

          <button
            className="btn ghost"
            onClick={handleExportCSV}
          >
            <Icon
              name="download"
              size={14}
            />{" "}
            Export CSV
          </button>

          <button
            className="btn primary"
            onClick={handleExportJSON}
          >
            <Icon
              name="download"
              size={14}
            />{" "}
            Export JSON
          </button>
        </div>
      </div>

      {/* -------------------- AUDIT TABLE -------------------- */}
      <div className="card hud-card">
        <div className="card-head">
          <h3>
            <Icon
              name="activity"
              size={16}
              style={{
                color:
                  "var(--accent)",
              }}
            />{" "}
            Astra Activity Log
          </h3>

          <span className="chip success">
            {filteredLogs.length} EVENTS
          </span>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User / Account</th>
                <th>Activity</th>
                <th>Result / Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
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
                    No activity records
                    found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(
                  (log) => (
                    <tr
                      key={log.id}
                    >
                      <td
                        className="mono"
                        style={{
                          fontWeight: 700,
                          color:
                            "var(--accent)",
                        }}
                      >
                        {log.id}
                      </td>

                      <td
                        className="mono"
                        style={{
                          fontSize:
                            11.5,
                        }}
                      >
                        {log.timestamp}
                      </td>

                      <td>
                        <b>
                          {log.user}
                        </b>
                      </td>

                      <td>
                        <span
                          className={`chip ${getActionChip(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td
                        style={{
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        {log.result}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- ACTIVITY INFORMATION -------------------- */}
      <div
        className="grid cols-3"
        style={{
          marginTop: 20,
        }}
      >
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="upload"
                size={16}
              />{" "}
              CDM Upload Activity
            </h3>
          </div>

          <div
            className="k-value"
            style={{
              marginTop: 8,
            }}
          >
            {
              evidenceService
                .getEvidenceList()
                .length
            }
          </div>

          <p
            style={{
              fontSize: 11.5,
              color:
                "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Dataset records available
            in the application.
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="file"
                size={16}
              />{" "}
              Generated Reports
            </h3>
          </div>

          <div
            className="k-value"
            style={{
              marginTop: 8,
            }}
          >
            {
              reportService
                .getReports()
                .length
            }
          </div>

          <p
            style={{
              fontSize: 11.5,
              color:
                "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Saved conjunction risk
            reports.
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="activity"
                size={16}
              />{" "}
              Activity Events
            </h3>
          </div>

          <div
            className="k-value"
            style={{
              marginTop: 8,
            }}
          >
            {logs.length}
          </div>

          <p
            style={{
              fontSize: 11.5,
              color:
                "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Recorded application
            activity events.
          </p>
        </div>
      </div>

      {/* -------------------- EXPORT INFORMATION -------------------- */}
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
              name="database"
              size={16}
            />{" "}
            Activity Export
          </h3>

          <span className="chip info">
            CSV / JSON
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color:
              "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          Export Astra application activity,
          CDM upload records, generated reports
          and audit events for project review,
          troubleshooting or archival purposes.
        </p>
      </div>
    </div>
  );
}