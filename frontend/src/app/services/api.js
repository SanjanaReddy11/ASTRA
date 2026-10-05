// Astra Backend API Service
// Talks to the real FastAPI backend (main.py / predict.py) running the
// trained CatBoost conjunction-risk model.

// Set VITE_API_BASE_URL in a .env file to point at a deployed backend.
// Defaults to localhost for local dev (uvicorn main:app --reload --port 8000).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Parses the first data row of a CSV file into a { columnName: value } object,
 * coercing numeric-looking strings to numbers so it matches what the model expects.
 */
export function parseFirstCsvRow(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return null;

  const headers = lines[0].split(",").map((h) => h.trim());
  const values = lines[1].split(",").map((v) => v.trim());

  const row = {};
  headers.forEach((header, i) => {
    const raw = values[i];
    if (raw === undefined || raw === "") {
      row[header] = 0;
      return;
    }
    const asNum = Number(raw);
    row[header] = Number.isNaN(asNum) ? raw : asNum;
  });
  return row;
}

/**
 * Calls POST /predict/json on the real backend with a row of tabular features.
 * Returns the backend's response: { prediction, confidence, status, is_alert, warning? }
 * Throws on network/HTTP failure so the caller can fall back to mock behavior.
 */
export async function predictFromFeatures(features, { sensorId, location } = {}) {
  const response = await fetch(`${API_BASE_URL}/predict/json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sensor_id: sensorId || "SENSOR-001",
      location: location || "Zone A",
      features,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Backend prediction failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * Sends a raw CSV or XLSX file to POST /predict/tabular, where the backend
 * (pandas) does the parsing server-side instead of in the browser.
 * Returns the same shape as predictFromFeatures().
 */
export async function predictFromFile(file, { sensorId, location } = {}) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict/tabular`, {
    method: "POST",
    body: formData, // no Content-Type header — the browser sets the correct multipart boundary itself
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Backend prediction failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/** Quick reachability check, used to show live/offline status in the UI. */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (!response.ok) return { online: false };
    const data = await response.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}