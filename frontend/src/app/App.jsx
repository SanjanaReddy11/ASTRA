import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { themeService } from "./services/store.js";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MissionOverview from "./pages/MissionOverview.jsx";
import Upload from "./pages/Upload.jsx";
import Timeline from "./pages/Timeline.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";
import AdminMonitoring from "./pages/AdminMonitoring.jsx";
import Help from "./pages/Help.jsx";

/* =========================================================
   GLOBAL THEME INITIALIZATION
========================================================= */

function initializeApplicationTheme() {
  const savedTheme = themeService.getTheme() || "dark";
  const selectedTheme =
    savedTheme === "light" ? "light" : "dark";

  document.documentElement.setAttribute(
    "data-theme",
    selectedTheme
  );

  document.documentElement.style.colorScheme =
    selectedTheme;
}

/* =========================================================
   APPLICATION ROUTES
========================================================= */

function ApplicationRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* PROTECTED APPLICATION */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/mission"
          element={<MissionOverview />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/timeline"
          element={<Timeline />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminMonitoring />
            </ProtectedRoute>
          }
        />

        {/* HELP */}
        <Route
          path="/help"
          element={<Help />}
        />

        {/* LEGACY */}
        <Route
          path="/team"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}

/* =========================================================
   APPLICATION
========================================================= */

export default function App() {
  const [isClient, setIsClient] = useState(false);
  const [
    BrowserRouterComponent,
    setBrowserRouterComponent,
  ] = useState(null);

  useEffect(() => {
    initializeApplicationTheme();

    let mounted = true;

    import("react-router-dom").then((router) => {
      if (mounted) {
        setBrowserRouterComponent(
          () => router.BrowserRouter
        );
        setIsClient(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isClient || !BrowserRouterComponent) {
    return null;
  }

  return (
    <BrowserRouterComponent>
      <ApplicationRoutes />
    </BrowserRouterComponent>
  );
}