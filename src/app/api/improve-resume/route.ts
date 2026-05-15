import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { buildImprovePrompt } from "@/lib/resumeImprover";

export async function POST(req: Request) {
  try {
    const { jobDescription, resumeText, missingKeywords, apiKey, baseUrl, model } = await req.json();

    if (!jobDescription || !resumeText) {
      return NextResponse.json(
        { error: "Missing jobDescription or resumeText" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    const prompt = buildImprovePrompt(jobDescription, resumeText, missingKeywords || []);

    const content = await chat(
      [
        { role: "system", content: "You are an expert resume writer. Always respond with the improved resume text only, no explanations." },
        { role: "user", content: prompt },
      ],
      { apiKey, baseUrl, model },
    );

    return NextResponse.json({ improvedResume: content });
  } catch (error) {
    console.error("Resume improvement error:", error);
    return NextResponse.json(
      { error: "Failed to generate improved resume. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
