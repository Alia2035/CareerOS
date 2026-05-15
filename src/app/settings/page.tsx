"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  clearSettings,
  getProviderDefaults,
  type UserSettings,
  type Language,
} from "@/lib/settingsStore";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Shield, Trash2, Download, Upload, AlertCircle } from "lucide-react";
import { downloadBackup, importBackup } from "@/lib/dataBackup";
import { useT } from "@/lib/i18n";

type Provider = "deepseek" | "openai" | "other";

const providerLabels: Record<Provider, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  other: "Other (OpenAI-compatible)",
};

export default function SettingsPage() {
  const t = useT();
  const [provider, setProvider] = useState<Provider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      setProvider(settings.provider || "deepseek");
      setApiKey(settings.apiKey || "");
      setBaseUrl(settings.baseUrl || "");
      setModel(settings.model || "");
      setLanguage(settings.language || "en");
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
      language,
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

  const handleExport = () => {
    downloadBackup();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowConfirm(true);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleConfirmImport = () => {
    if (!pendingFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importBackup(reader.result as string);
      if (result.success) {
        setImportSuccess(true);
        setImportError("");
        window.location.reload();
      } else {
        setImportError(result.error || "Import failed.");
        setImportSuccess(false);
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read file.");
    };
    reader.readAsText(pendingFile);
    setShowConfirm(false);
    setPendingFile(null);
  };

  const handleCancelImport = () => {
    setShowConfirm(false);
    setPendingFile(null);
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

      {/* Language */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t("Language")}</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("System Language")}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          >
            <option value="en">{t("English")}</option>
            <option value="zh">{t("中文")}</option>
          </select>
          {language === "en" && (
            <p className="mt-1 text-xs text-gray-400">
              Changes UI labels, date formats, and AI response language.
            </p>
          )}
          {language === "zh" && (
            <p className="mt-1 text-xs text-gray-400">
              切换界面语言、日期格式及 AI 回复语言。
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">{t("API Configuration")}</h2>

        {/* Provider */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("AI Provider")}
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
            {t("API Key")}
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
            {t("Base URL")}
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
            {t("Model Name")}
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
            {testing ? t("Testing...") : t("Test Connection")}
          </button>

          {testResult === "success" && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} />
              {t("Connection successful")}
            </span>
          )}
          {testResult === "fail" && apiKey.trim() && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <XCircle size={14} />
              {t("Connection failed — check your API key, base URL, and model.")}
            </span>
          )}

          <div className="flex-1" />

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            {t("Clear")}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            {saving || saved ? (
              <CheckCircle2 size={16} />
            ) : null}
            {saved ? t("Saved!") : t("Save")}
          </button>
        </div>
      </div>

      {/* Data Backup */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t("Data Backup")}</h2>
        <p className="text-sm text-gray-500">
          Export your data (jobs, resumes, analyses, AI-generated content) as a JSON file.
          Use this to back up your data or move it to another device.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            {t("Export Data")}
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload size={16} />
            {t("Import Data")}
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {importError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} />
            {importError}
          </div>
        )}
        {importSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={14} />
            Data imported successfully. Refreshing...
          </div>
        )}
      </div>

      {/* Import Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Confirm Import</h3>
            <p className="text-sm text-gray-600">
              Importing will overwrite your current data with the contents of the backup file. This cannot be undone. Continue?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelImport}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
