import type { Job } from "@/types";

export interface NextAction {
  label: string;
  path?: string;
}

export function getNextAction(job: Job): NextAction {
  if (job.atsScore === null) {
    return { label: "Analyze Resume", path: `/resume?jobId=${job.id}` };
  }
  if (job.atsScore < 60) {
    return { label: "Improve Resume", path: `/resume?jobId=${job.id}` };
  }
  if (job.atsScore >= 60 && job.status === "Saved") {
    return { label: "Apply Now" };
  }
  if (job.status === "Applied" && !job.followUpDate) {
    return { label: "Send Follow-up", path: "/outreach" };
  }
  return { label: "Review" };
}
