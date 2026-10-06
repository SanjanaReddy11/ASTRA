import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Icon from "./Icon.jsx";
import { authService } from "../services/store.js";

const BASE_COMMANDS = [
  {
    id: "dashboard",
    label: "Go to Mission Dashboard",
    category: "Navigation",
    path: "/dashboard",
    icon: "grid",
  },

  {
    id: "mission",
    label: "View Mission Overview",
    category: "Navigation",
    path: "/mission",
    icon: "target",
  },

  {
    id: "alerts",
    label: "Open Alert Center",
    category: "Alerts",
    path: "/alerts",
    icon: "bell",
  },

  {
    id: "upload",
    label: "Upload Conjunction Dataset",
    category: "Data Ingest",
    path: "/upload",
    icon: "upload",
  },

  {
    id: "timeline",
    label: "View Conjunction Analysis Timeline",
    category: "Timeline",
    path: "/timeline",
    icon: "clock",
  },

  {
    id: "history",
    label: "Browse Activity & Audit History",
    category: "Audit",
    path: "/history",
    icon: "database",
  },

  {
    id: "reports",
    label: "Generate & Download Conjunction Reports",
    category: "Reports",
    path: "/reports",
    icon: "file",
  },

  {
    id: "settings",
    label: "Configure Operator Preferences & Theme",
    category: "Settings",
    path: "/settings",
    icon: "settings",
  },
];

export default function CommandPalette({
  isOpen,
  onClose,
}) {
  const [query, setQuery] =
    useState("");

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const navigate = useNavigate();

  const currentUser =
    authService.getCurrentUser();

  const isAdmin =
    currentUser?.role === "admin";

  const commands = [
    ...BASE_COMMANDS,
  ];

  if (isAdmin) {
    commands.push({
      id: "admin",
      label: "Admin Monitoring Center",
      category: "Admin",
      path: "/admin",
      icon: "shield",
    });
  }

  const filtered =
    commands.filter(
      (command) =>
        command.label
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ) ||
        command.category
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelectedIndex(
          (previous) =>
            (previous + 1) %
            (filtered.length || 1)
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelectedIndex(
          (previous) =>
            (previous -
              1 +
              filtered.length) %
            (filtered.length || 1)
        );
      }

      if (
        event.key === "Enter" &&
        filtered[selectedIndex]
      ) {
        event.preventDefault();

        navigate(
          filtered[selectedIndex]
            .path
        );

        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    isOpen,
    filtered,
    selectedIndex,
    navigate,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="cmd-overlay"
      onClick={onClose}
    >
      <div
        className="cmd-box"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="cmd-input-wrap">
          <Icon
            name="search"
            size={18}
          />

          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(
                event.target.value
              );
            }}
            placeholder="Type a command, route, or dataset identifier..."
          />

          <span className="kbd">
            ESC
          </span>
        </div>

        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color:
                  "var(--text-muted)",
              }}
            >
              No matching Astra
              commands found.
            </div>
          ) : (
            filtered.map(
              (item, index) => (
                <div
                  key={item.id}
                  className={`cmd-item ${
                    index ===
                    selectedIndex
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    navigate(
                      item.path
                    );
                    onClose();
                  }}
                  onMouseEnter={() =>
                    setSelectedIndex(
                      index
                    )
                  }
                >
                  <Icon
                    name={item.icon}
                    size={16}
                  />

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div>
                      {item.label}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color:
                          "var(--text-muted)",
                      }}
                    >
                      {item.category}
                    </div>
                  </div>

                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color:
                        "var(--accent)",
                    }}
                  >
                    {item.path}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}