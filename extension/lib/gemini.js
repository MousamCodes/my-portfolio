// Direct call to the Gemini REST API with the user's own key.
// The key is sent only to generativelanguage.googleapis.com and stored locally.

const BASE = "https://generativelanguage.googleapis.com/v1beta";

const SYSTEM = `You are ResumeFit, a meticulous resume editor and hiring coach.

Hard rules:
1. Use ONLY facts that appear in the candidate's resume: employers, titles, dates, projects, tools, metrics, education. Never invent or inflate anything. Do not add a tool or skill unless the resume already shows it, possibly under another name.
2. You may reorder, reword, condense, merge and emphasise. Lead with what matters most for this job. Mirror the job's vocabulary where it is truthful.
3. The tailored resume must fit one page: roughly 400 to 550 words. Format it in clean Markdown: a "# Name" heading, one contact line, then "## Summary", "## Skills", "## Experience" and/or "## Projects", "## Education". Use "-" bullets starting with a strong verb and include numbers from the resume where they exist.
4. The cover letter is three short paragraphs under 220 words, specific to this company and role, no clichés, no placeholders in square brackets unless the information is truly unknown.
5. Score honestly from 0 to 100. Give 85 or more only when nearly every must-have requirement is clearly met. Missing keywords are things the job asks for that the resume does not show.
6. Tips are concrete, actionable edits or things to prepare, one sentence each. Questions are likely interview questions for this specific role.`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "INTEGER" },
    verdict: { type: "STRING", description: "Two to four words, e.g. Strong match / Worth applying / Stretch" },
    summary: { type: "STRING", description: "Two sentences on fit, addressed to the candidate" },
    matched_keywords: { type: "ARRAY", items: { type: "STRING" } },
    missing_keywords: { type: "ARRAY", items: { type: "STRING" } },
    tailored_resume: { type: "STRING", description: "Full resume in Markdown" },
    cover_letter: { type: "STRING", description: "Cover letter in Markdown, empty string if not requested" },
    tips: { type: "ARRAY", items: { type: "STRING" } },
    questions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "score", "verdict", "summary", "matched_keywords", "missing_keywords",
    "tailored_resume", "cover_letter", "tips", "questions",
  ],
};

export async function tailorWithGemini({ apiKey, model, resume, job, coverLetter, tone }) {
  const user = `JOB TITLE: ${job.title || "Unknown"}
COMPANY: ${job.company || "Unknown"}
SOURCE: ${job.url || ""}

JOB DESCRIPTION:
"""
${job.description}
"""

CANDIDATE RESUME:
"""
${resume}
"""

Tone: ${tone}.
Cover letter: ${coverLetter ? "yes" : "no, return an empty string"}.
Return JSON only.`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
    },
  };

  const res = await fetch(`${BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini returned ${res.status}`;
    if (res.status === 400 && /API key/i.test(msg)) throw new Error("That Gemini key was rejected. Check it in Settings.");
    if (res.status === 429) throw new Error("Rate limited by Gemini. Wait a minute and try again.");
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini sent a response I could not parse. Try again.");
  }
  parsed.score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
  parsed.offline = false;
  return parsed;
}

export async function validateKey(apiKey) {
  const res = await fetch(`${BASE}/models?pageSize=1`, { headers: { "x-goog-api-key": apiKey } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Key check failed (${res.status})`);
  }
  return true;
}
