import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { buildFeedbackPrompt, type FeedbackContext } from "@/lib/interviewGenerator";
import type { QuestionType } from "@/types/interview";

export async function POST(req: Request) {
  try {
    const {
      question,
      questionType,
      answer,
      company,
      position,
      jobDescription,
      apiKey,
      baseUrl,
      model,
    } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer" },
        { status: 400 },
      );
    }

    if (
      !questionType ||
      !["behavioral", "technical", "resume-based", "jd-based"].includes(questionType)
    ) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    const ctx: FeedbackContext = {
      question,
      questionType: questionType as QuestionType,
      answer,
      company: company || "",
      position: position || "",
      jobDescription: jobDescription || "",
    };

    const prompt = buildFeedbackPrompt(ctx);
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
      strengths: result.strengths || "",
      areasToImprove: result.areasToImprove || "",
      suggestedAnswer: result.suggestedAnswer || "",
      starCheck: result.starCheck ?? null,
    });
  } catch (error) {
    console.error("Interview feedback generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
