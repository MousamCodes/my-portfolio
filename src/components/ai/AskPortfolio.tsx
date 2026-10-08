"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { OPEN_ASK_AI } from "@/lib/events";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

interface Source {
  title: string;
  href: string;
}
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  error?: boolean;
}

const suggestions = [
  "What ML projects has Mousam built?",
  "Tell me about Intervo's architecture.",
  "What technologies does he know?",
  "Why should I hire him?",
];

const uid = () => Math.random().toString(36).slice(2);

export default function AskPortfolio() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setInput("");
      const userMsg: Message = { id: uid(), role: "user", content };
      const assistantId = uid();
      const history = [...messages, userMsg];
      setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setBusy(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
          signal: ctrl.signal,
        });

        if (!res.ok) {
          let msg = "Something went wrong. Please try again.";
          try {
            const data = await res.json();
            if (data.error === "AI_NOT_CONFIGURED") {
              msg = `The AI assistant isn't configured on this deployment yet. You can still browse the [projects](/projects) and [resume](/resume), or email ${profile.email}.`;
            } else if (data.message) msg = data.message;
          } catch {
            /* ignore */
          }
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: msg, error: true } : x)));
          return;
        }

        let sources: Source[] = [];
        try {
          sources = JSON.parse(decodeURIComponent(res.headers.get("X-Sources") || "[]"));
        } catch {
          /* ignore */
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const snapshot = acc;
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: snapshot } : x)));
        }
        setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: acc || "I couldn't generate a reply. Please try again.", sources } : x)));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: "Network error. Please try again.", error: true } : x)));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages],
  );

  // Open from anywhere via the event bus.
  useEffect(() => {
    const handler = (e: Event) => {
      const prefill = (e as CustomEvent<{ prefill?: string }>).detail?.prefill;
      setOpen(true);
      if (prefill) {
        setTimeout(() => send(prefill), 150);
      } else {
        setTimeout(() => inputRef.current?.focus(), 200);
      }
    };
    window.addEventListener(OPEN_ASK_AI, handler);
    return () => window.removeEventListener(OPEN_ASK_AI, handler);
  }, [send]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.button
        aria-label="Ask My Portfolio"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 pl-4 pr-5 text-sm font-medium text-bg shadow-[0_12px_40px_-10px_rgba(139,124,255,0.8)] transition",
          open && "opacity-0 pointer-events-none",
        )}
      >
        <Sparkles className="h-5 w-5" /> Ask AI
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden sm:bottom-5 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-40px)] sm:w-[420px] sm:rounded-3xl"
            role="dialog"
            aria-label="Ask My Portfolio chat"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-bg">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">Ask My Portfolio</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Grounded in resume + case studies</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    aria-label="Reset conversation"
                    onClick={() => {
                      abortRef.current?.abort();
                      setMessages([]);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button aria-label="Close" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="pt-2">
                  <p className="text-sm leading-relaxed text-muted">
                    Hi! I answer questions about {profile.firstName}&apos;s projects, skills and experience using the content of this portfolio. Try one of these:
                  </p>
                  <div className="mt-4 grid gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5 text-left text-sm text-fg/90 transition hover:border-accent/60 hover:bg-surface-2"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user" ? "rounded-br-sm bg-accent/25 text-fg" : "rounded-bl-sm border border-border bg-surface-2/70 text-fg/90",
                      m.error && "border-warn/40 text-warn",
                    )}
                  >
                    {m.role === "assistant" && m.content === "" ? (
                      <span className="inline-flex items-center gap-2 text-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                      </span>
                    ) : m.role === "assistant" ? (
                      <div className="prose-chat">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) =>
                              href?.startsWith("/") ? (
                                <Link href={href} onClick={() => setOpen(false)}>
                                  {children}
                                </Link>
                              ) : (
                                <a href={href} target="_blank" rel="noreferrer">
                                  {children}
                                </a>
                              ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2">
                            {m.sources.map((s) => (
                              <Link
                                key={s.href + s.title}
                                href={s.href}
                                onClick={() => setOpen(false)}
                                className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted transition hover:border-accent-2/60 hover:text-fg"
                              >
                                {s.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg/60 p-1.5 focus-within:border-accent/60">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={1500}
                  placeholder={`Ask about ${profile.firstName}'s work…`}
                  className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted/70"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fg text-bg transition hover:bg-white disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-muted/70">Answers are generated from portfolio content and may be imperfect · Ctrl/⌘ K to toggle</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
