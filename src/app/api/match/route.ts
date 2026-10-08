import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { CHAT_MODEL, getGemini, hasGemini, speedConfig } from "@/lib/gemini";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

export interface MatchResult {
  slug: string;
  title: string;
  href: string;
  score: number;
  reason: string;
}
export interface MatchResponse {
  mode: "ai" | "offline";
  role: string;
  summary: string;
  matches: MatchResult[];
}

const TOP = 4;

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#\s/-]/g, " ")
    .split(/[\s/]+/)
    .filter((t) => t.length > 1);
}

/** Deterministic fallback when no API key is configured or Gemini fails. */
function offlineMatch(role: string): MatchResponse {
  const q = new Set(tokenize(role));
  const expand: Record<string, string[]> = {
    ml: ["ai", "ml", "data"],
    ai: ["ai", "ml", "llm"],
    machine: ["ml"],
    learning: ["ml"],
    data: ["data", "analytics", "nlp"],
    analyst: ["data", "analytics"],
    backend: ["backend", "python", "fastapi"],
    frontend: ["frontend", "react", "nextjs", "web"],
    "full-stack": ["full-stack", "fullstack", "frontend", "backend"],
    fullstack: ["full-stack", "fullstack", "frontend", "backend"],
    full: ["full-stack", "fullstack"],
    stack: ["full-stack", "fullstack"],
    web: ["web", "frontend", "react", "nextjs"],
    software: ["full-stack", "backend", "frontend"],
    sde: ["full-stack", "backend"],
    agent: ["agent", "agents", "automation"],
    automation: ["automation", "agent"],
    nlp: ["nlp", "ml"],
    vision: ["computer vision", "cnn"],
    python: ["python"],
    react: ["react", "frontend", "nextjs"],
    node: ["backend"],
  };
  const wanted = new Set<string>();
  for (const t of q) {
    wanted.add(t);
    for (const e of expand[t] ?? []) wanted.add(e);
  }

  const scored = projects.map((p) => {
    const hay = [...p.roleKeywords, ...p.categories.map((c) => c.toLowerCase()), ...p.tech.map((t) => t.toLowerCase())];
    const hits = [...new Set(hay.filter((h) => wanted.has(h) || [...wanted].some((w) => h.includes(w) && w.length > 3)))];
    const base = Math.min(1, hits.length / 5);
    const bonus = p.featured ? 0.08 : 0;
    const score = Math.round((0.45 + 0.55 * base + bonus) * 100);
    const reason = hits.length
      ? `Matches on ${hits.slice(0, 4).join(", ")}. ${p.highlights.slice(0, 2).join(" · ")}.`
      : `General full-stack/AI relevance. ${p.highlights[0]}.`;
    return { slug: p.slug, title: p.title, href: `/projects/${p.slug}`, score: Math.min(score, 97), reason };
  });

  scored.sort((a, b) => b.score - a.score);
  return {
    mode: "offline",
    role,
    summary: `Based on keyword overlap with the role "${role}", these projects from ${profile.firstName}'s portfolio are the most relevant.`,
    matches: scored.slice(0, TOP),
  };
}

async function aiMatch(role: string): Promise<MatchResponse> {
  const ai = getGemini();
  const catalogue = projects
    .map(
      (p) =>
        `- slug: ${p.slug}\n  title: ${p.title}\n  summary: ${p.description}\n  tech: ${p.tech.join(", ")}\n  categories: ${p.categories.join(", ")}\n  results: ${p.caseStudy.results.join("; ")}`,
    )
    .join("\n");

  const prompt = `A recruiter is hiring for the role: "${role}".

Rank ${profile.firstName}'s projects by how strongly each one demonstrates the skills that role needs. Give each a match score from 0 to 100 and a one-sentence, specific reason that names the relevant technologies or outcomes. Return the top ${TOP} only, highest score first, and a one-sentence overall summary. Only use the slugs listed.

PROJECTS:
${catalogue}`;

  const res = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slug: { type: Type.STRING },
                score: { type: Type.INTEGER },
                reason: { type: Type.STRING },
              },
              required: ["slug", "score", "reason"],
            },
          },
        },
        required: ["summary", "matches"],
      },
      ...speedConfig(),
    },
  });

  const parsed = JSON.parse(res.text ?? "{}") as { summary?: string; matches?: { slug: string; score: number; reason: string }[] };
  const matches: MatchResult[] = (parsed.matches ?? [])
    .map((m) => {
      const p = projects.find((x) => x.slug === m.slug);
      if (!p) return null;
      return {
        slug: p.slug,
        title: p.title,
        href: `/projects/${p.slug}`,
        score: Math.max(0, Math.min(100, Math.round(Number(m.score) || 0))),
        reason: String(m.reason ?? "").slice(0, 300),
      };
    })
    .filter((m): m is MatchResult => Boolean(m))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP);

  if (matches.length === 0) throw new Error("empty match result");
  return { mode: "ai", role, summary: parsed.summary ?? "", matches };
}

export async function POST(req: Request) {
  const limit = rateLimit(`match:${clientKey(req)}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "RATE_LIMITED", message: `Too many requests. Try again in ${limit.retryAfterSec}s.` }, { status: 429 });
  }

  let role = "";
  try {
    const body = (await req.json()) as { role?: unknown };
    role = typeof body.role === "string" ? body.role.trim().slice(0, 120) : "";
  } catch {
    /* fall through */
  }
  if (!role) return NextResponse.json({ error: "BAD_REQUEST", message: "Provide a role." }, { status: 400 });

  if (hasGemini()) {
    try {
      return NextResponse.json(await aiMatch(role));
    } catch (err) {
      console.error("match: gemini failed, using offline scoring", err);
    }
  }
  return NextResponse.json(offlineMatch(role));
}
