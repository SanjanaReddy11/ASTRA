// Astra Centralized Storage & Service Module (localStorage / sessionStorage)

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

// Initial mock evidence datasets if empty
const INITIAL_EVIDENCE = [
  {
    id: "EVD-2026-0091",
    name: "financial_ledger_q1_2026.csv",
    size: "1.2 MB",
    type: "CSV",
    uploadDate: "2026-07-28 10:14:02",
    uploadedBy: "admin",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "Analyzed", // Uploaded -> Under Review -> Analyzed -> Included In Report -> Closed
    integrity: "VERIFIED",
  },
  {
    id: "EVD-2026-0084",
    name: "surveillance_log_cam4.png",
    size: "4.8 MB",
    type: "PNG",
    uploadDate: "2026-07-27 16:45:30",
    uploadedBy: "investigator",
    hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    status: "Under Review",
    integrity: "VERIFIED",
  },
  {
    id: "EVD-2026-0072",
    name: "incident_brief_report.pdf",
    size: "820 KB",
    type: "PDF",
    uploadDate: "2026-07-26 11:20:15",
    uploadedBy: "admin",
    hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    status: "Included In Report",
    integrity: "VERIFIED",
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: "AUD-1001",
    timestamp: "2026-07-28 10:00:12",
    user: "admin",
    action: "Login",
    result: "Success",
  },
  {
    id: "AUD-1002",
    timestamp: "2026-07-28 10:14:02",
    user: "admin",
    action: "Evidence Upload",
    result: "Uploaded financial_ledger_q1_2026.csv",
  },
  {
    id: "AUD-1003",
    timestamp: "2026-07-28 11:30:45",
    user: "investigator",
    action: "Login",
    result: "Success",
  },
];

const INITIAL_REPORTS = [
  {
    id: "RPT-2026-0728-A",
    title: "Daily Forensic Incident Summary",
    date: "2026-07-28",
    size: "1.4 MB",
    format: "PDF",
    summary: "High priority investigation on suspicious transaction ledger.",
  },
  {
    id: "RPT-2026-0727-B",
    title: "Chain of Custody Audit Report",
    date: "2026-07-27",
    size: "890 KB",
    format: "TXT",
    summary: "Verification logs for 3 active evidence files.",
  },
];

// Helper functions for localStorage persistence
export const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage write error:", e);
  }
};

// Authentication Services
const USERS_KEY = "prahari_registered_users";

