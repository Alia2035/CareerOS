import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";

export async function POST(req: Request) {
  try {
    const { jdText, resumeText, apiKey, baseUrl, model } = await req.json();

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

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach. Analyze the following job description and resume. Return ONLY valid JSON (no markdown, no extra text).

Job Description:
${jdText}

Resume:
${resumeText}

Return JSON in this exact format:
{
  "atsScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

    const content = await chat(
      [
        { role: "system", content: "You are an expert ATS analyzer. Always respond with valid JSON only, no markdown. Always respond in the same language as the user's input." },
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
      atsScore: result.atsScore || 50,
      matchedKeywords: result.matchedKeywords || [],
      missingKeywords: result.missingKeywords || [],
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
