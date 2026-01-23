-- Create email_accounts table for IMAP/SMTP settings
CREATE TABLE public.email_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    imap_host TEXT,
    imap_port INTEGER DEFAULT 993,
    imap_user TEXT,
    imap_password TEXT, -- Note: In production, this should be encrypted!
    smtp_host TEXT,
    smtp_port INTEGER DEFAULT 465,
    smtp_user TEXT,
    smtp_password TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Policies
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

-- Users can see/edit their own
CREATE POLICY "Users can manage their own email settings" ON public.email_accounts
USING (auth.uid() = user_id);

-- Admins can see/edit ALL (to help set them up)
CREATE POLICY "Admins can manage all email settings" ON public.email_accounts
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
