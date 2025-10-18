ALTER TABLE public.outreach_templates
ADD COLUMN follow_up_email_subject_lines jsonb,
ADD COLUMN follow_up_email_body text;
