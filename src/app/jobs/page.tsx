"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import type { JobStatus } from "@/types";
import { filterJobs, sortJobs, type AtsFilter, type SortBy } from "@/lib/jobFilters";
import JobCard from "@/components/jobs/JobCard";
import JobForm from "@/components/jobs/JobForm";
import JobFinderModal from "@/components/jobs/JobFinderModal";
import { Plus, Search } from "lucide-react";

const statusFilters: { label: string; value: JobStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Saved", value: "Saved" },
  { label: "Applied", value: "Applied" },
  { label: "Interview", value: "Interview" },
  { label: "Offer", value: "Offer" },
  { label: "Rejected", value: "Rejected" },
];

const atsFilters: { label: string; value: AtsFilter }[] = [
  { label: "All", value: "All" },
  { label: "Not Analyzed", value: "Not Analyzed" },
  { label: "ATS ≥ 80%", value: "ATS ≥ 80%" },
  { label: "ATS 60–79%", value: "ATS 60–79%" },
  { label: "ATS < 60%", value: "ATS < 60%" },
];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: "Default", value: "Default" },
  { label: "ATS: High → Low", value: "ATS Score: High to Low" },
  { label: "ATS: Low → High", value: "ATS Score: Low to High" },
  { label: "Deadline Date", value: "Deadline Date" },
  { label: "Applied Date", value: "Applied Date" },
];

export default function JobsPage() {
  const jobs = useStore((s) => s.jobs);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [atsFilter, setAtsFilter] = useState<AtsFilter>("All");
  const [sortBy, setSortBy] = useState<SortBy>("Default");
  const [showForm, setShowForm] = useState(false);
  const [showFinder, setShowFinder] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const filtered_ = filterJobs(jobs, statusFilter, atsFilter);
    return sortJobs(filtered_, sortBy);
  }, [jobs, statusFilter, atsFilter, sortBy]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        (["Saved", "Applied", "Interview", "Offer", "Rejected"] as JobStatus[]).map((s) => [
          s,
          jobs.filter((j) => j.status === s).length,
        ])
      ) as Record<JobStatus, number>,
    [jobs]
  );

  return (
    <div className="space-y-5">
      {/* Status filters + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
              {f.value !== "All" && (
                <span className="ml-1.5 opacity-70">{counts[f.value] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFinder(true)}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 bg-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search size={16} />
            Find Jobs with AI
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>
      </div>

      {/* ATS filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {atsFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setAtsFilter(f.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                atsFilter === f.value
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:w-auto w-full"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isExpanded={expandedJobId === job.id}
            onToggle={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400 text-sm">No jobs match the current filters.</p>
          </div>
        )}
      </div>

      {showForm && <JobForm onClose={() => setShowForm(false)} />}
      {showFinder && <JobFinderModal onClose={() => setShowFinder(false)} />}
    </div>
  );
}
