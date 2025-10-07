DELETE FROM public.outreach_templates a
USING public.outreach_templates b
WHERE
    a.id < b.id
    AND a.ghl_contact_id = b.ghl_contact_id
    AND a.user_id = b.user_id;
