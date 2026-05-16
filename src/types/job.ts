export type JobStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected" | "Other";

export interface Job {
  id: string;
  company: string;
  position: string;
  location: string;
  source: string;
  status: JobStatus;
  customStatus: string;
  appliedDate: string;
  followUpDate: string | null;
  deadlineDate: string;
  interviewDate: string;
  interviewTime: string;
  salary: string;
  jobUrl: string;
  jobDescription: string;
  resumeText: string;
  resumeFileName: string;
  atsScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  interviewStage: string;
  customStage: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
