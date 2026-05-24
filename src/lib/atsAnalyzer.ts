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

export interface MatchOutput {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchExplanations: Record<string, string>;
}

import { matchKeywords, normalizeKeyword } from "@/lib/keywordMatcher";

/**
 * Deterministic matching between AI-extracted structured data.
 * Uses synonym expansion, fuzzy matching, and Chinese substring
 * matching for intelligent keyword comparison.
 */
export function computeMatch(jd: JDExtraction, resume: ResumeExtraction): MatchOutput {
  const jdAll = [
    ...jd.skills,
    ...jd.tools,
    ...jd.requirements,
  ];
  const resumeAll = [
    ...resume.skills,
    ...resume.tools,
    ...resume.experience,
  ];

  const result = matchKeywords(jdAll, resumeAll);

  return {
    atsScore: result.atsScore,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    matchExplanations: result.matchExplanations,
  };
}
