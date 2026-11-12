"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePortfolio } from "@/components/portfolio-provider";

export function Experience() {
  const { data } = usePortfolio();
  const { experience } = data;

  return (
    <section
      id="experience"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="space-y-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Experience
          </h2>
          <p className="text-muted-foreground">
            Where I&apos;ve applied statistics to real-world problems.
          </p>
        </div>

        <div className="relative ml-3 space-y-12 border-l border-border pl-8">
          {experience.map((job, idx) => (
            <motion.div
              key={`${job.company}-${job.start}-${idx}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.08,
                ease: "easeOut",
              }}
              className="relative space-y-3"
            >
              <span className="absolute -left-[41px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Briefcase className="h-3 w-3" />
              </span>

              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {job.role}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {job.start} – {job.end}
                </span>
              </div>

              <p className="text-sm font-medium text-primary">
                {job.company} · {job.location}
              </p>

              <ul className="list-outside list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {job.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-1">
                {job.tech.map((t, tIdx) => (
                  <Badge key={`${t}-${tIdx}`} variant="outline" className="text-xs">
                    {t}
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
