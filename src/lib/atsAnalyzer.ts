/** Structured data extracted by AI from a job description. */
export interface JDExtraction {
  skills: string[];
  tools: string[];
  requirements: string[];
}

/** Structured data extracted by AI from a resume. */
export interface ResumeExtraction {
  skills: string[];
  tools: string[];
  experience: string[];
}

function norm(k: string): string {
  return k.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Deterministic matching between AI-extracted structured data.
 * Same input → same output, guaranteed.
 */
export function computeMatch(jd: JDExtraction, resume: ResumeExtraction): {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
} {
  const jdAll = [
    ...jd.skills.map(norm),
    ...jd.tools.map(norm),
    ...jd.requirements.map(norm),
  ];
  const resumeSet = new Set([
    ...resume.skills.map(norm),
    ...resume.tools.map(norm),
    ...resume.experience.map(norm),
  ]);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdAll) {
    if (resumeSet.has(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const atsScore = jdAll.length > 0
    ? Math.round((matched.length / jdAll.length) * 100)
    : 0;

  return { atsScore, matchedKeywords: matched, missingKeywords: missing };
}
