# Mission Metrics Integration Plan - Status: COMPLETED

## 1. Database & Authentication (Core Infrastructure) - [COMPLETED]
**Goal:** Enable a secondary GHL connection for "Mission Metrics" alongside the existing BGG connection.

*   **Database Schema:** [DONE]
    *   Created `ghl_integrations` table to store secondary credentials.
    *   **Columns:** `id`, `user_id`, `access_token`, `refresh_token`, `location_id`, `label` ('mission_metrics'), `created_at`.
    *   *Why:* Keeps the new connection completely isolated from the main `profiles` table connection.

*   **OAuth Flow Update:** [DONE]
    *   **Frontend:** Added "Connect Mission Metrics" button on the new page triggering OAuth with `?state=mission_metrics`.
    *   **Backend (`src/app/api/oauth/callback/route.ts`):** Modified callback handler.
        *   Checks `state` query parameter.
        *   If `state === 'mission_metrics'`, upserts tokens into `ghl_integrations`.
        *   Else, defaults to `profiles`.

*   **Token Retrieval Helper:** [DONE]
    *   Created `src/lib/ghl/token-helper.ts`.
    *   Function: `getGhlAccessToken(userId: string, integrationLabel?: string)`.
    *   Logic: Fetches from `ghl_integrations` if label provided, otherwise defaults to `profiles`. Validated async cookie handling.

## 2. API Routes (Backend Adaptation) - [COMPLETED]
**Goal:** Create endpoints that serve Mission Metrics data using the secondary token.

*   **Wrapper Pattern:** Created "Mission Metrics" versions of key endpoints using the new token helper.
    
*   **New Endpoints:** [DONE]
    *   `src/app/api/mission-metrics/opportunities/route.ts`: Fetches opportunities.
    *   `src/app/api/mission-metrics/pipelines/route.ts`: Fetches pipeline data.
    *   `src/app/api/mission-metrics/contact/[id]/route.ts`: Fetches contact info.
    *   `src/app/api/mission-metrics/notes/[id]/route.ts`: Fetches and adds notes.
    *   `src/app/api/mission-metrics/custom-fields/route.ts`: Fetches custom fields.
    *   `src/app/api/mission-metrics/update-opportunity-stage/route.ts`: Updates stage.

## 3. Frontend Implementation (`/mission-metrics`) - [COMPLETED]
**Goal:** Replicate the "Opportunities" page experience for the new sub-account.

*   **Page Layout (`src/app/(app)/mission-metrics/page.tsx`):** [DONE]
    *   Displays "Connect" card if not connected.
    *   Renders `MissionMetricsClient` if connected.
    *   Updated scopes to include write permissions for opportunities, contacts, calendars, etc.

*   **Client Component (`src/components/mission-metrics/mission-metrics-client.tsx`):** [DONE]
    *   Replicated `OpportunitiesClient` pointing to `/api/mission-metrics/...`.
    *   Lists opportunities, supports filtering and search.

*   **Workspace Component (`src/components/mission-metrics/mission-metrics-workspace.tsx`):** [DONE]
    *   Replicated `OpportunityWorkspace`.
    *   Integrated with new API endpoints.
    *   **Tabs:** "Mission Insights" (AI), "Contact Details", "Notes".

*   **Navigation:** [DONE]
    *   Added "Mission Metrics" link to `Sidebar` with `Target` icon.

## 4. AI Insights Integration - [COMPLETED]
**Goal:** Implement the "UK Charity" AI prompt flow for Mission Metrics.

*   **Database Schema:** [DONE]
    *   Created `mission_metrics_reports` table to store generated insights.

*   **Prompt Engineering:** [DONE]
    *   Created `src/lib/ai/prompts/mission-metrics-uk.prompt.ts`.
    *   Adapted from `non-profit-uk.prompt.ts`.
    *   Added support for "Specific Article/Case Study" URL for hyper-personalization.

*   **Backend Logic:** [DONE]
    *   Created `src/lib/ai/generate-mission-metrics.ts`.
    *   **Flow:**
        1.  Fetch Financial Data (Charity Commission API).
        2.  Scrape Website URL.
        3.  Scrape Specific Article URL.
        4.  Hydrate Prompt.
        5.  Call Gemini AI.
        6.  Parse Response.

*   **API Endpoint:** [DONE]
    *   Created `/api/mission-metrics/generate/route.ts`.
    *   Handles POST request, runs generation, saves report to database.

*   **Frontend UI:** [DONE]
    *   Updated `MissionMetricsWorkspace` "Mission Insights" tab.
    *   Added form for Charity Number, Website URL, Specific URL, and User Insight.
    *   Added "Generate Insights" button and result display.
