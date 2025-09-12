import type { LucideIcon } from 'lucide-react';

export type ContentDetail = {
  id: string;
  summary: string;
  details: string;
};

export type IconName = keyof typeof import('lucide-react');

type BaseSection = {
  id: string;
  title: string;
  icon: IconName;
};

export type ContentSection = BaseSection & {
  id: 'founder' | 'method' | 'testimonials' | 'objections' | 'competition';
  content: ContentDetail[];
};

export type ProgramFeature = {
  feature: string;
  elevate: string | boolean;
  intensive: string | boolean;
  boardroom: string | boolean;
};

export type ProgramSection = BaseSection & {
  id: 'programs';
  description: string;
  features: ProgramFeature[];
};

export type SectionData = ContentSection | ProgramSection;

export type Bookmark = {
    id: string;
    summary: string;
    details: string;
    sectionTitle: string;
};
