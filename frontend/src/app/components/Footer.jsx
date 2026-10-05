export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="mono" style={{ color: "var(--accent)" }}>ASTRA</span> · Orbital Conjunction Early Warning System
      </div>
      <div style={{ display: "flex", gap: "16px", fontFamily: "JetBrains Mono", fontSize: "11px" }}>
        <span>SGP4 PROPAGATOR: OK</span>
        <span>CATBOOST CORE: OK</span>
        <span>LATENCY: 14ms</span>
      </div>
    </footer>
  );
}
