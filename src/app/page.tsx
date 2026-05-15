"use client";

import { useMemo } from "react";
import { useStore, calcStats } from "@/lib/store";
import StatCard from "@/components/dashboard/StatCard";
import RecentApps from "@/components/dashboard/RecentApps";
import FollowUpList from "@/components/dashboard/FollowUpList";
import UpcomingInterviews from "@/components/dashboard/UpcomingInterviews";
import { Briefcase, Send, Users, Trophy, XCircle } from "lucide-react";

export default function DashboardPage() {
  const jobs = useStore((s) => s.jobs);
  const stats = useMemo(() => calcStats(jobs), [jobs]);

  const rateItems = useMemo(
    () => [
      { label: "Response Rate", value: `${stats.responseRate}%` },
      { label: "Interview Rate", value: `${stats.interviewRate}%` },
      { label: "Offer Rate", value: `${stats.offerRate}%` },
    ],
    [stats.responseRate, stats.interviewRate, stats.offerRate]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={<Briefcase size={18} className="text-white" />} colorClass="bg-gray-500" />
        <StatCard label="Applied" value={stats.applied} icon={<Send size={18} className="text-white" />} colorClass="bg-blue-500" />
        <StatCard label="Interview" value={stats.interview} icon={<Users size={18} className="text-white" />} colorClass="bg-yellow-500" />
        <StatCard label="Offer" value={stats.offer} icon={<Trophy size={18} className="text-white" />} colorClass="bg-green-500" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={18} className="text-white" />} colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {rateItems.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 px-5 py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <UpcomingInterviews />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentApps />
        <FollowUpList />
      </div>
    </div>
  );
}
