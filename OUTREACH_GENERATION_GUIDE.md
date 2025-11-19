# BGG Sales Toolkit: Outreach Generation Guide

This document provides a comprehensive technical and strategic overview of the AI-powered outreach generation system. It details the architecture, the different outreach workflows, and the locations of all key files.

---

## 1. Core Architecture

The outreach generation process follows a standard client-server model:

1.  **Frontend Component:** The user selects an outreach type and provides the necessary inputs.
    -   **File:** `src/components/ghl/workspace-tabs/OutreachPlanTab.tsx`

2.  **API Request:** The frontend sends a `POST` request containing all the user's inputs to a dedicated backend API route.
    -   **File:** `src/app/api/ghl/generate-outreach/route.ts`

3.  **Backend Orchestration:** This is the central logic file. It receives the request, fetches any necessary external data (e.g., website content, ProPublica data), selects the appropriate AI model and prompt, and calls the Google Gemini API.
    -   **File:** `src/lib/ai/generate-outreach-plan.ts`

4.  **AI Prompts:** A dedicated directory holds the detailed instructions for the AI for each specific workflow.
    -   **Directory:** `src/lib/ai/prompts/`

---

## 2. Outreach Workflows

The system has four distinct workflows, each tailored to a specific target type.

### a. For-Profit Workflow

-   **Purpose:** General-purpose research for established, for-profit businesses.
-   **UI Inputs:**
    -   `Company Homepage URL`
    -   `Specific URL` (e.g., case study, news article)
    -   `User's Key Insight` (Optional)
-   **Backend Process:**
    -   Scrapes the content of the two provided URLs.
    -   Builds the analysis around the `User's Key Insight` if provided.
-   **AI Model:** `gemini-3-pro-preview`

### b. Non-Profit Workflow

-   **Purpose:** Specialized research for non-profit organizations, focusing on financial health and mission impact.
-   **UI Inputs:**
    -   `Organization Name or EIN`
    -   `Company Homepage URL`
    -   `User's Key Insight` (Optional)
-   **Backend Process:**
    -   Calls the **ProPublica Non-Profit Explorer API** to fetch key financial data (Revenue, Expenses, Net Income).
    -   Scrapes the content of the homepage URL.
    -   Routes the ProPublica API call through a proxy to prevent IP blocking.
-   **AI Model:** `gemini-3-pro-preview`
-   **Prompt File:** `src/lib/ai/prompts/non-profit.prompt.ts`
-   **API Logic:** `src/lib/propublica/api.ts`

### c. VC-Backed Startup Workflow

-   **Purpose:** Highly specific analysis of recently funded startups, focusing on post-funding pressures and challenges.
-   **UI Inputs:**
    -   `Funding Announcement URL` (Required)
    -   `Lead VC Firm` (Optional)
    -   `User's Key Insight` (Optional)
-   **Backend Process:**
    -   Scrapes the content of the funding announcement article.
    -   The analysis is prioritized around the funding announcement, not the company homepage.
-   **AI Model:** `gemini-3-pro-preview`
-   **Prompt File:** `src/lib/ai/prompts/vc-backed.prompt.ts`

### d. Partnership Workflow

-   **Purpose:** Top-tier strategic outreach to potential partner firms (e.g., VCs, Private Equity) to build relationships, not to sell a product.
-   **UI Inputs:**
    -   `Firm Website URL` (Required)
    -   `Partner's LinkedIn Profile URL` (Optional)
    -   `Recent Investment Article URL` (Optional, for hyper-personalization)
    -   `User's Key Insight` (Optional)
-   **Backend Process:**
    -   Scrapes the firm's website.
    -   Scrapes the partner's LinkedIn profile (if provided).
    -   Scrapes the recent investment article (if provided) to craft a unique opening line.
-   **AI Model:** `gemini-3-pro-preview` (or a similar high-tier model)
-   **Prompt File:** `src/lib/ai/prompts/partnership.prompt.ts`

---

## 3. Key Files Quick Reference

| File Path                                           | Role                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `OutreachPlanTab.tsx`                                 | The primary frontend component with all UI inputs and tabs.                                      |
| `generate-outreach/route.ts`                          | The backend API route that receives requests from the frontend.                                  |
| `generate-outreach-plan.ts`                           | The core orchestration logic; fetches data, selects prompts/models, and calls the AI.            |
| `prompts/for-profit.prompt.ts`                        | AI instructions for the For-Profit workflow.                                                     |
| `prompts/non-profit.prompt.ts`                        | AI instructions for the Non-Profit workflow.                                                     |
| `prompts/vc-backed.prompt.ts`                         | AI instructions for the VC-Backed Startup workflow.                                              |
| `prompts/partnership.prompt.ts`                       | AI instructions for the high-level Partnership workflow.                                         |
| `propublica/api.ts`                                   | Contains the logic for fetching data from the ProPublica API, including the proxy implementation. |
| `migrations/..._add_follow_up_fields_to_templates.sql` | The database migration that added the necessary columns for the follow-up email feature.         |
