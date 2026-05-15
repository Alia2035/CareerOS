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
    system: `You are a professional job seeker writing a cold outreach email. Write in a natural, human tone — warm but professional. Do NOT copy-paste bullet points from the resume or job description. Synthesize the candidate's background and connect it naturally to the role. Keep the email between 150–200 words. Use a genuine, conversational style as if you were a real person emailing the hiring team. ${langInstruction(language)}`,
    user: `Write a cold email expressing interest in the ${ctx.position} role at ${ctx.company}.

## Candidate Background (synthesize, do NOT copy-paste):
${ctx.resumeText || "General professional background"}

## Job Description Context (reference key points, do NOT copy-paste):
${ctx.jobDescription || `${ctx.position} role at ${ctx.company}`}
${keywordHints}

## Requirements:
- Opening: brief, genuine expression of interest in the role
- Body: naturally connect 1-2 specific strengths to what the role needs — use your own words
- Closing: clear, polite call to action (e.g. expressing willingness to discuss further)
- Tone: confident but not arrogant, enthusiastic but not desperate
- Word count: 150–200 words

Return ONLY valid JSON:
{
  "subject": "<concise, natural subject line — not spammy or clickbait>",
  "body": "<the full email body>"
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
      instruction: `The candidate applied or sent a cold email but hasn't heard back. Write a polite, brief follow-up that:
- Gently acknowledges the timeline without complaint
- Re-affirms interest in the role (1 sentence)
- Is NOT pushy or demanding
- Leaves a positive impression`,
    },
    "after-interview": {
      label: "After Interview thank-you",
      instruction: `The candidate just finished an interview. Write a thank-you follow-up that:
- Expresses genuine gratitude for the interviewer's time
- References 1 specific point from the conversation or role that excites them
- Briefly reinforces why they're a good fit (1 sentence)
- Keeps the door open for next steps`,
    },
    "still-interested": {
      label: "Still Interested check-in",
      instruction: `The candidate is in the waiting period and wants to reaffirm interest. Write a friendly, professional follow-up that:
- Is warm and brief
- Reaffirms enthusiasm for the role and company
- Politely asks if there are any updates on the timeline
- Does NOT sound anxious or impatient`,
    },
  };

  const scenario = scenarios[followUpType];
  return {
    system: `You are a professional job seeker writing a follow-up email. Write in a natural, human tone — concise and respectful. Do NOT copy-paste from the resume or job description. Keep the email between 80–120 words. ${langInstruction(language)}`,
    user: `Write a follow-up email for the ${ctx.position} role at ${ctx.company}.

## Scenario: ${scenario.label}
${scenario.instruction}

## Candidate Background (reference briefly, do NOT copy-paste):
${ctx.resumeText || "Professional background relevant to the role"}

## Job Description Context:
${ctx.jobDescription || `${ctx.position} role at ${ctx.company}`}

## Requirements:
- Word count: 80–120 words
- Tone: professional, warm, respectful
- Do NOT copy-paste resume bullet points — use natural language

Return ONLY valid JSON:
{
  "subject": "<brief, natural subject line>",
  "body": "<the full email body>"
}`,
  };
}

function buildConnectMessagePrompt(ctx: OutreachContext, language?: Language): OutreachPrompt {
  return {
    system: `You are a professional writing a short LinkedIn connection request. Keep it under 300 characters. Be genuine and concise. ${langInstruction(language)}`,
    user: `Write a short LinkedIn connect message for someone interested in the ${ctx.position} role at ${ctx.company}.

## Candidate Background (reference briefly):
${ctx.resumeText || "Relevant professional background"}

## Requirements:
- Under 300 characters total
- Friendly and professional tone
- Mention interest in the company/role briefly

Return ONLY valid JSON:
{
  "subject": "",
  "body": "<the connect message>"
}`,
  };
}

function buildKeywordHints(ctx: OutreachContext): string {
  const parts: string[] = [];
  if (ctx.matchedKeywords.length > 0) {
    parts.push(`Keywords that match the candidate's background: ${ctx.matchedKeywords.join(", ")}`);
  }
  if (ctx.missingKeywords.length > 0) {
    parts.push(`Keywords the candidate could naturally reference or bridge to: ${ctx.missingKeywords.join(", ")}`);
  }
  return parts.length > 0 ? `\n## Keyword Context:\n${parts.join("\n")}` : "";
}
