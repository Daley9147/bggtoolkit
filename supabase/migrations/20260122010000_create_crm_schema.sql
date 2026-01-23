-- Cleanup Legacy Tables
DROP TABLE IF EXISTS public.ghl_integrations;
DROP TABLE IF EXISTS public.outreach_templates;
DROP TABLE IF EXISTS public.companies;
DROP TABLE IF EXISTS public.workspaces;

-- CRM Schema

-- Pipelines
CREATE TABLE public.pipelines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pipelines" ON public.pipelines USING (auth.uid() = user_id);

-- Stages
CREATE TABLE public.stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pipeline stages" ON public.stages USING (
    EXISTS (SELECT 1 FROM public.pipelines WHERE id = pipeline_id AND user_id = auth.uid())
);

-- Contacts
CREATE TABLE public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    identifier TEXT, -- Charity Number or EIN
    organization_name TEXT,
    country TEXT, -- 'UK' or 'US'
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own contacts" ON public.contacts USING (auth.uid() = user_id);

-- Opportunities
CREATE TABLE public.opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.stages(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    name TEXT NOT NULL, -- Opportunity Name
    value NUMERIC,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own opportunities" ON public.opportunities USING (auth.uid() = user_id);

-- Notes
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notes" ON public.notes USING (auth.uid() = user_id);
