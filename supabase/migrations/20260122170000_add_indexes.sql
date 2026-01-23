CREATE INDEX IF NOT EXISTS idx_notes_contact_id ON public.notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON public.opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
