-- Rename organization_name to organisation_name in contacts table
ALTER TABLE public.contacts 
RENAME COLUMN organization_name TO organisation_name;
