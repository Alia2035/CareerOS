"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { getSettings } from "@/lib/settingsStore";
import { Loader2, Sparkles, Target, AlertCircle, Lightbulb, CheckCircle2, Copy } from "lucide-react";
import type { ResumeAnalysis } from "@/types";

function ResumeAnalyzer() {
  const searchParams = useSearchParams();
  const jobs = useStore((s) => s.jobs);
  const updateJob = useStore((s) => s.updateJob);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");
  const [savedToJobId, setSavedToJobId] = useState<string | null>(null);
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [improveError, setImproveError] = useState("");
  const [copied, setCopied] = useState<"original" | "improved" | null>(null);

  // Auto-select job from URL ?jobId=
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId) {
      setSelectedJobId(jobId);
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        setJdText(job.jobDescription || "");
        setResumeText(job.resumeText || "");
      }
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setSavedToJobId(null);
    if (!jobId) {
      setJdText("");
      setResumeText("");
      return;
    }
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setJdText(job.jobDescription || "");
      setResumeText(job.resumeText || "");
    }
  };

  const handleAnalyze = async () => {
    if (!jdText.trim() || !resumeText.trim()) {
      setError("Please enter both job description and resume content.");
      return;
    }
    setError("");
    setLoading(true);
    setSavedToJobId(null);
    try {
      const settings = getSettings();
      const body: Record<string, unknown> = {
        jdText: jdText.trim(),
        resumeText: resumeText.trim(),
      };
      if (settings?.apiKey) {
        body.apiKey = settings.apiKey;
        if (settings.baseUrl) body.baseUrl = settings.baseUrl;
        if (settings.model) body.model = settings.model;
      }
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);

      // Save results back to the selected Job
      if (selectedJobId) {
        updateJob(selectedJobId, {
          atsScore: data.atsScore,
          matchedKeywords: data.matchedKeywords,
          missingKeywords: data.missingKeywords,
        });
        setSavedToJobId(selectedJobId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!result) return;
    setImproveError("");
    setImproving(true);
    setImprovedResume(null);
    try {
      const settings = getSettings();
      const body: Record<string, unknown> = {
        jobDescription: jdText.trim(),
        resumeText: resumeText.trim(),
        missingKeywords: result.missingKeywords,
      };
      if (settings?.apiKey) {
        body.apiKey = settings.apiKey;
        if (settings.baseUrl) body.baseUrl = settings.baseUrl;
        if (settings.model) body.model = settings.model;
      }
      const res = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Improvement failed");
      setImprovedResume(data.improvedResume);
    } catch (e) {
      setImproveError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setImproving(false);
    }
  };

  const handleCopy = (text: string, which: "original" | "improved") => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
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
        <p className="mt-1.5 text-xs text-gray-400">
          Selecting a job will auto-fill its JD and resume text below. You can still edit them.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* JD Input */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Job Description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          />
        </div>

        {/* Resume Input */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Your Resume
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          />
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {savedToJobId && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Results saved to job
          </p>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* ATS Score */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target size={20} className="text-primary-600" />
              <h2 className="font-semibold text-gray-900">ATS Match Score</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-primary-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">{result.atsScore}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-700"
                  style={{ width: `${result.atsScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-medium text-green-700 flex items-center gap-2 mb-3">
                <Target size={14} />
                Matched Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-medium text-red-700 flex items-center gap-2 mb-3">
                <AlertCircle size={14} />
                Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-500" />
              Optimization Suggestions
            </h3>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Generate Improved Resume */}
      {result && !improvedResume && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleImprove}
              disabled={improving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
            >
              {improving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {improving ? "Generating..." : "Generate Improved Resume"}
            </button>
            {improveError && (
              <p className="text-sm text-red-500">{improveError}</p>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            AI will enhance your resume based on the job description and missing keywords, while preserving your actual experience.
          </p>
        </div>
      )}

      {/* Comparison View */}
      {improvedResume && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Resume Comparison</h2>
            <button
              onClick={handleImprove}
              disabled={improving}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline"
            >
              {improving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Regenerate
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Original Resume</h3>
                <button
                  onClick={() => handleCopy(resumeText, "original")}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Copy size={12} />
                  {copied === "original" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                {resumeText}
              </pre>
            </div>
            {/* Improved */}
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-primary-600 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Improved Resume
                </h3>
                <button
                  onClick={() => handleCopy(improvedResume, "improved")}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Copy size={12} />
                  {copied === "improved" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                {improvedResume}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={null}>
      <ResumeAnalyzer />
    </Suspense>
  );
}
