import { Brain, Code2, Layout, Server, Workflow } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import { profile } from "@/data/profile";

const icons = [Code2, Brain, Layout, Server, Workflow];

export default function SkillsGrid() {
  return (
    <Section id="skills">
      <SectionHeader
        eyebrow="Skills"
        title="A full-stack toolkit with an AI core"
        description="Comfortable from model training to deployed product: Python and TypeScript, TensorFlow and Next.js, vector search and background jobs."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((group, i) => {
          const Icon = icons[i % icons.length];
          return (
            <Reveal key={group.group} delay={i * 0.06}>
              <div className="card h-full p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-accent-2">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-white">{group.group}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((s) => (
                    <Badge key={s} tone={i === 1 ? "accent" : "neutral"}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
        <Reveal delay={0.3}>
          <div className="card h-full bg-gradient-to-br from-accent/15 to-accent-2/10 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">Currently exploring</p>
            <ul className="mt-3 space-y-2 text-sm text-fg/90">
              <li>· Agentic workflows and tool-use with LLMs</li>
              <li>· Real-time audio pipelines and latency tuning</li>
              <li>· Evaluation and grounding for RAG systems</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
