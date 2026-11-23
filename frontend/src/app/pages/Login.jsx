import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/store.js";
import Icon from "../components/Icon.jsx";

// =========================================================
// NASA-STYLE INTERACTIVE ROTATING GLOBE
// =========================================================

function HeroGlobe() {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((r) => (r + 0.35) % 360);
      setPulse((p) => (p + 1) % 100);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  const satellites = [
    { id: "SAT-DEF-01", lat: 28.6, lng: 77.2, color: "#00f3ff", type: "Active" },
    { id: "SAT-SIG-04", lat: 51.5, lng: -0.1, color: "#00ff88", type: "Active" },
    { id: "SAT-WARN-09", lat: 38.9, lng: -77.0, color: "#ff3344", type: "Alert" },
    { id: "SAT-ORB-12", lat: 35.6, lng: 139.6, color: "#ffaa00", type: "Tracking" },
    { id: "SAT-OPT-77", lat: -33.8, lng: 151.2, color: "#3b82f6", type: "Active" },
  ];

  return (
    <div className="hero-globe-wrapper">
      <div className="globe-glow-backdrop" />

      <svg viewBox="0 0 600 600" className="hero-globe-svg">
        <defs>
          <radialGradient id="globeGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#141a24" />
            <stop offset="45%" stopColor="#0a0d14" />
            <stop offset="85%" stopColor="#040508" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.4" />
          </radialGradient>

          <radialGradient id="atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#00f3ff" stopOpacity="0" />
            <stop offset="95%" stopColor="#00f3ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00f3ff" stopOpacity="0.4" />
          </radialGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx="300" cy="300" rx="270" ry="85"
          fill="none"
          stroke="rgba(0,243,255,0.25)"
          strokeWidth="1.2"
          strokeDasharray="6 6"
          transform={`rotate(${rotation * 0.15} 300 300)`}
        />

        <ellipse
          cx="300" cy="300" rx="255" ry="140"
          fill="none"
          stroke="rgba(59,130,246,0.2)"
          strokeWidth="1.5"
          transform={`rotate(${-rotation * 0.2} 300 300)`}
        />

        <ellipse
          cx="300" cy="300" rx="280" ry="190"
          fill="none"
          stroke="rgba(255,51,68,0.22)"
          strokeWidth="1"
          transform={`rotate(${rotation * 0.1} 300 300)`}
        />

        <circle
          cx="300" cy="300" r="212"
          fill="none"
          stroke="#00f3ff"
          strokeWidth="2"
          opacity="0.3"
          filter="url(#neonGlow)"
        />

        <circle cx="300" cy="300" r="200" fill="url(#globeGrad)" />
        <circle cx="300" cy="300" r="200" fill="url(#atmosphere)" />

        {[-60, -40, -20, 0, 20, 40, 60].map((lat) => {
          const r = Math.cos((lat * Math.PI) / 180) * 200;
          const y = 300 - Math.sin((lat * Math.PI) / 180) * 200 * 0.45;

          return (
            <ellipse
              key={lat}
              cx="300"
              cy={y}
              rx={r}
              ry={r * 0.3}
              fill="none"
              stroke="rgba(0,243,255,0.12)"
              strokeWidth="0.8"
            />
          );
        })}

        {[0, 30, 60, 90, 120, 150].map((deg) => {
          const angle = ((rotation + deg) * Math.PI) / 180;
          const rx = Math.abs(Math.cos(angle)) * 200;

          return (
            <ellipse
              key={deg}
              cx="300"
              cy="300"
              rx={rx}
              ry="200"
              fill="none"
              stroke="rgba(0,243,255,0.08)"
              strokeWidth="0.8"
            />
          );
        })}

        {satellites.map((sat, i) => {
          const rad = ((rotation * 0.8 + i * 72) * Math.PI) / 180;
          const rx = 230 + (i % 2) * 20;
          const ry = 90 + (i % 3) * 30;
          const x = 300 + Math.cos(rad) * rx;
          const y = 300 + Math.sin(rad) * ry;

          return (
            <g key={sat.id}>
              <line
                x1={x}
                y1={y}
                x2="300"
                y2="300"
                stroke={sat.color}
                strokeWidth="0.8"
                opacity="0.35"
                strokeDasharray="3 3"
              />

              <circle
                cx={x}
                cy={y}
                r={(pulse + i * 20) % 25}
                fill="none"
                stroke={sat.color}
                strokeWidth="1"
                opacity={1 - ((pulse + i * 20) % 25) / 25}
              />

              <circle
                cx={x}
                cy={y}
                r="5"
                fill={sat.color}
                filter="url(#neonGlow)"
              />

              <circle cx={x} cy={y} r="2.5" fill="#ffffff" />

              <g transform={`translate(${x + 10}, ${y - 10})`}>
                <rect
                  x="0"
                  y="-12"
                  width="130"
                  height="20"
                  rx="3"
                  fill="rgba(8,12,18,0.85)"
                  stroke={sat.color}
                  strokeWidth="0.8"
                />

                <text
                  x="6"
                  y="2"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                >
                  {sat.id} · {sat.type}
                </text>
              </g>
            </g>
          );
        })}

        <circle
          cx="300"
          cy="300"
          r="30"
          fill="none"
          stroke="rgba(0,243,255,0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        <path
          d="M300 260 V280 M300 320 V340 M260 300 H280 M320 300 H340"
          stroke="rgba(0,243,255,0.6)"
          strokeWidth="1.2"
        />
      </svg>

      <div className="globe-telemetry-badge">
        <div className="t-row">
          <span className="pulse-dot" />
          <b>SATELLITE CONJUNCTION DATA STREAM</b>
        </div>

        <div className="t-meta">
          ORBITAL TRACKING: ACTIVE · 5 NODES LOCKED · REFRESH 0.35°/s
        </div>
      </div>
    </div>
  );
}

