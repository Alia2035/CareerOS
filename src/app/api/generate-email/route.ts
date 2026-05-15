import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { buildOutreachPrompt, type FollowUpType } from "@/lib/outreachGenerator";

export async function POST(req: Request) {
  try {
    const {
      company,
      position,
      jobDescription,
      resumeText,
      matchedKeywords,
      missingKeywords,
      type,
      followUpType,
      regenerateHint,
      apiKey,
      baseUrl,
      model,
    } = await req.json();

    if (!company || !position) {
      return NextResponse.json(
        { error: "Missing company or position" },
        { status: 400 },
      );
    }

    if (!type || !["cold-email", "connect-message", "follow-up"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid email type" },
        { status: 400 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    const ctx = {
      company,
      position,
      jobDescription: jobDescription || "",
      resumeText: resumeText || "",
      matchedKeywords: matchedKeywords || [],
      missingKeywords: missingKeywords || [],
    };

    const prompt = buildOutreachPrompt(type, ctx, {
      followUpType: followUpType as FollowUpType | undefined,
      regenerateHint: regenerateHint || undefined,
    });

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
      subject: result.subject || "",
      body: result.body || "Failed to generate content.",
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
