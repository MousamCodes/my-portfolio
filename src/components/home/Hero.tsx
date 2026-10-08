"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { profile } from "@/data/profile";
import { openAskAI } from "@/lib/events";

const sampleQuestions = [
  "What ML projects has Mousam built?",
  "Which project shows his strongest backend skills?",
  "Why should I hire him for an AI internship?",
];

export default function Hero() {
  return (
    <section id="about" className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
        animate={{ x: [-40, 40, -40], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-40 h-[380px] w-[380px] rounded-full bg-accent-2/10 blur-[120px]"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {profile.availability}
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-2">{profile.title}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">I build AI-powered</span>
            <br />
            <span className="text-white">products, end to end.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/projects" size="lg">
              View projects <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={profile.resumeUrl} variant="secondary" size="lg" external>
              <Download className="h-4 w-4" /> Download resume
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="card glow-accent relative p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-bg">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Ask My Portfolio</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">RAG · Gemini · streaming</p>
              </div>
            </div>
            <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">ONLINE</span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-accent/20 px-4 py-2.5 text-sm">
              Which project demonstrates his strongest backend skills?
            </div>
            <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-surface-2/70 px-4 py-3 text-sm leading-relaxed text-fg/90">
              <strong className="text-white">Intervo</strong> is the strongest backend showcase: serverless FastAPI webhooks orchestrate Gemini with a rolling context window, keep the voice loop under 800ms, and persist rubric-based scores to Firestore behind HTTP-only session auth.
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">Intervo · Architecture</span>
                <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">Skills · Backend</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => openAskAI(q)}
                className="rounded-full border border-border bg-surface/60 px-3 py-1.5 text-left text-xs text-muted transition hover:border-accent-2/60 hover:text-fg"
              >
                {q}
              </button>
            ))}
          </div>
          <button
            onClick={() => openAskAI()}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fg text-sm font-medium text-bg transition hover:bg-white"
          >
            <MessageSquare className="h-4 w-4" /> Ask anything about Mousam
          </button>
        </motion.div>
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-6 sm:px-8">
        <div className="grid grid-cols-2 divide-border overflow-hidden rounded-2xl border border-border bg-surface/40 md:grid-cols-4 md:divide-x">
          {profile.achievements.map((a) => (
            <div key={a.label} className="border-b border-border p-5 md:border-b-0">
              <p className="text-2xl font-semibold tracking-tight text-white">{a.value}</p>
              <p className="mt-1 text-sm text-fg/90">{a.label}</p>
              <p className="mt-0.5 text-xs text-muted">{a.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
