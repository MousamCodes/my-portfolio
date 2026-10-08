"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openAskAI } from "@/lib/events";
import { profile } from "@/data/profile";
import Logo from "@/components/ui/Logo";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/resume", label: "Resume" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled || open ? "glass border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo size={32} className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" />
          <span className="hidden sm:inline">{profile.firstName.toUpperCase()}</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:inline">· AI HQ</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-fg",
                pathname === l.href && "text-fg",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3.5 text-sm text-muted transition hover:border-accent-2/50 hover:text-fg"
          >
            <Download className="h-4 w-4" /> Resume
          </a>
          <button
            onClick={() => openAskAI()}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 text-sm font-medium text-bg transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" /> Ask AI
          </button>
        </div>

        <button
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base text-fg hover:bg-white/5">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border text-sm"
            >
              <Download className="h-4 w-4" /> Resume PDF
            </a>
            <button
              onClick={() => {
                setOpen(false);
                openAskAI();
              }}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 text-sm font-medium text-bg"
            >
              <Sparkles className="h-4 w-4" /> Ask AI
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
