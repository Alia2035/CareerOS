import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";

export async function POST(req: Request) {
  try {
    const { url, apiKey, baseUrl, model } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    const prompt = `You are a job posting parser. Extract structured information from this job posting URL. If you cannot access the URL, infer as much as possible from the URL structure and provide a best-effort extraction.

URL: ${url}

Return ONLY valid JSON (no markdown, no extra text) in this format:
{
  "company": "<company name or empty string>",
  "position": "<job title or empty string>",
  "location": "<location or empty string>",
  "source": "<LinkedIn/Indeed/Greenhouse/Lever/Workday/Company Website>",
  "jdText": "<job description summary or URL if can't access>",
  "salary": "<salary range if available or empty string>"
}`;

    const content = await chat(
      [
        { role: "system", content: "You are a job posting parser. Always respond with valid JSON only, no markdown." },
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
      company: result.company || "",
      position: result.position || "",
      location: result.location || "",
      source: result.source || "Link",
      jobDescription: result.jdText || "",
      salary: result.salary || "",
      jobUrl: url,
    });
  } catch (error) {
    console.error("Job URL parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse job URL. Please check your API key and try again." },
      { status: 500 },
    );
  }
}
