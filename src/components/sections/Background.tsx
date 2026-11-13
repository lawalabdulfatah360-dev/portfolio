"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, Users, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  EducationItem,
  RefereeItem,
  SectionVisibility,
} from "@/lib/portfolio-types";

interface BackgroundProps {
  education: EducationItem[];
  certifications: string[];
  memberships: string[];
  referees: RefereeItem[];
  visibility: SectionVisibility;
}

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;

function Heading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{children}</h2>
    </div>
  );
}

export function Background({
  education,
  certifications,
  memberships,
  referees,
  visibility,
}: BackgroundProps) {
  const showEdu = visibility.education && education.length > 0;
  const showCerts =
    visibility.certifications && (certifications.length > 0 || memberships.length > 0);
  const showRefs = visibility.referees && referees.length > 0;

  if (!showEdu && !showCerts && !showRefs) return null;

  return (
    <section className="mx-auto max-w-6xl space-y-16 px-4 pb-20 sm:px-6 lg:px-8">
      {(showEdu || showCerts) && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {showEdu && (
            <motion.div {...fade} className="space-y-6">
              <Heading icon={GraduationCap}>Education</Heading>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={`${edu.degree}-${idx}`} className="space-y-2 rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                      <Badge variant="secondary" className="text-xs">{edu.year}</Badge>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      {edu.school} · {edu.location}
                    </p>
                    {edu.grade && (
                      <p className="text-xs text-muted-foreground">
                        CGPA / Grade: <span className="font-medium text-foreground">{edu.grade}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {showCerts && (
            <motion.div {...fade} className="space-y-6">
              <Heading icon={Award}>Certifications &amp; Memberships</Heading>
              <div className="space-y-4">
                {certifications.length > 0 && (
                  <div className="space-y-3 rounded-lg border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Certifications</h3>
                    <ul className="list-outside list-disc space-y-2 pl-5 text-sm text-foreground">
                      {certifications.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {memberships.length > 0 && (
                  <div className="space-y-3 rounded-lg border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Professional Memberships</h3>
                    <ul className="list-outside list-disc space-y-2 pl-5 text-sm text-foreground">
                      {memberships.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {showRefs && (
        <motion.div {...fade} className="space-y-6">
          <Heading icon={Users}>Referees</Heading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {referees.map((ref, idx) => (
              <div key={`${ref.name}-${idx}`} className="space-y-2 rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{ref.name}</h3>
                <p className="text-sm font-medium text-primary">{ref.role} · {ref.org}</p>
                {visibility.showRefereeContacts ? (
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                    {ref.email && (
                      <a href={`mailto:${ref.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Mail className="h-3.5 w-3.5" />{ref.email}
                      </a>
                    )}
                    {ref.phone && (
                      <a href={`tel:${ref.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" />{ref.phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="pt-1 text-xs text-muted-foreground">Contact details available on request.</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}

