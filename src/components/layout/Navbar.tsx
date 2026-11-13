"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Github,
  Linkedin,
  Moon,
  Sun,
  Download,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import type { SocialsData } from "@/lib/portfolio-types";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  name: string;
  cvUrl: string;
  socials: SocialsData;
}

export function Navbar({ name, cvUrl, socials }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = (name || "Abdulfatai").split(" ")[0];
  const cv = cvUrl || "/documents/cv.pdf";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const themeLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  const openFrontendAdmin = () => {
    window.dispatchEvent(new CustomEvent("open-frontend-admin"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          {firstName}
          <span className="text-primary">.</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href)
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={themeLabel}
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

          <Button
            variant="outline"
            size="sm"
            onClick={openFrontendAdmin}
            aria-label="Open Admin Mode"
          >
            <Lock className="h-3.5 w-3.5 text-primary" />
            Admin Mode
          </Button>

          <Button size="sm" asChild>
            <a href={cv} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download CV
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={themeLabel}
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
            onClick={() => setMobileOpen((p) => !p)}
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

      {mobileOpen && (
        <div className="border-b border-border bg-background px-4 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  isActive(link.href)
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openFrontendAdmin();
              }}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-muted"
            >
              <Lock className="h-4 w-4" />
              Admin Mode (Edit &amp; Upload)
            </button>
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
              <a href={cv} download target="_blank" rel="noopener noreferrer">
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
