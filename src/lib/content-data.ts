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
        details: 'Question: “Are you the main decision maker in the business for strategy and investments?”\nIf no: → “Who else needs to be involved?”',
      },
      {
        id: 'price-awareness',
        summary: '2. Price Awareness',
        details: 'Question: “Our programs start from £1,500/month. Does that fit your expectations?”\nPurpose: Confirm comfort with investment level.',
      },
      {
        id: 'growth-readiness',
        summary: '3. Growth Readiness',
        details: 'Question: “Is growing or scaling your business a priority right now?”\nNote: Capture specific growth goals such as revenue targets, team expansion, or market growth.',
      },
      {
        id: 'commitment-to-change',
        summary: '4. Commitment to Change',
        details: 'Question: “Are you open and committed to making changes in your business to reach your goals?”\nPurpose: Check for genuine willingness, not just surface-level interest.',
      },
      {
        id: 'capacity-check',
        summary: '5. Capacity Check',
        details: 'Question: “Do you and your business have the time and resources to implement strategies?”\nPurpose: Ensure they are realistic, prepared, and able to follow through.',
      },
    ],
  },
  {
    id: 'about-bgg',

    title: 'About Business Growth Global',
    icon: 'Building2',
    content: [
      {
        id: 'bgg-1',
        summary: 'Overview',
        details: 'We use the Business Growth Blueprint methodology for entrepreneurs, startups, and corporates. Clients are experts in their business; BGG provides the frameworks & mentoring. Every business is unique; we help owners delegate operations and focus on strategy.',
      },
      {
        id: 'bgg-2',
        summary: 'Services Offered',
        details: 'We offer entrepreneur mentoring, startup coaching, and corporate executive mentoring.',
      },
      {
        id: 'bgg-3',
        summary: 'Outcomes',
        details: 'Increased revenue & profit, operational efficiency, customer growth, and team performance.',
      },
       {
        id: 'bgg-4',
        summary: 'Mission',
        details: 'To free owners from working in the business, empowering them to work on the business and achieve scalable growth.',
      },
      {
        id: 'bgg-5',
        summary: 'Guarantees',
        details: 'We offer a 12-Month ROI Guarantee (double ROI or full refund) and a 3-Month Satisfaction Guarantee (50% refund if approach is not aligned).',
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
        summary: 'Background',
        details: 'Lee started his first business at 26 after 10 years in the British Army. He has over 20 years of entrepreneurial experience across private and public sectors, including property management, photography, and legal services.',
      },
      {
        id: 'lee-2',
        summary: 'Skills',
        details: 'Lee excels in assessment & analysis, strategy & implementation, and leadership. He is known for his positive, personable, emotionally intelligent, and adaptive approach.',
      },
      {
        id: 'lee-3',
        summary: 'Credentials',
        details: 'Lee is a private pilot, an accredited Mediator, and holds a Master of Laws (LLM).',
      },
      {
        id: 'lee-4',
        summary: 'Philosophy',
        details: 'Lee believes everyone can live fulfilled lives. His mission is to remove barriers, build confidence, and empower growth.',
      },
      {
        id: 'lee-5',
        summary: 'Values',
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
            summary: 'Core Design',
            details: 'We focus on sustainable growth, not quick wins. The program is mentor-led, providing guidance, accountability, and emotional support based on our Business Growth Blueprint and AEROPS framework.',
        },
        {
            id: 'program-3',
            summary: 'Focus Areas',
            details: 'The curriculum centers on scaling revenue, improving operational efficiency, leadership development, and effective team building.',
        },
        {
            id: 'program-4',
            summary: 'Format',
            details: 'We require a 12-month minimum commitment, which includes structured mentoring sessions, regular strategy reviews, and access to crisis calls.',
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
        summary: 'Definition',
        details: 'The Business Growth Blueprint is our AEROPS Framework. It is a transformative, mentor-led journey derived from over 20 years of experience.',
      },
      {
        id: 'aerops-2',
        summary: 'A – Analyse',
        details: 'Identify strengths and weaknesses within your business.',
      },
      {
        id: 'aerops-3',
        summary: 'E – Expand',
        details: 'Develop strategies to grow your customer base and maximize profit potential.',
      },
      {
        id: 'aerops-4',
        summary: 'R – Revenue',
        details: 'Map and optimise all income streams for financial health.',
      },
      {
        id: 'aerops-5',
        summary: 'O – Operation',
        details: 'Improve and streamline systems and processes for efficiency.',
      },
      {
        id: 'aerops-6',
        summary: 'P – People',
        details: 'Develop your team to foster innovation and productivity.',
      },
      {
        id: 'aerops-7',
        summary: 'S – Success',
        details: 'Achieve a state where the business thrives independently of the owner\'s daily involvement.',
      },
      {
        id: 'aerops-8',
        summary: 'Key Benefits',
        details: 'Builds a steady customer base, ensures sustained growth, and empowers leaders with clarity and confidence.',
      }
    ],
  },
  {
    id: 'programs',
    title: 'Programs',
    icon: 'Briefcase',
    description: 'All programs are 12-month enrolments and include our ROI & Satisfaction Guarantees. They are mentor-led and based on the Business Growth Blueprint + AEROPS framework.',
    features: [
      { feature: '1-to-1 Sessions (per year)', elevate: '24 × 45-min sessions', intensive: '48 × 45-min sessions', boardroom: '24 1-to-1 & 24 group sessions' },
      { feature: 'Crisis Calls (15 min)', elevate: '1 per week', intensive: '2 per week', boardroom: '1 per week' },
      { feature: 'Strategy & Action Reviews', elevate: '6 per year', intensive: '12 per year', boardroom: '12 per year' },
      { feature: 'Participants', elevate: '1', intensive: '1', boardroom: 'Up to 3' },
      { feature: 'Power Review', elevate: '2 x per year', intensive: '2 x per year', boardroom: '2 x per year' },
      { feature: 'Email & Message Support', elevate: true, intensive: true, boardroom: true },
      { feature: 'Price', elevate: '£1,500/month', intensive: '£2,500/month', boardroom: '£5,000/month' },
    ],
  },
  {
    id: 'social-proof',
    title: 'Social Proof',
    icon: 'Star',
    content: [
      {
        id: 'breaking-1mill-turnover',
        summary: 'Breaking £1mill Turnover',
        details: `**Situation / Challenge**
The business had £468,000 revenue, but profit margins were very tight — 14% gross, 3% net, limiting ability to reinvest.
Founder was a bottleneck: working ~60 hours/week in day-to-day operations.
Demand was growing, but with low profits and no reliable tracking of operational metrics, the growth was unsustainable.

**Solution Approach**
They implemented Business Growth Global’s AEROPS framework, including:
- Establishing a cost-to-serve pricing model to ensure pricing reflects true costs.
- SKU rationalisation — focusing on fewer, higher-margin products.
- Introducing operational cadence: weekly Sales & Operations Planning (S&OP) meetings and daily huddles.
- Systematising core processes with LPAD (Document, Perfect, Automate, Delegate).
- Setting up a simple B2B sales pipeline to make demand more predictable.

**Results Achieved**
- Revenue increased from £468,000 → £1,248,000 in 12 months — a +167% growth.
- Gross margin rose from 14% → 21%, and net margin doubled.
- Founder reduced operational time from ~60 hours/week to ~30 hours/week.
- Unit throughput grew from 300 units/day → 800 units/day (also ~+167%).
- The team doubled in size.

**Impact / Takeaways**
- Pricing based on true cost-to-serve can unlock margin improvement.
- Operational cadence (regular meetings, tracking) helps stabilise workflows and expose inefficiencies.
- Process documentation, automation, delegation relieve bottlenecks — especially of key people.
- Focusing on fewer, better products (SKU rationalisation) can be more effective than trying to serve everything.`,
      },
      {
        id: 'uk-services-business-case-study',
        summary: 'Case Study: UK Services Business — £8m → £12m+ Growth in 24 Months',
        details: `**Situation / Challenge**
The business had plateaued at £8 million in revenue.
There was delivery strain and inconsistent utilisation of staff.
Founder was heavily involved in day‑to‑day operations, acting as a bottleneck.
Leadership gaps, weak processes, and underdeveloped KPIs, especially around utilisation and project margins.
Missed opportunities, especially in referrals, due to lack of structure.

**Solution Approach**
Used the AEROPS framework to diagnose issues.
Clarified the Ideal Customer Profiles (ICPs) and refined their service offers.
Built a Senior Management Team (SMT) with clearly defined role‑scorecards.
Instituted a weekly leadership cadence, with KPIs to track utilisation, project margins, etc.
Created a structured referrals engine to capitalise on existing relationships.

**Results Achieved**
Revenue grew from £8 million → over £12 million in 24 months (at least +50% growth).
A functional SMT was established, improving clarity, accountability, and speed of decision‑making.
Founder shifted role from being deeply involved in operations to focusing on strategy, partnerships, networking.
A culture of expansion and innovation was developed. Strategic hires supported that culture.

**Key Takeaways**
Breaking past revenue plateaus often requires more than sales/marketing — leadership structure and process clarity are critical.
Defining ICPs helps sharpen focus on the right customers.
Regular metrics, KPIs, and operational cadence (meetings, scorecards) keep utilisation, performance, margins visible and actionable.
Delegation and formation of a senior management team allow the founder to focus on growth, rather than being bogged down in daily operations.
Leverage existing relationships through referrals can be a powerful accelerator when put on a structured basis.`,
      },
      {
        id: 'exit-readiness-case-study',
        summary: 'Case Study: Exit Readiness — From ~£1.5m Valuation to £6m Exit',
        details: `**Situation / Challenge**
The business was valued at ~£1.5 million, largely because buyers viewed it as high risk.
Key‑person risk: the founder was heavily involved in all operations, sales, and decision‑making.
Processes and documentation were lacking (everything depended on the founder; no leadership bench; inconsistent reporting).
The sale was contingent on the founder staying on for 24 months post‑exit because buyers lacked confidence the business could run without them.

**Solution Approach**
Established a senior leadership layer (e.g., adding an Operations Lead and a Financial Controller), with defined role scorecards to distribute responsibility.
Systemised core operations via the LPAD framework (Learn → Perfect → Automate → Delegate).
Created diligence‑ready financial reporting: monthly information packs, management reporting.
Strengthened customer contracts, renewed and extended key contracts, widened referral channels to build more repeatable and stable revenue.
Assembled a clean data room: standard operating procedures (SOPs), organisation chart, contracts, KPIs, and a transition runbook to ease the transfer to a buyer.

**Results Achieved**
Sale price escalated from ~£1.5 million to £6 million within 12 months (a 300% increase).
The 24‑month post‑sale consultancy requirement for the founder was eliminated (replaced with a minimal handover).
Revenue increased during the 12‑month engagement period.
The business was transformed into a demonstrably “buy‑and‑run” asset, rather than a risky “buy‑and‑rebuild” proposition.

**Key Takeaways You Can Use in Sales Conversations**
Buyers place high value on businesses that are not founder‑dependent. Showing leadership delegation and documented processes can dramatically improve valuation.
Preparing “diligence‑ready” financials and contracts reduces friction in exit negotiations and removes buyer concerns.
Strengthening repeatable revenue streams (via contract renewals, referrals) makes the business more attractive.
Investing in exit readiness (systems, leadership, documentation) can lead to a substantially higher and cleaner exit—both in price and in founder liability.`,
      },
      {
        id: 'executive-coaching-case-study',
        summary: 'Case Study: Executive Coaching — From Imposter Syndrome to Expanded Leadership Role',
        details: `**Situation / Challenge**
A C‑Suite executive was struggling with persistent imposter syndrome, which undermined their confidence and visibility.
They were under‑communicating their achievements and felt uncomfortable advocating for resources.
Communication effectiveness was inconsistent: both upwards toward other executives, and downwards with direct reports.

**Solution Approach**
A 6‑month coaching programme combining both mindset work and practical communication strategy.
Key interventions included:
• Crafting a leadership narrative (origin, impact, horizon) to anchor their presence.
• Establishing a “visibility rhythm” to highlight wins, maintain consistent communication.
• Mapping stakeholders and sponsors to create meaningful touchpoints.
• Tools and structure: 5‑15‑5 executive updates, feedback loops (SBI+), repeatable agendas for team 1:1s and all‑hands meetings.
• Fortnightly coaching sessions + monthly deep dives, with reflection prompts/experiments between sessions.

**Results Achieved**
Role & scope expanded: the executive was given additional responsibility.
Confidence and credibility in their C‑Suite role increased.
Better upward communication and more empathetic leadership downward.
Improved team engagement, as reported by key stakeholders.

**Key Takeaways for Use in Sales Conversations**
Imposter syndrome can significantly limit leadership impact; addressing mindset is as important as process.
Structured visibility (narrative + regular updates) helps executives own their achievements.
Improving communication both up & down the organisation strengthens leadership credibility.
Stakeholder mapping and feedback loops can enable leaders to build trust and align more effectively.
Even C‑Suite roles benefit from coaching: measurable changes in confidence, role expansion, and influence.`,
      },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: 'HelpCircle',
    content: [
      {
        id: 'faq-1',
        summary: 'How is this different from a normal business coach?',
        details: 'We don’t just “coach” — we implement a framework. AEROPS gives a clear roadmap for growth, backed by experienced mentors with real business-building track records.',
      },
      {
        id: 'faq-2',
        summary: 'We’ve tried other programs before, why will this work?',
        details: 'Other programs are often generic. AEROPS is structured, measurable, and personalised. We focus on outcomes, not theory.',
      },
      {
        id: 'faq-3',
        summary: 'What kind of ROI can I expect?',
        details: 'On average, clients see improved revenue, efficiency, and leadership within 6–12 months. The ROI comes from improved decision-making, better use of resources, and scaling with confidence.',
      },
      {
        id: 'faq-4',
        summary: 'What’s the time commitment?',
        details: 'Most programs require a few focused hours each week. The goal is to fit growth strategies into your current operations, not overwhelm your schedule.',
      },
      {
        id: 'faq-5',
        summary: 'We don’t have the budget right now.',
        details: 'Scaling requires investment. Our programs are designed to generate returns that outweigh the cost. We can also phase programs to suit cash flow.',
      },
      {
        id: 'faq-6',
        summary: 'My business is too small/big for this.',
        details: 'The framework works at every stage. For small businesses, it builds strong foundations. For larger ones, it sharpens strategy and operations for scaling.',
      },
      {
        id: 'faq-7',
        summary: 'Do you guarantee results?',
        details: 'We guarantee a proven framework, experienced mentors, and accountability. Results depend on commitment, but our track record shows consistent business growth.',
      },
      {
        id: 'faq-8',
        summary: 'What’s the first step if we want to go ahead?',
        details: 'Book the discovery call → we qualify fit → we present a tailored growth plan → once agreed, onboarding begins.',
      },
    ],
  }
];
