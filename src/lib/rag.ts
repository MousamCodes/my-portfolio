import { chunks, type Chunk } from "@/data/knowledge";
import rawIndex from "@/data/embeddings.json";
import { embedTexts, hasGemini } from "./gemini";

interface EmbeddingIndex {
  model: string | null;
  dim: number;
  generatedAt: string | null;
  items: { id: string; vector: number[] }[];
}

const index = rawIndex as EmbeddingIndex;
const vectorById = new Map(index.items.map((i) => [i.id, i.vector]));
const indexCoversCorpus = chunks.length > 0 && chunks.every((c) => vectorById.has(c.id));

export type RetrievalMode = "embeddings" | "keyword";
export interface Retrieved {
  chunk: Chunk;
  score: number;
}

const STOP = new Set(
  "a an the and or of to in on for with is are was were be been his he him mousam mousams what which who how does do did has have had about tell me can you your this that these those it its as at by from into than then there their they them".split(" "),
);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t));
}

// Pre-compute term frequencies for keyword mode.
const docs = chunks.map((c) => {
  const tf = new Map<string, number>();
  for (const t of tokens(`${c.title} ${c.text}`)) tf.set(t, (tf.get(t) ?? 0) + 1);
  return { chunk: c, tf, len: tf.size };
});
const df = new Map<string, number>();
for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);

function keywordRetrieve(query: string, k: number): Retrieved[] {
  const q = tokens(query);
  const N = docs.length;
  return docs
    .map((d) => {
      let score = 0;
      for (const t of q) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
        score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.len / 60))));
      }
      return { chunk: d.chunk, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

async function embeddingRetrieve(query: string, k: number): Promise<Retrieved[]> {
  const [qv] = await embedTexts([query], "RETRIEVAL_QUERY");
  return chunks
    .map((c) => ({ chunk: c, score: cosine(qv, vectorById.get(c.id)!) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Returns the most relevant chunks for a query.
 * Uses the precomputed Gemini embedding index when it exists and covers the
 * current corpus; otherwise falls back to BM25-style keyword scoring.
 */
export async function retrieve(query: string, k = 6): Promise<{ results: Retrieved[]; mode: RetrievalMode }> {
  let results: Retrieved[] = [];
  let mode: RetrievalMode = "keyword";

  if (indexCoversCorpus && hasGemini()) {
    try {
      results = await embeddingRetrieve(query, k);
      mode = "embeddings";
    } catch {
      results = [];
    }
  }
  if (results.length === 0) results = keywordRetrieve(query, k);

  // The profile summary is cheap and almost always useful as grounding.
  const summary = chunks.find((c) => c.id === "profile:summary")!;
  if (!results.some((r) => r.chunk.id === summary.id)) results.push({ chunk: summary, score: 0 });

  return { results, mode };
}

export function formatContext(results: Retrieved[]): string {
  return results.map((r, i) => `[${i + 1}] ${r.chunk.title}\n${r.chunk.text}`).join("\n\n");
}
