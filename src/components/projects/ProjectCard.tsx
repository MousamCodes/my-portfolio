import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { GithubIcon as Github } from "@/components/ui/BrandIcons";
import Badge from "@/components/ui/Badge";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const statusTone = { live: "success", complete: "accent", "in-progress": "warn" } as const;
const statusLabel = { live: "Live", complete: "Complete", "in-progress": "In progress" } as const;

export default function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const href = `/projects/${project.slug}`;
  return (
    <article
      className={cn(
        "card group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_60px_-30px_rgba(139,124,255,0.55)]",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge tone={statusTone[project.status]}>
          <span className={cn("h-1.5 w-1.5 rounded-full", project.status === "live" ? "bg-success animate-pulse" : "bg-current")} />
          {statusLabel[project.status]}
        </Badge>
        <span className="font-mono text-[11px] text-muted">{project.period}</span>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-white">
        <Link href={href} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-accent-2/90">{project.tagline}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 5).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
        {project.tech.length > 5 && <Badge>+{project.tech.length - 5}</Badge>}
      </div>

      <ul className="mt-4 space-y-1 text-xs text-muted">
        {project.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" /> {h}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm">
        {project.links.live && (
          <a href={project.links.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-fg hover:text-accent-2">
            Live <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
        {project.links.github && (
          <a href={project.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg">
            <Github className="h-3.5 w-3.5" /> Code
          </a>
        )}
        <Link href={href} className="ml-auto inline-flex items-center gap-1 text-muted group-hover:text-accent-strong">
          <FileText className="h-3.5 w-3.5" /> Case study
        </Link>
      </div>
    </article>
  );
}
