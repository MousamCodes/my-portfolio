import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import ProjectCard from "@/components/projects/ProjectCard";
import { featuredProjects } from "@/data/projects";

export default function FeaturedProjects() {
  return (
    <Section id="projects">
      <SectionHeader
        eyebrow="Featured work"
        title="Projects with real architecture behind them"
        description="Each one opens into a product-style case study: problem, solution, architecture, challenges and results."
        action={
          <Button href="/projects" variant="secondary">
            All projects <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08} className="h-full">
            <ProjectCard project={p} className="h-full" />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
