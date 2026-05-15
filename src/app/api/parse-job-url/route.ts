import { NextResponse } from "next/server";
import { chat } from "@/lib/aiClient";
import { langInstruction, type Language } from "@/lib/i18n";

const PROXIES = [
  { name: "markdown.new", buildUrl: (url: string) => `https://markdown.new/${url}` },
  { name: "defuddle.md", buildUrl: (url: string) => `https://defuddle.md/${url}` },
  { name: "r.jina.ai", buildUrl: (url: string) => `https://r.jina.ai/${url}` },
];

async function fetchPageViaProxy(originalUrl: string): Promise<string | null> {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy.buildUrl(originalUrl);
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "CareerOS/1.0" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.trim().length > 50) {
        return text;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function tryExtractFromMarkdown(raw: string): {
  company: string;
  position: string;
  location: string;
  source: string;
  jdText: string;
  salary: string;
} {
  // Truncate to avoid exceeding model context windows
  const truncated = raw.slice(0, 12_000);
  return {
    company: "",
    position: "",
    location: "",
    source: "",
    jdText: truncated,
    salary: "",
  };
}

async function aiExtract(
  rawContent: string,
  url: string,
  apiKey: string,
  baseUrl?: string,
  model?: string,
  language?: Language,
): Promise<{
  company: string;
  position: string;
  location: string;
  source: string;
  jdText: string;
  salary: string;
} | null> {
  const truncated = rawContent.slice(0, 10_000);

  const systemPrompt = `You are a job posting parser. Extract structured information from the provided markdown/HTML content of a job posting page. Always respond with valid JSON only, no markdown. ${langInstruction(language)}`;

  const userPrompt = `Extract the following fields from this job posting content. If a field cannot be found, return an empty string for it.

## Fields to extract:
- **company**: The company name
- **position**: The job title
- **location**: Work location (city, remote, etc.)
- **source**: The job board or platform name (LinkedIn, Indeed, Greenhouse, Lever, Workday, Company Website, etc.)
- **jdText**: The full job description text (include all sections: responsibilities, requirements, qualifications, benefits, etc.)
- **salary**: Salary range if mentioned, otherwise empty

## Job Posting URL:
${url}

## Page Content:
${truncated}

Return ONLY valid JSON (no markdown, no extra text):
{
  "company": "<string>",
  "position": "<string>",
  "location": "<string>",
  "source": "<LinkedIn/Indeed/Greenhouse/Lever/Workday/Company Website>",
  "jdText": "<full job description>",
  "salary": "<string or empty>"
}`;

  try {
    const content = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
    return {
      company: result.company || "",
      position: result.position || "",
      location: result.location || "",
      source: result.source || "",
      jdText: result.jdText || "",
      salary: result.salary || "",
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { url, apiKey, baseUrl, model, language } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please add your API key in Settings first." },
        { status: 400 },
      );
    }

    // Step 1: Fetch page content via proxy chain
    const rawContent = await fetchPageViaProxy(url);

    if (!rawContent) {
      return NextResponse.json({
        company: "",
        position: "",
        location: "",
        source: tryGuessSource(url),
        jobDescription: "",
        salary: "",
        jobUrl: url,
        extracted: false,
        error: "Could not fetch job posting. The page may require login or block automated access. Please paste the job description manually.",
      });
    }

    // Step 2: Extract fields via AI
    const extracted = await aiExtract(rawContent, url, apiKey, baseUrl, model, language);

    if (!extracted || (!extracted.company && !extracted.position && !extracted.jdText)) {
      return NextResponse.json({
        company: "",
        position: "",
        location: "",
        source: tryGuessSource(url),
        jobDescription: tryExtractFromMarkdown(rawContent).jdText,
        salary: "",
        jobUrl: url,
        extracted: false,
        error: "Automatic extraction failed. The page content was fetched but key fields could not be identified. Please paste job details manually.",
      });
    }

    if (!extracted.source) {
      extracted.source = tryGuessSource(url);
    }

    return NextResponse.json({
      ...extracted,
      jobUrl: url,
      extracted: true,
    });
  } catch (error) {
    console.error("Job URL parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse job URL. Please try again later." },
      { status: 500 },
    );
  }
}

function tryGuessSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("indeed")) return "Indeed";
    if (hostname.includes("greenhouse")) return "Greenhouse";
    if (hostname.includes("lever.co")) return "Lever";
    if (hostname.includes("workday") || hostname.includes("myworkdayjobs")) return "Workday";
    return "Company Website";
  } catch {
    return "Link";
  }
}
