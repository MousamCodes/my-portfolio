/**
 * Builds src/data/embeddings.json from the portfolio content.
 *
 *   npm run embed
 *
 * Re-run whenever src/data/profile.ts or src/data/projects.ts changes.
 * Needs GEMINI_API_KEY in .env.local (or the environment).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env.local loader so the script has no dotenv dependency.
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set. Add it to .env.local and re-run.");
    process.exit(1);
  }
  const { chunks } = await import("../src/data/knowledge");
  const { embedTexts, EMBED_MODEL, EMBED_DIM } = await import("../src/lib/gemini");

  console.log(`Embedding ${chunks.length} chunks with ${EMBED_MODEL} (${EMBED_DIM} dims)...`);
  const items: { id: string; vector: number[] }[] = [];
  const BATCH = 16;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = await embedTexts(
      batch.map((c) => `${c.title}\n${c.text}`),
      "RETRIEVAL_DOCUMENT",
    );
    vectors.forEach((vector, j) => items.push({ id: batch[j].id, vector }));
    console.log(`  ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
  }

  const out = resolve(process.cwd(), "src/data/embeddings.json");
  writeFileSync(
    out,
    JSON.stringify({ model: EMBED_MODEL, dim: EMBED_DIM, generatedAt: new Date().toISOString(), items }),
  );
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
