"use client";

import React from "react";
import { motion } from "framer-motion";
import type { AboutData } from "@/lib/portfolio-types";

export function About({ about }: { about: AboutData }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          About Me
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4 leading-relaxed text-muted-foreground md:col-span-2">
            {about.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="h-fit rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Facts
            </h2>
            <dl className="space-y-4">
              {about.quickFacts.map((fact, idx) => (
                <div key={`${fact.label}-${idx}`} className="space-y-1">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="font-medium text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
