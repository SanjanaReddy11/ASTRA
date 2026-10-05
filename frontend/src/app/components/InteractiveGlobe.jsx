import { useState, useEffect } from "react";

const SATELLITES = [
  { id: "ISS-25544", name: "ISS (ZARYA)", alt: "418 km", lat: 51.64, lng: -104.2, status: "Nominal", color: "#00ff88", pri: "LOW" },
  { id: "SAT-43013", name: "GSAT-11 (COMM)", alt: "35,786 km", lat: 0.04, lng: 74.0, status: "Nominal", color: "#00f3ff", pri: "LOW" },
  { id: "SAT-48274", name: "STARLINK-4193", alt: "540 km", lat: 53.05, lng: 12.4, status: "CRITICAL VECTOR", color: "#ff3344", pri: "CRITICAL" },
  { id: "DEB-27424", name: "FENGYUN-1C DEB", alt: "840 km", lat: 98.51, lng: 142.8, status: "HIGH RISK DEBRIS", color: "#ffaa00", pri: "HIGH" },
  { id: "DEB-22675", name: "COSMOS-2251 DEB", alt: "780 km", lat: 74.03, lng: -45.1, status: "CONJUNCTION WARN", color: "#ff3344", pri: "CRITICAL" },
  { id: "SAT-49122", name: "SENTINEL-2B", alt: "786 km", lat: 98.62, lng: 88.5, status: "Nominal Scan", color: "#00ff88", pri: "NOMINAL" },
  { id: "SAT-88219", name: "DEFENSE-INTEL-X", alt: "1,200 km", lat: -12.4, lng: 45.2, status: "SECURE TELEMETRY", color: "#00f3ff", pri: "NOMINAL" },
];

