"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AboutData } from "@/lib/portfolio-types";

export function Hero({ about }: { about: AboutData }) {
  const firstName = (about.name || "Abdulfatai").split(" ")[0];
  const cv = about.cvUrl || "/documents/cv.pdf";

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2"
      >
        <div className="space-y-6">
          <Badge
            variant="secondary"
            className="border border-primary/20 bg-primary/10 px-3 py-1 text-primary"
          >
            {about.availability}
          </Badge>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Hi, I&apos;m {firstName}.
            </h1>
            <h2 className="text-xl font-medium text-muted-foreground sm:text-2xl">
              {about.role}
            </h2>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {about.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" asChild>
              <a href={cv} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                <Mail className="h-4 w-4" />
                Contact Me
              </Link>
            </Button>
          </div>

          <div className="pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              See my work →
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-primary/20 shadow-lg sm:h-80 sm:w-80">
            <Image
              src={about.profileImage || "/images/profile.jpg"}
              alt={`${about.name} — ${about.role}`}
              fill
              priority
              sizes="(max-width: 640px) 256px, 320px"
              className="object-cover"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
