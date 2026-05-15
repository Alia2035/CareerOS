"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getLanguage } from "@/lib/settingsStore";
import { useT } from "@/lib/i18n";
import { Calendar, Clock } from "lucide-react";

function daysLabel(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isZh = getLanguage() === "zh";
  if (diff === 0) return isZh ? "今天" : "Today";
  if (diff === 1) return isZh ? "明天" : "Tomorrow";
  return isZh ? `${diff}天后` : `In ${diff} days`;
}

export default function UpcomingInterviews() {
  const jobs = useStore((s) => s.jobs);
  const t = useT();

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return jobs
      .filter((j) => {
        if (!j.interviewDate) return false;
        const d = new Date(j.interviewDate + "T00:00:00");
        return d >= today;
      })
      .sort((a, b) => a.interviewDate.localeCompare(b.interviewDate))
      .slice(0, 5);
  }, [jobs]);

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-primary-500" />
          {t("Upcoming Interviews")}
        </h3>
        <p className="text-sm text-gray-400">{t("No upcoming interviews")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-primary-500" />
        {t("Upcoming Interviews")}
      </h3>
      <div className="space-y-3">
        {upcoming.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{job.company}</p>
              <p className="text-xs text-gray-500 truncate">{job.position}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Calendar size={12} />
                  {job.interviewDate}
                </p>
                {job.interviewTime && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {job.interviewTime}
                  </p>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                {daysLabel(job.interviewDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
