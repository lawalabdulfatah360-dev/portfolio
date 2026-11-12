"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Github,
  Linkedin,
  Moon,
  Sun,
  Download,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { usePortfolio } from "@/components/portfolio-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "#about", id: "about" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Publications", href: "#publications", id: "publications" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { data } = usePortfolio();
  const { about, socials } = data;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const firstName = (about.name || "Abdulfatai").split(" ")[0];
  const cvUrl = about.cvUrl || "/documents/cv.pdf";

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary Navigation"
      >
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          {firstName}
          <span className="text-primary">.</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin" aria-label="Admin Portal">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>

          <Button size="sm" className="ml-2" asChild>
            <a href={cvUrl} download>
              <Download className="h-4 w-4" />
              Download CV
            </a>
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="border-b border-border bg-background px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Admin Portal
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <Button size="sm" asChild>
              <a href={cvUrl} download>
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
