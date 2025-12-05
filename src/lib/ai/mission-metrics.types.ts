export interface MissionMetricsInput {
  charityNumber: string;
  websiteUrl: string;
  specificUrl?: string; // URL for specific article/case study
  userInsight?: string;
}

export interface MissionMetricsNonCharityInput {
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
  financialData?: any; // Raw data from Charity Commission, optional for non-charities
}
