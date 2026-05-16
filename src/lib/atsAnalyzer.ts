const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "shall", "you", "your",
  "we", "our", "they", "their", "he", "she", "it", "its", "this", "that",
  "these", "those", "as", "than", "not", "no", "so", "if", "all", "each",
  "every", "any", "both", "few", "more", "most", "other", "some", "such",
  "only", "own", "same", "into", "over", "also", "very", "just", "about",
  "above", "after", "again", "against", "between", "through", "during",
  "before", "while", "who", "whom", "which", "what", "when", "where", "why",
  "how", "up", "down", "out", "off", "then", "now", "here", "there",
]);

export interface ATSAnalysis {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s#+.]/g, " ")  // preserve # (C#), + (C++), . (.NET)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract meaningful keywords from a job description.
 * Uses unigrams (excluding stop words) + bigrams for multi-word terms.
 */
function extractKeywords(text: string): string[] {
  const cleaned = cleanText(text);
  const words = cleaned.split(" ").filter((w) => w.length >= 2);
  if (words.length === 0) return [];

  const seen = new Set<string>();
  const keywords: string[] = [];

  // Bigrams (2-word phrases) — often more meaningful
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (
      !seen.has(bigram) &&
      words[i].length >= 3 &&
      words[i + 1].length >= 3 &&
      !STOP_WORDS.has(words[i]) &&
      !STOP_WORDS.has(words[i + 1])
    ) {
      seen.add(bigram);
      keywords.push(bigram);
    }
  }

  // Unigrams — single significant words
  for (const w of words) {
    if (!seen.has(w) && w.length >= 3 && !STOP_WORDS.has(w)) {
      seen.add(w);
      keywords.push(w);
    }
  }

  return keywords;
}

/**
 * Deterministic ATS analysis: extracts keywords from JD and checks
 * each against the resume text. Returns a stable score.
 */
export function analyzeATS(jdText: string, resumeText: string): ATSAnalysis {
  const keywords = extractKeywords(jdText);
  const resumeLower = cleanText(resumeText);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (resumeLower.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const atsScore = keywords.length > 0
    ? Math.round((matched.length / keywords.length) * 100)
    : 0;

  return { atsScore, matchedKeywords: matched, missingKeywords: missing };
}
