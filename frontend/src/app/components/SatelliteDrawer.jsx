import Icon from "./Icon.jsx";

export default function SatelliteDrawer({ sat, onClose }) {
  if (!sat) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4, 9, 19, 0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 900,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "420px",
          height: "100%",
          background: "var(--card)",
          borderLeft: "1px solid var(--accent-border)",
          boxShadow: "var(--shadow-lg)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Asset Telemetry Inspector
            </div>
            <h2 style={{ fontSize: "20px", marginTop: "4px" }}>{sat.name || sat.id}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ padding: "14px", background: "rgba(78, 168, 255, 0.06)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: sat.color || "var(--accent-glow)", marginTop: "4px" }}>
            {sat.status || "NOMINAL OPERATIONAL STATE"}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "12px" }}>
            Orbital Parameters
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="card" style={{ padding: "12px" }}>
              <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>Altitude</small>
              <div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>{sat.alt || "540 km"}</div>
            </div>
            <div className="card" style={{ padding: "12px" }}>
              <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>Inclination</small>
              <div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>{sat.lat ? `${sat.lat}°` : "53.05°"}</div>
            </div>
            <div className="card" style={{ padding: "12px" }}>
              <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>Longitude</small>
              <div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>{sat.lng ? `${sat.lng}°` : "12.4°"}</div>
            </div>
            <div className="card" style={{ padding: "12px" }}>
              <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>Propagator</small>
              <div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>SGP4 + J2</div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "12px" }}>
            Maneuver Recommendation
          </h3>
          <p style={{ fontSize: "13px", lineHeight: "1.6" }}>
            Ensemble CatBoost model evaluates a <strong>34x Pc breach</strong> over mission safety thresholds.
            Prograde maneuver Δv of 0.021 m/s recommended at 09:31 UTC.
          </p>
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
          <button className="btn primary" style={{ flex: 1 }}>Execute Maneuver Plan</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
