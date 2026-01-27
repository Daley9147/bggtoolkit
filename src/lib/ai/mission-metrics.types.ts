export interface MissionMetricsInput {
  identifier?: string; // Charity Number (UK) or EIN (US)
  country: 'UK' | 'US';
  websiteUrl: string;
  specificUrl?: string; // URL for specific article/case study
  userInsight?: string;
}

export interface MissionMetricsOutput {
  insights: string;
  emailSubjectLines: string[];
  emailBody: string;
  linkedinMessages: string;
  callScript: string;
  followUpSubjectLines: string[];
  followUpBody: string;
  financialData?: any; // Raw data from Charity Commission or ProPublica
}