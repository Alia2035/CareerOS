"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { hasApiKey, getSettings } from "@/lib/settingsStore";
import type { FollowUpType } from "@/lib/outreachGenerator";
import { Loader2, Copy, Check, Sparkles, Mail, Briefcase, MapPin, X, RefreshCw, AlertCircle } from "lucide-react";

type EmailType = "cold-email" | "connect-message" | "follow-up";

const emailTypeLabels: Record<EmailType, string> = {
  "cold-email": "Cold Email",
  "connect-message": "Connect Message",
  "follow-up": "Follow-up Email",
};

const followUpTypeLabels: Record<FollowUpType, string> = {
  "no-response": "No Response — polite check-in after no reply",
  "after-interview": "After Interview — thank you & reaffirm fit",
  "still-interested": "Still Interested — brief check on timeline",
};

const regenerateHints = [
  "Use a slightly different opening approach this time.",
  "Try a more concise and direct style.",
  "Take a warmer, more personal tone.",
  "Lead with a different achievement or skill angle.",
];

export default function OutreachPage() {
  const jobs = useStore((s) => s.jobs);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("cold-email");
  const [followUpType, setFollowUpType] = useState<FollowUpType>("no-response");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const apiKeyAvailable = hasApiKey();

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setResult(null);
    setError("");
    setRegenerateCount(0);
    if (!jobId) {
      setCompany("");
      setPosition("");
      setJobDescription("");
      setResumeText("");
      return;
    }
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setCompany(job.company);
      setPosition(job.position);
      setJobDescription(job.jobDescription || "");
      setResumeText(job.resumeText || "");
    }
  };

  const handleClearJob = () => {
    setSelectedJobId("");
    setCompany("");
    setPosition("");
    setJobDescription("");
    setResumeText("");
    setResult(null);
    setRegenerateCount(0);
  };

  const doGenerate = async (isRegenerate: boolean) => {
    setError("");
    if (!company.trim() || !position.trim()) {
      setError("Please enter both company and position.");
      return;
    }

    setLoading(true);
    try {
      const settings = getSettings();
      const body: Record<string, unknown> = {
        company: company.trim(),
        position: position.trim(),
        type: emailType,
      };

      // Attach job context when a job is selected
      if (selectedJob) {
        body.jobDescription = selectedJob.jobDescription || "";
        body.resumeText = selectedJob.resumeText || "";
        body.matchedKeywords = selectedJob.matchedKeywords || [];
        body.missingKeywords = selectedJob.missingKeywords || [];
      }

      if (emailType === "follow-up") {
        body.followUpType = followUpType;
      }

      // Regenerate variation hint
      if (isRegenerate && regenerateCount > 0) {
        body.regenerateHint = regenerateHints[(regenerateCount - 1) % regenerateHints.length];
      }

      // Pass AI config from settings if available
      if (settings?.apiKey) {
        body.apiKey = settings.apiKey;
        if (settings.baseUrl) body.baseUrl = settings.baseUrl;
        if (settings.model) body.model = settings.model;
      }

      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      if (isRegenerate) {
        setRegenerateCount((c) => c + 1);
      } else {
        setRegenerateCount(0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => doGenerate(false);
  const handleRegenerate = () => doGenerate(true);

  const handleCopy = () => {
    if (!result) return;
    const text = result.subject
      ? `Subject: ${result.subject}\n\n${result.body}`
      : result.body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* API Key Warning */}
      {!apiKeyAvailable && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Please add your API key in Settings to generate AI-powered outreach messages.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Your API key is stored locally in your browser and is not uploaded to any server.
            </p>
          </div>
        </div>
      )}

      {/* Job Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Select a Job (optional)
        </label>
        <select
          value={selectedJobId}
          onChange={(e) => handleJobSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        >
          <option value="">— Manual input —</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.company} — {job.position}
            </option>
          ))}
        </select>

        {selectedJob && (
          <div className="mt-3 flex items-start justify-between bg-primary-50 border border-primary-100 rounded-lg p-3">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <Briefcase size={14} className="text-primary-500" />
                {selectedJob.position}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={14} />
                {selectedJob.company}
              </div>
              {selectedJob.jobDescription && (
                <p className="text-xs text-gray-400 mt-1">
                  JD: {selectedJob.jobDescription.slice(0, 100)}...
                </p>
              )}
            </div>
            <button
              onClick={handleClearJob}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <p className="mt-1.5 text-xs text-gray-400">
          Selecting a job auto-fills company and position, and uses its JD/resume for personalized email generation.
        </p>
      </div>

      {/* Email Generator Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Company <span className="text-red-400">*</span>
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Position <span className="text-red-400">*</span>
            </label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Product Designer"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>
        </div>

        {/* Email Type Selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Email Type</label>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(emailTypeLabels) as EmailType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setEmailType(type);
                  setResult(null);
                  setRegenerateCount(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  emailType === type
                    ? "bg-primary-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {emailTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up Type Selector */}
        {emailType === "follow-up" && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Follow-up Scenario
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(followUpTypeLabels) as FollowUpType[]).map((ft) => (
                <button
                  key={ft}
                  onClick={() => {
                    setFollowUpType(ft);
                    setResult(null);
                    setRegenerateCount(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    followUpType === ft
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {followUpTypeLabels[ft]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {loading ? "Generating..." : "Generate Email"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={16} className="text-primary-500" />
              {emailType === "follow-up"
                ? `Follow-up — ${followUpTypeLabels[followUpType]}`
                : `Generated ${emailTypeLabels[emailType]}`}
              {regenerateCount > 0 && (
                <span className="text-xs text-gray-400 font-normal">
                  (v{regenerateCount + 1})
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Regenerate
              </button>
            </div>
          </div>
          {result.subject && (
            <p className="text-sm font-medium text-gray-800 mb-2">{result.subject}</p>
          )}
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {result.body}
          </pre>
        </div>
      )}
    </div>
  );
}
