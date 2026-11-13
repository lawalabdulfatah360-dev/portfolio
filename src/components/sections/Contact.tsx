"use client";

import React, { useState } from "react";
import { Mail, Phone, Linkedin, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SocialsData } from "@/lib/portfolio-types";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ socials }: { socials: SocialsData }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    setErrorText("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          message: String(formData.get("message") ?? ""),
          company: String(formData.get("company") ?? ""),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to send");
      }

      // Optional email forwarding, configured in the admin portal.
      if (socials.formspreeUrl) {
        formData.delete("company");
        await fetch(socials.formspreeUrl, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }).catch(() => undefined);
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "");
      setStatus("error");
    }
  };

  const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");
  const contactLinks = [
    { label: "Email", value: socials.email, href: `mailto:${socials.email}`, icon: Mail, external: false },
    { label: "Phone", value: socials.phone, href: `tel:${socials.phone}`, icon: Phone, external: false },
    { label: "LinkedIn", value: strip(socials.linkedin), href: socials.linkedin, icon: Linkedin, external: true },
    { label: "GitHub", value: strip(socials.github), href: socials.github, icon: Github, external: true },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get In Touch</h1>
          <p className="text-muted-foreground">Have a project or role in mind? Let&apos;s talk.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {contactLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
                >
                  <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </a>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
              <Input id="name" name="name" placeholder="Your full name" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Tell me about your project or opportunity..."
                required
                maxLength={5000}
              />
            </div>
            {/* Honeypot — hidden from people, catches spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <Button type="submit" className="w-full" disabled={status === "sending"}>
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending..." : "Send Message"}
            </Button>

            <div aria-live="polite">
              {status === "sent" && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Thank you! Your message has been received.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {errorText || "Something went wrong."} Please try again or email me directly.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
