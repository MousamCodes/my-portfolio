"use client";

import { Sparkles } from "lucide-react";
import { openAskAI } from "@/lib/events";
import { cn } from "@/lib/utils";

export default function AskAboutButton({ prompt, label = "Ask AI about this", className }: { prompt: string; label?: string; className?: string }) {
  return (
    <button
      onClick={() => openAskAI(prompt)}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 text-sm font-medium text-bg transition hover:brightness-110",
        className,
      )}
    >
      <Sparkles className="h-4 w-4" /> {label}
    </button>
  );
}
