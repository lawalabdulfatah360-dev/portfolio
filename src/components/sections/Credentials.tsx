"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  ExternalLink,
  Mail,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/components/portfolio-provider";

export function Credentials() {
  const { data } = usePortfolio();
  const {
    education,
    publications,
    certifications,
    memberships,
    referees,
    visibility,
  } = data;

  const hasAnySection =
    visibility.education ||
    visibility.publications ||
    visibility.certifications ||
    visibility.referees;

  if (!hasAnySection) return null;

  return (
    <section
      id="publications"
      className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Publications & Research */}
      {visibility.publications && publications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Publications &amp; Research
              </h2>
              <p className="text-sm text-muted-foreground">
                Peer-reviewed journal articles, conference papers, and statistical distribution research.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {publications.map((pub, idx) => (
              <div
                key={`${pub.title}-${idx}`}
                className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 sm:flex-row sm:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {pub.year}
                    </Badge>
                    {pub.volume && (
                      <Badge variant="outline" className="text-xs">
                        {pub.volume}
                      </Badge>
                    )}
                    {pub.issn && (
                      <span className="text-xs text-muted-foreground">
                        ISSN: {pub.issn}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground">{pub.authors}</p>
                  <p className="text-xs font-medium text-primary">{pub.venue}</p>
                </div>

                {pub.link && (
                  <div className="shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Read Paper
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Education & Certifications Grid */}
      {(visibility.education || visibility.certifications) && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Education */}
          {visibility.education && education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Education
                </h2>
              </div>

              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div
                    key={`${edu.degree}-${idx}`}
                    className="rounded-lg border border-border bg-card p-5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">
                        {edu.degree}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {edu.year}
                      </Badge>
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

          {/* Certifications & Memberships */}
          {visibility.certifications &&
            (certifications.length > 0 || memberships.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Certifications &amp; Memberships
                  </h2>
                </div>

                <div className="space-y-4">
                  {certifications.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Certifications
                      </h3>
                      <ul className="list-outside list-disc space-y-2 pl-5 text-sm text-foreground">
                        {certifications.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {memberships.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Professional Memberships
                      </h3>
                      <ul className="list-outside list-disc space-y-2 pl-5 text-sm text-foreground">
                        {memberships.map((mem, idx) => (
                          <li key={idx}>{mem}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
        </div>
      )}

      {/* Referees */}
      {visibility.referees && referees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Academic &amp; Professional Referees
              </h2>
              <p className="text-sm text-muted-foreground">
                References supporting my academic and consulting work.
              </p>
            </div>
          </div>

          {visibility.showRefereeContacts ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {referees.map((ref, idx) => (
                <div
                  key={`${ref.name}-${idx}`}
                  className="rounded-lg border border-border bg-card p-5 space-y-2"
                >
                  <h3 className="font-semibold text-foreground">{ref.name}</h3>
                  <p className="text-sm font-medium text-primary">
                    {ref.role} · {ref.org}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                    {ref.email && (
                      <a
                        href={`mailto:${ref.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {ref.email}
                      </a>
                    )}
                    {ref.phone && (
                      <a
                        href={`tel:${ref.phone}`}
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {ref.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Detailed referee contact information is available upon request.
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

