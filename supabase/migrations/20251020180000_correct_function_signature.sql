-- Drop the incorrect function with text[] parameters
DROP FUNCTION IF EXISTS public.create_company_and_outreach_plan(
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
    p_email_subject_lines text[],
    p_linkedin_connection_note text,
    p_linkedin_follow_up_dm text,
    p_cold_call_script text,
    p_follow_up_email_subject_lines text[],
    p_follow_up_email_body text
);

-- Recreate the function with the correct jsonb parameters
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
    -- Check if a company with the given name already exists for the user
    select id
      into v_company_id
      from companies
     where name = p_company_name
       and user_id = p_user_id;

    -- If the company does not exist, create it
    if v_company_id is null then
        insert into companies (user_id, name, industry, website, summary, developments)
        values (p_user_id, p_company_name, p_industry, p_website, p_summary, p_developments)
        returning id into v_company_id;
    end if;

    -- Insert the outreach plan
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
    );
end;
$$;
