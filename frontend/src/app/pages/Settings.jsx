import { useEffect, useState } from "react";
import {
  themeService,
  autoRefreshService,
} from "../services/store.js";
import BriefingModal from "../components/BriefingModal.jsx";
import Icon from "../components/Icon.jsx";

/* -------------------------------------------------------
   THEME APPLICATION
------------------------------------------------------- */

function applyTheme(theme) {
  const root = document.documentElement;

  root.setAttribute(
    "data-theme",
    theme === "light" ? "light" : "dark"
  );

  /*
   * Keep the browser color scheme synchronized
   * with the selected Astra theme.
   */
  root.style.colorScheme =
    theme === "light" ? "light" : "dark";
}

/* -------------------------------------------------------
   SETTINGS
------------------------------------------------------- */

export default function Settings() {
  const [theme, setTheme] = useState(
    themeService.getTheme() || "dark"
  );

  const [autoRefresh, setAutoRefresh] = useState(
    autoRefreshService.getAutoRefresh()
  );

  const [briefingOpen, setBriefingOpen] =
    useState(false);

  const [highContrast, setHighContrast] =
    useState(false);

  const [desktopNotif, setDesktopNotif] =
    useState(true);

  /* -------------------------------------------------------
     APPLY SAVED THEME
  ------------------------------------------------------- */

  useEffect(() => {
    const savedTheme =
      themeService.getTheme() || "dark";

    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  /* -------------------------------------------------------
     THEME CHANGE
  ------------------------------------------------------- */

  const handleThemeChange = (newTheme) => {
    const selectedTheme =
      newTheme === "light" ? "light" : "dark";

    setTheme(selectedTheme);

    /*
     * Save the preference using the existing
     * project theme service.
     */
    themeService.setTheme(selectedTheme);

    /*
     * Immediately apply the HTML data-theme
     * attribute. styles.css handles all visual
     * changes from here.
     */
    applyTheme(selectedTheme);
  };

  /* -------------------------------------------------------
     AUTO REFRESH
  ------------------------------------------------------- */

  const handleAutoRefreshToggle = () => {
    const nextValue = !autoRefresh;

    setAutoRefresh(nextValue);

    autoRefreshService.setAutoRefresh(
      nextValue
    );
  };

  /* -------------------------------------------------------
     HIGH CONTRAST
  ------------------------------------------------------- */

  const handleHighContrastToggle = () => {
    const nextValue = !highContrast;

    setHighContrast(nextValue);

    document.documentElement.classList.toggle(
      "high-contrast",
      nextValue
    );
  };

  /* -------------------------------------------------------
     DESKTOP NOTIFICATIONS
  ------------------------------------------------------- */

  const handleDesktopNotifToggle = () => {
    setDesktopNotif((previous) => !previous);
  };

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-head">
        <div>
          <h1>Settings</h1>

          <p>
            Configure Astra appearance, screening
            refresh, notifications, and project
            briefing preferences.
          </p>
        </div>

        <div className="actions">
          <button
            className="btn primary"
            onClick={() =>
              setBriefingOpen(true)
            }
          >
            <Icon name="file" size={14} />
            View Project Briefing
          </button>
        </div>
      </div>

      {/* =====================================================
          SETTINGS GRID
      ===================================================== */}

      <div className="grid cols-2">

        {/* ===================================================
            THEME & APPEARANCE
        =================================================== */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>Theme & Appearance</h3>

            <span className="chip info">
              {theme.toUpperCase()} THEME
            </span>
          </div>

          {/* COLOR THEME */}

          <div className="settings-row">
            <div className="lab">
              <b
                style={{
                  fontSize: 13.5,
                  color: "var(--text)",
                }}
              >
                Color Theme
              </b>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Select the interface theme. Your
                preference is saved locally.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              {/* DARK THEME */}

              <button
                className={`btn ${
                  theme === "dark"
                    ? "primary"
                    : "ghost"
                }`}
                style={{
                  fontSize: "11px",
                  padding: "6px 12px",
                }}
                onClick={() =>
                  handleThemeChange("dark")
                }
              >
                Dark Theme
              </button>

              {/* LIGHT THEME */}

              <button
                className={`btn ${
                  theme === "light"
                    ? "primary"
                    : "ghost"
                }`}
                style={{
                  fontSize: "11px",
                  padding: "6px 12px",
                }}
                onClick={() =>
                  handleThemeChange("light")
                }
              >
                Light Theme
              </button>
            </div>
          </div>

          {/* HIGH CONTRAST */}

          <div className="settings-row">
            <div className="lab">
              <b
                style={{
                  fontSize: 13.5,
                  color: "var(--text)",
                }}
              >
                High Contrast
              </b>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Increase visual contrast for important
                risk and status information.
              </p>
            </div>

            <div
              className={`switch ${
                highContrast ? "on" : ""
              }`}
              onClick={
                handleHighContrastToggle
              }
              role="switch"
              aria-checked={highContrast}
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleHighContrastToggle();
                }
              }}
            />
          </div>
        </div>

        {/* ===================================================
            SCREENING PREFERENCES
        =================================================== */}

        <div className="card hud-card">
          <div className="card-head">
            <h3>Screening Preferences</h3>

            <span
              className={`chip ${
                autoRefresh
                  ? "success"
                  : "info"
              }`}
            >
              {autoRefresh
                ? "REFRESH ACTIVE"
                : "PAUSED"}
            </span>
          </div>

          {/* AUTO REFRESH */}

          <div className="settings-row">
            <div className="lab">
              <b
                style={{
                  fontSize: 13.5,
                  color: "var(--text)",
                }}
              >
                Auto-refresh Screening Data
              </b>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Refresh the displayed screening and
                activity information automatically.
              </p>
            </div>

            <div
              className={`switch ${
                autoRefresh ? "on" : ""
              }`}
              onClick={
                handleAutoRefreshToggle
              }
              role="switch"
              aria-checked={autoRefresh}
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleAutoRefreshToggle();
                }
              }}
            />
          </div>

          {/* DESKTOP NOTIFICATIONS */}

          <div className="settings-row">
            <div className="lab">
              <b
                style={{
                  fontSize: 13.5,
                  color: "var(--text)",
                }}
              >
                Desktop Notifications
              </b>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Receive notifications when important
                conjunction screening information
                changes.
              </p>
            </div>

            <div
              className={`switch ${
                desktopNotif ? "on" : ""
              }`}
              onClick={
                handleDesktopNotifToggle
              }
              role="switch"
              aria-checked={desktopNotif}
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  handleDesktopNotifToggle();
                }
              }}
            />
          </div>
        </div>

        {/* ===================================================
            PROJECT BRIEFING
        =================================================== */}

        <div
          className="card hud-card span-2"
          style={{
            marginTop: "10px",
          }}
        >
          <div className="card-head">
            <h3>Project Briefing</h3>

            <span className="chip info">
              ASTRA
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              gap: 20,
            }}
          >
            <div>
              <b
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                }}
              >
                View Project Summary
              </b>

              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                Review the Astra project scope, CDM
                screening workflow, CatBoost model,
                future-risk prediction, and current
                system status.
              </p>
            </div>

            <button
              className="btn primary"
              onClick={() =>
                setBriefingOpen(true)
              }
            >
              <Icon name="file" size={14} />
              Open Project Briefing
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          PROJECT BRIEFING MODAL
      ===================================================== */}

      <BriefingModal
        isOpen={briefingOpen}
        onClose={() =>
          setBriefingOpen(false)
        }
      />
    </div>
  );
}