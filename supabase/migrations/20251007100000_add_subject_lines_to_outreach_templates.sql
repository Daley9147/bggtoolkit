ALTER TABLE "public"."outreach_templates"
ADD COLUMN "email_subject_lines" TEXT[] DEFAULT '{}'::TEXT[];
