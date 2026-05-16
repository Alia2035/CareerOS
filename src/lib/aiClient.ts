import OpenAI from "openai";

export interface AIClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

export async function chat(
  messages: { role: "system" | "user"; content: string }[],
  config: AIClientConfig,
  temperature?: number,
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || DEFAULT_BASE_URL,
  });

  const response = await client.chat.completions.create({
    model: config.model || DEFAULT_MODEL,
    messages,
    temperature: temperature ?? 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}

export async function testConnection(config: AIClientConfig): Promise<boolean> {
  try {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || DEFAULT_BASE_URL,
    });
    await client.chat.completions.create({
      model: config.model || DEFAULT_MODEL,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 10,
    });
    return true;
  } catch {
    return false;
  }
}
