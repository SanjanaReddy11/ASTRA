import { useState } from "react";
import Icon from "../components/Icon.jsx";

const ALERTS = [
  {
    id: "AL-9821",
    p: "high",
    t: "High future-risk conjunction detected",
    event: "CONJ-9012",
    asset: "SATELLITE-A",
    type: "Orbital Debris",
    ts: "TCA T-04:12 · 12s ago",
    status: "New",
    pinned: true,
  },
  {
    id: "AL-9820",
    p: "high",
    t: "Future-risk threshold exceeded",
    event: "CONJ-8941",
    asset: "SATELLITE-B",
    type: "Rocket Body",
    ts: "TCA T-09:48 · 3m ago",
    status: "Reviewing",
    pinned: true,
  },
  {
    id: "AL-9819",
    p: "medium",
    t: "Conjunction event requires monitoring",
    event: "CONJ-8890",
    asset: "SATELLITE-C",
    type: "Unknown Object",
    ts: "11m ago",
    status: "New",
    pinned: false,
  },
  {
    id: "AL-9818",
    p: "medium",
    t: "New CDM received for screening",
    event: "CONJ-8762",
    asset: "SATELLITE-D",
    type: "Satellite",
    ts: "22m ago",
    status: "Processing",
    pinned: false,
  },
  {
    id: "AL-9817",
    p: "medium",
    t: "Future-risk prediction updated",
    event: "CONJ-8714",
    asset: "SATELLITE-E",
    type: "Rocket Body",
    ts: "42m ago",
    status: "Acknowledged",
    pinned: false,
  },
  {
    id: "AL-9816",
    p: "low",
    t: "CDM dataset screening completed",
    event: "CONJ-8652",
    asset: "SATELLITE-F",
    type: "Satellite",
    ts: "1h ago",
    status: "Resolved",
    pinned: false,
  },
  {
    id: "AL-9815",
    p: "low",
    t: "Future-risk prediction completed",
    event: "CONJ-8618",
    asset: "SATELLITE-G",
    type: "Satellite",
    ts: "1h ago",
    status: "Resolved",
    pinned: false,
  },
  {
    id: "AL-9814",
    p: "low",
    t: "CDM integrity verification completed",
    event: "CONJ-8582",
    asset: "Dataset",
    type: "CDM Dataset",
    ts: "5h ago",
    status: "Resolved",
    pinned: false,
  },
];

export default function Alerts() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const [mutedAlerts, setMutedAlerts] =
    useState([]);

  const shown = ALERTS.filter((alert) => {
    const matchesFilter =
      filter === "all" ||
      alert.p === filter;

    const searchText = `
      ${alert.t}
      ${alert.id}
      ${alert.event}
      ${alert.asset}
      ${alert.type}
      ${alert.status}
    `.toLowerCase();

    const matchesSearch =
      searchText.includes(
        q.toLowerCase()
      );

    const isMuted =
      mutedAlerts.includes(alert.id);

    return (
      matchesFilter &&
      matchesSearch &&
      !isMuted
    );
  });

  const pinned = ALERTS.filter(
    (alert) =>
      alert.pinned &&
      !mutedAlerts.includes(alert.id)
  );

  return (
    <div>
      {/* -------------------- PAGE HEADER -------------------- */}
      <div className="page-head">
        <div>
          <h1>Conjunction Alerts</h1>

          <p>
            Future-risk and CDM screening
            alerts across Low, Medium and
            High risk levels.
          </p>
        </div>

        <div className="actions">
          <div
            className="header-search"
            style={{
              maxWidth: 280,
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
              placeholder="Search alerts…"
            />
          </div>
        </div>
      </div>

      {/* -------------------- FILTERS -------------------- */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          "all",
          "high",
          "medium",
          "low",
        ].map((f) => (
          <button
            key={f}
            onClick={() =>
              setFilter(f)
            }
            className="btn"
            style={{
              padding: "6px 16px",
              fontSize: 12,
              borderColor:
                filter === f
                  ? "var(--accent)"
                  : "var(--border)",
              background:
                filter === f
                  ? "rgba(78,168,255,0.15)"
                  : undefined,
              color:
                filter === f
                  ? "#fff"
                  : "var(--text-secondary)",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.06em",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* -------------------- MAIN GRID -------------------- */}
      <div
        className="grid"
        style={{
          gridTemplateColumns:
            "1.4fr 1fr",
        }}
      >
        {/* -------------------- ALERT FEED -------------------- */}
        <div className="card hud-card">
          <div className="card-head">
            <h3>
              <Icon
                name="bell"
                size={16}
                style={{
                  color:
                    "var(--accent)",
                }}
              />{" "}
              Live Conjunction Alert Feed ·{" "}
              {shown.length} Alerts
            </h3>

            <span className="chip info">
              CDM SCREENING
            </span>
          </div>

          {shown.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign:
                  "center",
                color:
                  "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              No conjunction alerts
              match the selected
              filter.
            </div>
          ) : (
            shown.map((alert) => (
              <div
                key={alert.id}
                className={`alert-item ${alert.p}`}
                style={{
                  opacity:
                    alert.status ===
                    "Resolved"
                      ? 0.65
                      : 1,
                }}
              >
                <span className="stripe" />

                <div>
                  <div className="a-title">
                    {alert.t}
                  </div>

                  <div className="a-sub">
                    {alert.id} ·{" "}
                    {alert.event} ·{" "}
                    {alert.asset}
                  </div>
                </div>

                <div
                  className="a-time"
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "flex-end",
                    gap: 4,
                  }}
                >
                  <span>
                    {alert.ts}
                  </span>

                  <span
                    style={{
                      fontSize:
                        "9px",
                      color:
                        alert.status ===
                        "Acknowledged"
                          ? "var(--success)"
                          : alert.status ===
                            "Escalated"
                          ? "var(--danger)"
                          : "var(--text-muted)",
                    }}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* -------------------- RIGHT SIDEBAR -------------------- */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 20,
          }}
        >
          {/* PRIORITY CONJUNCTIONS */}
          <div className="card hud-card">
            <div className="card-head">
              <h3>
                <Icon
                  name="bell"
                  size={16}
                  style={{
                    color:
                      "var(--danger)",
                  }}
                />{" "}
                Priority Conjunctions
              </h3>

              <span className="chip danger">
                {pinned.length} PRIORITIZED
              </span>
            </div>

            {pinned.map((alert) => (
              <div
                key={alert.id}
                className={`alert-item ${alert.p}`}
                style={{
                  cursor:
                    "default",
                }}
              >
                <span className="stripe" />

                <div>
                  <div className="a-title">
                    {alert.t}
                  </div>

                  <div className="a-sub">
                    {alert.id} ·{" "}
                    {alert.event}
                  </div>
                </div>

                <div className="a-time">
                  {alert.ts}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- MODEL / ALERT INFO -------------------- */}
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
            Alert Generation Pipeline
          </h3>

          <span className="chip success">
            CATBOOST
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
          <div>
            <div className="k-label">
              INPUT
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              CDM Dataset
            </div>
          </div>

          <div>
            <div className="k-label">
              MODEL
            </div>

            <div
              className="mono"
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 600,
                color:
                  "var(--accent)",
              }}
            >
              CatBoostRegressor
            </div>
          </div>

          <div>
            <div className="k-label">
              OUTPUT
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Future Risk
            </div>
          </div>

          <div>
            <div className="k-label">
              CLASSIFICATION
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                fontWeight: 600,
                color:
                  "var(--warning)",
              }}
            >
              Low / Medium / High
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}