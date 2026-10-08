import type { Metadata } from "next";
import Link from "next/link";
import { Download, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${profile.name}: education, skills, projects and certifications.`,
};

export default function ResumePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-2">Resume</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{profile.name}</h1>
          <p className="mt-2 text-lg text-muted">{profile.title}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {profile.location}
            </span>
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-fg">
              <Mail className="h-3.5 w-3.5" /> {profile.email}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {profile.phone}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button href={profile.resumeUrl} external>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Section title="Summary">
        <p className="leading-relaxed text-fg/85">{profile.summary}</p>
      </Section>

      <Section id="education" title="Education">
        {profile.education.map((e) => (
          <div key={e.school} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="font-medium text-white">{e.degree}</p>
              <p className="text-sm text-muted">{e.school}</p>
              <p className="mt-1 text-sm text-accent-strong">{e.detail}</p>
            </div>
            <p className="font-mono text-xs text-muted">{e.period}</p>
          </div>
        ))}
      </Section>

      <Section id="skills" title="Technical skills">
        <dl className="space-y-3">
          {profile.skills.map((g) => (
            <div key={g.group} className="grid gap-1 sm:grid-cols-[200px_1fr]">
              <dt className="text-sm font-medium text-white">{g.group}</dt>
              <dd className="text-sm text-muted">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="projects" title="Projects">
        <div className="space-y-6">
          {projects
            .filter((p) => p.slug !== "ai-developer-hq")
            .map((p) => (
              <div key={p.slug}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <Link href={`/projects/${p.slug}`} className="font-medium text-white hover:text-accent-strong">
                    {p.title} <span className="text-muted">· {p.tagline}</span>
                  </Link>
                  <p className="font-mono text-xs text-muted">{p.period}</p>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-fg/80">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-accent">·</span> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.slice(0, 7).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  {p.links.live && (
                    <a href={p.links.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-2 hover:underline">
                      Live <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {p.links.github && (
                    <a href={p.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Link href={`/projects/${p.slug}`} className="text-muted hover:text-fg">
                    Case study →
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </Section>

      <Section id="certifications" title="Certifications">
        <ul className="space-y-3">
          {profile.certifications.map((c) => (
            <li key={c.name} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-sm text-muted">{c.issuer}</p>
              </div>
              <p className="font-mono text-xs text-muted">{c.year}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="PDF preview">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <object data={profile.resumeUrl} type="application/pdf" className="h-[80vh] w-full">
            <div className="p-8 text-center text-sm text-muted">
              Your browser can&apos;t preview PDFs here.{" "}
              <a href={profile.resumeUrl} className="text-accent-2 underline">
                Download the resume
              </a>
              .
            </div>
          </object>
        </div>
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-border py-10 last:border-b-0">
      <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-accent-2">{title}</h2>
      {children}
    </section>
  );
}
