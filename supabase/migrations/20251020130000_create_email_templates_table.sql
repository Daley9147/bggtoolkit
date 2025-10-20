CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_name TEXT NOT NULL,
    subject_line TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email templates"
ON email_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email templates"
ON email_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates"
ON email_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates"
ON email_templates FOR DELETE
USING (auth.uid() = user_id);
