import type { SectionData } from './types';

export const allSections: SectionData[] = [
  {
    id: 'founder',
    title: 'Our Founder',
    icon: 'User',
    content: [
      {
        id: 'founder-1',
        summary: 'Background in Sales Leadership',
        details: 'Lee has over 20 years of experience in sales, leading high-performing teams at several Fortune 500 companies. His strategies have generated over $500 million in revenue.',
      },
      {
        id: 'founder-2',
        summary: 'Vision for BGG',
        details: 'Lee founded BGG with the mission to democratize sales coaching, providing small and medium-sized businesses with the same level of expertise once reserved for large corporations.',
      },
      {
        id: 'founder-3',
        summary: 'Personal Philosophy',
        details: 'He believes in a relationship-first approach to sales, emphasizing trust, value, and long-term partnerships over short-term gains. This philosophy is the cornerstone of the BGG Method.',
      },
    ],
  },
  {
    id: 'programs',
    title: 'Our Programs',
    icon: 'Briefcase',
    description: 'We offer three distinct programs designed to meet you where you are and take your sales team to the next level. Each program is built on the core principles of the BGG Method but tailored for different needs and scales.',
    features: [
      { feature: 'Ideal For', elevate: 'Individuals & Small Teams', intensive: 'Growing Sales Teams', boardroom: 'Executive Leadership' },
      { feature: 'Duration', elevate: '6 Weeks', intensive: '12 Weeks', boardroom: '12 Months' },
      { feature: 'Live Coaching Calls', elevate: 'Weekly', intensive: '2x per week', boardroom: 'Bi-weekly + On-demand' },
      { feature: '1-on-1 Sessions', elevate: true, intensive: true, boardroom: true },
      { feature: 'Custom Playbook', elevate: false, intensive: true, boardroom: true },
      { feature: 'Team Performance Dashboards', elevate: false, intensive: true, boardroom: true },
      { feature: 'Executive Strategy Sessions', elevate: false, intensive: false, boardroom: true },
      { feature: 'Price', elevate: '$2,500', intensive: '$10,000', boardroom: 'Contact Us' },
    ],
  },
  {
    id: 'method',
    title: 'The BGG Method',
    icon: 'Target',
    content: [
      {
        id: 'method-1',
        summary: 'Discovery & Empathy Mapping',
        details: 'We start by deeply understanding the customer\'s world. Our framework helps reps uncover latent needs and align solutions to the client\'s core problems, building trust from the first interaction.',
      },
      {
        id: 'method-2',
        summary: 'Value-Centric Storytelling',
        details: 'Instead of listing features, we teach teams to craft compelling narratives that demonstrate tangible business value and ROI. This shifts the conversation from cost to investment.',
      },
      {
        id: 'method-3',
        summary: 'Collaborative Closing',
        details: 'Our approach turns closing into a collaborative process. We provide techniques to create mutual buy-in, define clear next steps, and build momentum towards a confident decision.',
      },
    ],
  },
  {
    id: 'testimonials',
    title: 'Client Testimonials',
    icon: 'Star',
    content: [
      {
        id: 'testimonial-1',
        summary: '“Our sales cycle was cut by 30%.” - CEO, TechStart Inc.',
        details: '“The BGG Intensive program was a game-changer. Lee’s methods helped our team qualify leads more effectively and focus on high-value opportunities. We saw a 30% reduction in our average sales cycle within the first quarter.”',
      },
      {
        id: 'testimonial-2',
        summary: '“The best investment in our team’s development.” - VP of Sales, Innovate Corp',
        details: '“I was skeptical about another sales training, but the Boardroom program provided unparalleled strategic insight. The combination of team coaching and executive sessions aligned our entire go-to-market strategy. It\'s the best investment we\'ve made.”',
      },
    ],
  },
  {
    id: 'objections',
    title: 'Overcoming Objections',
    icon: 'HelpCircle',
    content: [
      {
        id: 'objection-1',
        summary: '“It’s too expensive.”',
        details: 'Acknowledge: “I understand that this is a significant investment.” Reframe: “Many clients feel that way at first. However, they find that the program pays for itself within months through increased deal size and win rates. Can we walk through what a 15% increase in performance would mean for your team’s revenue?”',
      },
      {
        id: 'objection-2',
        summary: '“We don’t have time for training.”',
        details: 'Acknowledge: “Your team’s time is incredibly valuable, and I appreciate that.” Reframe: “Our programs are designed to be integrated into the workflow, not to pull people out of it. The time invested upfront leads to significant time savings later by reducing no-decision funnels and improving efficiency. It’s about making their selling time more productive.”',
      },
      {
        id: 'objection-3',
        summary: '“We have our own internal training.”',
        details: 'Acknowledge: “It’s great that you prioritize internal development.” Reframe: “We aren’t looking to replace your training, but to enhance it with an external perspective. We bring insights from hundreds of other sales teams that can challenge assumptions and introduce new strategies to complement what you’re already doing successfully.”',
      },
    ],
  },
  {
    id: 'competition',
    title: 'Competition',
    icon: 'Shield',
    content: [
      {
        id: 'competition-1',
        summary: 'Generic Sales Trainers (e.g., SalesForce Academy)',
        details: 'They offer one-size-fits-all solutions. Our approach is deeply customized. We build a specific playbook for your team, your product, and your market. We are partners, not just instructors.',
      },
      {
        id: 'competition-2',
        summary: 'Individual Coaches / Consultants',
        details: 'While individual coaches can be good, they often lack a scalable, repeatable methodology. The BGG Method is a proven system that can be implemented across your entire team for consistent results, complete with dashboards and performance tracking.',
      },
    ],
  },
];
