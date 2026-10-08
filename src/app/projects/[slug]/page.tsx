import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { GithubIcon as Github } from "@/components/ui/BrandIcons";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AskAboutButton from "@/components/ai/AskAboutButton";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: `${p.tagline}. ${p.description}` };
}

const sections = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "architecture", label: "Architecture" },
  { id: "features", label: "Features" },
  { id: "tech", label: "Tech stack" },
  { id: "challenges", label: "Challenges" },
  { id: "results", label: "Results" },
  { id: "demo", label: "Demo" },
];

const statusTone = { live: "success", complete: "accent", "in-progress": "warn" } as const;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const cs = project.caseStudy;

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <header className="mt-6 border-b border-border pb-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone[project.status]}>{project.status.replace("-", " ")}</Badge>
          {project.categories.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
          <span className="ml-auto font-mono text-xs text-muted">{project.period}</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{project.title}</h1>
        <p className="mt-3 text-xl text-accent-2">{project.tagline}</p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{project.description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {project.links.live && (
            <Button href={project.links.live} external>
              Live demo <ArrowUpRight className="h-4 w-4" />
            </Button>
          )}
          {project.links.github && (
            <Button href={project.links.github} variant="secondary" external>
              <Github className="h-4 w-4" /> Source code
            </Button>
          )}
          <AskAboutButton prompt={`Tell me about ${project.title} and what it demonstrates.`} label="Ask AI about this project" />
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-14">
          <Block id="problem" title="Problem">
            <p>{cs.problem}</p>
          </Block>

          <Block id="solution" title="Solution">
            <p>{cs.solution}</p>
          </Block>

          <Block id="architecture" title="Architecture">
            <ol className="relative space-y-0 border-l border-border pl-6">
              {cs.architecture.map((step, i) => (
                <li key={i} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[31px] top-0.5 grid h-5 w-5 place-items-center rounded-full border border-accent/60 bg-bg font-mono text-[10px] text-accent-strong">
                    {i + 1}
                  </span>
                  <p className="text-fg/90">{step}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="features" title="Key features">
            <ul className="grid gap-3 sm:grid-cols-2">
              {cs.features.map((f) => (
                <li key={f} className="rounded-xl border border-border bg-surface/50 p-4 text-sm text-fg/90">
                  {f}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="tech" title="Tech stack">
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <Badge key={t} tone="accent" className="px-2.5 py-1 text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </Block>

          <Block id="challenges" title="Challenges & decisions">
            <div className="space-y-4">
              {cs.challenges.map((c, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface/50 p-5">
                  <p className="font-medium text-white">{c.challenge}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-accent-2">Resolution · </span>
                    {c.resolution}
                  </p>
                </div>
              ))}
            </div>
          </Block>

          <Block id="results" title="Results">
            <ul className="space-y-2">
              {cs.results.map((r) => (
                <li key={r} className="flex items-start gap-3 text-fg/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {r}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="demo" title="Demo & links">
            {project.links.live || project.links.github ? (
              <div className="flex flex-wrap gap-3">
                {project.links.live && (
                  <Button href={project.links.live} external>
                    Open live demo <ArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
                {project.links.github && (
                  <Button href={project.links.github} variant="secondary" external>
                    <Github className="h-4 w-4" /> View on GitHub
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">Source for this project is private for now. Ask the AI assistant or email me for a walkthrough.</p>
            )}
          </Block>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 rounded-2xl border border-border bg-surface/40 p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">On this page</p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-2 py-1.5 text-sm text-muted transition hover:bg-white/5 hover:text-fg">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <nav className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
        <Link href={`/projects/${prev.slug}`} className="card group p-5 transition hover:border-accent/50">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            <ArrowLeft className="h-3 w-3" /> Previous
          </p>
          <p className="mt-1 font-semibold text-white group-hover:text-accent-strong">{prev.title}</p>
        </Link>
        <Link href={`/projects/${next.slug}`} className="card group p-5 text-right transition hover:border-accent/50">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted">
            Next <ArrowRight className="h-3 w-3" />
          </p>
          <p className="mt-1 font-semibold text-white group-hover:text-accent-strong">{next.title}</p>
        </Link>
      </nav>
    </article>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="text-base leading-relaxed text-fg/85">{children}</div>
    </section>
  );
}
