"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AlertTriangle, Check } from "lucide-react";
import { useT } from "@/lib/i18n";

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function describeFollowUp(dateStr: string): { text: string; overdue: boolean } {
  const due = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)
    return { text: `Overdue ${Math.abs(diffDays)}d`, overdue: true };
  if (diffDays === 0) return { text: "Today", overdue: false };
  if (diffDays === 1) return { text: "Tomorrow", overdue: false };
  return { text: `In ${diffDays}d`, overdue: false };
}

export default function FollowUpList() {
  const jobs = useStore((s) => s.jobs);
  const updateJob = useStore((s) => s.updateJob);
  const t = useT();

  const followUps = useMemo(() => {
    return jobs
      .filter((j): j is typeof j & { followUpDate: string } => {
        const d = j.followUpDate;
        return d !== null && d.trim() !== "";
      })
      .map((j) => ({
        jobId: j.id,
        company: j.company,
        position: j.position,
        dueDate: j.followUpDate,
        dateInfo: describeFollowUp(j.followUpDate),
      }))
      .sort(
        (a, b) =>
          parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime(),
      );
  }, [jobs]);

  const handleMarkDone = (jobId: string) => {
    updateJob(jobId, { followUpDate: "" });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-900">
          {t("Pending Follow-ups")}
        </h2>
      </div>
      <div className="divide-y divide-gray-50">
        {followUps.map((f) => (
          <div key={f.jobId} className="px-5 py-3.5 flex items-center gap-3">
            <button
              onClick={() => handleMarkDone(f.jobId)}
              className="shrink-0 text-gray-300 hover:text-green-500 transition-colors"
              title="Mark as done"
            >
              <Check size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 truncate">{f.position}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.company}</p>
            </div>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                f.dateInfo.overdue
                  ? "text-red-600 bg-red-50"
                  : "text-amber-600 bg-amber-50"
              }`}
            >
              {f.dateInfo.overdue && <AlertTriangle size={10} />}
              {f.dateInfo.text}
            </span>
          </div>
        ))}
        {followUps.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {t("No follow-ups yet. Add one from the Jobs page!")}
          </div>
        )}
      </div>
    </div>
  );
}
