"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Wrench,
  Briefcase,
  FolderKanban,
  BookOpen,
  Mail,
  ArrowRight,
} from "lucide-react";

interface ExploreProps {
  counts: {
    skills: number;
    experience: number;
    projects: number;
    publications: number;
  };
  showPublications: boolean;
}

export function Explore({ counts, showPublications }: ExploreProps) {
  const items = [
    { href: "/about", label: "About Me", desc: "Background, education & credentials", icon: User },
    { href: "/skills", label: "Skills", desc: `${counts.skills} tools & techniques`, icon: Wrench },
    { href: "/experience", label: "Experience", desc: `${counts.experience} roles in research & analytics`, icon: Briefcase },
    { href: "/projects", label: "Projects", desc: `${counts.projects} selected projects`, icon: FolderKanban },
    ...(showPublications
      ? [{ href: "/publications", label: "Publications", desc: `${counts.publications} papers & conference talks`, icon: BookOpen }]
      : []),
    { href: "/contact", label: "Contact", desc: "Get in touch about a role or project", icon: Mail },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8" aria-labelledby="explore-heading">
      <h2 id="explore-heading" className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Explore
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={item.href}
                className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

