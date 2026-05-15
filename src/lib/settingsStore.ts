import type { AIClientConfig } from "@/lib/aiClient";

const SETTINGS_KEY = "career-os-settings";

type Provider = "deepseek" | "openai" | "other";

export type Language = "en" | "zh";

export interface UserSettings {
  provider: Provider;
  apiKey: string;
  baseUrl: string;
  model: string;
  language: Language;
}

const providerDefaults: Record<Provider, { baseUrl: string; model: string }> = {
  deepseek: { baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o" },
  other: { baseUrl: "", model: "" },
};

export function getProviderDefaults(provider: Provider): { baseUrl: string; model: string } {
  return { ...providerDefaults[provider] };
}

export function getSettings(): UserSettings | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSettings;
  } catch {
    return null;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}

export function hasApiKey(): boolean {
  const settings = getSettings();
  return !!(settings?.apiKey);
}

export function getAIConfig(): AIClientConfig | null {
  const settings = getSettings();
  if (!settings?.apiKey) return null;
  return {
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl || undefined,
    model: settings.model || undefined,
  };
}

export function getLanguage(): Language {
  const settings = getSettings();
  return settings?.language || "en";
}