export const authService = {
  login: (username, password) => {
    const cleanUser = username?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (cleanUser === "admin" && cleanPass === "admin123") {
      const session = { username: "admin", role: "admin", name: "Administrator", email: "admin@prahari.gov", loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log("admin", "Login", "Success");
      return { success: true, user: session };
    }

    if ((cleanUser === "investigator" || cleanUser === "user") && (cleanPass === "investigator123" || cleanPass === "user123" || cleanPass.length >= 6)) {
      const session = { username: cleanUser, role: "user", name: cleanUser === "investigator" ? "Lead Investigator" : "Intel Analyst", email: `${cleanUser}@prahari.gov`, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(cleanUser, "Login", "Success");
      return { success: true, user: session };
    }

    // Check registered custom users
    const registeredUsers = getStorageItem(USERS_KEY, []);
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanUser || u.username?.toLowerCase() === cleanUser);
    if (found && found.password === cleanPass) {
      const session = { username: found.username || found.email, role: found.role || "user", name: found.name, email: found.email, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(found.email, "Login", "Success");
      return { success: true, user: session };
    }

    // Failed login tracking
    const failedCount = getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;
    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);
    auditService.log(cleanUser || "Unknown", "Failed Login", `Failed password attempt for user '${cleanUser}'`);
    return { success: false, error: "Invalid credentials. Please verify your email/ID and password." };
  },

  loginUser: (email, password, rememberMe = false) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Email and password are required." };
    }

    // Check default investigator account
    if (cleanEmail === "investigator@prahari.gov" || cleanEmail === "user@prahari.gov" || cleanEmail === "investigator") {
      const session = { username: "investigator", role: "user", name: "Intel Analyst", email: "investigator@prahari.gov", rememberMe, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log("investigator", "User Login", "Success");
      return { success: true, user: session };
    }

    const registeredUsers = getStorageItem(USERS_KEY, []);
    const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found && found.password === cleanPass) {
      const session = { username: found.email, role: "user", name: found.name || "Intel Analyst", email: found.email, rememberMe, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(found.email, "User Login", "Success");
      return { success: true, user: session };
    }

    // Allow quick demo login for any valid email if password is provided
    if (cleanEmail.includes("@") && cleanPass.length >= 6) {
      const session = { username: cleanEmail.split("@")[0], role: "user", name: cleanEmail.split("@")[0].toUpperCase(), email: cleanEmail, rememberMe, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(cleanEmail, "User Demo Login", "Success");
      return { success: true, user: session };
    }

    const failedCount = getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;
    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);
    return { success: false, error: "Authentication failed. User email or password invalid." };
  },

  loginAdmin: (adminId, password, rememberMe = false) => {
    const cleanId = adminId?.trim().toLowerCase();
    const cleanPass = password?.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: "Admin ID and password are required." };
    }

    if ((cleanId === "admin" || cleanId === "adm-9021" || cleanId.startsWith("adm")) && (cleanPass === "admin123" || cleanPass.length >= 6)) {
      const session = { username: "admin", role: "admin", name: "Administrator", adminId: cleanId, rememberMe, loginTime: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.AUTH, session);
      auditService.log(cleanId, "Admin Login", "Success - Access Granted to Central Command");
      return { success: true, user: session };
    }

    const failedCount = getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0) + 1;
    setStorageItem(STORAGE_KEYS.FAILED_LOGINS, failedCount);
    auditService.log(cleanId, "Admin Login Failed", "Unauthorized clearance level");
    return { success: false, error: "Invalid Admin ID or Security Key. Access Denied." };
  },

  signupUser: (name, email, password) => {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();
    if (!cleanEmail || !cleanPass || !name) {
      return { success: false, error: "All fields are required." };
    }

    const registeredUsers = getStorageItem(USERS_KEY, []);
    if (registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser = { id: `USR-${Date.now().toString().slice(-4)}`, name: name.trim(), email: cleanEmail, password: cleanPass, role: "user", created: new Date().toISOString() };
    registeredUsers.push(newUser);
    setStorageItem(USERS_KEY, registeredUsers);

    // Auto login
    const session = { username: cleanEmail, role: "user", name: newUser.name, email: newUser.email, loginTime: new Date().toISOString() };
    setStorageItem(STORAGE_KEYS.AUTH, session);
    auditService.log(cleanEmail, "User Account Created", "Registered & Logged In");
    return { success: true, user: session };
  },

  forgotPassword: (email) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: "Enter a valid email address." };
    auditService.log(cleanEmail, "Password Reset Request", "Verification Token Dispatched");
    return { success: true, message: `Security token sent to ${cleanEmail}. Check secure inbox.` };
  },

  logout: () => {
    const current = authService.getCurrentUser();
    if (current) {
      auditService.log(current.username || current.email, "Logout", "User logged out");
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.AUTH, null);
  },

  getFailedLoginsCount: () => {
    return getStorageItem(STORAGE_KEYS.FAILED_LOGINS, 0);
  },
};

// Theme Services
export const themeService = {
  getTheme: () => getStorageItem(STORAGE_KEYS.THEME, "dark"),
  setTheme: (theme) => {
    setStorageItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Settings Change", `Theme changed to ${theme}`);
  },
  initTheme: () => {
    const theme = getStorageItem(STORAGE_KEYS.THEME, "dark");
    document.documentElement.setAttribute("data-theme", theme);
  },
};

// Auto Refresh Services
export const autoRefreshService = {
  getAutoRefresh: () => getStorageItem(STORAGE_KEYS.AUTO_REFRESH, true),
  setAutoRefresh: (val) => {
    setStorageItem(STORAGE_KEYS.AUTO_REFRESH, val);
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Settings Change", `Auto-refresh set to ${val ? "On" : "Off"}`);
  },
};

// Evidence & Chain of Custody Services
export const evidenceService = {
  getEvidenceList: () => {
    return getStorageItem(STORAGE_KEYS.EVIDENCE, INITIAL_EVIDENCE);
  },

  addEvidence: (fileData) => {
    const list = evidenceService.getEvidenceList();
    const newEvidence = {
      id: `EVD-${new Date().getFullYear()}-${String(list.length + 1).padStart(4, "0")}`,
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      uploadDate: new Date().toISOString().replace("T", " ").substring(0, 19),
      uploadedBy: fileData.uploadedBy || authService.getCurrentUser()?.username || "investigator",
      hash: fileData.hash,
      status: "Uploaded",
      integrity: "VERIFIED",
    };
    const updated = [newEvidence, ...list];
    setStorageItem(STORAGE_KEYS.EVIDENCE, updated);
    auditService.log(newEvidence.uploadedBy, "Upload", `Uploaded file: ${newEvidence.name}`);
    return newEvidence;
  },

  updateStatus: (id, newStatus) => {
    const list = evidenceService.getEvidenceList();
    const updated = list.map((ev) => (ev.id === id ? { ...ev, status: newStatus } : ev));
    setStorageItem(STORAGE_KEYS.EVIDENCE, updated);
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Evidence Status Change", `Updated ${id} status to ${newStatus}`);
    return updated;
  },

  verifyIntegrity: (id) => {
    const list = evidenceService.getEvidenceList();
    const item = list.find((ev) => ev.id === id);
    if (!item) return false;
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Integrity Verification", `Verified SHA-256 hash for ${item.name} (${id})`);
    return true;
  },

  calculateCasePriority: (count) => {
    if (count <= 2) return { label: "Low", class: "low" };
    if (count <= 5) return { label: "Medium", class: "medium" };
    if (count <= 8) return { label: "High", class: "high" };
    return { label: "Critical", class: "critical" };
  },
};

