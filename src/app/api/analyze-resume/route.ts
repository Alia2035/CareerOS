import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { computeMatch, type JDExtraction, type ResumeExtraction } from "@/lib/atsAnalyzer";
import { langInstruction, type Language } from "@/lib/i18n";

function hashKey(jd: string, resume: string): string {
  let hash = 5381;
  const str = jd + "|||" + resume;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}

interface CacheEntry {
  jd: JDExtraction;
  resume: ResumeExtraction;
  suggestions: string[];
}

const extractionCache = new Map<string, CacheEntry>();

function parseAIJson(content: string): Record<string, unknown> {
  let json = content;
  if (json.includes("```json")) {
    json = json.split("```json")[1].split("```")[0];
  } else if (json.includes("```")) {
    json = json.split("```")[1].split("```")[0];
  }
  return JSON.parse(json.trim());
}

export async function POST(req: Request) {
  try {
    const { jdText, resumeText, apiKey, baseUrl, model, language } = await req.json();

    if (!jdText || !resumeText) {
      return NextResponse.json(
        { error: "Missing jdText or resumeText" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    // Deterministic cache — same JD + Resume always reuses the same extraction
    const key = hashKey(jdText, resumeText);
    let cached = extractionCache.get(key);

    if (!cached) {
      const prompt = `You are an expert resume analyzer. Extract structured, canonical information from both the job description and resume below.

## Rules
- Normalize synonyms to a SINGLE canonical form (e.g. "data analysis" / "data analytics" → "data analysis"; "React.js" / "ReactJS" → "React"; "K8s" / "Kubernetes" → "Kubernetes"; "ML" / "Machine Learning" → "Machine Learning"; "CI/CD" / "CI CD" → "CI/CD")
- Be consistent — if you normalize "React.js" to "React" in JD, use "React" in Resume too
- List each skill/tool/requirement only once (deduplicate)
- Use the EXACT same canonical name across both JD and Resume sections

## Job Description
${jdText}

## Resume
${resumeText}

Return ONLY valid JSON (no markdown, no extra text):
{
  "jd": {
    "skills": ["canonical skill 1", "canonical skill 2"],
    "tools": ["canonical tool 1"],
    "requirements": ["degree requirement", "years of experience", "certification"]
  },
  "resume": {
    "skills": ["canonical skill 1"],
    "tools": ["canonical tool 1"],
    "experience": ["relevant experience keyword 1"]
  },
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2"]
}

Provide 4-6 specific, actionable suggestions in the "suggestions" array.`;

      const content = await chat(
        [
          {
            role: "system",
            content: `You are an expert resume analyzer. Always respond with valid JSON only, no markdown. Use consistent canonical names for skills and tools across both JD and Resume sections. ${langInstruction(language)}`,
          },
          { role: "user", content: prompt },
        ],
        { apiKey, baseUrl, model },
        0, // temperature=0 for maximum consistency
      );

      const result = parseAIJson(content);

      cached = {
        jd: (result.jd || { skills: [], tools: [], requirements: [] }) as JDExtraction,
        resume: (result.resume || { skills: [], tools: [], experience: [] }) as ResumeExtraction,
        suggestions: (result.suggestions || []) as string[],
      };
      extractionCache.set(key, cached);
    }

    // Deterministic matching on the structured extraction
    const match = computeMatch(cached.jd, cached.resume);

    return NextResponse.json({
      id: Math.random().toString(36).slice(2, 11),
      jobId: null,
      jdText,
      resumeText,
      atsScore: match.atsScore,
      matchedKeywords: match.matchedKeywords,
      missingKeywords: match.missingKeywords,
      suggestions: cached.suggestions,
      createdAt: new Date().toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
