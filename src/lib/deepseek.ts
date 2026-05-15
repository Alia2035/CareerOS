/**
 * @deprecated Use `chat()` from "@/lib/aiClient" directly. This wrapper is kept
 * for backward compatibility only and will be removed in a future version.
 */
import { chat as aiChat, type AIClientConfig } from "@/lib/aiClient";

export async function chat(
  messages: { role: "system" | "user"; content: string }[],
  options?: { apiKey?: string; baseUrl?: string; model?: string },
): Promise<string> {
  if (!options?.apiKey) {
    throw new Error("API key is required. Please add your API key in Settings.");
  }
  const config: AIClientConfig = {
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    model: options.model,
  };
  return aiChat(messages, config);
}
