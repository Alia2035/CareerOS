export type { JobStatus, Job } from "./job";

export interface ResumeAnalysis {
  id: string;
  jobId: string | null;
  jdText: string;
  resumeText: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  jobId: string | null;
  company: string;
  position: string;
  type: "cold-email" | "connect-message" | "follow-up";
  subject: string;
  body: string;
  createdAt: string;
}

export interface InterviewPrep {
  id: string;
  jobId: string | null;
  company: string;
  position: string;
  questions: InterviewQuestion[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  starAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface FollowUp {
  id: string;
  jobId: string;
  company: string;
  position: string;
  dueDate: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

export interface AppStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}