export default function InteractiveGlobe({ onSelectSat }) {
  const [rotation, setRotation] = useState(0);
  const [activeSat, setActiveSat] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((r) => (r + 0.4) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="interactive-globe-card-body"
      style={{
        position: "relative",
        width: "100%",
        height: "440px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 50%, #0d121c 0%, #050505 85%)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid rgba(0, 243, 255, 0.2)",
        boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.9)",
      }}
    >
      {/* Background Radar Scanning Grid Effect */}
      <div className="radar-sweep-lines" />

      <svg width="420" height="420" viewBox="0 0 420 420">
        <defs>
          <radialGradient id="globeCore" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#141c2b" />
            <stop offset="60%" stopColor="#080a10" />
            <stop offset="90%" stopColor="#020305" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="atmoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="#00f3ff" stopOpacity="0" />
            <stop offset="95%" stopColor="#00f3ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.5" />
          </radialGradient>
          <filter id="neonGlowGlobe">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Atmosphere Outer Ring */}
        <circle cx="210" cy="210" r="172" fill="none" stroke="#00f3ff" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
        <circle cx="210" cy="210" r="160" fill="url(#globeCore)" filter="url(#neonGlowGlobe)" />
        <circle cx="210" cy="210" r="160" fill="url(#atmoGlow)" />

        {/* Latitude Lines */}
        {[-60, -40, -20, 0, 20, 40, 60].map((lat) => {
          const r = Math.cos((lat * Math.PI) / 180) * 160;
          const y = 210 - Math.sin((lat * Math.PI) / 180) * 160 * 0.42;
          return (
            <ellipse
              key={lat}
              cx="210"
              cy={y}
              rx={r}
              ry={r * 0.3}
              fill="none"
              stroke="rgba(0, 243, 255, 0.16)"
              strokeWidth="0.9"
            />
          );
        })}

        {/* Dynamic Longitude Meridians */}
        {[0, 45, 90, 135].map((deg) => {
          const angle = ((rotation + deg) * Math.PI) / 180;
          const rx = Math.abs(Math.cos(angle)) * 160;
          return (
            <ellipse
              key={deg}
              cx="210"
              cy="210"
              rx={rx}
              ry="160"
              fill="none"
              stroke="rgba(0, 243, 255, 0.12)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Orbit Path 1 - LEO Active */}
        <ellipse cx="210" cy="210" rx="195" ry="60" fill="none" stroke="rgba(0, 243, 255, 0.4)" strokeWidth="1.2" strokeDasharray="8 4" transform={`rotate(${rotation * 0.2} 210 210)`} />
        
        {/* Orbit Path 2 - Threat Debris Inclined */}
        <ellipse cx="210" cy="210" rx="180" ry="110" fill="none" stroke="rgba(255, 51, 68, 0.45)" strokeWidth="1.2" strokeDasharray="4 4" transform={`rotate(${-rotation * 0.25} 210 210)`} />

        {/* Orbit Path 3 - Deep GEO Orbit */}
        <ellipse cx="210" cy="210" rx="205" ry="140" fill="none" stroke="rgba(0, 255, 136, 0.35)" strokeWidth="1" transform={`rotate(${rotation * 0.1} 210 210)`} />

        {/* Satellite Points & Telemetry Nodes */}
        {SATELLITES.map((sat, i) => {
          const angle = ((rotation + i * 51.4) * Math.PI) / 180;
          const rx = 165 + (i % 3) * 12;
          const ry = 60 + (i % 2) * 45;
          const x = 210 + Math.cos(angle) * rx;
          const y = 210 + Math.sin(angle) * ry;

          const isCritical = sat.pri === "CRITICAL";

          return (
            <g
              key={sat.id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectSat && onSelectSat(sat)}
              onMouseEnter={() => setActiveSat(sat)}
              onMouseLeave={() => setActiveSat(null)}
            >
              {/* Laser Beam line to center */}
              <line x1={x} y1={y} x2="210" y2="210" stroke={sat.color} strokeWidth="0.8" opacity="0.25" strokeDasharray="2 2" />

              {/* Pulsing ring for threats */}
              {isCritical && (
                <circle cx={x} cy={y} r="14" fill="none" stroke="#ff3344" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="6;16;6" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              <circle cx={x} cy={y} r="10" fill={sat.color} opacity="0.25" />
              <circle cx={x} cy={y} r="5" fill={sat.color} filter="url(#neonGlowGlobe)" />
              <circle cx={x} cy={y} r="2" fill="#ffffff" />

              {/* Interactive Tooltip Card */}
              {activeSat?.id === sat.id && (
                <g transform={`translate(${x > 260 ? x - 130 : x + 10}, ${y > 350 ? y - 45 : y - 20})`}>
                  <rect width="140" height="38" rx="6" fill="rgba(8, 12, 18, 0.95)" stroke={sat.color} strokeWidth="1" />
                  <text x="8" y="15" fill="#ffffff" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono">
                    {sat.name}
                  </text>
                  <text x="8" y="28" fill={sat.color} fontSize="9" fontWeight="600" fontFamily="JetBrains Mono">
                    ALT: {sat.alt} · {sat.pri}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Center Target HUD Crosshair */}
        <path d="M210 185 V235 M185 210 H235" stroke="rgba(0, 243, 255, 0.5)" strokeWidth="1" />
        <circle cx="210" cy="210" r="16" fill="none" stroke="rgba(0, 243, 255, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* Real-time Telemetry HUD Footer */}
      <div style={{ position: "absolute", bottom: "14px", left: "18px", right: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "14px", fontSize: "11px", fontFamily: "JetBrains Mono", color: "var(--text-secondary)" }}>
          <span><b style={{ color: "var(--accent)" }}>ORBITAL RADAR:</b> LOCKED</span>
          <span><b style={{ color: "var(--success)" }}>TRACKED NODES:</b> 428</span>
          <span><b style={{ color: "var(--danger)" }}>ACTIVE CONJUNCTIONS:</b> 2</span>
        </div>
        <span className="chip info" style={{ fontSize: "10px" }}>
          LIVE 3D SIMULATION · 0.4°/s ROTATION
        </span>
      </div>
    </div>
  );
}
