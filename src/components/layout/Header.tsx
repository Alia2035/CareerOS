"use client";

import { usePathname } from "next/navigation";

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
  const title = titles[pathname] || "Dashboard";

  return (
    <header className="px-6 py-5 border-b border-gray-100 bg-white">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
