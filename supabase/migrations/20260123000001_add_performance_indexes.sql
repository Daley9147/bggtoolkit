-- Optimize performance with Indexes

-- 1. Accelerate "Upsert" checks (finding existing contacts during upload)
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_identifier ON public.contacts(identifier);

-- 2. Accelerate Opportunity Workspace loading (finding the contact for an opportunity)
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON public.opportunities(contact_id);

-- 3. Accelerate Pipeline Board loading (finding opportunities in a specific pipeline/stage)
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline_stage ON public.opportunities(pipeline_id, stage_id);
