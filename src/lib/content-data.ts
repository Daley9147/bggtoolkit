import type { SectionData } from './types';

export const allSections: SectionData[] = [
  {
    id: 'qualification-questions',
    title: 'Qualification Questions',
    icon: 'HelpCircle',
    content: [
      {
        id: 'decision-maker',
        summary: '1. Decision Maker',
        details: 'Question: “Are you the main decision maker for data strategy and investments?”\nIf no: → “Who else needs to be involved (e.g., Board, CEO)?”',
      },
      {
        id: 'data-readiness',
        summary: '2. Data Readiness',
        details: 'Question: “How do you currently track your impact and outcomes?”\nPurpose: Assess if they are drowning in spreadsheets or have no system at all.',
      },
      {
        id: 'pain-points',
        summary: '3. Pain Points',
        details: 'Question: “What is the biggest challenge you face when creating reports for donors or the board?”\nPurpose: Identify time wasted on manual data entry or lack of clarity.',
      },
      {
        id: 'budget-awareness',
        summary: '4. Budget Awareness',
        details: 'Question: “Our plans start from a very accessible price point for nonprofits. Do you have a budget allocated for M&E or digital tools?”\nPurpose: Confirm financial viability.',
      },
      {
        id: 'timeline',
        summary: '5. Timeline',
        details: 'Question: “When do you need to have your next major impact report ready?”\nPurpose: Create urgency.',
      },
    ],
  },
  {
    id: 'about-mission-metrics',
    title: 'About Mission Metrics',
    icon: 'Building2',
    content: [
      {
        id: 'mm-1',
        summary: 'Overview',
        details: 'MissionMetrics exists to democratize powerful data analytics for the not-for-profit sector. We combine cutting-edge AI with deep sector expertise to help organizations of all sizes move from "guessing" to "knowing".',
      },
      {
        id: 'mm-2',
        summary: 'Mission',
        details: 'To provide clarity and confidence for data-driven decisions, regardless of an organization\'s size or budget.',
      },
      {
        id: 'mm-3',
        summary: 'Core Value Proposition',
        details: 'We help nonprofits organize messy data, automate reporting, and generate predictive insights to improve donor retention and program outcomes.',
      },
       {
        id: 'mm-4',
        summary: 'Human-Led Strategy',
        details: 'We are not just a tool. We provide expert analyst support for data audits, custom metric design, and ongoing strategic consultation.',
      },
    ],
  },
  {
    id: 'mission-metrics-engine',
    title: 'The Mission Metrics Engine',
    icon: 'Workflow',
    content: [
      {
        id: 'engine-1',
        summary: 'What is it?',
        details: 'The Mission Metrics Engine is our AI-powered intelligence core that connects to your data sources, learns your organization\'s voice, and automates complex analysis.',
      },
      {
        id: 'engine-2',
        summary: 'Step 1: Data Model & Cleaning',
        details: 'We ingest your raw data (spreadsheets, CRMs), clean it, and structure it into a coherent data model ready for analysis.',
      },
      {
        id: 'engine-3',
        summary: 'Step 2: Visualization',
        details: 'Data is visualized through interactive, analyst-built Power BI dashboards that provide real-time visibility into key performance indicators.',
      },
      {
        id: 'engine-4',
        summary: 'Step 3: AI Analysis',
        details: 'Our AI analyzes trends and patterns to provide predictive modeling, helping you forecast donor behavior and program impact.',
      },
      {
        id: 'engine-5',
        summary: 'Step 4: Insights',
        details: 'We don\'t just give you charts. We provide actionable insights and strategic roadmaps to help you make better decisions.',
      },
    ],
  },
  {
    id: 'programs',
    title: 'Plans & Pricing',
    icon: 'Briefcase',
    description: 'We offer three tiers designed to meet the needs of nonprofits at different stages of their data journey.',
    features: [
      { feature: 'Target Audience', clarity: 'Small Nonprofits', performance: 'Growing Orgs', enterprise: 'Large/Complex Orgs' },
      { feature: 'Dashboards', clarity: '1 Overview Dashboard', performance: '3 Dept. Dashboards', enterprise: 'Fully Custom' },
      { feature: 'User Seats', clarity: '1 User', performance: '5 Users', enterprise: 'Unlimited' },
      { feature: 'Impact Reports', clarity: 'Monthly', performance: 'Weekly', enterprise: 'Unlimited' },
      { feature: 'Data Cleaning', clarity: true, performance: true, enterprise: true },
      { feature: 'Prediction Models', clarity: false, performance: '1 Model', enterprise: 'All Models' },
      { feature: 'Analyst Support', clarity: 'Email Support', performance: 'Monthly Review', enterprise: 'Dedicated Analyst' },
      { feature: 'Custom KPIs', clarity: false, performance: true, enterprise: true },
      { feature: 'Secure Data Connection', clarity: true, performance: true, enterprise: true },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: 'HelpCircle',
    content: [
      {
        id: 'faq-1',
        summary: 'Do I need a data expert on my team?',
        details: 'No. MissionMetrics is designed to be your data team. We handle the technical heavy lifting (cleaning, modeling, visualization) so you can focus on the insights.',
      },
      {
        id: 'faq-2',
        summary: 'Is my data secure?',
        details: 'Yes. We use enterprise-grade encryption and role-based access control to ensure your sensitive donor and beneficiary data is protected.',
      },
      {
        id: 'faq-3',
        summary: 'Can you integrate with our existing CRM?',
        details: 'Yes. The Mission Metrics Engine is designed to connect with various data sources, including popular CRMs and spreadsheet formats.',
      },
      {
        id: 'faq-4',
        summary: 'What is "Predictive Modeling"?',
        details: 'It uses historical data to forecast future trends. For example, we can help predict which donors are at risk of churning or forecast the potential impact of a program intervention.',
      },
      {
        id: 'faq-5',
        summary: 'How long does it take to get started?',
        details: 'Our onboarding process is streamlined. Once we have access to your data, we can typically have your initial dashboards and reports ready within a few weeks.',
      },
    ],
  }
];