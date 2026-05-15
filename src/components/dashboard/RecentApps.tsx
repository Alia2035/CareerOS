"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export default function RecentApps() {
  const jobs = useStore((s) => s.jobs);
  const t = useT();

  const recent = useMemo(
    () =>
      [...jobs]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [jobs]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-900">{t("Recent Applications")}</h2>
        <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          {t("View all")} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {recent.map((job) => (
          <div key={job.id} className="px-5 py-3.5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{job.position}</p>
              <p className="text-xs text-gray-500 mt-0.5">{job.company} · {formatDate(job.updatedAt)}</p>
            </div>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {t("No applications yet. Start tracking your job search!")}
          </div>
        )}
      </div>
    </div>
  );
}
