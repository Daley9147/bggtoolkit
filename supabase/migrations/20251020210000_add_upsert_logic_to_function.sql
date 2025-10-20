-- Recreate the function with upsert logic for outreach_templates
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
    -- Upsert the company
    insert into companies (user_id, name, industry, website, summary, developments)
    values (p_user_id, p_company_name, p_industry, p_website, p_summary, p_developments)
    on conflict (name, user_id) do update 
    set 
        industry = excluded.industry,
        website = excluded.website,
        summary = excluded.summary,
        developments = excluded.developments
    returning id into v_company_id;

    -- Upsert the outreach plan
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
