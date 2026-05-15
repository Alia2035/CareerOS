import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { buildQuestionsPrompt, type QuestionGenerationContext } from "@/lib/interviewGenerator";

export async function POST(req: Request) {
  try {
    const {
      company,
      position,
      jobDescription,
      resumeText,
      atsScore,
      matchedKeywords,
      missingKeywords,
      apiKey,
      baseUrl,
      model,
      language,
    } = await req.json();

    if (!company || !position) {
      return NextResponse.json(
        { error: "Missing company or position" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    const ctx: QuestionGenerationContext = {
      company,
      position,
      jobDescription: jobDescription || "",
      resumeText: resumeText || "",
      atsScore: atsScore ?? null,
      matchedKeywords: matchedKeywords || [],
      missingKeywords: missingKeywords || [],
    };

    const prompt = buildQuestionsPrompt(ctx, language);
    const content = await chat(
      [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
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
      questions: result.questions || [],
    });
  } catch (error) {
    console.error("Interview question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
