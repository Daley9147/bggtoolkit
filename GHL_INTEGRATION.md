# GHL API v2 Integration Plan

This document outlines the plan for integrating the GoHighLevel (GHL) API v2 into the BGG Sales Toolkit.

## 1. Goals

The primary goal is to create a seamless workflow for the sales team, allowing them to manage their GHL opportunities and outreach directly from the toolkit. This will eliminate the need for double data entry and streamline the research and outreach process.

The key features to be implemented are:
- [x] Fetch and display GHL opportunities in the toolkit.
- [x] Trigger the existing research and outreach plan generation for a selected opportunity.
- [x] Update the GHL contact with insights and notes.
- [x] Advance the opportunity's pipeline stage in GHL.
- [x] Send outreach emails through GHL.
- [x] Log call notes in GHL.
- [x] Handle Appointment Booking.

## 2. Authentication

GHL API v2 uses OAuth 2.0 for authentication. The integration will require the following steps:

1.  [x] **Create a GHL App:** A new application has been created in the GHL Marketplace.
2.  [x] **OAuth 2.0 Flow:** The toolkit implements the standard OAuth 2.0 flow.
3.  [x] **Token Storage:** Access and refresh tokens are securely stored in the Supabase database.
4.  [x] **Token Refresh:** A mechanism will be implemented to automatically refresh the access token.

## 3. API Endpoints and Implementation Plan

The following GHL API v2 endpoints will be used to implement the required features.

### 3.1. Fetch Opportunities (Done)

*   **Endpoint:** `GET /opportunities/`
*   **Implementation:** The API route and frontend components are complete.

### 3.2. Update Contact / Add Note (Done)

*   **Endpoint:** `POST /contacts/{contactId}/notes`
*   **Implementation:** The "Sync Notes to GHL" feature is complete.

### 3.3. Advance Pipeline Stage (Done)

*   **Endpoint:** `PUT /opportunities/{opportunityId}`
*   **Implementation:** The API routes to fetch pipelines and update the stage are complete. The frontend UI is also complete.

### 3.4. Send Email (Done)

*   **Endpoint:** `POST /conversations/messages`
*   **Implementation:** The API route and frontend UI are complete.

### 3.5. Log Call Notes (Done)

*   **Endpoint:** `POST /contacts/{contactId}/notes`
*   **Implementation:** The frontend UI for logging call notes is complete.

### 3.6. Handle Appointment Booking (Done)

*   **Endpoint:** `GET /calendars/`
*   **Description:** This endpoint will be used to fetch a list of available calendars to access their booking links.

## 4. Data Synchronization

To avoid double data entry, the toolkit will be the primary interface for managing the outreach process for GHL opportunities. All actions taken in the toolkit will be immediately reflected in GHL.

The toolkit will not store a separate copy of the GHL data. Instead, it will fetch the data from the GHL API in real-time, ensuring that the information is always up-to-date.

## 5. Next Steps

We have successfully implemented the GHL integration. The remaining task is to:
1.  Thoroughly test all features.

## 6. Next Steps

The core GHL integration is feature-complete. The final remaining task is to resolve a bug in the Opportunity Workspace:
1.  **Fix Email Display:** Ensure that when a new outreach plan is generated, the AI-generated email is correctly populated in the editable `Textarea` component.

## 7. Implementation Summary (October 4, 2025)

This summary details the significant feature integrations, UI/UX improvements, and bug fixes completed.

### 7.1. Core Feature Development

- **AI Research Workflow Integration:** The AI research and outreach generation feature is now fully integrated into the Opportunity Workspace. Users can provide specific URLs for targeted analysis, and the generated plan is displayed in a tabbed view.
- **Persistent Research:** Generated outreach plans are now saved to the database and automatically fetched and displayed when a user re-opens an opportunity, ensuring research is not lost between sessions. A "Rerun Research" option is provided.
- **Full Contact Details:** The application now fetches and displays all custom fields (e.g., company revenue, address) and historical notes for GHL contacts.
- **Calendar "Upcoming Week" View:** The calendar feature was refactored into a simplified "Upcoming Week" list view, showing all appointments and blocked slots for the next 7 days.
- **"Join Meeting" Link:** The calendar view now displays a "Join Meeting" button for any appointment that has a valid meeting URL.
- **Editable Emails:** The AI-generated email is now presented in an editable text area, allowing team members to customize it and add their signatures before sending.

### 7.2. UI/UX Improvements

- **New "Clean Slate & Ocean Blue" Theme:** Implemented a new professional light-mode color scheme and updated the application's typography to use the `Inter` font for better readability.
- **Refactored Opportunity List:** The main opportunities list was redesigned into a vertical list of distinct cards for better visual separation and clarity.
- **Navigation Refactoring:** The "Insights" and "Saved" links were moved from the main header to the sidebar and renamed to "AI Insights" and "Company Research" for better organization.
- **Persistent Pipeline Selection:** The user's last selected pipeline is now saved in `localStorage` and automatically re-selected when they return to the app.

### 7.3. Major Bug Fixes & Architecture

- **GHL Authentication:** Fixed critical bugs in the OAuth flow, including correcting invalid scopes (`oauth/token`) and adding all required scopes for calendars, appointments, and custom fields (`calendars.readonly`, `calendars.write`, `calendars/events.read`, `calendars/events.write`, `locations/customFields.readonly`).
- **API Endpoint and Parameter Corrections:** Resolved numerous `401`, `403`, and `404` errors by correcting GHL API endpoint URLs and fixing parameter mismatches (e.g., `locationId` as a query parameter vs. a header, `userId` requirement).
- **Next.js Framework Errors:** Fixed a persistent and critical Next.js App Router error (`params should be awaited`) by refactoring the dynamic route handlers to correctly handle the asynchronous `params` object.
- **Database Schema:** Added a `ghl_contact_id` column to the `outreach_templates` table to allow for robust linking between GHL contacts and saved research.
- **Component Architecture:** Refactored the `OpportunitiesClient` and `OpportunityWorkspace` components to follow a proper parent-child, "smart-dumb" component architecture. All data fetching is now centralized in the parent component, resolving a cascade of state management bugs.
