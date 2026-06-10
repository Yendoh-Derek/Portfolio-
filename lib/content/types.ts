export interface ProjectFeature {
  icon: string;
  title: string;
  description: string;
}

export interface TechCategory {
  category: "AI/ML" | "Backend" | "Frontend" | "Infra" | "Mobile" | "Other";
  items: string[];
}

export interface TechnicalDecision {
  title: string;
  rationale: string;
}

export interface ProjectImpact {
  metrics?: { label: string; value: string }[];
  summary: string;
}

export interface ProjectDetails {
  problem: string;
  solution: string;
  features: ProjectFeature[];
  architecture: string;
  techStack: TechCategory[];
  decisions: TechnicalDecision[];
  impact: ProjectImpact;
  relatedSlugs?: string[];
  disclaimer?: string;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  githubUrl: string;
  tech: string[];
  order: number;
  details?: ProjectDetails;
  isOpenSource?: boolean;
  isPrivate?: boolean;
}

export type ExperienceType = "Experience" | "Education" | "Certification";

export interface Experience {
  id?: string;
  type: ExperienceType;
  role: string;
  company: string;
  period: string;
  location: string;
  logo?: string;
  description: string[];
  /** Optional skill tags — used mainly for certifications */
  skills?: string[];
  order: number;
}

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Tools"
  | "AI/ML"
  | "Database"
  | "Other";

export interface Skill {
  id?: string;
  name: string;
  category: SkillCategory;
  level: number;
  experience: string;
  order?: number;
  icon?: string;
}

export interface ProfileLinks {
  github: string;
  linkedin?: string;
  portfolio?: string;
  instagram?: string;
  twitter?: string;
}

export interface AboutSectionBlock {
  title: string;
  content: string;
}

export interface AboutContent {
  imageUrl: string;
  quote: string;
  sections: AboutSectionBlock[];
  label?: string;
}

export interface Profile {
  personal: {
    name: string;
    shortName?: string;
    title: string;
    tagline?: string;
    footerBio?: string;
    email: string;
    phone?: string;
    links: ProfileLinks;
    location: string;
  };
  about?: AboutContent;
  skillsSummary: {
    languages: string[];
    software: string[];
  };
}

export interface ServicesCard {
  number?: string;
  title: string;
  description: string;
  items?: string[];
  metric?: string;
  icon?: string;
}

export interface ServicesContent {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  problems: {
    heading: string;
    items: ServicesCard[];
  };
  offer: {
    icon: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  pillars: {
    heading: string;
    items: ServicesCard[];
  };
  outcomes: {
    heading: string;
    items: ServicesCard[];
  };
  process: {
    heading: string;
    steps: ServicesCard[];
  };
  finalCta: {
    title: string;
    description: string;
    ctaLabel: string;
  };
}

/** Shape passed to the Gemini system prompt (mirrors legacy PORTFOLIO_DATA). */
export interface PortfolioSnapshot {
  personal: Profile["personal"];
  about?: AboutContent;
  skills: Profile["skillsSummary"];
  skillsDetail: Skill[];
  experience: Experience[];
  projects: Project[];
}
