"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fade-up on scroll. Initial styles are identical on server and client so the
 * markup hydrates cleanly; MotionConfig in the root layout honours
 * prefers-reduced-motion by skipping the transform.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
