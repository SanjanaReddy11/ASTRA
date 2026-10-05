import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { authService } from "../services/store.js";

const BASE_COMMANDS = [
  { id: "dashboard", label: "Go to Mission Dashboard", category: "Navigation", path: "/dashboard", icon: "grid" },
  { id: "mission", label: "View Mission Overview", category: "Navigation", path: "/mission", icon: "target" },
  { id: "predictions", label: "Launch Astra Risk Assistant", category: "AI Assistant", path: "/predictions", icon: "activity" },
  { id: "alerts", label: "Open Alert Center", category: "Alerts", path: "/alerts", icon: "bell" },
  { id: "upload", label: "Upload Conjunction Dataset", category: "Data Ingest", path: "/upload", icon: "upload" },
  { id: "analytics", label: "View System Analytics & Metrics", category: "Analytics", path: "/analytics", icon: "chart" },
  { id: "timeline", label: "View Conjunction Analysis Timeline", category: "Timeline", path: "/timeline", icon: "clock" },
  { id: "history", label: "Browse Activity & Audit History", category: "Audit", path: "/history", icon: "database" },
  { id: "reports", label: "Generate & Download Conjunction Reports", category: "Reports", path: "/reports", icon: "file" },
  { id: "settings", label: "Configure Operator Preferences & Theme", category: "Settings", path: "/settings", icon: "settings" },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const commands = [...BASE_COMMANDS];

  if (isAdmin) {
    commands.push({
      id: "admin",
      label: "Admin Monitoring Center",
      category: "Admin",
      path: "/admin",
      icon: "shield",
    });
  }

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        if (isOpen) {
          onClose();
        } else {
          onClose(true);
        }
      }

      if (isOpen) {
        if (e.key === "Escape") {
          onClose();
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev + 1) % (filtered.length || 1)
          );
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(
            (prev) =>
              (prev - 1 + filtered.length) % (filtered.length || 1)
          );
        }

        if (e.key === "Enter" && filtered[selectedIndex]) {
          e.preventDefault();
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div
        className="cmd-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cmd-input-wrap">
          <Icon name="search" size={18} />

          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, or dataset identifier..."
          />

          <span className="kbd">ESC</span>
        </div>

        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              No matching Astra commands found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`cmd-item ${
                  idx === selectedIndex ? "selected" : ""
                }`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <Icon name={item.icon} size={16} />

                <div style={{ flex: 1 }}>
                  <div>{item.label}</div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {item.category}
                  </div>
                </div>

                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                  }}
                >
                  {item.path}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}