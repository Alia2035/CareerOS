import type { AIClientConfig } from "@/lib/aiClient";
import { chat } from "@/lib/aiClient";
import { langInstruction, type Language } from "@/lib/i18n";

export interface JobFinderInput {
  resumeText: string;
  targetRole: string;
  location: string;
  timeRange: string;
  keywords: string;
}

export interface JobFinderResult {
  jobTitles: string[];
  searchKeywords: string[];
  platforms: string[];
  booleanQueries: string[];
  prioritize: string[];
  avoid: string[];
  matchingRationale: string;
}

function buildSystemPrompt(language?: Language): string {
  return `You are an expert career strategist and job search consultant. Based on the user's resume and preferences, generate a comprehensive job search strategy.

${langInstruction(language)} Return ONLY valid JSON, no markdown, no extra text.`;
}

function buildUserPrompt(input: JobFinderInput): string {
  return `Generate a job search strategy based on the following information:

## Resume / CV:
${input.resumeText || "(Not provided)"}

## Target Role:
${input.targetRole || "(Not specified)"}

## Preferred Location:
${input.location || "(Not specified)"}

## Time Range for Postings:
${input.timeRange}

## Job Type / Keywords:
${input.keywords || "(Not specified)"}

## Output Format (return valid JSON only):
{
  "jobTitles": ["title1", "title2", ...],
  "searchKeywords": ["keyword1", "keyword2", ...],
  "platforms": ["platform1", "platform2", ...],
  "booleanQueries": ["query1", "query2", ...],
  "prioritize": ["tip1", "tip2", ...],
  "avoid": ["warning1", "warning2", ...],
  "matchingRationale": "Brief paragraph explaining why these recommendations match the candidate's profile"
}

## Guidelines:
- **jobTitles**: 5-8 relevant job titles the candidate should search for, including variations and seniority levels
- **searchKeywords**: 10-15 specific keywords and skills to use in job board searches
- **platforms**: 3-5 platforms best suited for this role (e.g. LinkedIn, Indeed, Wellfound, GitHub Jobs, company career pages, industry-specific boards)
- **booleanQueries**: 3-5 Boolean search strings combining title, skills, and location for efficient searching
- **prioritize**: 4-6 actionable tips on what to prioritize in the job search
- **avoid**: 3-4 warnings about common pitfalls, red flags, or time-wasters to avoid
- **matchingRationale**: A concise paragraph (2-4 sentences) summarizing why this strategy fits the candidate's profile`;
}

export function parseJobFinderResponse(raw: string): JobFinderResult | null {
  try {
    let json = raw;
    if (json.includes("```json")) {
      json = json.split("```json")[1].split("```")[0];
    } else if (json.includes("```")) {
      json = json.split("```")[1].split("```")[0];
    }
    const parsed = JSON.parse(json.trim());

    const defaults: JobFinderResult = {
      jobTitles: [],
      searchKeywords: [],
      platforms: [],
      booleanQueries: [],
      prioritize: [],
      avoid: [],
      matchingRationale: "",
    };

    return {
      jobTitles: Array.isArray(parsed.jobTitles) ? parsed.jobTitles : defaults.jobTitles,
      searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords : defaults.searchKeywords,
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : defaults.platforms,
      booleanQueries: Array.isArray(parsed.booleanQueries) ? parsed.booleanQueries : defaults.booleanQueries,
      prioritize: Array.isArray(parsed.prioritize) ? parsed.prioritize : defaults.prioritize,
      avoid: Array.isArray(parsed.avoid) ? parsed.avoid : defaults.avoid,
      matchingRationale: typeof parsed.matchingRationale === "string" ? parsed.matchingRationale : defaults.matchingRationale,
    };
  } catch {
    return null;
  }
}

export async function generateJobSearchPlan(
  input: JobFinderInput,
  config: AIClientConfig,
  language?: Language,
): Promise<JobFinderResult> {
  const content = await chat(
    [
      { role: "system", content: buildSystemPrompt(language) },
      { role: "user", content: buildUserPrompt(input) },
    ],
    config,
  );
  const result = parseJobFinderResponse(content);
  if (!result) throw new Error("Failed to parse AI response");
  return result;
}
