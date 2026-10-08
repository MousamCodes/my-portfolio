import { NextResponse } from "next/server";
import { profile } from "@/data/profile";
import { CHAT_MODEL, getGemini, hasGemini, speedConfig } from "@/lib/gemini";
import { formatContext, retrieve } from "@/lib/rag";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 16;
const MAX_CHARS = 1500;

function systemPrompt(context: string): string {
  return `You are "Ask My Portfolio", an AI assistant embedded in ${profile.name}'s developer portfolio. Visitors are usually recruiters, hiring managers or engineers evaluating ${profile.firstName} for an internship.

Answer questions about ${profile.firstName}'s projects, skills, education, achievements and fit for roles.

Rules:
- Ground every claim in the CONTEXT below. If the context does not contain the answer, say you don't have that information in the portfolio and suggest contacting ${profile.firstName} at ${profile.email}.
- Never invent projects, employers, metrics or dates.
- Refer to ${profile.firstName} in the third person (he/him).
- Be concise: 2-6 sentences, or a short bulleted list when comparing several items. Use **bold** for project names.
- When relevant, point to a page on this site using markdown links with relative paths (for example [Intervo](/projects/intervo), [Resume](/resume)).
- If asked something unrelated to ${profile.firstName}'s portfolio, politely steer back.

CONTEXT:
${context}`;
}

export async function POST(req: Request) {
  if (!hasGemini()) {
    return NextResponse.json({ error: "AI_NOT_CONFIGURED", message: "The AI assistant is not configured on this deployment." }, { status: 503 });
  }

  const limit = rateLimit(`chat:${clientKey(req)}`, 30, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "RATE_LIMITED", message: `Too many requests. Try again in ${limit.retryAfterSec}s.` }, { status: 429 });
  }

  let messages: ChatMessage[];
  try {
    const body = (await req.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) throw new Error("bad body");
    messages = body.messages
      .filter((m): m is ChatMessage => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  // Use the previous user turn as extra retrieval signal for short follow-ups.
  const prevUser = messages.filter((m) => m.role === "user").slice(-2, -1)[0];
  const query = last.content.length < 40 && prevUser ? `${prevUser.content} ${last.content}` : last.content;
  const { results, mode } = await retrieve(query, 6);

  const ai = getGemini();
  let stream: AsyncIterable<{ text?: string }>;
  try {
    stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
      config: {
        systemInstruction: systemPrompt(formatContext(results)),
        temperature: 0.4,
        maxOutputTokens: 700,
        ...speedConfig(),
      },
    });
  } catch (err) {
    console.error("gemini error", err);
    return NextResponse.json({ error: "UPSTREAM", message: "The AI service is unavailable right now." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (err) {
        console.error("stream error", err);
        controller.enqueue(encoder.encode("\n\n_(The response was cut short.)_"));
      } finally {
        controller.close();
      }
    },
  });

  const sources = results
    .filter((r) => r.score > 0)
    .slice(0, 4)
    .map((r) => ({ title: r.chunk.title, href: r.chunk.href }));

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Sources": encodeURIComponent(JSON.stringify(sources)),
      "X-Retrieval-Mode": mode,
    },
  });
}
