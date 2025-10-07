ALTER TABLE public.outreach_templates
ADD CONSTRAINT outreach_templates_ghl_contact_id_user_id_key UNIQUE (ghl_contact_id, user_id);
