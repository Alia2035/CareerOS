const STORAGE_KEY = "career-os-storage";

interface BackupData {
  version: 1;
  exportedAt: string;
  data: {
    jobs: unknown[];
    analyses: unknown[];
    emails: unknown[];
    interviewPreps: unknown[];
    followUps: unknown[];
  };
}

export function exportBackup(): string {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // No data yet — still export a valid backup with empty collections
    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { jobs: [], analyses: [], emails: [], interviewPreps: [], followUps: [] },
    };
    return JSON.stringify(backup, null, 2);
  }

  const persisted = JSON.parse(raw);
  const state = persisted.state || {};

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      jobs: state.jobs || [],
      analyses: state.analyses || [],
      emails: state.emails || [],
      interviewPreps: state.interviewPreps || [],
      followUps: state.followUps || [],
    },
  };

  return JSON.stringify(backup, null, 2);
}

export function importBackup(jsonString: string): { success: boolean; error?: string } {
  let backup: BackupData;

  try {
    backup = JSON.parse(jsonString);
  } catch {
    return { success: false, error: "Invalid JSON format. Please check the file." };
  }

  if (!backup || typeof backup !== "object") {
    return { success: false, error: "Invalid backup file structure." };
  }

  if (!backup.version || !backup.data) {
    return { success: false, error: "Unrecognized backup format. Missing version or data field." };
  }

  const { data } = backup;

  if (!data.jobs || !Array.isArray(data.jobs)) {
    return { success: false, error: 'Missing or invalid "jobs" field in backup data.' };
  }
  if (!Array.isArray(data.analyses)) {
    return { success: false, error: 'Invalid "analyses" field.' };
  }
  if (!Array.isArray(data.emails)) {
    return { success: false, error: 'Invalid "emails" field.' };
  }
  if (!Array.isArray(data.interviewPreps)) {
    return { success: false, error: 'Invalid "interviewPreps" field.' };
  }
  if (!Array.isArray(data.followUps)) {
    return { success: false, error: 'Invalid "followUps" field.' };
  }

  // Preserve Zustand persist wrapper structure
  const raw = localStorage.getItem(STORAGE_KEY);
  const currentState = raw ? JSON.parse(raw) : {};

  const merged = {
    ...currentState,
    state: {
      ...(currentState.state || {}),
      jobs: data.jobs,
      analyses: data.analyses,
      emails: data.emails,
      interviewPreps: data.interviewPreps,
      followUps: data.followUps,
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return { success: true };
}

export function downloadBackup(): void {
  const json = exportBackup();
  const date = new Date().toISOString().split("T")[0];
  const filename = `careeros-backup-${date}.json`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