// =========================================================
// PASSWORD STRENGTH
// =========================================================

function calculateStrength(pwd) {
  if (!pwd) {
    return { score: 0, label: "Empty", color: "#6b7280" };
  }

  let score = 0;

  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) {
    return { score: 25, label: "WEAK", color: "var(--danger)" };
  }

  if (score <= 3) {
    return { score: 65, label: "MEDIUM", color: "var(--warning)" };
  }

  return { score: 100, label: "STRONG", color: "var(--success)" };
}

// =========================================================
// LOGIN COMPONENT
// =========================================================

export default function Login() {
  const [authRole, setAuthRole] = useState("user");
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();

  // -------------------------------------------------------
  // USER LOGIN
  // -------------------------------------------------------

  const handleUserLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authService.loginUser(
        email,
        userPassword,
        rememberMe
      );

      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.error);
      }
    } catch (error) {
      setError(error.message || "User login failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // ADMIN LOGIN
  // -------------------------------------------------------

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authService.loginAdmin(
        adminId,
        adminPassword,
        rememberMe
      );

      if (res.success) {
        navigate("/admin");
      } else {
        setError(res.error);
      }
    } catch (error) {
      setError(error.message || "Administrator login failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // USER REGISTRATION
  // -------------------------------------------------------

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authService.signupUser(
        signupName,
        signupEmail,
        signupPassword
      );

      if (res.success) {
        setSuccessMsg(
          "Account created successfully! Redirecting to mission dashboard..."
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        setError(res.error);
      }
    } catch (error) {
      setError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // PASSWORD RECOVERY
  // -------------------------------------------------------

  const handleForgotPassSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");

    const res = await authService.forgotPassword(resetEmail);

    if (res.success) {
      setSuccessMsg(res.message);
      setForgotModal(false);
    } else {
      setError(res.error);
    }
  };

  const pwdStrength = calculateStrength(
    tab === "signup"
      ? signupPassword
      : authRole === "admin"
        ? adminPassword
        : userPassword
  );

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="login-root">

      {/* NASA ORBITAL GLOBE */}
      <div className="login-globe-section">
        <HeroGlobe />
      </div>

      {/* AUTHENTICATION PANEL */}
      <div className="login-form-section">
        <div className="card hud-card login-glass-card">

          {/* BRAND HEADER */}
          <div className="login-card-head">
            <div className="brand-mark-lg">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"
                  opacity=".4"
                />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </div>

            <div>
              <h1 className="login-title">ASTRA</h1>
              <p className="login-subtitle">
                SATELLITE CONJUNCTION RISK INTELLIGENCE
              </p>
            </div>
          </div>

          {/* ROLE SWITCH */}
          <div className="role-switch-tabs">
            <button
              type="button"
              className={`role-tab ${authRole === "user" ? "active" : ""}`}
              onClick={() => {
                setAuthRole("user");
                setError("");
                setSuccessMsg("");
              }}
            >
              <Icon name="user" size={15} />
              User Access
            </button>

            <button
              type="button"
              className={`role-tab admin-tab ${authRole === "admin" ? "active" : ""}`}
              onClick={() => {
                setAuthRole("admin");
                setError("");
                setSuccessMsg("");
                setTab("login");
              }}
            >
              <Icon name="shield" size={15} />
              Administrator Access
            </button>
          </div>

          {/* USER SUBTABS */}
          {authRole === "user" && (
            <div className="sub-tab-bar">
              <button
                type="button"
                className={`sub-tab ${tab === "login" ? "active" : ""}`}
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={`sub-tab ${tab === "signup" ? "active" : ""}`}
                onClick={() => {
                  setTab("signup");
                  setError("");
                  setSuccessMsg("");
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* FEEDBACK */}
          {error && (
            <div className="alert-banner danger">
              <Icon name="bell" size={14} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-banner success">
              <Icon name="check" size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* USER LOGIN */}
          {authRole === "user" && tab === "login" && (
            <form onSubmit={handleUserLogin} className="login-form">

              <div className="form-group">
                <label className="form-label">
                  User Email Address
                </label>

                <div className="input-wrap">
                  <Icon name="mail" size={16} className="input-icon" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@astra.local"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">
                    Account Password
                  </label>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setForgotModal(true);
                      setResetEmail(email);
                      setError("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="input-wrap">
                  <Icon name="lock" size={16} className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="form-input"
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div className="form-row-between">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn primary glow-btn"
                style={{ width: "100%", padding: "12px" }}
              >
                {loading ? "Authenticating..." : "Sign In to Mission Control"}
              </button>
            </form>
          )}

          {/* USER SIGNUP */}
          {authRole === "user" && tab === "signup" && (
            <form onSubmit={handleSignup} className="login-form">

              <div className="form-group">
                <label className="form-label">Full Name</label>

                <div className="input-wrap">
                  <Icon name="user" size={16} className="input-icon" />

                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>

                <div className="input-wrap">
                  <Icon name="mail" size={16} className="input-icon" />

                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Create Password</label>

                <div className="input-wrap">
                  <Icon name="lock" size={16} className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="form-input"
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>

                {signupPassword && (
                  <div className="strength-meter">
                    <div className="strength-bar-bg">
                      <div
                        className="strength-bar-fill"
                        style={{
                          width: `${pwdStrength.score}%`,
                          backgroundColor: pwdStrength.color,
                        }}
                      />
                    </div>

                    <span
                      style={{
                        color: pwdStrength.color,
                        fontSize: "10.5px",
                        fontWeight: "700",
                      }}
                    >
                      STRENGTH: {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn primary glow-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "4px",
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* ADMIN LOGIN */}
          {authRole === "admin" && (
            <form onSubmit={handleAdminLogin} className="login-form admin-form">

              <div className="admin-notice">
                <Icon
                  name="shield"
                  size={16}
                  style={{ color: "var(--danger)" }}
                />
                <span>RESTRICTED ADMINISTRATOR ACCESS</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Administrator Email
                </label>

                <div className="input-wrap">
                  <Icon name="shield" size={16} className="input-icon" />

                  <input
                    type="email"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="admin@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Administrator Password
                </label>

                <div className="input-wrap">
                  <Icon name="key" size={16} className="input-icon" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="form-input"
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div className="form-row-between">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Admin Session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn primary glow-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  borderColor: "#ff3344",
                }}
              >
                {loading ? "Verifying Administrator..." : "Sign In as Administrator"}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModal && (
        <div className="modal-backdrop">
          <div className="card hud-card modal-box">

            <div className="modal-head">
              <h3>
                <Icon name="key" size={18} />
                Password Recovery Request
              </h3>

              <button
                type="button"
                className="close-btn"
                onClick={() => setForgotModal(false)}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "16px",
              }}
            >
              Password recovery is not currently enabled.
              Please contact the administrator for assistance.
            </p>

            <form onSubmit={handleForgotPassSubmit}>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                style={{ marginBottom: "16px" }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setForgotModal(false)}
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="btn primary"
                >
                  Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}