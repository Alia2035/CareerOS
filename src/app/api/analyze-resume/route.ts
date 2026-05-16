import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { analyzeATS } from "@/lib/atsAnalyzer";
import { langInstruction, type Language } from "@/lib/i18n";

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

    // Deterministic keyword matching — same input always yields the same score
    const ats = analyzeATS(jdText, resumeText);

    // AI only provides optimization suggestions based on the deterministic results
    const prompt = `You are an expert career coach. A deterministic ATS scan has already been performed on the candidate's resume against the job description below. Do NOT recalculate or question the score — use it as given.

ATS Score: ${ats.atsScore}/100
Matched Keywords: ${ats.matchedKeywords.join(", ") || "(none)"}
Missing Keywords: ${ats.missingKeywords.join(", ") || "(none)"}

Job Description:
${jdText}

Resume:
${resumeText}

Return ONLY valid JSON (no markdown, no extra text) in this format:
{
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", ...]
}

Provide 4-6 specific, actionable suggestions for improving the resume to better match the job description. Focus on incorporating the missing keywords naturally and strengthening the presentation of existing skills.`;

    const content = await chat(
      [
        { role: "system", content: `You are an expert career coach and resume writer. Always respond with valid JSON only, no markdown. ${langInstruction(language)}` },
        { role: "user", content: prompt },
      ],
      { apiKey, baseUrl, model },
    );

    let json = content;
    if (json.includes("```json")) {
      json = json.split("```json")[1].split("```")[0];
    } else if (json.includes("```")) {
      json = json.split("```")[1].split("```")[0];
    }

    const result = JSON.parse(json.trim());

    return NextResponse.json({
      id: Math.random().toString(36).slice(2, 11),
      jobId: null,
      jdText,
      resumeText,
      atsScore: ats.atsScore,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      suggestions: result.suggestions || [],
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
