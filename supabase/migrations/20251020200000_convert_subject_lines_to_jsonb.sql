ALTER TABLE public.outreach_templates
ALTER COLUMN email_subject_lines TYPE jsonb
USING to_jsonb(email_subject_lines);
