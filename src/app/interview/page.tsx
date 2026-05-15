"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { hasApiKey, getSettings, getLanguage } from "@/lib/settingsStore";
import type { GeneratedQuestion, InterviewFeedback, QuestionType } from "@/types/interview";
import { useT } from "@/lib/i18n";
import {
  Loader2,
  Sparkles,
  MessageSquare,
  Send,
  AlertCircle,
  Briefcase,
  MapPin,
  Target,
  X,
  ChevronRight,
  Brain,
  Lightbulb,
  ListChecks,
} from "lucide-react";

const questionTypeLabel: Record<QuestionType, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  "resume-based": "Resume",
  "jd-based": "JD-based",
};

const questionTypeBadge: Record<QuestionType, string> = {
  behavioral: "bg-blue-100 text-blue-700",
  technical: "bg-purple-100 text-purple-700",
  "resume-based": "bg-green-100 text-green-700",
  "jd-based": "bg-orange-100 text-orange-700",
};

export default function InterviewPage() {
  const jobs = useStore((s) => s.jobs);
  const t = useT();

  const [selectedJobId, setSelectedJobId] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState("");

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const apiKeyAvailable = hasApiKey();

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setQuestions([]);
    setActiveIndex(null);
    setAnswer("");
    setFeedback(null);
    setError("");
  };

  const handleClearJob = () => {
    setSelectedJobId("");
    setQuestions([]);
    setActiveIndex(null);
    setAnswer("");
    setFeedback(null);
    setError("");
  };

  const handleGenerateQuestions = async () => {
    setError("");
    if (!selectedJob) {
      setError("Please select a job first.");
      return;
    }

    setLoadingQuestions(true);
    try {
      const settings = getSettings();
      const body: Record<string, unknown> = {
        company: selectedJob.company,
        position: selectedJob.position,
        jobDescription: selectedJob.jobDescription || "",
        resumeText: selectedJob.resumeText || "",
        atsScore: selectedJob.atsScore,
        matchedKeywords: selectedJob.matchedKeywords || [],
        missingKeywords: selectedJob.missingKeywords || [],
        language: getLanguage(),
      };

      if (settings?.apiKey) {
        body.apiKey = settings.apiKey;
        if (settings.baseUrl) body.baseUrl = settings.baseUrl;
        if (settings.model) body.model = settings.model;
      }

      const res = await fetch("/api/generate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setQuestions(data.questions || []);
      setActiveIndex(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectQuestion = (index: number) => {
    setActiveIndex(index);
    setAnswer("");
    setFeedback(null);
  };

  const handleGetFeedback = async () => {
    setError("");
    if (activeIndex === null || !answer.trim()) {
      setError("Please select a question and write your answer.");
      return;
    }

    setLoadingFeedback(true);
    try {
      const settings = getSettings();
      const activeQuestion = questions[activeIndex];
      const body: Record<string, unknown> = {
        question: activeQuestion.question,
        questionType: activeQuestion.type,
        answer: answer.trim(),
        company: selectedJob?.company || "",
        position: selectedJob?.position || "",
        jobDescription: selectedJob?.jobDescription || "",
        language: getLanguage(),
      };

      if (settings?.apiKey) {
        body.apiKey = settings.apiKey;
        if (settings.baseUrl) body.baseUrl = settings.baseUrl;
        if (settings.model) body.model = settings.model;
      }

      const res = await fetch("/api/generate-interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Feedback generation failed");

      setFeedback({
        strengths: data.strengths,
        areasToImprove: data.areasToImprove,
        suggestedAnswer: data.suggestedAnswer,
        starCheck: data.starCheck ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const activeQuestion = activeIndex !== null ? questions[activeIndex] : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* API Key Warning */}
      {!apiKeyAvailable && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Please add your API key in Settings to use AI-powered interview preparation.
            </p>
          </div>
        </div>
      )}

      {/* Job Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {t("Select a Job")}
        </label>
        <select
          value={selectedJobId}
          onChange={(e) => handleJobSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        >
          <option value="">— Choose a job —</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.company} — {job.position}
            </option>
          ))}
        </select>

        {selectedJob && (
          <div className="mt-3 bg-primary-50 border border-primary-100 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-primary-500 shrink-0" />
                  <span className="font-medium text-gray-900">{selectedJob.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600">{selectedJob.company}</span>
                </div>
                {selectedJob.atsScore != null && (
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600">
                      ATS Score:{" "}
                      <span
                        className={
                          selectedJob.atsScore >= 80
                            ? "text-green-600 font-medium"
                            : selectedJob.atsScore >= 60
                              ? "text-amber-600 font-medium"
                              : "text-red-600 font-medium"
                        }
                      >
                        {selectedJob.atsScore}/100
                      </span>
                    </span>
                  </div>
                )}
                {selectedJob.missingKeywords.length > 0 && (
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-gray-500">Missing Keywords:</span>
                    {selectedJob.missingKeywords.slice(0, 6).map((kw) => (
                      <span
                        key={kw}
                        className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs"
                      >
                        {kw}
                      </span>
                    ))}
                    {selectedJob.missingKeywords.length > 6 && (
                      <span className="text-xs text-gray-400">
                        +{selectedJob.missingKeywords.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleClearJob}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            {selectedJob.jobDescription && (
              <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                JD: {selectedJob.jobDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Generate Questions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateQuestions}
            disabled={loadingQuestions || !selectedJob}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {loadingQuestions ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {loadingQuestions ? t("Generating...") : t("Generate Questions")}
          </button>
          {error && !activeQuestion && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* TODO: Voice mock interview can be added in a future version. */}
        <p className="mt-2 text-xs text-gray-400">
          TODO: Voice mock interview can be added in a future version.
        </p>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary-500" />
            {t("Interview")} ({questions.length})
          </h3>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  activeIndex === i
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${questionTypeBadge[q.type]}`}
                  >
                    {t(questionTypeLabel[q.type])}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{q.question}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 mt-0.5 transition-colors ${
                      activeIndex === i ? "text-primary-500" : "text-gray-300"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mock Interview Area */}
      {activeQuestion && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Brain size={16} className="text-primary-500" />
            {t("Mock Interview")}
          </h3>

          {/* Current Question */}
          <div className="bg-gray-50 rounded-lg p-4">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${questionTypeBadge[activeQuestion.type]}`}
            >
              {t(questionTypeLabel[activeQuestion.type])}
            </span>
            <p className="text-sm font-medium text-gray-900">{activeQuestion.question}</p>
          </div>

          {/* Answer Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              {t("Your Answer")}
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Aim for 60-120 words. For behavioral questions, try using the STAR method (Situation, Task, Action, Result)."
              rows={5}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-y"
            />
          </div>

          {/* Get Feedback Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGetFeedback}
              disabled={loadingFeedback || !answer.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-60 transition-colors"
            >
              {loadingFeedback ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {loadingFeedback ? t("Analyzing...") : t("Get Feedback")}
            </button>
            {error && activeQuestion && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="space-y-4 mt-2">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lightbulb size={12} />
                  {t("Strengths")}
                </p>
                <p className="text-sm text-green-800 whitespace-pre-wrap">{feedback.strengths}</p>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ListChecks size={12} />
                  {t("Areas to Improve")}
                </p>
                <p className="text-sm text-amber-800 whitespace-pre-wrap">{feedback.areasToImprove}</p>
              </div>

              {/* Suggested Better Answer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                  {t("Suggested Better Answer")}
                </p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{feedback.suggestedAnswer}</p>
              </div>

              {/* STAR Check */}
              {feedback.starCheck && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
                    {t("STAR Structure Check")}
                  </p>
                  <p className="text-sm text-purple-800 whitespace-pre-wrap">{feedback.starCheck}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
