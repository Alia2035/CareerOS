"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Job, JobStatus } from "@/types";
import type { CV } from "@/types/cv";
import { parseJobUrl } from "@/lib/jobParser";
import { getCVs } from "@/lib/storage";
import CVLibraryModal from "./CVLibraryModal";
import { X, Scan, FileText } from "lucide-react";

interface Props {
  job?: Job;
  onClose: () => void;
}

const statuses: JobStatus[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export default function JobForm({ job, onClose }: Props) {
  const addJob = useStore((s) => s.addJob);
  const updateJob = useStore((s) => s.updateJob);

  const [form, setForm] = useState({
    company: job?.company || "",
    position: job?.position || "",
    location: job?.location || "",
    status: job?.status || ("Saved" as JobStatus),
    appliedDate: job?.appliedDate || "",
    notes: job?.notes || "",
    jobUrl: job?.jobUrl || "",
    jobDescription: job?.jobDescription || "",
    salary: job?.salary || "",
    source: job?.source || "",
    followUpDate: job?.followUpDate || "",
    deadlineDate: job?.deadlineDate || "",
    resumeText: job?.resumeText || "",
    resumeFileName: job?.resumeFileName || "",
    atsScore: job?.atsScore ?? null,
    matchedKeywords: job?.matchedKeywords || [],
    missingKeywords: job?.missingKeywords || [],
  });

  const [parseMessage, setParseMessage] = useState<string | null>(null);

  const [cvList, setCVList] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState("");
  const [showCVLibrary, setShowCVLibrary] = useState(false);

  useEffect(() => {
    setCVList(getCVs());
  }, []);

  const refreshCVs = () => setCVList(getCVs());

  const handleCVSelect = (cvId: string) => {
    setSelectedCVId(cvId);
    if (!cvId) return;
    const cv = cvList.find((c) => c.id === cvId);
    if (cv) {
      setForm((f) => ({ ...f, resumeFileName: cv.name, resumeText: cv.content }));
    }
  };

  const handleParseUrl = () => {
    if (!form.jobUrl.trim()) return;
    const result = parseJobUrl(form.jobUrl);
    if (result.source) {
      setForm((f) => ({ ...f, source: result.source! }));
    }
    setParseMessage(result.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (job) {
      updateJob(job.id, form);
    } else {
      addJob(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {job ? "Edit Job" : "Add Job"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                required
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                placeholder="LinkedIn, Indeed, Referral..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as JobStatus }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
              <input
                type="date"
                value={form.appliedDate}
                onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Date</label>
              <input
                type="date"
                value={form.deadlineDate}
                onChange={(e) => setForm((f) => ({ ...f, deadlineDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              placeholder="e.g. $150K - $200K"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
            <div className="flex gap-2">
              <input
                value={form.jobUrl}
                onChange={(e) => setForm((f) => ({ ...f, jobUrl: e.target.value }))}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
              <button
                type="button"
                onClick={handleParseUrl}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded-lg transition-colors shrink-0"
              >
                <Scan size={14} />
                Parse URL
              </button>
            </div>
            {parseMessage && (
              <p className="mt-1.5 text-xs text-gray-400">{parseMessage}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea
              value={form.jobDescription}
              onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
              placeholder="Paste the job description here..."
              className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>

          {/* Resume Section */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-500 mb-3">Resume</p>

            {/* CV Selector */}
            <div className="flex items-end gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select saved CV</label>
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
              <button
                type="button"
                onClick={() => setShowCVLibrary(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded-lg transition-colors shrink-0"
              >
                <FileText size={14} />
                Manage CVs
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume File Name</label>
              <input
                value={form.resumeFileName}
                onChange={(e) => setForm((f) => ({ ...f, resumeFileName: e.target.value }))}
                placeholder="e.g. my-resume-2026.pdf (file upload coming soon)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text</label>
              <textarea
                value={form.resumeText}
                onChange={(e) => setForm((f) => ({ ...f, resumeText: e.target.value }))}
                placeholder="Paste your resume content here..."
                className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any notes..."
              className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              {job ? "Save Changes" : "Add Job"}
            </button>
          </div>
        </form>
      </div>

      {showCVLibrary && (
        <CVLibraryModal
          onClose={() => {
            setShowCVLibrary(false);
            refreshCVs();
          }}
        />
      )}
    </div>
  );
}
