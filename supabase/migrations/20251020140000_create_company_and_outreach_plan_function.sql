CREATE OR REPLACE FUNCTION create_company_and_outreach_plan(
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
)
RETURNS void AS $$
DECLARE
    v_company_id uuid;
BEGIN
    -- Check if a company with the given name already exists for the user
    SELECT id INTO v_company_id
    FROM companies
    WHERE name = p_company_name AND user_id = p_user_id;

    -- If the company does not exist, create it
    IF v_company_id IS NULL THEN
        INSERT INTO companies (user_id, name, industry, website, summary, developments)
        VALUES (p_user_id, p_company_name, p_industry, p_website, p_summary, p_developments)
        RETURNING id INTO v_company_id;
    END IF;

    -- Insert the outreach plan, linking it to the company
    INSERT INTO outreach_templates (
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
    VALUES (
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
END;
$$ LANGUAGE plpgsql;
