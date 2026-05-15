"use client";

import { useMemo } from "react";
import { useStore, calcStats } from "@/lib/store";
import { useT } from "@/lib/i18n";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Saved: "#9ca3af",
  Applied: "#3b82f6",
  Interview: "#eab308",
  Offer: "#22c55e",
  Rejected: "#ef4444",
};

const statusOrder = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export default function AnalyticsPage() {
  const jobs = useStore((s) => s.jobs);
  const stats = useMemo(() => calcStats(jobs), [jobs]);
  const t = useT();

  const pieData = useMemo(
    () => statusOrder.map((status) => ({ name: status, value: jobs.filter((j) => j.status === status).length })),
    [jobs]
  );

  const trendData = useMemo(() => {
    const days: Record<string, { date: string; applied: number; interview: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = { date: key.slice(5), applied: 0, interview: 0 };
    }
    jobs.forEach((j) => {
      if (j.appliedDate && days[j.appliedDate]) days[j.appliedDate].applied++;
      if (j.status === "Interview" && j.updatedAt && days[j.updatedAt]) days[j.updatedAt].interview++;
    });
    return Object.values(days);
  }, [jobs]);

  const sourceData = useMemo(() => {
    const sources = jobs.reduce((acc, j) => {
      const src = j.source || "Unknown";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sources).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const sourceMax = sourceData[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("Response Rate"), value: `${stats.responseRate}%`, sub: "of applications get a response" },
          { label: t("Interview Rate"), value: `${stats.interviewRate}%`, sub: "of applications lead to interview" },
          { label: t("Offer Rate"), value: `${stats.offerRate}%`, sub: "of applications result in offer" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 px-5 py-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t("Application Status")}</h2>
          {jobs.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">{t("No data yet")}</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t("Application Trend (30d)")}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applied" stroke="#22c55e" strokeWidth={2} dot={false} name="Applied" />
              <Line type="monotone" dataKey="interview" stroke="#eab308" strokeWidth={2} dot={false} name="Interview" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">{t("Applications by Source")}</h2>
        {sourceData.length > 0 ? (
          <div className="space-y-3">
            {sourceData.map(([source, count]) => (
              <div key={source} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 shrink-0">{source}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-400 rounded-full transition-all" style={{ width: `${(count / sourceMax) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-sm text-gray-400">{t("No data yet")}</div>
        )}
      </div>
    </div>
  );
}
