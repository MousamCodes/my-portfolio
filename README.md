# Mousam's AI Developer HQ

Portfolio site that is itself an AI product: a SaaS-style dashboard, product-style project case studies, and two AI features grounded in the site's own content.

- **Ask My Portfolio**: floating chat (Ctrl/⌘ K). Questions are embedded, matched against pre-computed chunks of the resume and case studies, and answered by Gemini with source chips.
- **Find the right project**: a recruiter types a role; Gemini returns ranked projects with match scores and reasons as structured JSON. Works offline with keyword scoring when no key is set.
- **Case studies**: every project opens into problem → solution → architecture → features → tech → challenges → results → demo, statically generated with SEO metadata.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Google Gemini (`@google/genai`) · Vercel

No database. Retrieval uses a JSON embedding index committed to the repo.

## Run locally

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY (free at https://aistudio.google.com/apikey)
npm run embed                # builds src/data/embeddings.json (optional but recommended)
npm run dev
```

Without `GEMINI_API_KEY` the site still works: the chat shows a "not configured" note and the matcher uses offline keyword ranking. Without `npm run embed`, the chat falls back to BM25-style keyword retrieval.

## Edit content

Everything the site and the AI know lives in two files:

- `src/data/profile.ts`: bio, skills, education, certifications, achievements, links.
- `src/data/projects.ts`: projects with full case studies (problem, solution, architecture, features, challenges, results).

After changing either file, re-run `npm run embed` so retrieval stays in sync. Replace `public/Mousam_Podder_Resume.pdf` to update the downloadable resume.

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add environment variables: `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://your-domain`.
3. Deploy. API routes run on the Node runtime; the in-memory rate limiter caps each visitor to 30 chat and 20 matcher calls per 10 minutes per instance.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run embed` | Regenerate the embedding index |
| `npm run typecheck` / `npm run lint` | Checks |

## Architecture

```
src/data/profile.ts + projects.ts
        │
        ▼ buildChunks()           npm run embed
src/data/knowledge.ts ───────────────────────► src/data/embeddings.json
        │                                              │
        ▼                                              ▼
/api/chat  ── retrieve(query) ── cosine over index ── Gemini stream ──► AskPortfolio.tsx
/api/match ── project catalogue ── Gemini JSON schema ─────────────────► ProjectMatcher.tsx
```
