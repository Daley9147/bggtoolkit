-- Add new columns to contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
ADD COLUMN IF NOT EXISTS corporate_phone TEXT,
ADD COLUMN IF NOT EXISTS other_phone TEXT,
ADD COLUMN IF NOT EXISTS list_name TEXT;

-- Wipe existing data
TRUNCATE TABLE public.opportunities CASCADE;
TRUNCATE TABLE public.contacts CASCADE;
