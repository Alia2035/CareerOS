"use client";

import { useState, useEffect } from "react";
import type { CV } from "@/types/cv";
import { getCVs } from "@/lib/storage";
import { getAIConfig, getLanguage } from "@/lib/settingsStore";
import { generateJobSearchPlan, type JobFinderResult } from "@/lib/jobFinder";
import { X, Search, Loader2, AlertCircle, Copy, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onClose: () => void;
}

const TIME_RANGES = [
  { label: "Last 24 hours", value: "Last 24 hours" },
  { label: "Last 7 days", value: "Last 7 days" },
  { label: "Last 30 days", value: "Last 30 days" },
  { label: "Still open", value: "Still open" },
];

export default function JobFinderModal({ onClose }: Props) {
  const [cvList, setCVList] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [keywords, setKeywords] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobFinderResult | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    platforms: true,
    jobTitles: true,
    booleanQueries: true,
    prioritize: true,
    avoid: false,
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setCVList(getCVs());
  }, []);

  const handleCVSelect = (cvId: string) => {
    setSelectedCVId(cvId);
    if (!cvId) return;
    const cv = cvList.find((c) => c.id === cvId);
    if (cv) {
      setResumeText(cv.content);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyQuery = async (query: string, index: number) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleCopyAllQueries = async () => {
    if (!result) return;
    const all = result.booleanQueries.join("\n");
    try {
      await navigator.clipboard.writeText(all);
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setResult(null);

    const config = getAIConfig();
    if (!config) {
      setError("Please add your API key in Settings first.");
      return;
    }

    if (!resumeText.trim() && !targetRole.trim()) {
      setError("Please provide at least a resume or a target role.");
      return;
    }

    setGenerating(true);
    try {
      const plan = await generateJobSearchPlan(
        {
          resumeText: resumeText.trim(),
          targetRole: targetRole.trim(),
          location: location.trim(),
          timeRange,
          keywords: keywords.trim(),
        },
        config,
        getLanguage(),
      );
      setResult(plan);
    } catch {
      setError("Failed to generate job search plan. Please check your API key and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const SectionHeader = ({
    title,
    sectionKey,
    count,
  }: {
    title: string;
    sectionKey: string;
    count?: number;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full text-left py-2"
    >
      <span className="text-sm font-medium text-gray-700">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 text-xs text-gray-400">({count})</span>
        )}
      </span>
      {expandedSections[sectionKey] ? (
        <ChevronUp size={16} className="text-gray-400" />
      ) : (
        <ChevronDown size={16} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search size={18} className="text-primary-500" />
            Find Jobs with AI
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* CV Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Saved CV
            </label>
            <select
              value={selectedCVId}
              onChange={(e) => handleCVSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            >
              <option value="">— None —</option>
              {cvList.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resume Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or Paste Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (e.target.value && selectedCVId) setSelectedCVId("");
              }}
              placeholder="Paste your resume content here..."
              className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Role
              </label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Product Manager"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, San Francisco"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              >
                {TIME_RANGES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type / Keywords
              </label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Full-time, Python, Senior"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {generating ? "Generating..." : "Generate Job Search Plan"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 border-t border-gray-100 pt-5 space-y-3">
            {/* Matching Rationale */}
            {result.matchingRationale && (
              <div className="bg-primary-50 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-primary-800 mb-1">Matching Rationale</p>
                <p className="text-sm text-primary-700">{result.matchingRationale}</p>
              </div>
            )}

            {/* Boolean Queries */}
            {result.booleanQueries.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                <SectionHeader
                  title="Boolean Search Queries"
                  sectionKey="booleanQueries"
                  count={result.booleanQueries.length}
                />
                {expandedSections.booleanQueries && (
                  <div className="px-4 pb-3 space-y-2">
                    {result.booleanQueries.map((query, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <code className="flex-1 text-xs text-gray-700 break-all">{query}</code>
                        <button
                          onClick={() => handleCopyQuery(query, i)}
                          className="shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                          title="Copy query"
                        >
                          {copiedIndex === i ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleCopyAllQueries}
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {copiedIndex === -1 ? (
                        <CheckCircle2 size={12} className="text-green-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copiedIndex === -1 ? "Copied!" : "Copy All Queries"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Platforms */}
            {result.platforms.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                <SectionHeader
                  title="Suggested Platforms"
                  sectionKey="platforms"
                  count={result.platforms.length}
                />
                {expandedSections.platforms && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {result.platforms.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Job Titles */}
            {result.jobTitles.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                <SectionHeader
                  title="Recommended Job Titles"
                  sectionKey="jobTitles"
                  count={result.jobTitles.length}
                />
                {expandedSections.jobTitles && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {result.jobTitles.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* What to Prioritize */}
            {result.prioritize.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                <SectionHeader
                  title="What to Prioritize"
                  sectionKey="prioritize"
                  count={result.prioritize.length}
                />
                {expandedSections.prioritize && (
                  <ul className="px-4 pb-3 space-y-1.5">
                    {result.prioritize.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* What to Avoid */}
            {result.avoid.length > 0 && (
              <div className="border border-gray-100 rounded-lg">
                <SectionHeader
                  title="What to Avoid"
                  sectionKey="avoid"
                  count={result.avoid.length}
                />
                {expandedSections.avoid && (
                  <ul className="px-4 pb-3 space-y-1.5">
                    {result.avoid.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
