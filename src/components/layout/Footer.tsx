import React from "react";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
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
        <p className="text-sm text-muted-foreground">
          &copy; {year} {name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className={iconClass}>
            <Github className="h-4 w-4" />
          </a>
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className={iconClass}>
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={`mailto:${socials.email}`} aria-label="Send email" className={iconClass}>
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
