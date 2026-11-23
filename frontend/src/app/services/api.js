// ASTRA Backend API Service

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Must match STORAGE_KEYS.AUTH in store.js
const AUTH_STORAGE_KEY = "prahari_auth_session";

/**
 * Retrieve JWT from the existing authentication session.
 */
export function getAuthToken() {
  try {
    const session = JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY)
    );

    return session?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Common API request helper.
 */
async function apiRequest(endpoint, options = {}, authenticated = false) {
  const headers = {
    ...(options.headers || {}),
  };

  if (authenticated) {
    const token = getAuthToken();

    if (!token) {
      throw new Error("You are not logged in. Please log in again.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const errorData = await response.json();
      message =
        typeof errorData.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData.detail || errorData);
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/**
 * Register a new user.
 * Backend: POST /auth/register
 */
export async function registerAccount({ fullName, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      email: email.trim().toLowerCase(),
      password,
    }),
  });
}

/**
 * Authenticate a user or admin.
 * Backend: POST /auth/login
 */
export async function loginAccount(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });
}

/**
 * Retrieve the authenticated user's details.
 * Backend: GET /auth/me
 */
export async function fetchCurrentUser() {
  return apiRequest("/auth/me", {}, true);
}

/**
 * Parses the first data row of a CSV file.
 */
export function parseFirstCsvRow(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

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
 * Predict using JSON features.
 * Backend: POST /predict/json
 */
export async function predictFromFeatures(
  features,
  { sensorId, location } = {}
) {
  return apiRequest(
    "/predict/json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensor_id: sensorId || "SENSOR-001",
        location: location || "Zone A",
        features,
      }),
    },
    true
  );
}

/**
 * Predict using CSV or XLSX upload.
 * Backend: POST /predict/tabular
 */
export async function predictFromFile(
  file,
  { sensorId, location } = {}
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(
    "/predict/tabular",
    {
      method: "POST",
      body: formData,
    },
    true
  );
}

/**
 * Backend health check.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);

    if (!response.ok) return { online: false };

    const data = await response.json();

    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}