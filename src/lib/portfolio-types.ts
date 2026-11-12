import { about } from "@/data/about";
import { socials } from "@/data/socials";
import { skills } from "@/data/skills";
import { experience, type Experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { education } from "@/data/education";
import { publications } from "@/data/publications";
import { certifications, memberships } from "@/data/certifications";
import { referees } from "@/data/referees";
import { seo } from "@/data/seo-fallback";

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

export interface PortfolioData {
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
  messages: ContactMessage[];
}

export const defaultPortfolioData: PortfolioData = {
  about: {
    ...about,
    profileImage: "/images/profile.jpg",
    cvUrl: "/documents/cv.pdf",
  },
  socials: {
    ...socials,
    formspreeUrl: "",
  },
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
    showRefereeContacts: true,
  },
  messages: [],
};

