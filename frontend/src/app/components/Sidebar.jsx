import { NavLink } from "react-router-dom";

import Icon from "./Icon.jsx";

import { authService } from "../services/store.js";


/* =========================================================
   BASE NAVIGATION
========================================================= */

const BASE_NAV = [

  { section: "Operations" },

  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "grid",
  },

  {
    to: "/mission",
    label: "Mission Overview",
    icon: "target",
  },

  {
    to: "/alerts",
    label: "Alert Center",
    icon: "bell",
  },

  {
    to: "/timeline",
    label: "Evidence Timeline",
    icon: "clock",
  },


  { section: "Data" },

  {
    to: "/upload",
    label: "Upload Dataset",
    icon: "upload",
  },

  // NEW SHAP NAVIGATION

  {
    to: "/explainability",
    label: "SHAP Explainability",
    icon: "activity",
  },

  {
    to: "/reports",
    label: "Reports",
    icon: "file",
  },

  {
    to: "/history",
    label: "Audit Ledger",
    icon: "database",
  },


  { section: "Account" },

  {
    to: "/settings",
    label: "Settings",
    icon: "settings",
  },

  {
    to: "/help",
    label: "Help",
    icon: "help",
  },

];


/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

export default function Sidebar({
  collapsed,
  onToggle,
}) {

  const currentUser =
    authService.getCurrentUser();


  const isAdmin =
    currentUser?.role === "admin";


  const navItems = [...BASE_NAV];


  /* ADMIN NAVIGATION */

  if (isAdmin) {

    navItems.push({

      to: "/admin",
      label: "Admin Center",
      icon: "shield",

    });

  }


  return (

    <aside
      className="sidebar"
      aria-label="Primary navigation"
    >


      {/* BRAND */}

      <div
        className="sidebar-brand"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >

        <div
          className="brand-mark"
          aria-hidden="true"
        >

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            <circle
              cx="12"
              cy="12"
              r="3"
            />


            <path
              d="M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"
              opacity=".4"
            />


            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
            />

          </svg>

        </div>


        <div className="brand-text">

          <b>ASTRA</b>

          <span>
            Orbital Risk Intelligence
          </span>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="nav-scroll">

        {navItems.map((item, index) =>

          item.section ? (

            <div
              key={`section-${index}`}
              className="nav-section-title"
            >

              {item.section}

            </div>

          ) : (

            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "nav-item" +
                (isActive ? " active" : "")
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
            >

              <Icon name={item.icon} />


              <span className="nav-label">

                {item.label}

              </span>

            </NavLink>

          )

        )}

      </nav>


      {/* FOOTER */}

      <div className="sidebar-foot">

        {!collapsed && (

          <span
            className="mono"
            style={{
              color: "var(--accent-glow)",
              fontSize: "10.5px",
            }}
          >

            ASTRA · OPERATIONAL

          </span>

        )}


        <button
          className="collapse-btn"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >

          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            {collapsed ? (

              <polyline points="9 18 15 12 9 6" />

            ) : (

              <polyline points="15 18 9 12 15 6" />

            )}

          </svg>

        </button>

      </div>

    </aside>

  );

}