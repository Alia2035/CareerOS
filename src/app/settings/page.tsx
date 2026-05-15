"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  clearSettings,
  getProviderDefaults,
  type UserSettings,
} from "@/lib/settingsStore";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Shield, Trash2 } from "lucide-react";

type Provider = "deepseek" | "openai" | "other";

const providerLabels: Record<Provider, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  other: "Other (OpenAI-compatible)",
};

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      setProvider(settings.provider || "deepseek");
      setApiKey(settings.apiKey || "");
      setBaseUrl(settings.baseUrl || "");
      setModel(settings.model || "");
    } else {
      // Set defaults for initial provider
      const defaults = getProviderDefaults("deepseek");
      setBaseUrl(defaults.baseUrl);
      setModel(defaults.model);
    }
  }, []);

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    const defaults = getProviderDefaults(p);
    setBaseUrl(defaults.baseUrl);
    setModel(defaults.model);
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    if (!apiKey.trim()) {
      setTestResult("fail");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          baseUrl: baseUrl.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });
      const data = await res.json();
      setTestResult(data.ok ? "success" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const settings: UserSettings = {
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim(),
    };
    saveSettings(settings);
    setSaving(true);
    setSaved(true);
    setTimeout(() => {
      setSaving(false);
      setTimeout(() => setSaved(false), 1500);
    }, 300);
  };

  const handleClear = () => {
    clearSettings();
    setApiKey("");
    setBaseUrl("");
    setModel("");
    setTestResult(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Security Notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Shield size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Your API key is stored locally in your browser.</p>
          <p className="text-xs text-blue-600 mt-1">
            Do not use this on shared or public computers. Your key is never uploaded to any server except the AI provider you choose.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">API Configuration</h2>

        {/* Provider */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as Provider)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          >
            {(Object.keys(providerLabels) as Provider[]).map((p) => (
              <option key={p} value={p}>
                {providerLabels[p]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            DeepSeek and OpenAI use their respective default endpoints. Choose &quot;Other&quot; for custom OpenAI-compatible providers.
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Base URL
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 font-mono"
          />
          <p className="mt-1 text-xs text-gray-400">
            Auto-filled based on provider. Edit if using a proxy or custom endpoint.
          </p>
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Model Name
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="deepseek-chat"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 font-mono"
          />
          <p className="mt-1 text-xs text-gray-400">
            Auto-filled based on provider. You can change to any model your provider supports (e.g., gpt-4o, deepseek-reasoner).
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing || !apiKey.trim()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {testing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : testResult === "success" ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : testResult === "fail" ? (
              <XCircle size={16} className="text-red-500" />
            ) : null}
            {testing ? "Testing..." : "Test Connection"}
          </button>

          {testResult === "success" && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} />
              Connection successful
            </span>
          )}
          {testResult === "fail" && apiKey.trim() && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <XCircle size={14} />
              Connection failed — check your API key, base URL, and model.
            </span>
          )}

          <div className="flex-1" />

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Clear
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            {saving || saved ? (
              <CheckCircle2 size={16} />
            ) : null}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
