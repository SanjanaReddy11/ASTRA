import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { authService } from "../services/store.js";

const CRUMBS = {
  "/": "Home",
  "/dashboard": "Mission Control Dashboard",
  "/mission": "Mission Overview",
  "/upload": "Data Intake Center",
  "/predictions": "Future Risk Predictions",
  "/analytics": "Conjunction Analytics",
  "/timeline": "CDM Processing Timeline",
  "/alerts": "Conjunction Alerts",
  "/reports": "Conjunction Reports",
  "/history": "Activity & Audit History",
  "/settings": "Settings",
  "/admin": "System Monitoring",
  "/help": "Help",
};

function useLocalTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return now;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatLocalTime(date) {
  return `${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}

function formatLocalDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Header({
  onMobileMenu,
  onOpenCmd,
  missionMode,
  onToggleMissionMode,
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const now = useLocalTime();

  const localTime = formatLocalTime(now);
  const localDate = formatLocalDate(now);

  const crumb = CRUMBS[loc.pathname] || "ASTRA";

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentUser = authService.getCurrentUser() || {
    username: "user",
    name: "Astra User",
    role: "user",
  };

  const userInitials =
    currentUser.username === "admin"
      ? "AD"
      : currentUser.username
        ? currentUser.username
            .slice(0, 2)
            .toUpperCase()
        : "AS";

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="header" role="banner">
      {/* -------------------- MOBILE MENU -------------------- */}
      <button
        className="icon-btn"
        aria-label="Open menu"
        onClick={onMobileMenu}
        style={{ display: "none" }}
      >
        <Icon name="menu" />
      </button>

      {/* -------------------- BREADCRUMB -------------------- */}
      <div className="breadcrumb">
        <b>ASTRA</b>
        <span className="sep">/</span>
        <span>{crumb}</span>
      </div>

      {/* -------------------- SEARCH -------------------- */}
      <div
        className="header-search"
        role="search"
        onClick={onOpenCmd}
      >
        <Icon name="search" size={16} />

        <input
          placeholder="Search datasets, hashes, reports…"
          aria-label="Quick search"
          readOnly
        />

        <span className="kbd">⌘K</span>
      </div>

      {/* -------------------- HEADER RIGHT -------------------- */}
      <div className="header-right">
        {/* Mission Mode */}
        <button
          className={`btn ghost ${
            missionMode ? "primary" : ""
          }`}
          onClick={onToggleMissionMode}
          title="Toggle Fullscreen Mission Mode"
          style={{
            fontSize: "11px",
            padding: "4px 10px",
          }}
        >
          <Icon name="target" size={14} />

          {missionMode
            ? "Exit Mission Control"
            : "Mission Mode"}
        </button>

        {/* Dataset Integrity */}
        <span
          className="status-chip"
          title="CDM dataset integrity monitoring"
        >
          <span className="pulse-dot" />
          Data Integrity
        </span>

        {/* SHA-256 */}
        <span
          className="status-chip"
          title="SHA-256 dataset integrity verification"
        >
          <span className="pulse-dot" />
          SHA-256 Verified
        </span>

        {/* -------------------- LOCAL CLOCK -------------------- */}
        <div
          className="clock"
          aria-live="polite"
          title="Local system time"
        >
          <b>{localTime}</b>
          <span>{localDate}</span>
        </div>

        {/* -------------------- NOTIFICATIONS -------------------- */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen((value) => !value);
              setProfileOpen(false);
            }}
          >
            <Icon name="bell" size={17} />
          </button>

          {notifOpen && (
            <div className="notification-menu">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "8px",
                }}
              >
                <b
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Screening Updates
                </b>

                <span
                  className="chip"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  UPDATES
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "8px",
                  }}
                >
                  <b
                    style={{
                      color: "var(--accent)",
                    }}
                  >
                    CDM SCREENING
                  </b>

                  <p
                    style={{
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    Conjunction dataset processing is
                    available from the Data Intake page.
                  </p>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "8px",
                  }}
                >
                  <b
                    style={{
                      color: "var(--success)",
                    }}
                  >
                    MODEL READY
                  </b>

                  <p
                    style={{
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    CatBoost future-risk prediction
                    pipeline is available.
                  </p>
                </div>

                <div
                  style={{
                    fontSize: "12px",
                  }}
                >
                  <b
                    style={{
                      color: "var(--warning)",
                    }}
                  >
                    REPORTING
                  </b>

                  <p
                    style={{
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    Conjunction reports can be generated
                    from processed screening results.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------- SETTINGS -------------------- */}
        <button
          className="icon-btn"
          aria-label="Settings"
          onClick={() => navigate("/settings")}
        >
          <Icon name="settings" size={17} />
        </button>

        {/* -------------------- PROFILE -------------------- */}
        <div style={{ position: "relative" }}>
          <div
            className="avatar"
            aria-label="User profile"
            title={`${currentUser.name} (${currentUser.role})`}
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotifOpen(false);
            }}
            style={{
              cursor: "pointer",
              background:
                currentUser.role === "admin"
                  ? "var(--accent)"
                  : "rgba(78, 168, 255, 0.2)",
            }}
          >
            {userInitials}
          </div>

          {profileOpen && (
            <div
              className="notification-menu"
              style={{
                right: 0,
                width: "220px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  paddingBottom: "10px",
                  marginBottom: "10px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <b
                  style={{
                    fontSize: "13px",
                    display: "block",
                    color: "var(--text)",
                  }}
                >
                  {currentUser.name}
                </b>

                <span
                  className="chip"
                  style={{
                    fontSize: "10px",
                    marginTop: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  Role: {currentUser.role}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <button
                  className="btn ghost"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    fontSize: "12px",
                  }}
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <Icon name="settings" size={14} />
                  Settings
                </button>

                <button
                  className="btn primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "12px",
                    marginTop: "6px",
                    background: "var(--danger)",
                    borderColor: "var(--danger)",
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}