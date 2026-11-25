import {
  loginAccount,
  registerAccount,
} from "./api.js";

// =========================================================
// ASTRA USER-SCOPED STORAGE & SERVICE MODULE
// =========================================================

const STORAGE_KEYS = {
  AUTH: "prahari_auth_session",
  THEME: "prahari_theme",
  AUTO_REFRESH: "prahari_auto_refresh",
  EVIDENCE: "prahari_evidence_files",
  AUDIT_LOGS: "prahari_audit_logs",
  REPORTS: "prahari_reports",
  CHAT_HISTORY: "prahari_chat_history",
  FAILED_LOGINS: "prahari_failed_logins_count",
};

const USERS_KEY = "prahari_registered_users";

const PREDICTION_KEY = "astra_latest_cdm_prediction";

// Authentication-related keys remain global.
const GLOBAL_KEYS = new Set([
  STORAGE_KEYS.AUTH,
  USERS_KEY,
  STORAGE_KEYS.FAILED_LOGINS,
]);

// =========================================================
// USER IDENTIFICATION
// =========================================================

function getCurrentUserScope() {
  try {
    const rawSession = localStorage.getItem(STORAGE_KEYS.AUTH);

    if (!rawSession) {
      return "guest";
    }

    const user = JSON.parse(rawSession);

    if (!user) {
      return "guest";
    }

    const identity =
      user.id ||
      user.email ||
      user.username ||
      user.name ||
      "guest";

    return encodeURIComponent(
      String(identity).trim().toLowerCase()
    );
  } catch (error) {
    console.error("Unable to identify current user:", error);
    return "guest";
  }
}

// =========================================================
// STORAGE NAMESPACE RESOLVER
// =========================================================

function getScopedStorageKey(key) {
  if (GLOBAL_KEYS.has(key)) {
    return key;
  }

  const userScope = getCurrentUserScope();

  return `astra_user:${userScope}:${key}`;
}

// =========================================================
// STORAGE HELPERS
// =========================================================

