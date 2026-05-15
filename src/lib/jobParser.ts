export interface ParseUrlResult {
  source: string | null;
  message: string | null;
}

const SOURCE_PATTERNS: [string, string][] = [
  ["linkedin.com", "LinkedIn"],
  ["indeed.com", "Indeed"],
  ["greenhouse.io", "Greenhouse"],
  ["lever.co", "Lever"],
  ["myworkdayjobs.com", "Workday"],
  ["workday.com", "Workday"],
];

const NOT_AVAILABLE_MSG =
  "Automatic extraction is not available yet. Please paste the job description manually.";

export function parseJobUrl(url: string): ParseUrlResult {
  if (!url.trim()) return { source: null, message: null };

  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    // Not a valid URL — try simple string match
    const lower = url.toLowerCase();
    for (const [pattern, source] of SOURCE_PATTERNS) {
      if (lower.includes(pattern)) {
        return { source, message: NOT_AVAILABLE_MSG };
      }
    }
    return { source: null, message: null };
  }

  for (const [pattern, source] of SOURCE_PATTERNS) {
    if (hostname.includes(pattern)) {
      return { source, message: NOT_AVAILABLE_MSG };
    }
  }

  return { source: null, message: NOT_AVAILABLE_MSG };
}
