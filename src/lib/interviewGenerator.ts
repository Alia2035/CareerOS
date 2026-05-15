import type { QuestionType, GeneratedQuestion, InterviewFeedback } from "@/types/interview";

export type { QuestionType, GeneratedQuestion, InterviewFeedback };

export interface QuestionGenerationContext {
  company: string;
  position: string;
  jobDescription: string;
  resumeText: string;
  atsScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface FeedbackContext {
  question: string;
  questionType: QuestionType;
  answer: string;
  company: string;
  position: string;
  jobDescription: string;
}

const typeLabels: Record<QuestionType, string> = {
  behavioral: "Behavioral — STAR-method question about past experiences and soft skills",
  technical: "Technical / Role-specific — hard skills, domain knowledge, or craft-specific question",
  "resume-based": "Resume-based — question directly referencing the candidate's background",
  "jd-based": "JD-based — question drawn from specific requirements in the job description",
};

export function buildQuestionsPrompt(ctx: QuestionGenerationContext): {
  system: string;
  user: string;
} {
  const keywordHints = buildKeywordContext(ctx);
  const atsInfo =
    ctx.atsScore != null
      ? `ATS Score: ${ctx.atsScore}/100 — there are gaps the interview might probe.`
      : "";

  return {
    system: `You are an expert technical interviewer and career coach. You generate highly specific, non-generic interview questions tailored to a particular candidate, role, and company. Every question must reference concrete details from the job description, resume, or keyword analysis. Never output questions like "Tell me about yourself" or "What are your strengths?" — those are too generic. Ground every question in the provided context. Always respond in the same language as the user's input. Return ONLY valid JSON.`,

    user: `Generate 6 interview questions for a candidate applying to **${ctx.position}** at **${ctx.company}**.

## Distribution (exactly 6 questions):
- 2 Behavioral questions (STAR-method, tied to challenges relevant to this role)
- 2 Technical / Role-specific questions (domain skills, tools, or craft scenarios from the JD)
- 1 Resume-based question (reference something concrete in the candidate's background)
- 1 JD-based question (reference a specific requirement or responsibility from the job description)

## Job Description:
${ctx.jobDescription || `${ctx.position} role at ${ctx.company}`}

## Candidate Resume / Background:
${ctx.resumeText || "General professional background"}

${keywordHints}

${atsInfo}

## Critical Rules:
- Each question MUST reference a concrete detail (a tool, a scenario, a past project, a JD requirement, a missing keyword area). Generic questions are UNACCEPTABLE.
- Questions should feel like they were written by a human interviewer who studied both the JD and the resume.
- Behavioral questions: tie to specific challenges this role likely involves.
- Technical questions: reference tools, technologies, or domain scenarios from the JD.
- Resume-based: point to something the candidate actually mentioned.
- JD-based: reference a specific line or requirement from the job description.

Return ONLY valid JSON (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "type": "behavioral",
      "question": "<specific, contextual question>"
    }
  ]
}`,
  };
}

export function buildFeedbackPrompt(ctx: FeedbackContext): {
  system: string;
  user: string;
} {
  const starSection =
    ctx.questionType === "behavioral"
      ? `- **STAR Check**: Evaluate whether the answer follows Situation → Task → Action → Result structure. Note what's present and what's missing.`
      : `- **STAR Check**: Not applicable (non-behavioral question). Return null.`;

  return {
    system: `You are an expert interview coach providing constructive, actionable feedback. Be encouraging but honest. Point out specific strengths and concrete areas for improvement. When suggesting a better answer, write it in natural spoken language as if the candidate were answering in an interview. Always respond in the same language as the user's input. Return ONLY valid JSON.`,

    user: `Evaluate the following interview answer.

## Role: ${ctx.position} at ${ctx.company}
## Question Type: ${ctx.questionType}
## Interview Question:
${ctx.question}

## Candidate's Answer:
${ctx.answer || "(empty — no answer provided)"}

## Provide:
- **Strengths** (2-3 specific things the candidate did well; if the answer is empty, note that)
- **Areas to Improve** (2-3 concrete suggestions with actionable advice)
- **Suggested Better Answer** (a rewritten version that improves on the original while keeping the candidate's voice. Write it in natural spoken language, ~100-180 words.)
${starSection}

## Tone:
- Supportive but candid — don't sugarcoat problems
- Focus on actionable improvements, not just critique
- If the answer is very short or empty, gently point this out and provide a full example answer

Return ONLY valid JSON (no markdown, no extra text):
{
  "strengths": "<2-3 specific strengths>",
  "areasToImprove": "<2-3 concrete suggestions>",
  "suggestedAnswer": "<rewritten improved answer in natural spoken language>",
  "starCheck": "<STAR evaluation or null>"
}`,
  };
}

function buildKeywordContext(ctx: QuestionGenerationContext): string {
  const parts: string[] = [];
  if (ctx.matchedKeywords.length > 0) {
    parts.push(`Matched keywords (candidate already has these): ${ctx.matchedKeywords.join(", ")}`);
  }
  if (ctx.missingKeywords.length > 0) {
    parts.push(
      `Missing/gap keywords (areas to probe or bridge): ${ctx.missingKeywords.join(", ")}`,
    );
  }
  return parts.length > 0 ? `\n## Keyword Analysis:\n${parts.join("\n")}` : "";
}
