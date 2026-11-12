"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/components/portfolio-provider";

export function Projects() {
  const { data } = usePortfolio();
  const { projects } = data;

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Projects
          </h2>
          <p className="text-muted-foreground">
            Selected work in statistical modeling and data analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => (
            <motion.article
              key={`${project.name}-${idx}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ y: -4 }}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <Image
                  src={project.image || "/images/projects/survival-model.png"}
                  alt={project.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col space-y-4 p-5">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((item, tIdx) => (
                    <Badge
                      key={`${item}-${tIdx}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>

                {(project.live || project.github) && (
                  <div className="flex items-center gap-2 pt-1">
                    {project.live && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Live
                        </a>
                      </Button>
                    )}

                    {project.github && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="h-3.5 w-3.5" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