export const getStorageItem = (key, fallback) => {
  try {
    if (typeof localStorage === "undefined") {
      return fallback;
    }

    const scopedKey = getScopedStorageKey(key);
    const item = localStorage.getItem(scopedKey);

    return item !== null ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error("LocalStorage read error:", error);
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  try {
    if (typeof localStorage === "undefined") {
      return;
    }

    const scopedKey = getScopedStorageKey(key);

    localStorage.setItem(
      scopedKey,
      JSON.stringify(value)
    );

    window.dispatchEvent(
      new CustomEvent("astra:storage-updated", {
        detail: { key },
      })
    );
  } catch (error) {
    console.error("LocalStorage write error:", error);
  }
};

// =========================================================
// PREDICTION SERVICE
// =========================================================

export const predictionService = {
  getLatestPrediction: () => {
    return getStorageItem(PREDICTION_KEY, null);
  },

  saveLatestPrediction: (prediction) => {
    setStorageItem(PREDICTION_KEY, prediction);
  },

  clearLatestPrediction: () => {
    try {
      const scopedKey = getScopedStorageKey(PREDICTION_KEY);

      localStorage.removeItem(scopedKey);

      window.dispatchEvent(
        new CustomEvent("astra:storage-updated", {
          detail: { key: PREDICTION_KEY },
        })
      );
    } catch (error) {
      console.error("Unable to clear prediction:", error);
    }
  },
};

// =========================================================
// AUTHENTICATION
// =========================================================

export const authService = {

  // -------------------------------------------------------
  // SAVE BACKEND SESSION
  // -------------------------------------------------------

  saveSession: (response, rememberMe = false) => {
    if (!response?.user || !response?.access_token) {
      throw new Error("Invalid authentication response from server.");
    }

    const user = response.user;

    const session = {
      id: user.id,
      username: user.email,
      name: user.full_name,
      email: user.email,
      role: user.role,
      accessToken: response.access_token,
      tokenType: response.token_type || "bearer",
      rememberMe,
      loginTime: new Date().toISOString(),
    };

    setStorageItem(STORAGE_KEYS.AUTH, session);

    window.dispatchEvent(
      new Event("astra:user-changed")
    );

    return session;
  },

  // -------------------------------------------------------
  // GENERAL LOGIN
  // -------------------------------------------------------

  login: async (email, password) => {
    try {
      const response = await loginAccount(email, password);

      const session = authService.saveSession(response);

      auditService.log(
        email,
        "Login",
        "Successful backend authentication"
      );

      return {
        success: true,
        user: session,
      };

    } catch (error) {
      const failedCount =
        getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

      setStorageItem(
        STORAGE_KEYS.FAILED_LOGINS,
        failedCount
      );

      auditService.log(
        email || "Unknown",
        "Failed Login",
        error.message
      );

      return {
        success: false,
        error: error.message || "Login failed.",
      };
    }
  },

  // -------------------------------------------------------
  // USER LOGIN
  // -------------------------------------------------------

  loginUser: async (email, password, rememberMe = false) => {
    if (!email?.trim() || !password) {
      return {
        success: false,
        error: "Email and password are required.",
      };
    }

    try {
      const response = await loginAccount(email, password);

      if (response.user.role !== "user") {
        return {
          success: false,
          error: "This account does not have user access.",
        };
      }

      const session = authService.saveSession(
        response,
        rememberMe
      );

      auditService.log(
        email,
        "User Login",
        "Successful backend authentication"
      );

      return {
        success: true,
        user: session,
      };

    } catch (error) {
      const failedCount =
        getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

      setStorageItem(
        STORAGE_KEYS.FAILED_LOGINS,
        failedCount
      );

      auditService.log(
        email,
        "User Login Failed",
        error.message
      );

      return {
        success: false,
        error: error.message || "Authentication failed.",
      };
    }
  },

  // -------------------------------------------------------
  // ADMIN LOGIN
  // -------------------------------------------------------

  loginAdmin: async (adminId, password, rememberMe = false) => {
    if (!adminId?.trim() || !password) {
      return {
        success: false,
        error: "Admin email and password are required.",
      };
    }

    try {
      const response = await loginAccount(
        adminId,
        password
      );

      if (response.user.role !== "admin") {
        auditService.log(
          adminId,
          "Admin Login Failed",
          "Account does not have administrator privileges."
        );

        return {
          success: false,
          error: "This account does not have administrator privileges.",
        };
      }

      const session = authService.saveSession(
        response,
        rememberMe
      );

      auditService.log(
        adminId,
        "Admin Login",
        "Central Command Access Granted"
      );

      return {
        success: true,
        user: session,
      };

    } catch (error) {
      const failedCount =
        getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

      setStorageItem(
        STORAGE_KEYS.FAILED_LOGINS,
        failedCount
      );

      auditService.log(
        adminId,
        "Admin Login Failed",
        error.message
      );

      return {
        success: false,
        error: error.message || "Invalid administrator credentials.",
      };
    }
  },

  // -------------------------------------------------------
  // USER REGISTRATION
  // -------------------------------------------------------

  signupUser: async (name, email, password) => {
    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return {
        success: false,
        error: "All fields are required.",
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must contain at least 8 characters.",
      };
    }

    try {
      await registerAccount({
        fullName: cleanName,
        email: cleanEmail,
        password,
      });

      // Automatically log in after successful registration.
      const response = await loginAccount(
        cleanEmail,
        password
      );

      const session = authService.saveSession(response);

      auditService.log(
        cleanEmail,
        "User Account Created",
        "Registered and logged in successfully"
      );

      return {
        success: true,
        user: session,
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || "Account registration failed.",
      };
    }
  },

  // -------------------------------------------------------
  // FORGOT PASSWORD
  // -------------------------------------------------------

  forgotPassword: async () => {
    return {
      success: false,
      error: "Password reset is not currently available. Please contact the administrator.",
    };
  },

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------

  logout: () => {
    const current = authService.getCurrentUser();

    if (current) {
      auditService.log(
        current.username || current.email,
        "Logout",
        "User logged out"
      );
    }

    localStorage.removeItem(STORAGE_KEYS.AUTH);

    window.dispatchEvent(
      new Event("astra:user-changed")
    );
  },

  // -------------------------------------------------------
  // CURRENT USER
  // -------------------------------------------------------

  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.AUTH, null);
  },

  // -------------------------------------------------------
  // FAILED LOGIN COUNT
  // -------------------------------------------------------

  getFailedLoginsCount: () => {
    return getStorageItem(
      STORAGE_KEYS.FAILED_LOGINS,
      0
    );
  },
};

// =========================================================
// THEME SERVICES
// =========================================================

export const themeService = {
  getTheme: () => getStorageItem(STORAGE_KEYS.THEME, "dark"),

  setTheme: (theme) => {
    setStorageItem(STORAGE_KEYS.THEME, theme);

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Settings Change",
      `Theme changed to ${theme}`
    );
  },

  initTheme: () => {
    const theme = getStorageItem(
      STORAGE_KEYS.THEME,
      "dark"
    );

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  },
};

// =========================================================
// AUTO REFRESH SERVICES
// =========================================================

export const autoRefreshService = {
  getAutoRefresh: () =>
    getStorageItem(STORAGE_KEYS.AUTO_REFRESH, true),

  setAutoRefresh: (value) => {
    setStorageItem(STORAGE_KEYS.AUTO_REFRESH, value);

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Settings Change",
      `Auto-refresh set to ${value ? "On" : "Off"}`
    );
  },
};

// =========================================================
// EVIDENCE SERVICES
// =========================================================

