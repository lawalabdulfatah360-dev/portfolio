"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { SkillGroup } from "@/lib/portfolio-types";

export function Skills({ skills }: { skills: SkillGroup[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Skills</h1>
          <p className="text-muted-foreground">
            Tools and techniques I use to turn raw data into insight.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {skills.map((group, index) => (
            <motion.div
              key={`${group.category}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">{group.category}</h2>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item, idx) => (
                  <Badge key={`${item}-${idx}`} variant="secondary">{item}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
