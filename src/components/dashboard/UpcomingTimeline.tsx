"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useT } from "@/lib/i18n";

type EventType = "interview" | "follow-up" | "deadline";

interface TimelineEvent {
  jobId: string;
  company: string;
  position: string;
  type: EventType;
  date: string;
  time?: string;
  overdue: boolean;
  relText: string;
}

const typeConfig: Record<EventType, { badge: string; label: string }> = {
  interview: { badge: "bg-purple-50 text-purple-700", label: "Interview" },
  "follow-up": { badge: "bg-amber-50 text-amber-700", label: "Follow-up" },
  deadline: { badge: "bg-blue-50 text-blue-700", label: "Deadline" },
};

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function describeDate(dateStr: string): { relText: string; overdue: boolean } {
  const due = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)
    return { relText: `Overdue ${Math.abs(diffDays)}d`, overdue: true };
  if (diffDays === 0) return { relText: "Today", overdue: false };
  if (diffDays === 1) return { relText: "Tomorrow", overdue: false };
  return { relText: `In ${diffDays}d`, overdue: false };
}

const MAX_VISIBLE = 5;

export default function UpcomingTimeline() {
  const jobs = useStore((s) => s.jobs);
  const updateJob = useStore((s) => s.updateJob);
  const t = useT();
  const [showAll, setShowAll] = useState(false);

  const events = useMemo(() => {
    const result: TimelineEvent[] = [];

    for (const j of jobs) {
      if (j.interviewDate && j.interviewDate.trim()) {
        const info = describeDate(j.interviewDate);
        result.push({
          jobId: j.id,
          company: j.company,
          position: j.position,
          type: "interview",
          date: j.interviewDate,
          time: j.interviewTime || undefined,
          overdue: info.overdue,
          relText: info.relText,
        });
      }
      if (j.followUpDate && j.followUpDate.trim()) {
        const info = describeDate(j.followUpDate);
        result.push({
          jobId: j.id,
          company: j.company,
          position: j.position,
          type: "follow-up",
          date: j.followUpDate,
          overdue: info.overdue,
          relText: info.relText,
        });
      }
      if (j.deadlineDate && j.deadlineDate.trim()) {
        const info = describeDate(j.deadlineDate);
        result.push({
          jobId: j.id,
          company: j.company,
          position: j.position,
          type: "deadline",
          date: j.deadlineDate,
          overdue: info.overdue,
          relText: info.relText,
        });
      }
    }

    result.sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
    );
    return result;
  }, [jobs]);

  const displayed = showAll ? events : events.slice(0, MAX_VISIBLE);
  const hiddenCount = events.length - MAX_VISIBLE;

  const handleMarkDone = (jobId: string) => {
    updateJob(jobId, { followUpDate: "" });
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={16} className="text-primary-500" />
          {t("Upcoming Timeline")}
        </h3>
        <p className="text-sm text-gray-400 mt-3">
          No upcoming events. Add interview dates, follow-ups, or deadlines to your jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-primary-500" />
        {t("Upcoming Timeline")}
      </h3>

      <div className="space-y-1">
        {displayed.map((e) => (
          <div
            key={`${e.jobId}-${e.type}`}
            className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
          >
            {/* Type badge */}
            <span
              className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${typeConfig[e.type].badge}`}
            >
              {typeConfig[e.type].label}
            </span>

            {/* Job info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 truncate">{e.position}</p>
              <p className="text-xs text-gray-500 truncate">{e.company}</p>
            </div>

            {/* Date + optional time */}
            <div className="shrink-0 text-right">
              <p className="text-xs text-gray-600">{e.date}</p>
              {e.time && (
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                  <Clock size={10} />
                  {e.time}
                </p>
              )}
            </div>

            {/* Relative label */}
            <span
              className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                e.overdue
                  ? "text-red-600 bg-red-50"
                  : "text-gray-500 bg-gray-50"
              }`}
            >
              {e.overdue && <AlertTriangle size={10} />}
              {e.relText}
            </span>

            {/* Mark done — follow-ups only */}
            {e.type === "follow-up" && (
              <button
                onClick={() => handleMarkDone(e.jobId)}
                className="shrink-0 text-gray-300 hover:text-green-500 transition-colors"
                title="Mark follow-up as done"
              >
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full text-center text-xs text-primary-600 hover:text-primary-700 py-1 font-medium"
        >
          {showAll
            ? t("Show less")
            : `View all (${hiddenCount} more)`}
        </button>
      )}
    </div>
  );
}
