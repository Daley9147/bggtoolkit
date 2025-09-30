// /src/lib/case-studies.ts

export interface CaseStudy {
  id: number;
  industry: string;
  headline: string;
  overview: {
    challenge: string;
    solution: string;
    keyResults: string[];
  };
  story: string;
  testimonial: {
    quote: string;
    author: string;
  };
}

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    industry: 'UK Food Producer',
    headline: '£468k → £1.248m in 12 months (+167%); founder halves time in ops',
    overview: {
      challenge:
        'Thin margins (14% gross, 3% net) were limiting reinvestment, and the founder was a bottleneck, spending 60 hours per week in day-to-day operations.',
      solution:
        'Implemented the AEROPS framework to formalise pricing and operations. This included a cost-to-serve pricing model, SKU rationalisation, and a weekly S&OP cadence.',
      keyResults: [
        'Revenue increased from £468k to £1.248m (+167%)',
        'Gross margin lifted from 14% to 21%',
        "Founder's time in operations cut from 60 to 30 hours/week",
        'Unit throughput grew from 300 to 800 units/day',
      ],
    },
    story:
      'Demand was growing, but profit wasn’t. With a gross margin of only 14%, every increase in volume amplified operational strain without generating enough cash to hire or invest. The founder was managing everything, leading to long hours and reactive firefighting. We rebuilt the pricing architecture around the true cost-to-serve, rationalised the product line to focus on high-margin items, and introduced a weekly Sales & Operations Planning (S&OP) cadence. The transformation was significant. Revenue grew by 167% to £1.248m in just twelve months, and the founder’s operational hours were halved, creating the headspace to lead the business strategically.',
    testimonial: {
      quote:
        'Mentoring with Business Growth Global gave me clarity and a cadence. We finally priced to our true cost, tightened changeovers, and built a team I could trust. We’ve gone from 300 to 800 units a day, revenue has leapt, and for the first time I’m leading the business instead of firefighting.',
      author: 'Founder, Anonymised UK Food Producer',
    },
  },
  {
    id: 2,
    industry: 'UK Services Business',
    headline: 'From £8m plateau to £12m+ in 24 months; SMT built and owner shifts to growth',
    overview: {
      challenge:
        'Growth stalled around £8m with delivery strain and inconsistent utilisation. The founder was a bottleneck with heavy day-to-day involvement.',
      solution:
        'Clarified ICPs and offers, built a Senior Management Team (SMT), and introduced a weekly leadership cadence with clear KPIs. A structured referrals engine was also created.',
      keyResults: [
        'Revenue grew from £8m to £12m+ over 24 months (≥ +50%)',
        'Senior Management Team established, improving accountability',
        "Owner's role shifted from firefighting to strategic networking",
        'A culture of expansion and innovation was fostered',
      ],
    },
    story:
      'The business had hit a ceiling around £8m in revenue, coupled with significant delivery strain and a founder who was too involved in daily operations. Using the AEROPS framework, we diagnosed the core issues: a lack of strategic focus and no senior management rhythm. The plan involved clarifying ideal customer profiles (ICPs), building a proper Senior Management Team (SMT), and introducing a weekly leadership cadence. Within 24 months, revenue broke the plateau, growing by at least 50% to over £12m, and a fully functional SMT was in place.',
    testimonial: {
      quote:
        'After years stuck around £8m, mentoring forced us to think and act like a bigger firm. With the right leaders, cleaner ops, and a proper referrals engine, we pushed past £12m—and I finally had the space to win the next wave of clients.',
      author: 'Founder & CEO, Anonymised Services Business',
    },
  },
  {
    id: 3,
    industry: 'Exit Readiness (UK)',
    headline: 'From £1.5m valuation to a £6m exit in 12 months',
    overview: {
      challenge:
        'Initial valuation of ~£1.5m was contingent on the owner remaining for 24 months post-sale due to high key-person risk and undocumented processes.',
      solution:
        'Built a senior leadership layer, systemised core operations using the LPAD framework, created diligence-ready financial reporting, and strengthened customer contracts.',
      keyResults: [
        'Achieved a £6m sale price, a 300% increase on the initial valuation.',
        'Eliminated the 24-month post-sale consultancy requirement for the founder.',
        'Increased revenue during the 12-month engagement period.',
        'Transformed the business into a demonstrably “buy-and-run” asset.',
      ],
    },
    story:
      'A business owner was exploring a sale but faced a low valuation of approximately £1.5m, which was heavily contingent on them remaining for a 24-month consultancy period. The business was critically dependent on the founder. We implemented a focused exit-readiness plan, building a senior leadership team and documenting all core processes. Within 12 months, the business was sold for £6m—a 300% increase from its initial valuation—and the owner’s post-sale consultancy requirement was reduced to a minimal handover period.',
    testimonial: {
      quote:
        'Before mentoring, every road led back to me—buyers knew it. In twelve months we built the team, the systems, and clean numbers. I sold for £6m without being tied in for two years, and the business can thrive without me.',
      author: 'Founder, Anonymised UK Business',
    },
  },
  {
    id: 4,
    industry: 'Executive Coaching (C-Suite, UK)',
    headline: 'Six months to visible, confident leadership: from imposter syndrome to expanded remit',
    overview: {
      challenge:
        'Persistent imposter syndrome was undermining confidence and visibility. The executive was under-communicating achievements and was uncomfortable advocating for resources.',
      solution:
        'A 6-month coaching program focused on building a leadership narrative, creating a visibility rhythm, mapping stakeholders, and improving communication strategies with mindset work.',
      keyResults: [
        'Role and scope expanded with additional responsibility granted.',
        'Increased confidence and credibility in the C-suite role.',
        'Clearer upward communication and more empathetic downward leadership.',
        'Stronger team engagement noted by key stakeholders.',
      ],
    },
    story:
      'A C-suite executive was struggling with persistent imposter syndrome, which led to under-communicating achievements and discomfort in advocating for resources. Through a 6-month coaching program, we crafted a personal value proposition, established a visibility rhythm for updates, and improved communication with tools for concise executive updates. The coaching led to improved visibility, and the executive was granted additional responsibility, reporting that they felt more comfortable and credible in their role.',
    testimonial: {
      quote:
        'Coaching helped me name the imposter voice and turn it down. I now communicate impact with clarity, lead both upwards and downwards with confidence, and I’ve been trusted with more responsibility. Most importantly, I actually feel comfortable in the role.',
      author: 'C-Suite Executive',
    },
  },
];
