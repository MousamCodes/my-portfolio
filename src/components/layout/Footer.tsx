import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin, XIcon as Twitter } from "@/components/ui/BrandIcons";
import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="mt-1 text-sm text-muted">
            {profile.title} · {profile.location}
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted/80">
            Built with Next.js, Tailwind, Framer Motion and Gemini · © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Social href={profile.socials.github} label="GitHub">
            <Github className="h-4 w-4" />
          </Social>
          <Social href={profile.socials.linkedin} label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </Social>
          <Social href={profile.socials.x} label="X">
            <Twitter className="h-4 w-4" />
          </Social>
          <Social href={`mailto:${profile.email}`} label="Email">
            <Mail className="h-4 w-4" />
          </Social>
          <Link href="/resume" className="ml-2 text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
            Resume
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted transition hover:border-accent/60 hover:text-fg"
    >
      {children}
    </a>
  );
}
