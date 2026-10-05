import { useState, useEffect } from "react";

export default function MiniRadar() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAngle((a) => (a + 4) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Blip targets
  const blips = [
    { x: 120, y: 70, r: 3, pri: "#FF4D4D" },
    { x: 70, y: 110, r: 2.5, pri: "#FFB300" },
    { x: 140, y: 130, r: 2, pri: "#00E676" },
  ];

  return (
    <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto" }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="radarSweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4EA8FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4EA8FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Concentric Radar Rings */}
        <circle cx="90" cy="90" r="80" fill="#061021" stroke="rgba(78, 168, 255, 0.2)" strokeWidth="1" />
        <circle cx="90" cy="90" r="55" fill="none" stroke="rgba(78, 168, 255, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="90" cy="90" r="30" fill="none" stroke="rgba(78, 168, 255, 0.2)" strokeWidth="1" />

        {/* Crosshair Axes */}
        <line x1="90" y1="10" x2="90" y2="170" stroke="rgba(78, 168, 255, 0.25)" strokeWidth="1" />
        <line x1="10" y1="90" x2="170" y2="90" stroke="rgba(78, 168, 255, 0.25)" strokeWidth="1" />

        {/* Radar Sweep Line */}
        <g transform={`rotate(${angle} 90 90)`}>
          <path d="M90 90 L170 90 A80 80 0 0 0 90 10 Z" fill="url(#radarSweep)" />
          <line x1="90" y1="90" x2="170" y2="90" stroke="#4EA8FF" strokeWidth="1.8" />
        </g>

        {/* Radar Blips */}
        {blips.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.pri} boxShadow={`0 0 8px ${b.pri}`} />
        ))}
      </svg>

      <div style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", fontFamily: "JetBrains Mono", marginTop: "-10px" }}>
        RADAR 50km RANGE
      </div>
    </div>
  );
}
