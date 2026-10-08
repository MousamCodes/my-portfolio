import { GoogleGenAI } from "@google/genai";

export const CHAT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";
export const EMBED_DIM = 768;

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export type EmbedTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export async function embedTexts(texts: string[], taskType: EmbedTask): Promise<number[][]> {
  const ai = getGemini();
  const res = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: texts,
    config: { taskType, outputDimensionality: EMBED_DIM },
  });
  return (res.embeddings ?? []).map((e) => e.values ?? []);
}

/** Thinking makes 2.5-series answers slower; disable it for a snappy chat. */
export function speedConfig() {
  return CHAT_MODEL.includes("2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {};
}
