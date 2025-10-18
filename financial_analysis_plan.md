# **CONSOLIDATED PLAN: PROPUBLICA API INTEGRATION FOR NON-PROFIT ANALYSIS**

This document provides a comprehensive, step-by-step blueprint for upgrading the AI outreach generation feature. The goal is to replace the manual PDF-based analysis with a direct, reliable integration with the ProPublica Non-Profit Explorer API. This will allow for automated, real-time financial data retrieval for non-profit organizations.

---

## **1. The Strategic Goal**

The objective is to pivot from a cumbersome PDF-parsing workflow to a streamlined, API-driven approach for financial analysis. By integrating the ProPublica API, we can instantly fetch key financial data for non-profits, allowing the AI to generate hyper-personalized, strategically relevant outreach with much greater speed and reliability. The financial analysis feature will be exclusively used for non-profit targets.

---

## **2. The Four-Step Implementation Plan**

This plan is designed to be executed sequentially, moving from the user interface to the backend logic and finishing with cleanup.

### **STEP 1: UPDATE THE USER INTERFACE (FRONTEND)**

The user interface must be modified to remove the PDF-related fields and add a new input for identifying the non-profit organization.

-   **File to Modify:** `src/components/ghl/workspace-tabs/OutreachPlanTab.tsx`
-   **Detailed Actions:**
    1.  **Remove PDF Input:** Remove the `financialsUrl` state and the associated "Financial Document URL" `Input` component.
    2.  **Add Non-Profit Identifier Input:**
        -   Introduce a new state variable: `const [nonProfitIdentifier, setNonProfitIdentifier] = useState('');`
        -   Add a new `Input` component with the label "Organization Name or EIN".
    3.  **Implement Conditional Rendering:** Ensure the "Organization Name or EIN" input field is only visible when the "Organization Type" dropdown is set to "Non-Profit".
    4.  **Update API Call:** In the `handleRunResearch` function, modify the `fetch` request body to send `nonProfitIdentifier` instead of `financialsUrl`.

### **STEP 2: CREATE PROPUBLICA API FETCHER (BACKEND)**

A dedicated module will be created to handle all communication with the ProPublica Non-Profit Explorer API.

-   **File to Create:** `src/lib/propublica/api.ts`
-   **Detailed Actions:**
    1.  **Create `fetchNonProfitData` Function:**
        -   This asynchronous function will take a non-profit identifier (name or EIN) as an argument.
        -   It will construct the appropriate ProPublica API URL to search for the organization.
        -   It will use `fetch` to call the API and retrieve the organization's financial data.
        -   The function will parse the JSON response and return the key financial details (e.g., total revenue, expenses, net income, program expense ratio).
        -   Error handling will be included to manage cases where the organization is not found or the API call fails.

### **STEP 3: REWORK CORE AI LOGIC (BACKEND)**

The main outreach generation logic will be adapted to use the new ProPublica data source.

-   **File to Modify:** `src/lib/ai/generate-outreach-plan.ts`
-   **Detailed Actions:**
    1.  **Update Function Signature:** The function will now accept `nonProfitIdentifier` as an argument instead of `financialsUrl`.
    2.  **Implement Conditional Logic:**
        -   An `if` block will check if `organizationType` is `"non-profit"` and if a `nonProfitIdentifier` has been provided.
        -   If true, the function will call the new `fetchNonProfitData` function from `src/lib/propublica/api.ts`.
        -   The financial data returned from the API will be formatted into a string and injected into the `nonProfitPrompt`.
        -   If `organizationType` is `"for-profit"`, the financial analysis will be skipped entirely, proceeding with the existing website-only analysis.
    3.  **Update AI Prompt:** The `nonProfitPrompt` will be reviewed and updated to align with the specific data fields provided by the ProPublica API, ensuring the AI can effectively use the new data.

### **STEP 4: CLEAN UP DEPENDENCIES**

To keep the project clean and lightweight, the old, unused PDF parsing library will be removed.

-   **Commands to Execute:**
    1.  `npm uninstall pdf-parse`
    2.  `npm uninstall --save-dev @types/pdf-parse`
-   **Code Cleanup:**
    -   Any remaining code related to the previous PDF parsing implementation, such as the `fetchAndParsePdf` function, will be deleted.
    -   The Adobe API credentials will be removed from the `.env.local` file.

---
