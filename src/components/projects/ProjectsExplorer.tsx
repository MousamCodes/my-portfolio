"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProjectCard from "./ProjectCard";
import { allCategories, projects, type ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";

export default function ProjectsExplorer() {
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const list = useMemo(() => (active === "All" ? projects : projects.filter((p) => p.categories.includes(active))), [active]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {(["All", ...allCategories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition",
              active === c ? "border-accent/60 bg-accent/15 text-white" : "border-border text-muted hover:border-border-strong hover:text-fg",
            )}
          >
            {c}
            <span className="ml-1.5 font-mono text-[10px] text-muted">{c === "All" ? projects.length : projects.filter((p) => p.categories.includes(c)).length}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <ProjectCard project={p} className="h-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
