"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, ArrowUp, Settings } from "lucide-react";
import { usePortfolio } from "@/components/portfolio-provider";

export function Footer() {
  const { data } = usePortfolio();
  const { about, socials } = data;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {about.name}. All rights reserved.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            <Settings className="h-3.5 w-3.5" />
            Admin Portal
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>

          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" />
          </a>

          <a
            href={`mailto:${socials.email}`}
            aria-label="Send email"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
          </a>

          <a
            href="#top"
            aria-label="Back to top"
            className="ml-2 inline-flex items-center justify-center rounded-md border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
