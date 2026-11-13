"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, ArrowUp, Lock } from "lucide-react";
import type { SocialsData } from "@/lib/portfolio-types";

interface FooterProps {
  name: string;
  socials: SocialsData;
}

export function Footer({ name, socials }: FooterProps) {
  const year = new Date().getFullYear();
  const iconClass =
    "rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <p>
            &copy; {year} {name}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-frontend-admin"))
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            <Lock className="h-3 w-3" />
            Admin Mode
          </button>
          <Link
            href="/admin"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Full Admin Studio
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className={iconClass}
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className={iconClass}
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href={`mailto:${socials.email}`}
            aria-label="Send email"
            className={iconClass}
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href="#main-content"
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