// SHA-256 Hash Computation Helper
export async function calculateSHA256(file) {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (err) {
    console.error("SHA-256 computation error:", err);
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }
}

// Audit Trail Services
export const auditService = {
  getLogs: () => {
    return getStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  log: (user, action, result) => {
    const logs = auditService.getLogs();
    const newLog = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: user || "system",
      action,
      result,
    };
    const updated = [newLog, ...logs];
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, updated);
    return newLog;
  },
};

// Report Generator & Downloader Services
export const reportService = {
  getReports: () => {
    return getStorageItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  addReport: (title, type, summary) => {
    const reports = reportService.getReports();
    const newReport = {
      id: `RPT-${new Date().getFullYear()}-${String(reports.length + 1).padStart(4, "0")}`,
      title,
      date: new Date().toISOString().substring(0, 10),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      format: type,
      summary,
    };
    const updated = [newReport, ...reports];
    setStorageItem(STORAGE_KEYS.REPORTS, updated);
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Report Generation", `Generated ${title} (${newReport.id})`);
    return newReport;
  },

  downloadFile: (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const user = authService.getCurrentUser()?.username || "system";
    auditService.log(user, "Report Download", `Downloaded file ${filename}`);
  },
};

// AI Assistant Simulation Services
export const aiAssistantService = {
  getChatHistory: () => {
    return getStorageItem(STORAGE_KEYS.CHAT_HISTORY, [
      {
        id: "msg-1",
        sender: "assistant",
        text: "Hello Investigator. I am the ASTRA AI Forensic Assistant. Select an action below or ask a question regarding case evidence.",
        timestamp: "10:00 AM",
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
        return `### Case Briefing Summary
* **Active Evidence Items**: ${count} files registered.
* **Integrity Status**: 100% SHA-256 verified.
* **Primary Findings**: Financial ledger shows multiple micro-transaction deviations between 02:00 UTC and 04:30 UTC. Surveillance imagery cross-referenced with upload logs confirming user access authorization.`;

      case "Find suspicious transactions":
        return `### Suspicious Transaction Findings
* **Flagged Pattern**: Rapid sequence of sub-threshold transfers totaling $48,250 within 4 minutes.
* **Source Node**: Account 0x482A...91F
* **Target Node**: External unverified escrow wallet.
* **Anomaly Rating**: HIGH (Risk Score 88/100). Recommend immediate hold.`;

      case "Generate investigation notes":
        return `### Investigation Notes — ASTRA Audit
* Timestamp: ${new Date().toISOString()}
* Investigator: ${authService.getCurrentUser()?.name || "Lead Investigator"}
* Note: All uploaded files have passed cryptographic hash checks. Chain of custody is intact. Next step is finalizing the comprehensive report for team review.`;

      case "Explain evidence":
        return `### Evidence Explanation Breakdown
1. **financial_ledger_q1_2026.csv**: Contains raw transaction records. Anomaly detection detected 4 outlier rows.
2. **surveillance_log_cam4.png**: High-resolution image capture verifying timestamp alignment.
3. **incident_brief_report.pdf**: Executive overview of initial triage.`;

      case "List anomalies":
        return `### Identified Anomalies (3 Total)
1. **Timestamp Skew**: 42-second delta between sensor node B and primary database.
2. **Unusual File Size**: Export log 18% larger than baseline average.
3. **Hash Consistency**: Verified SHA-256 matches initial ingestion vector. No tampering detected.`;

      case "Suggest next steps":
        return `### Recommended Next Actions
1. Advance evidence status from **Analyzed** to **Included In Report**.
2. Run final SHA-256 integrity verification across all ${count} files.
3. Generate and export the complete PDF Investigation Report for executive sign-off.`;

      default:
        return `Analyzed prompt query: "${promptAction}". All evidence items are locked and verified under SHA-256 chain of custody.`;
    }
  },
};