"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getRelativeDate } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function FollowUpList() {
  const followUps = useStore((s) => s.followUps);
  const toggleFollowUp = useStore((s) => s.toggleFollowUp);
  const t = useT();

  const pending = useMemo(
    () =>
      followUps
        .filter((f) => !f.completed)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [followUps]
  );

  const completed = useMemo(() => followUps.filter((f) => f.completed), [followUps]);

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-900">{t("Pending Follow-ups")}</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {pending.map((f) => (
          <div key={f.id} className="px-5 py-3.5 flex items-center gap-3">
            <button onClick={() => toggleFollowUp(f.id)} className="shrink-0 text-gray-300 hover:text-primary-500 transition-colors">
              <Circle size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 truncate">{f.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.company} · {f.position}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              {getRelativeDate(f.dueDate)}
            </span>
          </div>
        ))}
        {completed.map((f) => (
          <div key={f.id} className="px-5 py-3.5 flex items-center gap-3 opacity-60">
            <button onClick={() => toggleFollowUp(f.id)} className="shrink-0 text-primary-500">
              <CheckCircle2 size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-900 line-through truncate">{f.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.company}</p>
            </div>
          </div>
        ))}
        {pending.length === 0 && completed.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            {t("No follow-ups yet. Add one from the Jobs page!")}
          </div>
        )}
      </div>
    </div>
  );
}
