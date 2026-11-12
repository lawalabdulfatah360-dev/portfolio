"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/components/portfolio-provider";

export function About() {
  const { data } = usePortfolio();
  const { about } = data;

  return (
    <section
      id="about"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          About Me
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Bio Paragraphs (2/3) */}
          <div className="space-y-4 leading-relaxed text-muted-foreground md:col-span-2">
            {about.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Quick Facts Card (1/3) */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Facts
            </h3>
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
