"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/components/portfolio-provider";

export function CVDownload() {
  const { data } = usePortfolio();
  const cvUrl = data.about.cvUrl || "/documents/cv.pdf";

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8 md:flex-row md:p-12"
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="rounded-full bg-primary/10 p-3">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-foreground">
              My Curriculum Vitae
            </h3>
            <p className="text-sm text-muted-foreground">
              Full details of my education, publications, and experience.
            </p>
          </div>
        </div>

        <Button size="lg" asChild>
          <a href={cvUrl} download>
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
