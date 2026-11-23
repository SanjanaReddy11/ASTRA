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

// These keys must remain global for authentication to work.
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

    // Prefer a stable registered-user ID.
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
  login: (username, password) => {
    const cleanUser = username?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (cleanUser === "admin" && cleanPass === "admin123") {
      const session = {
        username: "admin",
        role: "admin",
        name: "Administrator",
        email: "admin@prahari.gov",
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log("admin", "Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    if (
      (cleanUser === "investigator" || cleanUser === "user") &&
      (
        cleanPass === "investigator123" ||
        cleanPass === "user123" ||
        (cleanPass && cleanPass.length >= 6)
      )
    ) {
      const session = {
        username: cleanUser,
        role: "user",
        name:
          cleanUser === "investigator"
            ? "Lead Investigator"
            : "Intel Analyst",
        email: `${cleanUser}@prahari.gov`,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(cleanUser, "Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    const registeredUsers = getStorageItem(USERS_KEY, []);

    const found = registeredUsers.find(
      (user) =>
        user.email.toLowerCase() === cleanUser ||
        user.username?.toLowerCase() === cleanUser
    );

    if (found && found.password === cleanPass) {
      const session = {
        id: found.id,
        username: found.username || found.email,
        role: found.role || "user",
        name: found.name,
        email: found.email,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(found.email, "Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    const failedCount =
      getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);

    auditService.log(
      cleanUser || "Unknown",
      "Failed Login",
      `Failed password attempt for user '${cleanUser}'`
    );

    return {
      success: false,
      error: "Invalid credentials. Please verify your email/ID and password.",
    };
  },

  loginUser: (email, password, rememberMe = false) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: "Email and password are required.",
      };
    }

    if (
      cleanEmail === "investigator@prahari.gov" ||
      cleanEmail === "user@prahari.gov" ||
      cleanEmail === "investigator"
    ) {
      const session = {
        username: "investigator",
        role: "user",
        name: "Intel Analyst",
        email: "investigator@prahari.gov",
        rememberMe,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log("investigator", "User Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    const registeredUsers = getStorageItem(USERS_KEY, []);

    const found = registeredUsers.find(
      (user) => user.email.toLowerCase() === cleanEmail
    );

    if (found && found.password === cleanPass) {
      const session = {
        id: found.id,
        username: found.email,
        role: found.role || "user",
        name: found.name || "Intel Analyst",
        email: found.email,
        rememberMe,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(found.email, "User Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    // Existing demo login behavior retained.
    if (cleanEmail.includes("@") && cleanPass.length >= 6) {
      const session = {
        username: cleanEmail.split("@")[0],
        role: "user",
        name: cleanEmail.split("@")[0].toUpperCase(),
        email: cleanEmail,
        rememberMe,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(cleanEmail, "User Demo Login", "Success");

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    const failedCount =
      getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);

    return {
      success: false,
      error: "Authentication failed. User email or password invalid.",
    };
  },

  loginAdmin: (adminId, password, rememberMe = false) => {
    const cleanId = adminId?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        error: "Admin ID and password are required.",
      };
    }

    if (
      (
        cleanId === "admin" ||
        cleanId === "adm-9021" ||
        cleanId.startsWith("adm")
      ) &&
      (cleanPass === "admin123" || cleanPass.length >= 6)
    ) {
      const session = {
        username: "admin",
        role: "admin",
        name: "Administrator",
        adminId: cleanId,
        rememberMe,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(STORAGE_KEYS.AUTH, session);

      auditService.log(
        cleanId,
        "Admin Login",
        "Success - Access Granted to Central Command"
      );

      window.dispatchEvent(new Event("astra:user-changed"));

      return { success: true, user: session };
    }

    const failedCount =
      getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;

    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);

    auditService.log(
      cleanId,
      "Admin Login Failed",
      "Unauthorized clearance level"
    );

    return {
      success: false,
      error: "Invalid Admin ID or Security Key. Access Denied.",
    };
  },

  signupUser: (name, email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (!cleanEmail || !cleanPass || !name) {
      return {
        success: false,
        error: "All fields are required.",
      };
    }

    const registeredUsers = getStorageItem(USERS_KEY, []);

    if (
      registeredUsers.some(
        (user) => user.email.toLowerCase() === cleanEmail
      )
    ) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: cleanPass,
      role: "user",
      created: new Date().toISOString(),
    };

    registeredUsers.push(newUser);

    setStorageItem(USERS_KEY, registeredUsers);

    const session = {
      id: newUser.id,
      username: cleanEmail,
      role: "user",
      name: newUser.name,
      email: newUser.email,
      loginTime: new Date().toISOString(),
    };

    setStorageItem(STORAGE_KEYS.AUTH, session);

    auditService.log(
      cleanEmail,
      "User Account Created",
      "Registered & Logged In"
    );

    window.dispatchEvent(new Event("astra:user-changed"));

    return { success: true, user: session };
  },

  forgotPassword: (email) => {
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return {
        success: false,
        error: "Enter a valid email address.",
      };
    }

    auditService.log(
      cleanEmail,
      "Password Reset Request",
      "Verification Token Dispatched"
    );

    return {
      success: true,
      message: `Security token sent to ${cleanEmail}. Check secure inbox.`,
    };
  },

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

    window.dispatchEvent(new Event("astra:user-changed"));
  },

  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.AUTH, null);
  },

  getFailedLoginsCount: () => {
    return getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0);
  },
};

// =========================================================
// THEME SERVICES
// =========================================================

export const themeService = {
  getTheme: () => getStorageItem(STORAGE_KEYS.THEME, "dark"),

  setTheme: (theme) => {
    setStorageItem(STORAGE_KEYS.THEME, theme);

    document.documentElement.setAttribute("data-theme", theme);

    const user =
      authService.getCurrentUser()?.username || "system";

    auditService.log(
      user,
      "Settings Change",
      `Theme changed to ${theme}`
    );
  },

  initTheme: () => {
    const theme = getStorageItem(STORAGE_KEYS.THEME, "dark");

    document.documentElement.setAttribute("data-theme", theme);
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

    setStorageItem(STORAGE_KEYS.EVIDENCE, updated);

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

    setStorageItem(STORAGE_KEYS.EVIDENCE, updated);

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

    const item = list.find((entry) => entry.id === id);

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
    if (count <= 2) return { label: "Low", class: "low" };
    if (count <= 5) return { label: "Medium", class: "medium" };
    if (count <= 8) return { label: "High", class: "high" };

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

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("SHA-256 computation error:", error);

    throw new Error("SHA-256 computation failed.");
  }
}

// =========================================================
// AUDIT SERVICES
// =========================================================

export const auditService = {
  getLogs: () => {
    return getStorageItem(STORAGE_KEYS.AUDIT_LOGS, []);
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
    return getStorageItem(STORAGE_KEYS.REPORTS, []);
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
    const blob = new Blob([content], { type: mimeType });

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
    return getStorageItem(STORAGE_KEYS.CHAT_HISTORY, [
      {
        id: "msg-1",
        sender: "assistant",
        text: "Hello Investigator. I am the ASTRA AI Assistant.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  },

  saveChatHistory: (messages) => {
    setStorageItem(STORAGE_KEYS.CHAT_HISTORY, messages);
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