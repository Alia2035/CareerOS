export type QuestionType = "behavioral" | "technical" | "resume-based" | "jd-based";

export interface GeneratedQuestion {
  id: string;
  type: QuestionType;
  question: string;
}

export interface InterviewFeedback {
  strengths: string;
  areasToImprove: string;
  suggestedAnswer: string;
  starCheck: string | null;
}
