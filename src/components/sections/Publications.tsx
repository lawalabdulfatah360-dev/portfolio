"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PublicationItem } from "@/lib/portfolio-types";

export function Publications({ publications }: { publications: PublicationItem[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Publications &amp; Research
          </h1>
          <p className="text-muted-foreground">
            Journal articles, conference papers, and statistical distribution research.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {publications.map((pub, idx) => (
            <motion.article
              key={`${pub.title}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 sm:flex-row sm:items-center"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{pub.year}</Badge>
                  {pub.volume && <Badge variant="outline" className="text-xs">{pub.volume}</Badge>}
                  {pub.issn && <span className="text-xs text-muted-foreground">ISSN: {pub.issn}</span>}
                </div>
                <h2 className="font-semibold text-foreground">{pub.title}</h2>
                <p className="text-sm text-muted-foreground">{pub.authors}</p>
                <p className="text-xs font-medium text-primary">{pub.venue}</p>
              </div>

              {pub.link && (
                <div className="shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <a href={pub.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Read Paper
                    </a>
                  </Button>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

