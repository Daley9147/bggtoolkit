-- Add opportunity_id to notes table
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE;

-- Make contact_id nullable to allow notes linked only to opportunities
ALTER TABLE public.notes 
ALTER COLUMN contact_id DROP NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notes_opportunity_id ON public.notes(opportunity_id);
