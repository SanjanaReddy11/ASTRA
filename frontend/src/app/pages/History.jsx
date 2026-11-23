import { useState, useEffect, useCallback } from "react";
import Icon from "../components/Icon.jsx";
import {
  evidenceService,
  reportService,
} from "../services/store.js";
import { fetchAuditLogs } from "../services/api.js";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploads, setUploads] = useState([]);
  const [reports, setReports] = useState([]);

  // Determine whether the logged-in account is an administrator.
  const getIsAdmin = () => {
    try {
      const session = JSON.parse(
        localStorage.getItem("prahari_auth_session") || "{}"
      );

      return String(session.role || "").toLowerCase() === "admin";
    } catch {
      return false;
    }
  };

  // Convert backend audit records into the existing table format.
  const normalizeLog = (log) => {
    let metadata = {};

    try {
      metadata =
        typeof log.metadata_json === "string"
          ? JSON.parse(log.metadata_json || "{}")
          : log.metadata_json || {};
    } catch {
      metadata = {};
    }

    const eventType = log.event_type || "SYSTEM_EVENT";

    const action = eventType
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());

    const user =
      log.full_name ||
      log.actor_email ||
      (log.user_id ? `User ${log.user_id}` : "Unknown User");

    const details =
      log.description ||
      metadata.description ||
      metadata.message ||
      "Activity recorded.";

    return {
      id: log.id,
      timestamp: log.created_at || log.timestamp || "",
      user,
      action,
      result: details,
      email: log.actor_email || "",
      userId: log.user_id ?? null,
      eventType,
      metadata,
    };
  };

  // Fetch centralized backend audit history.
  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = getIsAdmin();

      // Admin gets all users' events.
      // Regular users get only their own events.
      const backendLogs = await fetchAuditLogs(isAdmin);

      const normalizedLogs = backendLogs
        .map(normalizeLog)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        );

      setLogs(normalizedLogs);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load audit history. Please log in again."
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUploads(evidenceService.getEvidenceList());
    setReports(reportService.getReports());

    loadAuditLogs();
  }, [loadAuditLogs]);

  const filteredLogs = logs.filter((log) => {
    const text = `
      ${log.id}
      ${log.timestamp}
      ${log.user}
      ${log.email}
      ${log.userId}
      ${log.action}
      ${log.result}
    `.toLowerCase();

    return text.includes(q.toLowerCase());
  });

  // Safely escape CSV values.
  const csvEscape = (value) => {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  };

  /* -------------------- EXPORT CSV -------------------- */
  const handleExportCSV = () => {
    let csvContent =
      "TYPE,ID,TIMESTAMP/DATE,USER/EMAIL,DETAILS,EXTRA\n";

    logs.forEach((log) => {
      csvContent += [
        "AUDIT",
        csvEscape(log.id),
        csvEscape(log.timestamp),
        csvEscape(log.email || log.user),
        csvEscape(log.action),
        csvEscape(log.result),
      ].join(",") + "\n";
    });

    uploads.forEach((upload) => {
      csvContent += [
        "CDM_UPLOAD",
        csvEscape(upload.id),
        csvEscape(upload.uploadDate),
        csvEscape(upload.uploadedBy),
        csvEscape(upload.name),
        csvEscape(`SHA-256: ${upload.hash}`),
      ].join(",") + "\n";
    });

    reports.forEach((report) => {
      csvContent += [
        "REPORT",
        csvEscape(report.id),
        csvEscape(report.date),
        csvEscape("System"),
        csvEscape(report.title),
        csvEscape(`Format: ${report.format}`),
      ].join(",") + "\n";
    });

    reportService.downloadFile(
      csvContent,
      "astra_activity_export.csv",
      "text/csv"
    );
  };

  /* -------------------- EXPORT JSON -------------------- */
  const handleExportJSON = () => {
    const exportData = {
      system: "ASTRA Conjunction Risk Screening System",

      exportTimestamp: new Date().toISOString(),

      auditLogs: logs,
      uploads,
      reports,
    };

    reportService.downloadFile(
      JSON.stringify(exportData, null, 2),
      "astra_activity_export.json",
      "application/json"
    );
  };

  /* -------------------- ACTION CHIP -------------------- */
  const getActionChip = (action = "") => {
    const normalized = action.toLowerCase();

    if (normalized.includes("login")) {
      return "info";
    }

    if (
      normalized.includes("upload") ||
      normalized.includes("dataset") ||
      normalized.includes("prediction")
    ) {
      return "success";
    }

    if (normalized.includes("report")) {
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
            generation, account activity and system events.
          </p>

          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 5,
            }}
          >
            {getIsAdmin()
              ? "Administrator view: activity from all registered users."
              : "Showing activity associated with your account."}
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
            <Icon name="search" size={14} />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search activity..."
            />
          </div>

          <button
            className="btn ghost"
            onClick={loadAuditLogs}
            disabled={loading}
          >
            <Icon name="activity" size={14} />{" "}
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            className="btn ghost"
            onClick={handleExportCSV}
          >
            <Icon name="download" size={14} />{" "}
            Export CSV
          </button>

          <button
            className="btn primary"
            onClick={handleExportJSON}
          >
            <Icon name="download" size={14} />{" "}
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
                color: "var(--accent)",
              }}
            />{" "}
            Astra Activity Log
          </h3>

          <span className="chip success">
            {filteredLogs.length} EVENTS
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              color: "#ff7777",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Loading centralized audit history...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No activity records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td
                      className="mono"
                      style={{
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {log.id}
                    </td>

                    <td
                      className="mono"
                      style={{
                        fontSize: 11.5,
                      }}
                    >
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <b>{log.user}</b>

                      {log.email && (
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "var(--text-muted)",
                            marginTop: 3,
                          }}
                        >
                          {log.email}
                        </div>
                      )}
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
                        color: "var(--text-secondary)",
                      }}
                    >
                      {log.result}
                    </td>
                  </tr>
                ))
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
              <Icon name="upload" size={16} />{" "}
              CDM Upload Activity
            </h3>
          </div>

          <div
            className="k-value"
            style={{
              marginTop: 8,
            }}
          >
            {uploads.length}
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Dataset records available in the application.
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon name="file" size={16} />{" "}
              Generated Reports
            </h3>
          </div>

          <div
            className="k-value"
            style={{
              marginTop: 8,
            }}
          >
            {reports.length}
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Saved conjunction risk reports.
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon name="activity" size={16} />{" "}
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
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Centralized backend audit events.
          </p>
        </div>
      </div>

      {/* -------------------- EXPORT INFORMATION -------------------- */}
      <div
        className="card hud-card"
        style={{
          marginTop: 20,
          borderColor: "var(--accent-border)",
        }}
      >
        <div className="card-head">
          <h3>
            <Icon name="database" size={16} />{" "}
            Activity Export
          </h3>

          <span className="chip info">
            CSV / JSON
          </span>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          Export ASTRA application activity, CDM upload
          records, generated reports and centralized audit
          events for project review, troubleshooting or
          archival purposes.
        </p>
      </div>
    </div>
  );
}