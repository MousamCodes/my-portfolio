import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/Section";
import ProjectsExplorer from "@/components/projects/ProjectsExplorer";

export const metadata: Metadata = {
  title: "Projects",
  description: "AI, full-stack and backend projects by Mousam Podder, each with a product-style case study.",
};

export default function ProjectsPage() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Projects"
        title="Everything I've built"
        description="Filter by area. Every card opens a case study with the problem, architecture, challenges and results."
      />
      <ProjectsExplorer />
    </Section>
  );
}
