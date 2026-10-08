import { profile } from "./profile";
import { projects } from "./projects";

export interface Chunk {
  id: string;
  title: string; // shown as a source chip
  href: string; // where the source lives on the site
  text: string;
}

/**
 * Builds the retrieval corpus from the typed data modules.
 * Deterministic: the same data always yields the same chunk ids,
 * so the embeddings index stays valid until content changes.
 */
export function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  chunks.push({
    id: "profile:summary",
    title: "About Mousam",
    href: "/#about",
    text: `${profile.name} is a ${profile.title} based in ${profile.location}. ${profile.summary} Availability: ${profile.availability} Contact: ${profile.email}. GitHub: ${profile.socials.github}. LinkedIn: ${profile.socials.linkedin}.`,
  });

  chunks.push({
    id: "profile:education",
    title: "Education",
    href: "/resume#education",
    text: profile.education.map((e) => `${e.degree} at ${e.school}, ${e.period}. ${e.detail}.`).join(" "),
  });

  chunks.push({
    id: "profile:certifications",
    title: "Certifications",
    href: "/resume#certifications",
    text:
      "Certifications: " +
      profile.certifications.map((c) => `${c.name} by ${c.issuer} (${c.year})`).join("; ") +
      ".",
  });

  for (const group of profile.skills) {
    chunks.push({
      id: `skills:${group.group.toLowerCase().replace(/[^a-z]+/g, "-")}`,
      title: `Skills · ${group.group}`,
      href: "/#skills",
      text: `${profile.name}'s skills in ${group.group}: ${group.items.join(", ")}.`,
    });
  }

  chunks.push({
    id: "profile:achievements",
    title: "Achievements",
    href: "/#achievements",
    text:
      "Achievements and metrics: " +
      profile.achievements.map((a) => `${a.label} ${a.value} (${a.detail})`).join("; ") +
      ".",
  });

  chunks.push({
    id: "profile:why-hire",
    title: "Why hire Mousam",
    href: "/#about",
    text: "Reasons to hire Mousam: " + profile.hiringPitch.join(" "),
  });

  for (const p of projects) {
    const base = `/projects/${p.slug}`;
    const links = [p.links.live && `Live demo: ${p.links.live}`, p.links.github && `Source: ${p.links.github}`]
      .filter(Boolean)
      .join(". ");

    chunks.push({
      id: `project:${p.slug}:overview`,
      title: p.title,
      href: base,
      text: `Project "${p.title}" (${p.period}, status: ${p.status}). ${p.tagline}. ${p.description} Categories: ${p.categories.join(", ")}. Tech stack: ${p.tech.join(", ")}. Highlights: ${p.highlights.join("; ")}. ${links}`,
    });

    chunks.push({
      id: `project:${p.slug}:problem-solution`,
      title: `${p.title} · Problem & solution`,
      href: `${base}#problem`,
      text: `${p.title} — Problem: ${p.caseStudy.problem} Solution: ${p.caseStudy.solution}`,
    });

    chunks.push({
      id: `project:${p.slug}:architecture`,
      title: `${p.title} · Architecture`,
      href: `${base}#architecture`,
      text: `${p.title} architecture, step by step: ${p.caseStudy.architecture.map((s, i) => `${i + 1}. ${s}`).join(" ")} Features: ${p.caseStudy.features.join("; ")}.`,
    });

    chunks.push({
      id: `project:${p.slug}:challenges-results`,
      title: `${p.title} · Challenges & results`,
      href: `${base}#challenges`,
      text: `${p.title} challenges: ${p.caseStudy.challenges.map((c) => `${c.challenge} Resolved by: ${c.resolution}`).join(" ")} Results: ${p.caseStudy.results.join("; ")}.`,
    });
  }

  return chunks;
}

export const chunks = buildChunks();
