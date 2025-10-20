-- This is a comprehensive script to clean up duplicate data and fix the outreach plan generation.

-- Step 1: Delete all but the most recent outreach_template for each contact/user combination.
DELETE FROM public.outreach_templates
WHERE id IN (
    SELECT id
    FROM (
        SELECT
            id,
            ROW_NUMBER() OVER(PARTITION BY ghl_contact_id, user_id ORDER BY created_at DESC) as rn
        FROM
            public.outreach_templates
    ) t
    WHERE t.rn > 1
);

-- Step 2: Delete any companies that are no longer referenced by any outreach_templates.
DELETE FROM public.companies c
WHERE NOT EXISTS (
    SELECT 1
    FROM public.outreach_templates ot
    WHERE ot.company_id = c.id
);

-- Step 3: Safely de-duplicate any remaining companies.
-- First, re-assign outreach templates from duplicate companies to the "golden" record.
WITH duplicates AS (
    SELECT
        id,
        name,
        user_id,
        FIRST_VALUE(id) OVER (PARTITION BY name, user_id ORDER BY id DESC) as golden_record_id
    FROM
        public.companies
),
remapping AS (
    SELECT id as duplicate_id, golden_record_id
    FROM duplicates
    WHERE id != golden_record_id
)
UPDATE public.outreach_templates
SET company_id = remapping.golden_record_id
FROM remapping
WHERE public.outreach_templates.company_id = remapping.duplicate_id;

-- Now, delete the duplicate companies that have been remapped.
DELETE FROM public.companies
WHERE id IN (
    SELECT id
    FROM (
        SELECT
            id,
            FIRST_VALUE(id) OVER (PARTITION BY name, user_id ORDER BY id DESC) as golden_record_id
        FROM
            public.companies
    ) as subquery
    WHERE id != golden_record_id
);


-- Step 4: Add the unique constraint to the companies table idempotently.
ALTER TABLE public.companies
DROP CONSTRAINT IF EXISTS companies_name_user_id_key;

ALTER TABLE public.companies
ADD CONSTRAINT companies_name_user_id_key UNIQUE (name, user_id);


-- Step 5: Recreate the function with the final, correct upsert logic.
create or replace function public.create_company_and_outreach_plan(
    p_user_id uuid,
    p_ghl_contact_id text,
    p_company_name text,
    p_industry text,
    p_website text,
    p_summary text,
    p_developments text,
    p_contact_first_name text,
    p_job_title text,
    p_insights text,
    p_email text,
    p_email_subject_lines jsonb,
    p_linkedin_connection_note text,
    p_linkedin_follow_up_dm text,
    p_cold_call_script text,
    p_follow_up_email_subject_lines jsonb,
    p_follow_up_email_body text
)
returns void
language plpgsql
as $$
declare
    v_company_id uuid;
begin
    -- Upsert the company, handling potential conflicts on (name, user_id)
    insert into companies (user_id, name, industry, website, summary, developments)
    values (p_user_id, p_company_name, p_industry, p_website, p_summary, p_developments)
    on conflict (name, user_id) do update 
    set 
        industry = excluded.industry,
        website = excluded.website,
        summary = excluded.summary,
        developments = excluded.developments
    returning id into v_company_id;

    -- Upsert the outreach plan, handling potential conflicts on (ghl_contact_id, user_id)
    insert into outreach_templates (
        user_id,
        ghl_contact_id,
        company_id,
        contact_first_name,
        job_title,
        insights,
        email,
        email_subject_lines,
        linkedin_connection_note,
        linkedin_follow_up_dm,
        cold_call_script,
        follow_up_email_subject_lines,
        follow_up_email_body
    )
    values (
        p_user_id,
        p_ghl_contact_id,
        v_company_id,
        p_contact_first_name,
        p_job_title,
        p_insights,
        p_email,
        p_email_subject_lines,
        p_linkedin_connection_note,
        p_linkedin_follow_up_dm,
        p_cold_call_script,
        p_follow_up_email_subject_lines,
        p_follow_up_email_body
    )
    on conflict (ghl_contact_id, user_id) do update
    set
        company_id = excluded.company_id,
        contact_first_name = excluded.contact_first_name,
        job_title = excluded.job_title,
        insights = excluded.insights,
        email = excluded.email,
        email_subject_lines = excluded.email_subject_lines,
        linkedin_connection_note = excluded.linkedin_connection_note,
        linkedin_follow_up_dm = excluded.linkedin_follow_up_dm,
        cold_call_script = excluded.cold_call_script,
        follow_up_email_subject_lines = excluded.follow_up_email_subject_lines,
        follow_up_email_body = excluded.follow_up_email_body,
        updated_at = now();
end;
$$;