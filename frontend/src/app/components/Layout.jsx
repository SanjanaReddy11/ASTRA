import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import SpaceBackground from "./SpaceBackground.jsx";
import CommandPalette from "./CommandPalette.jsx";
import SatelliteDrawer from "./SatelliteDrawer.jsx";
import { themeService } from "../services/store.js";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [missionMode, setMissionMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectedSat, setSelectedSat] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const savedTheme = themeService.getTheme() || "dark";
    const selectedTheme =
      savedTheme === "light" ? "light" : "dark";

    document.documentElement.setAttribute(
      "data-theme",
      selectedTheme
    );

    document.documentElement.style.colorScheme =
      selectedTheme;
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div
      className={[
        "app-shell",
        collapsed ? "collapsed" : "",
        mobileOpen ? "mobile-open" : "",
        missionMode ? "mission-mode" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SpaceBackground />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <Header
        onMobileMenu={() =>
          setMobileOpen((value) => !value)
        }
        onOpenCmd={() => setCmdOpen(true)}
        missionMode={missionMode}
        onToggleMissionMode={() =>
          setMissionMode((value) => !value)
        }
      />

      <main className="main">
        <Outlet
          context={{
            onSelectSat: setSelectedSat,
            onOpenCmd: () => setCmdOpen(true),
          }}
        />
      </main>

      <Footer />

      <button
        className="help-fab"
        aria-label="Help"
        onClick={() => setCmdOpen(true)}
        title="Open Command Palette (⌘K)"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      </button>

      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />

      <SatelliteDrawer
        sat={selectedSat}
        onClose={() => setSelectedSat(null)}
      />
    </div>
  );
}