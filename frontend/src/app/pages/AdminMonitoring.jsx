import { useState, useEffect } from "react";
import Icon from "../components/Icon.jsx";
import {
  evidenceService,
  reportService,
  auditService,
  authService,
} from "../services/store.js";

export default function AdminMonitoring() {
  const [datasetList, setDatasetList] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [failedLogins, setFailedLogins] = useState(0);

  useEffect(() => {
    setDatasetList(evidenceService.getEvidenceList());
    setReports(reportService.getReports());
    setLogs(auditService.getLogs());
    setFailedLogins(authService.getFailedLoginsCount());
  }, []);

  const totalDatasets = datasetList.length;

  const processingDatasets = datasetList.filter(
    (item) =>
      item.status === "Under Review" ||
      item.status === "Uploaded"
  ).length;

  const completedDatasets = datasetList.filter(
    (item) =>
      item.status === "Closed" ||
      item.status === "Completed"
  ).length;

  const reportsCount = reports.length;

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>System Monitoring</h1>

          <p>
            Astra system activity, CDM processing status,
            reports, and authentication monitoring.
          </p>
        </div>

        <div className="actions">
          <span
            className="chip success"
            style={{
              fontSize: "12px",
              padding: "6px 12px",
            }}
          >
            <span className="pulse-dot" />
            SYSTEM MONITORING ACTIVE
          </span>
        </div>
      </div>

      {/* -------------------- PRIMARY KPI GRID -------------------- */}
      <div
        className="grid cols-4"
        style={{ marginBottom: 20 }}
      >
        <div className="card kpi hud-card">
          <div className="k-label">
            <span>Active Session</span>

            <span
              className="k-icon"
              style={{
                color: "var(--accent)",
              }}
            >
              <Icon
                name="users"
                size={16}
              />
            </span>
          </div>

          <div className="k-value">1</div>

          <p
            style={{
              fontSize: 11,
              color: "var(--success)",
              marginTop: 4,
            }}
          >
            Current project session
          </p>
        </div>

        <div className="card kpi hud-card">
          <div className="k-label">
            <span>CDM Datasets</span>

            <span
              className="k-icon"
              style={{
                color: "var(--accent)",
              }}
            >
              <Icon
                name="upload"
                size={16}
              />
            </span>
          </div>

          <div className="k-value">
            {totalDatasets}
          </div>

          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Uploaded datasets
          </p>
        </div>

        <div className="card kpi hud-card">
          <div className="k-label">
            <span>Reports Generated</span>

            <span
              className="k-icon"
              style={{
                color: "var(--accent)",
              }}
            >
              <Icon
                name="file"
                size={16}
              />
            </span>
          </div>

          <div className="k-value">
            {reportsCount}
          </div>

          <p
            style={{
              fontSize: 11,
              color: "var(--accent-glow)",
              marginTop: 4,
            }}
          >
            Conjunction reports
          </p>
        </div>

        <div className="card kpi hud-card">
          <div className="k-label">
            <span>Failed Logins</span>

            <span
              className="k-icon"
              style={{
                color:
                  failedLogins > 0
                    ? "var(--danger)"
                    : "var(--accent)",
              }}
            >
              <Icon
                name="bell"
                size={16}
              />
            </span>
          </div>

          <div
            className="k-value"
            style={{
              color:
                failedLogins > 0
                  ? "var(--danger)"
                  : "var(--text)",
            }}
          >
            {failedLogins}
          </div>

          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Authentication attempts
          </p>
        </div>
      </div>

      {/* -------------------- SECONDARY KPI ROW -------------------- */}
      <div
        className="grid cols-3"
        style={{ marginBottom: 20 }}
      >
        <div className="card hud-card">
          <div className="card-head">
            <h3>Datasets Processing</h3>

            <span className="chip info">
              {processingDatasets} Active
            </span>
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              margin: "10px 0",
            }}
          >
            {processingDatasets}
          </div>

          <div className="progress info">
            <span
              style={{
                width: `${
                  totalDatasets > 0
                    ? Math.min(
                        100,
                        (processingDatasets /
                          totalDatasets) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Datasets awaiting or undergoing processing
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>Completed Datasets</h3>

            <span className="chip success">
              {completedDatasets} Complete
            </span>
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              margin: "10px 0",
              color: "var(--success)",
            }}
          >
            {completedDatasets}
          </div>

          <div className="progress success">
            <span
              style={{
                width: `${
                  totalDatasets > 0
                    ? Math.min(
                        100,
                        (completedDatasets /
                          totalDatasets) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Completed dataset processing records
          </p>
        </div>

        <div className="card hud-card">
          <div className="card-head">
            <h3>Model Pipeline</h3>

            <span className="chip success">
              READY
            </span>
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              margin: "10px 0",
              color: "var(--accent)",
            }}
          >
            CatBoost
          </div>

          <div className="progress success">
            <span style={{ width: "100%" }} />
          </div>

          <p
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Future-risk prediction pipeline
          </p>
        </div>
      </div>

      {/* -------------------- SYSTEM STATUS & AUDIT -------------------- */}
      <div className="grid cols-2">
        <div className="card hud-card">
          <div className="card-head">
            <h3>System Status</h3>

            <span className="chip success">
              STABLE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                padding: "12px",
                background:
                  "rgba(10, 10, 14, 0.8)",
                borderRadius:
                  "var(--radius-sm)",
                border:
                  "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <b>Application</b>

                <span className="chip success">
                  ONLINE
                </span>
              </div>

              <p
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Astra frontend and project interface
              </p>
            </div>

            <div
              style={{
                padding: "12px",
                background:
                  "rgba(10, 10, 14, 0.8)",
                borderRadius:
                  "var(--radius-sm)",
                border:
                  "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <b>Prediction Model</b>

                <span className="chip success">
                  READY
                </span>
              </div>

              <p
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                CatBoostRegressor · Future-risk prediction
              </p>
            </div>

            <div
              style={{
                padding: "12px",
                background:
                  "rgba(10, 10, 14, 0.8)",
                borderRadius:
                  "var(--radius-sm)",
                border:
                  "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <b>Data Integrity</b>

                <span className="chip info">
                  SHA-256
                </span>
              </div>

              <p
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Uploaded datasets can be verified using
                their SHA-256 integrity hash.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------- AUDIT EVENTS -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>Recent Activity</h3>

            <span className="chip">
              AUDIT LOG
            </span>
          </div>

          <div
            className="table-wrap"
            style={{
              maxHeight: "280px",
              overflowY: "auto",
            }}
          >
            <table className="data">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Activity</th>
                </tr>
              </thead>

              <tbody>
                {logs.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td
                      className="mono"
                      style={{
                        fontSize: 11,
                      }}
                    >
                      {log.timestamp}
                    </td>

                    <td>
                      <b>{log.user}</b>
                    </td>

                    <td>
                      {log.action}
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        color:
                          "var(--text-muted)",
                        padding: "20px",
                      }}
                    >
                      No activity recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}