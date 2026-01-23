-- Update RLS to allow Admins to view all contacts

-- Drop the old strict policy
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;

-- Create new policy: Users see their own, OR Admins see everything
CREATE POLICY "Users can manage their own contacts OR Admins see all" ON public.contacts
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Note: We keep Opportunities strict so the Admin's Pipeline Board doesn't get cluttered.
-- Admin can see the *Contacts* in the list view, but won't see the *Deals* on their board unless they own them.
