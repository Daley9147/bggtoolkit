-- Optimize performance for List Management
CREATE INDEX IF NOT EXISTS idx_contacts_list_name ON public.contacts(list_name);
