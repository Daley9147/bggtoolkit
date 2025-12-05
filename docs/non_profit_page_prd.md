# Product Requirements Document (PRD): Non-Profit "Mission Multiplier" Page

**Date:** November 19, 2025
**Project:** Business Growth Global Website Expansion
**Target Page URL:** `/non-profits` (or `/mission-multiplier`)
**Owner:** Sales & Marketing Director

---

## 1. Executive Summary
We are introducing a dedicated landing page for the **Non-Profit & Charity Sector**. Historically, BGG is seen as a commercial growth agency. This page must reframe our "Growth Mentor Program" and "AEROPS Framework" specifically for the third sector, positioning us not as "consultants" but as **"Mission Multipliers."**

**Core Message:** Operational inefficiency is the silent killer of mission impact. We fix the operations so more money goes to the cause.

---

## 2. User Personas
*   **Primary:** CEO / Founder of a Non-Profit (£500k - £5M turnover). They are burnt out, wearing too many hats, and feel guilty that "admin" is eating up "impact."
*   **Secondary:** Board of Trustees. They are worried about financial sustainability, governance, and long-term reserves.

---

## 3. Strategic Framework: AEROPS for Non-Profits
*Note to Developers/Copywriters:* We are NOT using standard sales language. We are translating AEROPS into "Mission Impact" language.

| AEROPS Pillar | Commercial Definition | **Non-Profit Definition (Use on Page)** |
| :--- | :--- | :--- |
| **Analyse** | Metrics & KPIs | **Impact Measurement:** Proving your model to donors and Trustees. |
| **Expand** | Sales Growth | **Sustainable Scale:** Expanding program reach without breaking the team. |
| **Revenue** | Profit & Margins | **Funding Diversity:** Reducing grant dependency & optimizing Gift Aid. |
| **Operation** | Efficiency | **Resource Maximization:** Ensuring more "pence in the pound" reaches the frontline. |
| **People** | Leadership & Hiring | **Volunteer & Staff Retention:** Preventing burnout in mission-driven teams. |
| **Success** | Exit Strategy | **Mission Longevity:** Building an organization that survives its founder. |

---

## 4. Page Architecture & Content
*Developers: Use the existing Shadcn/UI component library. The layout should be clean, trust-inducing, and easy to scan.*

### Section 1: The Hero (Above the Fold)
*   **Visual:** A split screen or centered hero. Image should be high-quality, showing a diverse team collaborating (warm, human feel, not corporate).
*   **Headline (H1):** Stop Letting Operations Eat Your Mission.
*   **Sub-headline:** We help ambitious non-profits fix the "Mission Gap"—the operational drag that separates your funding from your impact.
*   **CTA Button (Primary):** Book a Free "Mission Health" Audit
*   **CTA Button (Secondary):** See How It Works

### Section 2: The Problem (Agitation)
*   **Header:** The "Overhead Myth" is holding you back.
*   **Copy:** You started this non-profit to change lives, not to manage spreadsheets, chase invoices, or wrestle with compliance. But as you grow, the operational complexity grows faster than your funding.
*   **Bullet Points (The Symptoms):**
    *   **Founder Bottleneck:** You are the only one who knows how everything works.
    *   **Funding Rollercoaster:** Relying on one big grant per year.
    *   **Burnout:** High staff turnover because the systems are broken.

### Section 3: The Solution (The AEROPS Framework)
*   **Component:** A 2x3 Grid or an Interactive Accordion showing the AEROPS pillars (translated to Non-Profit definitions above).
*   **Intro Copy:** We don't just give advice. We install the **AEROPS Operating System**—the same framework used by high-growth tech companies, adapted for the unique constraints of the charity sector.

### Section 4: The Offer (The Mentor Program)
*   **Header:** Expert Mentorship, Not Expensive Consulting.
*   **Copy:** You don't need a 100-page report. You need hands-on guidance. Our Growth Mentors are seasoned operators who have scaled organizations before. They work alongside you to fix specific bottlenecks.
*   **The "Trojan Horse" Offer:**
    *   *Highlight Box:* **Partner Access:** We offer 2-3 complimentary sessions to eligible non-profits to tackle one specific challenge (e.g., "Fixing Volunteer Churn" or " diversifying income").

### Section 5: Social Proof / Trust
*   **Component:** Logo Carousel (Partners/Charities) + 1 Featured Testimonial.
*   **Testimonial Placeholder:** "BGG helped us move from 'survival mode' to strategic growth. We increased our program delivery by 30% on the same budget simply by fixing our internal processes." — *Sarah J., CEO, Community First.*

### Section 6: Footer CTA
*   **Headline:** Ready to Multiply Your Impact?
*   **Sub-headline:** It starts with a conversation. No pressure, just practical advice.
*   **Button:** Apply for Your Free Mentorship Sessions

---

## 5. Functional Requirements
1.  **Lead Capture Form (HubSpot/GHL Integration):**
    *   Fields: Name, Organization Name, Website URL, Annual Income Range (Dropdown: <£100k, £100k-£1M, £1M-£5M, >£5M), Primary Challenge.
2.  **Responsive Design:** Must look perfect on mobile (Trustees often check links on phones).
3.  **Speed:** Page load under 1.5s (Crucial for SEO).

## 6. Design & Tone Guidelines
*   **Palette:** Use the primary brand colors but consider softening the "Sales Red" (if applicable) to warmer, more community-focused tones (Deep Blues, Greens, or softer accents).
*   **Typography:** Clean, accessible sans-serif.
*   **Imagery:** Avoid "Stock Photo Handshakes." Use images of *doing the work* (workshops, community events, whiteboarding).

## 7. Implementation Prompt (For Gemini 3 Pro)
*Use this prompt when asking the AI to generate the code:*

> "Create a Next.js page using Tailwind CSS and Shadcn UI for the '/non-profits' route. Use the copy provided in the PRD.
> - Implement the 'AEROPS' section as a responsive grid of Cards.
> - Create a 'Sticky' CTA for the 'Book Audit' button.
> - Ensure the form captures the 'Annual Income' field, as this qualifies the lead for the free sessions.
> - Use the 'Mission Multiplier' terminology consistently."
