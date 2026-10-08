import { cn } from "@/lib/utils";

export default function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "cyan";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-white/[0.04] text-muted",
    accent: "border-accent/40 bg-accent/10 text-accent-strong",
    success: "border-success/40 bg-success/10 text-success",
    warn: "border-warn/40 bg-warn/10 text-warn",
    cyan: "border-accent-2/40 bg-accent-2/10 text-accent-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] leading-5 tracking-tight",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