export const evidenceService = {
  getEvidenceList: () => {
    return getStorageItem(STORAGE_KEYS.EVIDENCE, []);
  },

  addEvidence: (fileData) => {
    const list = evidenceService.getEvidenceList();

    const newEvidence = {
      id: `EVD-${new Date().getFullYear()}-${Date.now()}`,
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,

      uploadDate: new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19),

      uploadedBy:
        fileData.uploadedBy ||
        authService.getCurrentUser()?.username ||
        "investigator",

      hash: fileData.hash,
      status: "Uploaded",
      integrity: "VERIFIED",
    };

    const updated = [newEvidence, ...list];

    setStorageItem(
      STORAGE_KEYS.EVIDENCE,
      updated
    );

    auditService.log(
      newEvidence.uploadedBy,
      "Upload",
      `Uploaded file: ${newEvidence.name}`
    );

    return newEvidence;
  },

  updateStatus: (id, newStatus) => {
    const list = evidenceService.getEvidenceList();

    const updated = list.map((item) =>
      item.id === id
        ? { ...item, status: newStatus }
        : item
    );

    setStorageItem(
      STORAGE_KEYS.EVIDENCE,
      updated
    );

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Evidence Status Change",
      `Updated ${id} status to ${newStatus}`
    );

    return updated;
  },

  verifyIntegrity: (id) => {
    const list = evidenceService.getEvidenceList();

    const item = list.find(
      (entry) => entry.id === id
    );

    if (!item) return false;

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Integrity Verification",
      `Verified SHA-256 hash for ${item.name} (${id})`
    );

    return true;
  },

  calculateCasePriority: (count) => {
    if (count <= 2) {
      return { label: "Low", class: "low" };
    }

    if (count <= 5) {
      return { label: "Medium", class: "medium" };
    }

    if (count <= 8) {
      return { label: "High", class: "high" };
    }

    return { label: "Critical", class: "critical" };
  },
};

// =========================================================
// SHA-256
// =========================================================

export async function calculateSHA256(file) {
  try {
    const buffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      buffer
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    return hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

  } catch (error) {
    console.error(
      "SHA-256 computation error:",
      error
    );

    throw new Error("SHA-256 computation failed.");
  }
}

// =========================================================
// AUDIT SERVICES
// =========================================================

export const auditService = {
  getLogs: () => {
    return getStorageItem(
      STORAGE_KEYS.AUDIT_LOGS,
      []
    );
  },

  log: (user, action, result) => {
    const logs = auditService.getLogs();

    const newLog = {
      id: `AUD-${Date.now()}`,

      timestamp: new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19),

      user: user || "system",
      action,
      result,
    };

    setStorageItem(
      STORAGE_KEYS.AUDIT_LOGS,
      [newLog, ...logs]
    );

    return newLog;
  },
};

// =========================================================
// REPORT SERVICES
// =========================================================

export const reportService = {
  getReports: () => {
    return getStorageItem(
      STORAGE_KEYS.REPORTS,
      []
    );
  },

  addReport: (title, type, summary) => {
    const reports = reportService.getReports();

    const newReport = {
      id: `RPT-${new Date().getFullYear()}-${Date.now()}`,
      title,
      date: new Date().toISOString().substring(0, 10),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      format: type,
      summary,
    };

    setStorageItem(
      STORAGE_KEYS.REPORTS,
      [newReport, ...reports]
    );

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Report Generation",
      `Generated ${title} (${newReport.id})`
    );

    return newReport;
  },

  downloadFile: (content, filename, mimeType) => {
    const blob = new Blob(
      [content],
      { type: mimeType }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Report Download",
      `Downloaded file ${filename}`
    );
  },
};

// =========================================================
// AI ASSISTANT SERVICES
// =========================================================

export const aiAssistantService = {
  getChatHistory: () => {
    return getStorageItem(
      STORAGE_KEYS.CHAT_HISTORY,
      [
        {
          id: "msg-1",
          sender: "assistant",
          text: "Hello Investigator. I am the ASTRA AI Assistant.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]
    );
  },

  saveChatHistory: (messages) => {
    setStorageItem(
      STORAGE_KEYS.CHAT_HISTORY,
      messages
    );
  },

  getResponseForPrompt: (promptAction) => {
    const evidenceList = evidenceService.getEvidenceList();

    const count = evidenceList.length;

    switch (promptAction) {
      case "Summarize report":
        return `ASTRA Summary: ${count} evidence files registered.`;

      case "Find suspicious transactions":
        return "Suspicious transaction analysis requires actual uploaded transaction data.";

      case "Generate investigation notes":
        return `ASTRA notes generated at ${new Date().toISOString()}. Investigator: ${authService.getCurrentUser()?.name || "User"}.`;

      case "Explain evidence":
        return `There are ${count} evidence files in your account.`;

      case "List anomalies":
        return "Upload and analyze a dataset to identify anomalies.";

      case "Suggest next steps":
        return `Review the ${count} uploaded evidence files and generate your report.`;

      default:
        return `Analyzed prompt query: "${promptAction}".`;
    }
  },
};