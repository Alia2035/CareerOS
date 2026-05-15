"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/jobs": "Job Tracker",
  "/resume": "Resume Analyzer",
  "/outreach": "Cold Email Generator",
  "/interview": "Interview Prep",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const t = useT();
  const titleKey = titles[pathname] || "Dashboard";

  return (
    <header className="px-6 py-5 border-b border-gray-100 bg-white">
      <h1 className="text-xl font-semibold text-gray-900">{t(titleKey)}</h1>
    </header>
  );
}
