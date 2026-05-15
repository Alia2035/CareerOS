import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, ResumeAnalysis, EmailTemplate, InterviewPrep, FollowUp } from "@/types";
import { mockJobs, mockResumeAnalysis, mockEmails, mockInterviewPrep, mockFollowUps } from "./mock-data";

interface AppState {
  jobs: Job[];
  analyses: ResumeAnalysis[];
  emails: EmailTemplate[];
  interviewPreps: InterviewPrep[];
  followUps: FollowUp[];

  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">) => void;
  updateJob: (id: string, data: Partial<Job>) => void;
  deleteJob: (id: string) => void;

  addAnalysis: (analysis: ResumeAnalysis) => void;
  addEmail: (email: EmailTemplate) => void;
  addInterviewPrep: (prep: InterviewPrep) => void;

  addFollowUp: (followUp: FollowUp) => void;
  toggleFollowUp: (id: string) => void;
  deleteFollowUp: (id: string) => void;

  getJobById: (id: string) => Job | undefined;
}

const genId = () => Math.random().toString(36).slice(2, 11);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      analyses: [mockResumeAnalysis],
      emails: mockEmails,
      interviewPreps: [mockInterviewPrep],
      followUps: mockFollowUps,

      addJob: (job) => {
        const now = new Date().toISOString().split("T")[0];
        set((state) => ({
          jobs: [...state.jobs, { ...job, id: genId(), createdAt: now, updatedAt: now }],
        }));
      },

      updateJob: (id, data) => {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id ? { ...j, ...data, updatedAt: new Date().toISOString().split("T")[0] } : j
          ),
        }));
      },

      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
          followUps: state.followUps.filter((f) => f.jobId !== id),
        }));
      },

      addAnalysis: (analysis) => {
        set((state) => ({ analyses: [...state.analyses, analysis] }));
      },

      addEmail: (email) => {
        set((state) => ({ emails: [...state.emails, email] }));
      },

      addInterviewPrep: (prep) => {
        set((state) => ({ interviewPreps: [...state.interviewPreps, prep] }));
      },

      addFollowUp: (followUp) => {
        set((state) => ({ followUps: [...state.followUps, followUp] }));
      },

      toggleFollowUp: (id) => {
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === id ? { ...f, completed: !f.completed } : f
          ),
        }));
      },

      deleteFollowUp: (id) => {
        set((state) => ({
          followUps: state.followUps.filter((f) => f.id !== id),
        }));
      },

      getJobById: (id) => get().jobs.find((j) => j.id === id),
    }),
    {
      name: "career-os-storage",
    }
  )
);

/** Pure stats calculator — call with useMemo in components */
export function calcStats(jobs: Job[]) {
  const total = jobs.length;
  const saved = jobs.filter((j) => j.status === "Saved").length;
  const applied = jobs.filter((j) => j.status === "Applied").length;
  const interview = jobs.filter((j) => j.status === "Interview").length;
  const offer = jobs.filter((j) => j.status === "Offer").length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;
  const nonSaved = total - saved || 1;
  return {
    total,
    saved,
    applied,
    interview,
    offer,
    rejected,
    responseRate: Math.round(((interview + offer + rejected) / nonSaved) * 100),
    interviewRate: Math.round((interview / nonSaved) * 100),
    offerRate: Math.round((offer / nonSaved) * 100),
  };
}
