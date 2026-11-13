import { about } from "@/data/about";
import { socials } from "@/data/socials";
import { skills } from "@/data/skills";
import { experience, type Experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { education } from "@/data/education";
import { publications } from "@/data/publications";
import { certifications, memberships } from "@/data/certifications";
import { referees } from "@/data/referees";
import { seo } from "@/lib/seo";

export type { Experience };

export interface QuickFact {
  label: string;
  value: string;
}

export interface AboutData {
  name: string;
  role: string;
  tagline: string;
  location: string;
  yearsExperience: string;
  availability: string;
  email: string;
  phone: string;
  profileImage: string;
  cvUrl: string;
  bio: string[];
  quickFacts: QuickFact[];
}

export interface SocialsData {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  formspreeUrl?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string[];
  live: string;
  github: string;
  image: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  location: string;
  year: string;
  grade: string;
}

export interface PublicationItem {
  title: string;
  authors: string;
  venue: string;
  year: string;
  volume?: string;
  issn?: string;
  link?: string;
}

export interface RefereeItem {
  name: string;
  role: string;
  org: string;
  phone: string;
  email: string;
}

export interface SeoData {
  title: string;
  description: string;
  author: string;
  url: string;
  keywords: string[];
  ogImage: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SectionVisibility {
  education: boolean;
  publications: boolean;
  certifications: boolean;
  referees: boolean;
  showRefereeContacts: boolean;
}

/** Everything that is publicly rendered on the site. */
export interface PortfolioContent {
  about: AboutData;
  socials: SocialsData;
  skills: SkillGroup[];
  experience: Experience[];
  projects: ProjectItem[];
  education: EducationItem[];
  publications: PublicationItem[];
  certifications: string[];
  memberships: string[];
  referees: RefereeItem[];
  seo: SeoData;
  visibility: SectionVisibility;
}

/** Admin-side working copy: public content plus private inbox. */
export interface PortfolioData extends PortfolioContent {
  messages: ContactMessage[];
}

export const defaultContent: PortfolioContent = {
  about: {
    ...about,
    profileImage: "/images/profile.jpg",
    cvUrl: "/documents/cv.pdf",
  },
  socials: { ...socials, formspreeUrl: "" },
  skills,
  experience,
  projects,
  education,
  publications,
  certifications,
  memberships,
  referees,
  seo,
  visibility: {
    education: true,
    publications: true,
    certifications: true,
    referees: true,
    showRefereeContacts: false,
  },
};

/** Fill in any fields missing from stored data (e.g. after adding new fields). */
export function withDefaults(
  stored: Partial<PortfolioContent> | null
): PortfolioContent {
  if (!stored) return defaultContent;
  return {
    ...defaultContent,
    ...stored,
    about: { ...defaultContent.about, ...(stored.about ?? {}) },
    socials: { ...defaultContent.socials, ...(stored.socials ?? {}) },
    seo: { ...defaultContent.seo, ...(stored.seo ?? {}) },
    visibility: { ...defaultContent.visibility, ...(stored.visibility ?? {}) },
  };
}
