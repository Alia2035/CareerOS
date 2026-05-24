import { langInstruction, type Language } from "@/lib/i18n";

export type FollowUpType = "no-response" | "after-interview" | "still-interested";

export interface OutreachContext {
  company: string;
  position: string;
  jobDescription: string;
  resumeText: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface OutreachPrompt {
  system: string;
  user: string;
}

export function buildOutreachPrompt(
  type: "cold-email" | "connect-message" | "follow-up",
  ctx: OutreachContext,
  options?: {
    followUpType?: FollowUpType;
    regenerateHint?: string;
    language?: Language;
  },
): OutreachPrompt {
  const followUpType = options?.followUpType;
  const regenerateHint = options?.regenerateHint;
  const language = options?.language;

  let prompt: OutreachPrompt;
  switch (type) {
    case "cold-email":
      prompt = buildColdEmailPrompt(ctx, language);
      break;
    case "connect-message":
      prompt = buildConnectMessagePrompt(ctx, language);
      break;
    case "follow-up":
      prompt = buildFollowUpPrompt(ctx, followUpType || "no-response", language);
      break;
  }

  if (regenerateHint) {
    prompt = {
      ...prompt,
      user: `${prompt.user}\n\n## Variation instruction:\n${regenerateHint}\nIMPORTANT: Write a DIFFERENT version — change the wording, structure, or angle. Do not repeat the same phrases as before.`,
    };
  }

  return prompt;
}

function buildColdEmailPrompt(ctx: OutreachContext, language?: Language): OutreachPrompt {
  const keywordHints = buildKeywordHints(ctx);
  return {
    system: `You are writing a cold outreach email AS the job applicant. You ARE the candidate — write in first person ("I", "my", "me") throughout. Write in a natural, human tone — warm but professional. Do NOT copy-paste bullet points from the resume or job description. Synthesize your background and connect it naturally to the role. Keep the email between 150–200 words.

CRITICAL — Perspective rules:
- ALWAYS use first person: "I have experience in...", "My background includes...", "I am drawn to...", "I would love to..."
- NEVER use HR/recruiter voice: "we are looking for", "the candidate should", "the ideal candidate", "as a recruiter", "we require", "applicants must"
- NEVER use third person: "he/she has", "they are", "the applicant"
${langInstruction(language)}`,
    user: `Write a cold email from ME (the job applicant) expressing interest in the ${ctx.position} role at ${ctx.company}.

## My Background (synthesize into natural first-person language, do NOT copy-paste):
${ctx.resumeText || "General professional background"}

## Job Description Context (reference key points, do NOT copy-paste):
${ctx.jobDescription || `${ctx.position} role at ${ctx.company}`}
${keywordHints}

## Requirements:
- Voice: I am writing this email as the applicant — use "I", "my", "me"
- Opening: brief, genuine expression of my interest in the role
- Body: naturally connect 1-2 of MY specific strengths to what the role needs — use my own words
- Closing: clear, polite call to action (e.g. expressing willingness to discuss further)
- Tone: confident but not arrogant, enthusiastic but not desperate
- Word count: 150–200 words

Return ONLY valid JSON:
{
  "subject": "<concise, natural subject line — not spammy or clickbait>",
  "body": "<the full email body in first person>"
}`,
  };
}

function buildFollowUpPrompt(ctx: OutreachContext, followUpType: FollowUpType, language?: Language): OutreachPrompt {
  const scenarios: Record<FollowUpType, {
    label: string;
    instruction: string;
  }> = {
    "no-response": {
      label: "No Response follow-up",
      instruction: `I applied or sent a cold email but haven't heard back. Write a polite, brief follow-up from ME that:
- Gently acknowledges the timeline without complaint
- Re-affirms MY interest in the role (1 sentence)
- Is NOT pushy or demanding
- Leaves a positive impression`,
    },
    "after-interview": {
      label: "After Interview thank-you",
      instruction: `I just finished an interview. Write a thank-you follow-up from ME that:
- Expresses genuine gratitude for the interviewer's time
- References 1 specific point from MY conversation that excites ME
- Briefly reinforces why I'm a good fit (1 sentence)
- Keeps the door open for next steps`,
    },
    "still-interested": {
      label: "Still Interested check-in",
      instruction: `I am in the waiting period and want to reaffirm interest. Write a friendly, professional follow-up from ME that:
- Is warm and brief
- Reaffirms MY enthusiasm for the role and company
- Politely asks if there are any updates on the timeline
- Does NOT sound anxious or impatient`,
    },
  };

  const scenario = scenarios[followUpType];
  return {
    system: `You are writing a follow-up email AS the job applicant. You ARE the candidate — write in first person ("I", "my", "me") throughout. Write in a natural, human tone — concise and respectful. Do NOT copy-paste from the resume or job description. Keep the email between 80–120 words.

CRITICAL — Perspective rules:
- ALWAYS use first person: "I applied for...", "I wanted to follow up...", "I remain very interested..."
- NEVER use HR/recruiter voice: "we are looking for", "the candidate should", "as a recruiter", "we require"
- NEVER use third person: "he/she has", "they are", "the applicant"
${langInstruction(language)}`,
    user: `Write a follow-up email from ME (the job applicant) for the ${ctx.position} role at ${ctx.company}.

## Scenario: ${scenario.label}
${scenario.instruction}

## My Background (reference briefly, do NOT copy-paste):
${ctx.resumeText || "Professional background relevant to the role"}

## Job Description Context:
${ctx.jobDescription || `${ctx.position} role at ${ctx.company}`}

## Requirements:
- Voice: I am writing this as the applicant — use "I", "my", "me"
- Word count: 80–120 words
- Tone: professional, warm, respectful
- Do NOT copy-paste resume bullet points — use natural language

Return ONLY valid JSON:
{
  "subject": "<brief, natural subject line>",
  "body": "<the full email body in first person>"
}`,
  };
}

function buildConnectMessagePrompt(ctx: OutreachContext, language?: Language): OutreachPrompt {
  return {
    system: `You are writing a short LinkedIn connection request AS the job applicant. You ARE the person reaching out — write in first person ("I", "my", "me"). Keep it under 300 characters. Be genuine and concise.

CRITICAL — Perspective rules:
- ALWAYS use first person: "I came across...", "I'm interested in...", "I'd love to connect..."
- NEVER use HR/recruiter voice: "we are looking for", "the candidate should", "as a recruiter"
- NEVER use third person: "he/she has", "they are", "the applicant"
${langInstruction(language)}`,
    user: `Write a short LinkedIn connect message from ME for someone interested in the ${ctx.position} role at ${ctx.company}.

## My Background (reference briefly):
${ctx.resumeText || "Relevant professional background"}

## Requirements:
- Voice: I am writing this — use "I", "my", "me"
- Under 300 characters total
- Friendly and professional tone
- Mention my interest in the company/role briefly

Return ONLY valid JSON:
{
  "subject": "",
  "body": "<the connect message in first person>"
}`,
  };
}

function buildKeywordHints(ctx: OutreachContext): string {
  const parts: string[] = [];
  if (ctx.matchedKeywords.length > 0) {
    parts.push(`Keywords that match my background: ${ctx.matchedKeywords.join(", ")}`);
  }
  if (ctx.missingKeywords.length > 0) {
    parts.push(`Keywords I could naturally reference or bridge to: ${ctx.missingKeywords.join(", ")}`);
  }
  return parts.length > 0 ? `\n## Keyword Context:\n${parts.join("\n")}` : "";
}

const HR_VOICE_PATTERNS = [
  /we are looking for/i,
  /we are seeking/i,
  /we require/i,
  /we need/i,
  /the candidate should/i,
  /the ideal candidate/i,
  /the applicant/i,
  /as a recruiter/i,
  /applicants must/i,
  /he\/she has/i,
  /he\/she is/i,
  /candidates should/i,
  /candidates must/i,
  /we would like/i,
];

export function detectHRVoice(body: string): boolean {
  return HR_VOICE_PATTERNS.some((pattern) => pattern.test(body));
}

export function buildCorrectionHint(): string {
  return "REWRITE IN FIRST PERSON. You ARE the job applicant. Use I/my/me. The previous version used HR/recruiter voice — do NOT use it. Never say \"we are looking for\", \"the candidate should\", \"the ideal candidate\", or any third-person language. Write as the person applying for the job.";
}
