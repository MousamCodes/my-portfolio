"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Target, Wand2 } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import type { MatchResponse } from "@/app/api/match/route";

const presets = ["AI/ML Intern", "Full-Stack Intern", "Backend Intern", "Frontend Intern", "Data Analyst Intern", "LLM / Agent Engineer"];

export default function ProjectMatcher() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);

  async function run(r: string) {
    const value = r.trim();
    if (!value || loading) return;
    setRole(value);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      setResult(data as MatchResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section id="matcher" className="relative">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2/10 blur-[140px]" />
      <SectionHeader
        eyebrow="AI career assistant"
        title="Find the right project for your role"
        description="Tell the assistant what you're hiring for. It ranks Mousam's projects by relevance and explains each match."
      />

      <div className="card relative overflow-hidden p-6 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(role);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="relative flex-1">
            <Target className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="I'm hiring for… e.g. AI/ML Intern"
              maxLength={120}
              className="h-12 w-full rounded-full border border-border bg-bg/60 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent/60"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !role.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 text-sm font-medium text-bg transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Match projects
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => run(p)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent-2/60 hover:text-fg"
            >
              {p}
            </button>
          ))}
        </div>

        {error && <p className="mt-5 text-sm text-warn">{error}</p>}

        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              key={result.role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="mt-8"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted">
                  Best matches for <span className="font-medium text-fg">{result.role}</span>
                </p>
                <Badge tone={result.mode === "ai" ? "cyan" : "neutral"}>{result.mode === "ai" ? "Gemini ranked" : "Offline keyword ranking"}</Badge>
              </div>
              {result.summary && <p className="mb-5 text-sm leading-relaxed text-fg/85">{result.summary}</p>}

              <ol className="space-y-3">
                {result.matches.map((m, i) => (
                  <motion.li
                    key={m.slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className="rounded-xl border border-border bg-bg/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted">0{i + 1}</span>
                        <Link href={m.href} className="font-semibold text-white hover:text-accent-strong">
                          {m.title}
                        </Link>
                      </div>
                      <span className="font-mono text-sm text-accent-2">{m.score}% match</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + 0.08 * i, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{m.reason}</p>
                    <Link href={m.href} className="mt-2 inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
                      Read case study <ArrowRight className="h-3 w-3" />
                    </Link>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
