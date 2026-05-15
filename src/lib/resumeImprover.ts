/**
 * Builds the AI prompt for resume improvement.
 * Pure function — no side effects.
 */
export function buildImprovePrompt(
  jobDescription: string,
  resumeText: string,
  missingKeywords: string[]
): string {
  const keywordList = missingKeywords.length > 0
    ? `\n\nMissing keywords to incorporate naturally (only where truly relevant):\n${missingKeywords.join(", ")}`
    : "";

  return `You are an expert resume writer and career coach. Improve the following resume to better match the job description.

## Rules
- Enhance the existing resume content — do NOT fabricate job titles, company names, dates, or education
- Naturally incorporate relevant missing keywords where they genuinely fit the candidate's experience
- Improve wording to highlight transferable skills and measurable impact
- Keep the same overall structure and sections as the original
- Use strong action verbs and quantify achievements where possible

## Job Description
${jobDescription}

## Original Resume
${resumeText}
${keywordList}

Return ONLY the improved resume text. No explanations, no markdown fences, no commentary.`;
}
