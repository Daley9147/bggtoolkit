-- Add Calendly URL to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS calendly_url TEXT;
