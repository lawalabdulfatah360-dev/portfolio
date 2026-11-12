"use client";

import React, { useState } from "react";
import { Mail, Phone, Linkedin, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePortfolio } from "@/components/portfolio-provider";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const { data, refresh } = usePortfolio();
  const { socials } = data;
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        message: String(formData.get("message") ?? ""),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Optional Formspree forwarding if configured in the Admin Portal
      if (socials.formspreeUrl) {
        await fetch(socials.formspreeUrl, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
      }

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      setStatus("sent");
      form.reset();
      await refresh();
    } catch {
      setStatus("error");
    }
  };

  const contactLinks = [
    {
      label: "Email",
      value: socials.email,
      href: `mailto:${socials.email}`,
      icon: Mail,
      external: false,
    },
    {
      label: "Phone",
      value: socials.phone,
      href: `tel:${socials.phone}`,
      icon: Phone,
      external: false,
    },
    {
      label: "LinkedIn",
      value: socials.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      href: socials.linkedin,
      icon: Linkedin,
      external: true,
    },
    {
      label: "GitHub",
      value: socials.github.replace(/^https?:\/\/(www\.)?/, ""),
      href: socials.github,
      icon: Github,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Get In Touch
          </h2>
          <p className="text-muted-foreground">
            Have a project or role in mind? Let&apos;s talk.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: Contact Link Cards */}
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
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Right: Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-border bg-card p-6"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-foreground"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Tell me about your project or opportunity..."
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "sending"}
            >
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending..." : "Send Message"}
            </Button>

            {status === "sent" && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Thank you! Your message has been received.
              </p>
            )}

            {status === "error" && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Something went wrong. Please try again or email me directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
