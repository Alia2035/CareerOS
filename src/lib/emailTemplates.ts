export interface EmailResult {
  subject: string;
  body: string;
}

export function generateColdEmail(
  company: string,
  position: string,
  resumeText: string,
  jobDescription: string,
): EmailResult {
  const nameLine = "Dear Hiring Team,";
  const intro = `I am writing to express my strong interest in the ${position} role at ${company}. Based on the job description, I believe my background aligns well with what you are looking for.`;
  const body = buildBodyParagraph(resumeText, jobDescription);
  const closing = "I would welcome the opportunity to discuss how my experience can contribute to the team. I have attached my resume for your review and am available at your convenience for a conversation.\n\nThank you for your time and consideration.\n\nBest regards,";

  return {
    subject: `Interest in ${position} at ${company}`,
    body: `${nameLine}\n\n${intro}\n\n${body}\n\n${closing}`,
  };
}

export function generateConnectMessage(
  company: string,
  position: string,
  resumeText: string,
): EmailResult {
  const preview = resumeText.slice(0, 200).replace(/\n/g, " ").trim();
  const body = `Hi, I came across the ${position} opening at ${company} and I'm very interested. With my background (${preview}...), I believe I could bring value to the team. I'd love to connect and learn more about the role. Thank you!`;

  return {
    subject: "",
    body: body.length > 300 ? body.slice(0, 297) + "..." : body,
  };
}

export function generateFollowUpEmail(
  company: string,
  position: string,
): EmailResult {
  const nameLine = "Dear Hiring Team,";
  const body = `I hope this message finds you well. I'm writing to follow up on my recent application for the ${position} role at ${company}.\n\nI remain very interested in this opportunity and would be grateful for any update you can share regarding the status of my application or the hiring timeline.\n\nThank you again for your consideration. Please let me know if there is any additional information I can provide to support my candidacy.\n\nBest regards,`;

  return {
    subject: `Follow-up: ${position} Application at ${company}`,
    body: `${nameLine}\n\n${body}`,
  };
}

function buildBodyParagraph(resumeText: string, jobDescription: string): string {
  const resumePreview = resumeText.slice(0, 300).replace(/\n/g, " ").trim();
  const jdPreview = jobDescription.slice(0, 200).replace(/\n/g, " ").trim();

  const lines: string[] = [];
  if (resumePreview) {
    lines.push(`My experience includes: ${resumePreview}...`);
  }
  if (jdPreview) {
    lines.push(`I am particularly drawn to this role because: ${jdPreview}...`);
  }
  return lines.join("\n\n") || "I am confident that my skills and experience make me a strong candidate for this role.";
}
