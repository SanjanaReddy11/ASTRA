import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Icon from "./Icon.jsx";
import { authService } from "../services/store.js";

/* =========================================================
   PAGE BREADCRUMBS
========================================================= */

const CRUMBS = {
  "/": "Home",
  "/dashboard": "Mission Control Dashboard",
  "/mission": "Mission Overview",
  "/upload": "Data Intake Center",
  "/timeline": "CDM Processing Timeline",
  "/alerts": "Conjunction Alerts",
  "/reports": "Conjunction Reports",
  "/explainability": "SHAP Explainability",
  "/history": "Activity & Audit History",
  "/settings": "Settings",
  "/admin": "System Monitoring",
  "/help": "Help",
};

/* =========================================================
   LOCAL TIME
========================================================= */

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

/* =========================================================
   TIME FORMATTING
========================================================= */

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

/* =========================================================
   HEADER COMPONENT
========================================================= */

export default function Header({
  onMobileMenu,
  onOpenCmd,
  missionMode,
  onToggleMissionMode,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const now = useLocalTime();

  const localTime = formatLocalTime(now);
  const localDate = formatLocalDate(now);

  const crumb =
    CRUMBS[location.pathname] || "ASTRA";

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentUser =
    authService.getCurrentUser() || {
      username: "user",
      name: "Astra User",
      role: "user",
    };

  const userInitials =
    currentUser.username === "admin"
      ? "AD"
      : currentUser.username
        ? currentUser.username.slice(0, 2).toUpperCase()
        : "AS";

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="header" role="banner">

      {/* MOBILE MENU */}

      <button
        className="icon-btn"
        aria-label="Open menu"
        onClick={onMobileMenu}
        style={{ display: "none" }}
      >
        <Icon name="menu" size={18} />
      </button>

      {/* BREADCRUMB */}

      <div className="breadcrumb">
        <b>ASTRA</b>
        <span className="sep">/</span>
        <span>{crumb}</span>
      </div>

      {/* SEARCH */}

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

      {/* RIGHT SIDE */}

      <div className="header-right">

        {/* MISSION MODE */}

        <button
          className={`btn ghost ${
            missionMode ? "primary" : ""
          }`}
          onClick={onToggleMissionMode}
          title="Toggle Mission Mode"
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

        {/* DATA STATUS */}

        <div className="status-pill">
          <span className="status-dot" />
          <span>Data Integrity</span>
        </div>

        {/* HASH STATUS */}

        <div className="status-pill">
          <span className="status-dot" />
          <span>SHA-256 Verified</span>
        </div>

        {/* CLOCK */}

        <div
          className="header-clock"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: "80px",
          }}
        >
          <b className="mono">{localTime}</b>
          <small>{localDate}</small>
        </div>

        {/* NOTIFICATIONS */}

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
            <div
              className="notification-menu"
              style={{
                right: 0,
                width: "260px",
                padding: "14px",
              }}
            >
              <b>System Status</b>

              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                }}
              >
                ASTRA services are operational.
              </p>
            </div>
          )}
        </div>

        {/* SETTINGS */}

        <button
          className="icon-btn"
          aria-label="Settings"
          onClick={() => navigate("/settings")}
        >
          <Icon name="settings" size={17} />
        </button>

        {/* PROFILE */}

        <div style={{ position: "relative" }}>
          <div
            className="avatar"
            aria-label="User profile"
            title={currentUser.role}
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
              {/* USER INFORMATION */}

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

              {/* PROFILE ACTIONS */}

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

                {/* LOGOUT */}

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