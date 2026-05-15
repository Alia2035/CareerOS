export type JobStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

export interface Job {
  id: string;
  company: string;
  position: string;
  location: string;
  source: string;
  status: JobStatus;
  appliedDate: string;
  followUpDate: string | null;
  deadlineDate: string;
  salary: string;
  jobUrl: string;
  jobDescription: string;
  resumeText: string;
  resumeFileName: string;
  atsScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}
