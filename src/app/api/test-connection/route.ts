import { NextResponse } from "next/server";
import { testConnection } from "@/lib/aiClient";

export async function POST(req: Request) {
  try {
    const { apiKey, baseUrl, model } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "API key is required" },
        { status: 400 },
      );
    }

    const ok = await testConnection({
      apiKey,
      baseUrl: baseUrl || undefined,
      model: model || undefined,
    });

    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
