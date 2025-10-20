-- This script adds the missing updated_at column to the outreach_templates table.
-- This is the final fix to allow the upsert logic in the create_company_and_outreach_plan function to work correctly.

ALTER TABLE public.outreach_templates
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
