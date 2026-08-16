"use client";

import { motion } from "framer-motion";

export function ResultsLoadingBar() {
  return (
    <div aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full w-1/3 rounded-full bg-gradient-hero"
        initial={false}
        animate={{ x: ["-120%", "340%"] }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
      />
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.4) }}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}