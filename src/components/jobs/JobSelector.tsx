"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import type { Job } from "@/types";
import { Search, X, ChevronDown } from "lucide-react";

interface Props {
  jobs: Job[];
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  /** Optional: custom card rendered below the input when a job is selected */
  renderSelectedJob?: (job: Job, onClear: () => void) => ReactNode;
}

function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-sm px-0.5">{part}</mark>
      : part,
  );
}

export default function JobSelector({
  jobs,
  selectedJobId,
  onSelect,
  onClear,
  placeholder = "Search jobs...",
  label = "Select a Job",
  hint,
  renderSelectedJob,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const filtered = useMemo(() => {
    if (!query.trim()) return jobs;
    const q = query.toLowerCase();
    return jobs.filter(
      (j) =>
        j.position.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q),
    );
  }, [jobs, query]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filtered.length]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (jobId: string) => {
    onSelect(jobId);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered.length > 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex].id);
        }
        break;
      case "Escape":
        setOpen(false);
        setQuery("");
        setActiveIndex(0);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}

      {/* Input area */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedJob ? `${selectedJob.company} — ${selectedJob.position}` : placeholder}
          className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
        {(query || selectedJob) && (
          <button
            onClick={() => {
              if (selectedJob) {
                handleClear();
              } else {
                setQuery("");
                setOpen(false);
              }
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
        {!query && !selectedJob && (
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No matching jobs — you can still enter details manually
            </div>
          ) : (
            filtered.map((job, i) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelect(job.id)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-primary-50 text-primary-900"
                    : "text-gray-700 hover:bg-gray-50"
                } ${i !== filtered.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <span className="font-medium">{highlightText(job.position, query)}</span>
                <span className="text-gray-400 mx-1.5">—</span>
                <span className="text-gray-500">{highlightText(job.company, query)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected job card (optional, page-specific) */}
      {selectedJob && renderSelectedJob && (
        <div className="mt-3">{renderSelectedJob(selectedJob, handleClear)}</div>
      )}

      {hint && !selectedJob && (
        <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
