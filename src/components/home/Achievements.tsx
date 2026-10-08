"use client";

import { useEffect, useState } from "react";
import { Award, GraduationCap, Trophy } from "lucide-react";
import { GithubIcon as Github } from "@/components/ui/BrandIcons";
import { Section, SectionHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

interface GhStats {
  public_repos: number;
  followers: number;
}

export default function Achievements() {
  const [gh, setGh] = useState<GhStats | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://api.github.com/users/${profile.handle}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setGh({ public_repos: d.public_repos, followers: d.followers }))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return (
    <Section id="achievements">
      <SectionHeader eyebrow="Achievements" title="Credentials and milestones" description="Academic record, recognised coursework and the numbers behind the projects." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="card h-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-accent-2">
                <GraduationCap className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-white">Education</h3>
            </div>
            {profile.education.map((e) => (
              <div key={e.school}>
                <p className="font-medium text-fg">{e.degree}</p>
                <p className="mt-1 text-sm text-muted">{e.school}</p>
                <p className="mt-1 font-mono text-xs text-muted">{e.period}</p>
                <p className="mt-3 inline-block rounded-md border border-accent/40 bg-accent/10 px-2 py-1 font-mono text-xs text-accent-strong">{e.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card h-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-accent-2">
                <Award className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-white">Certifications</h3>
            </div>
            <ul className="space-y-4">
              {profile.certifications.map((c) => (
                <li key={c.name}>
                  <p className="text-sm font-medium text-fg">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.issuer} · {c.year}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="card flex h-full flex-col p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-accent-2">
                <Trophy className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-white">By the numbers</h3>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <Stat label="Projects shipped" value={String(projects.length)} />
              <Stat label="Deployed apps" value={String(projects.filter((p) => p.status === "live").length)} />
              <Stat label="Public repos" value={gh ? String(gh.public_repos) : "—"} />
              <Stat label="GitHub followers" value={gh ? String(gh.followers) : "—"} />
            </dl>
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-muted transition hover:text-fg"
            >
              <Github className="h-4 w-4" /> github.com/{profile.handle}
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 p-3">
      <dd className="text-2xl font-semibold tracking-tight text-white">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted">{label}</dt>
    </div>
  );
}
