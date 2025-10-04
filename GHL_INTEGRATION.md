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
