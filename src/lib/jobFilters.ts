import type { Job, JobStatus } from "@/types";

export type AtsFilter = "All" | "Not Analyzed" | "ATS ≥ 80%" | "ATS 60–79%" | "ATS < 60%";
export type SortBy = "Default" | "ATS Score: High to Low" | "ATS Score: Low to High" | "Deadline Date" | "Applied Date";

export function filterJobs(jobs: Job[], statusFilter: JobStatus | "All", atsFilter: AtsFilter): Job[] {
  let list = statusFilter === "All" ? jobs : jobs.filter((j) => j.status === statusFilter);

  switch (atsFilter) {
    case "Not Analyzed":
      return list.filter((j) => j.atsScore === null);
    case "ATS ≥ 80%":
      return list.filter((j) => j.atsScore !== null && j.atsScore >= 80);
    case "ATS 60–79%":
      return list.filter((j) => j.atsScore !== null && j.atsScore >= 60 && j.atsScore < 80);
    case "ATS < 60%":
      return list.filter((j) => j.atsScore !== null && j.atsScore < 60);
    default:
      return list;
  }
}

export function sortJobs(jobs: Job[], sortBy: SortBy): Job[] {
  const list = [...jobs];

  switch (sortBy) {
    case "ATS Score: High to Low":
      return list.sort((a, b) => (b.atsScore ?? -1) - (a.atsScore ?? -1));
    case "ATS Score: Low to High":
      return list.sort((a, b) => (a.atsScore ?? -1) - (b.atsScore ?? -1));
    case "Deadline Date":
      return list.sort((a, b) => {
        if (!a.deadlineDate && !b.deadlineDate) return 0;
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      });
    case "Applied Date":
      return list.sort((a, b) => {
        if (!a.appliedDate && !b.appliedDate) return 0;
        if (!a.appliedDate) return 1;
        if (!b.appliedDate) return -1;
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      });
    default:
      return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}
