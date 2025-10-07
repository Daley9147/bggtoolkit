## Project Overview

This project is the **BGG Sales Toolkit**, a Next.js web application designed to integrate directly with the GoHighLevel (GHL) CRM.

### Core Functionality:

- **GHL Opportunity Management:** Users can connect their GHL account via OAuth and view their assigned opportunities, filtered by pipeline and stage.
- **Contact Details:** The application fetches and displays full contact details from GHL, including all standard fields, custom fields (e.g., company revenue, address), and historical notes.
- **AI-Powered Research & Outreach:** The toolkit integrates with the Gemini AI to perform research on a contact's company.
    - Users can provide a company homepage and a specific article/case study URL.
    - The AI generates a detailed outreach plan, including key insights, a personalized email, LinkedIn messages, and a cold call script.
- **Workflow Integration:**
    - Generated insights can be synced to the contact's notes in GHL with a single click.
    - Outreach emails can be sent directly through GHL from the toolkit.
    - Users can log call notes, which are added to the contact's record in GHL.
    - The generated outreach plans are automatically saved to the toolkit's own database for future reference.

### Technical Stack:

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Supabase
- **CRM Integration:** GoHighLevel (GHL) API v2
- **AI:** Google Gemini
- **Styling:** Tailwind CSS, shadcn/ui

---
## Gemini Added Memories
- The development server for this project should be started on port 9003, as port 9002 is often already in use.
- For this project, only use the `gemini-2.5-flash` model. Never use `gemini-1.5-flash`.
- GHL Client Secret: c7f1e5cc-2747-42b2-a157-52ee838377b3
