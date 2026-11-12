"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/components/portfolio-provider";

export function Skills() {
  const { data } = usePortfolio();
  const { skills } = data;

  return (
    <section
      id="skills"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Skills
          </h2>
          <p className="text-muted-foreground">
            Tools and techniques I use to turn raw data into insight.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {skills.map((group, index) => (
            <motion.div
              key={`${group.category}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item, idx) => (
                  <Badge key={`${item}-${idx}`} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
