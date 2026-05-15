import type { CV } from "@/types/cv";

const isBrowser = () => typeof window !== "undefined";

export function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

// --- CV-specific helpers ---

const CVS_KEY = "career-os-cvs";

const genId = () => Math.random().toString(36).slice(2, 11);
const todayStr = () => new Date().toISOString().split("T")[0];

export function getCVs(): CV[] {
  return getItem<CV[]>(CVS_KEY) || [];
}

export function saveCV(name: string, content: string): CV {
  const cvs = getCVs();
  const now = todayStr();
  const cv: CV = { id: genId(), name, content, createdAt: now, updatedAt: now };
  setItem(CVS_KEY, [...cvs, cv]);
  return cv;
}

export function updateCV(id: string, data: Partial<Pick<CV, "name" | "content">>): void {
  const cvs = getCVs();
  setItem(
    CVS_KEY,
    cvs.map((cv) => (cv.id === id ? { ...cv, ...data, updatedAt: todayStr() } : cv))
  );
}

export function deleteCV(id: string): void {
  const cvs = getCVs();
  setItem(CVS_KEY, cvs.filter((cv) => cv.id !== id));
}
