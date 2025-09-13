import type { SectionData } from './types';

export const allSections: SectionData[] = [
  {
    id: 'about-bgg',
    title: 'About Business Growth Global',
    icon: 'Building2',
    content: [
      {
        id: 'bgg-1',
        summary: 'Our Methodology',
        details: 'We use the Business Growth Blueprint methodology for entrepreneurs, startups, and corporates. Our clients are experts in their business; we provide the frameworks and mentoring to help them delegate operations and focus on strategy.',
      },
      {
        id: 'bgg-2',
        summary: 'Services Offered',
        details: 'We offer entrepreneur mentoring, startup coaching, and corporate executive mentoring to help businesses scale effectively.',
      },
      {
        id: 'bgg-3',
        summary: 'Expected Outcomes',
        details: 'Our programs are designed to increase revenue & profit, operational efficiency, customer growth, and team performance.',
      },
       {
        id: 'bgg-4',
        summary: 'Our Mission',
        details: 'To free business owners from working in the business, empowering them to work on the business and achieve scalable growth.',
      },
      {
        id: 'bgg-5',
        summary: '12-Month ROI Guarantee',
        details: 'We guarantee you will see at least double your return on investment within 12 months, or we will refund your program fee in full.',
      },
      {
        id: 'bgg-6',
        summary: '3-Month Satisfaction Guarantee',
        details: 'If you feel our approach is not aligned with your goals after the first three months, we offer a 50% refund.',
      },
    ],
  },
  {
    id: 'about-lee',
    title: 'About Lee Broders',
    icon: 'User',
    content: [
      {
        id: 'lee-1',
        summary: 'Entrepreneurial Background',
        details: 'Lee started his first business at 26 after 10 years in the British Army. He has over 20 years of entrepreneurial experience across private and public sectors, including property management, photography, and legal services.',
      },
      {
        id: 'lee-2',
        summary: 'Core Skills',
        details: 'Lee excels in assessment & analysis, strategy & implementation, and leadership. He is known for his positive, personable, emotionally intelligent, and adaptive approach.',
      },
      {
        id: 'lee-3',
        summary: 'Credentials',
        details: 'Lee is a private pilot, an accredited Mediator, and holds a Master of Laws (LLM).',
      },
      {
        id: 'lee-4',
        summary: 'Personal Philosophy',
        details: 'Lee believes everyone can live a fulfilled life. His mission is to remove barriers, build confidence, and empower growth for business owners.',
      },
      {
        id: 'lee-5',
        summary: 'Values & Global Goals',
        details: 'Lee is committed to continuous learning and aligning his work with the UN Sustainable Development Goals, specifically No Poverty and Partnerships for the Goals.',
      },
    ],
  },
  {
    id: 'about-program',
    title: 'About the Program',
    icon: 'Target',
    content: [
        {
            id: 'program-1',
            summary: 'Target Clients',
            details: 'Our programs are designed for entrepreneurs, startups, and corporates seeking sustainable growth.',
        },
        {
            id: 'program-2',
            summary: 'Core Design Principles',
            details: 'We focus on sustainable growth, not quick wins. The program is mentor-led, providing guidance, accountability, and emotional support based on our Business Growth Blueprint and AEROPS framework.',
        },
        {
            id: 'program-3',
            summary: 'Key Focus Areas',
            details: 'The curriculum centers on scaling revenue, improving operational efficiency, leadership development, and effective team building.',
        },
        {
            id: 'program-4',
            summary: 'Program Format',
            details: 'We require a 12-month minimum commitment, which includes structured mentoring sessions, regular strategy reviews, and access to crisis calls when you need them most.',
        },
    ]
  },
   {
    id: 'aerops',
    title: 'AEROPS Framework',
    icon: 'Workflow',
    content: [
      {
        id: 'aerops-1',
        summary: 'A – Analyse',
        details: 'Identify strengths and weaknesses within your business to build a clear picture of your current state.',
      },
      {
        id: 'aerops-2',
        summary: 'E – Expand',
        details: 'Develop strategies to grow your customer base and maximize profit potential.',
      },
      {
        id: 'aerops-3',
        summary: 'R – Revenue',
        details: 'Map and optimise all income streams to ensure financial health and scalability.',
      },
      {
        id: 'aerops-4',
        summary: 'O – Operation',
        details: 'Improve and streamline systems and processes for maximum efficiency.',
      },
      {
        id: 'aerops-5',
        summary: 'P – People',
        details: 'Develop your team to foster innovation, productivity, and a positive culture.',
      },
      {
        id: 'aerops-6',
        summary: 'S – Success',
        details: 'Achieve a state where the business thrives independently of the owner\'s daily involvement.',
      },
    ],
  },
  {
    id: 'programs',
    title: 'Programs',
    icon: 'Briefcase',
    description: 'All programs are 12-month enrolments and include our ROI & Satisfaction Guarantees. They are mentor-led and based on the Business Growth Blueprint + AEROPS framework.',
    features: [
      { feature: 'Sessions', elevate: '24 × 45-min', intensive: '48 × 45-min', boardroom: '24 × 1-to-1 + 24 group' },
      { feature: 'Crisis Calls (15 min)', elevate: '1 per week', intensive: '2 per week', boardroom: '1 per week' },
      { feature: 'Strategy/Action Reviews', elevate: '6 per year', intensive: '12 per year', boardroom: '12 per year' },
      { feature: 'Participants', elevate: '1', intensive: '1', boardroom: 'Up to 3' },
      { feature: 'Price', elevate: '£1,500/month', intensive: '£2,500/month', boardroom: '£5,000/month' },
    ],
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    icon: 'Star',
    content: [
      {
        id: 'testimonial-1',
        summary: 'Client Testimonial Snippet 1',
        details: 'Full testimonial content for snippet 1 goes here. This section can be expanded to provide more detail.',
      },
      {
        id: 'testimonial-2',
        summary: 'Client Testimonial Snippet 2',
        details: 'Full testimonial content for snippet 2 goes here. This section can be expanded to provide more detail.',
      },
      {
        id: 'case-study-1',
        summary: 'Case Study: Client A',
        details: 'A brief summary of the case study for Client A, with a link to the full story if available.',
      },
      {
        id: 'stats-1',
        summary: 'Key Performance Stat',
        details: 'Example: 85% average revenue growth across all clients in the first 12 months.',
      },
    ],
  },
];
