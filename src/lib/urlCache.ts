export interface ParsedJobEntry {
  company: string;
  position: string;
  location: string;
  source: string;
  jobDescription: string;
  salary: string;
  jobUrl: string;
  cachedAt: string;
}

const CACHE_KEY = "parsed-job-cache";
const COOLDOWN_MS = 10_000;

function loadCache(): Record<string, ParsedJobEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, ParsedJobEntry>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getCachedUrl(url: string): ParsedJobEntry | null {
  const cache = loadCache();
  const entry = cache[url];
  if (!entry) return null;
  return entry;
}

export function setCachedUrl(url: string, data: Omit<ParsedJobEntry, "cachedAt">): void {
  const cache = loadCache();
  cache[url] = { ...data, cachedAt: new Date().toISOString() };

  // Limit cache to 50 entries to avoid filling localStorage
  const keys = Object.keys(cache);
  if (keys.length > 50) {
    // Remove oldest entries
    keys
      .sort((a, b) => new Date(cache[a].cachedAt).getTime() - new Date(cache[b].cachedAt).getTime())
      .slice(0, keys.length - 50)
      .forEach((k) => delete cache[k]);
  }

  saveCache(cache);
}

export function isOnCooldown(url: string): boolean {
  const entry = getCachedUrl(url);
  if (!entry) return false;
  const age = Date.now() - new Date(entry.cachedAt).getTime();
  return age < COOLDOWN_MS;
}
