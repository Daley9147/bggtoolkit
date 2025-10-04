import { Tables } from './supabase/database.types';

export * from './supabase/database.types';

export type Profile = Tables<'profiles'>;

export type IconName = keyof typeof import('lucide-react');

export interface Bookmark {
  id: string;
  summary: string;
  details: string;
  sectionTitle: string;
}

export interface ProgramSection {
  id: 'programs';
  title: string;
  description: string;
  icon: IconName;
  features: {
    feature: string;
    elevate: string | boolean;
    intensive: string | boolean;
    boardroom: string | boolean;
  }[];
}

export interface ContentSection {
  id: string;
  title: string;
  icon: IconName;
  content: {
    id: string;
    summary: string;
    details: string;
  }[];
}

export type SectionData = ContentSection | ProgramSection;

export type OutreachTemplate = Tables<'outreach_templates'>;

export type Company = Tables<'companies'> & {
  outreach_templates: OutreachTemplate[];
};
