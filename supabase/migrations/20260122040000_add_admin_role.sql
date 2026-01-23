-- Add role and email columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Sync existing emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Update the handle_new_user function to sync email on creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set Darrel as admin (if user exists)
UPDATE public.profiles SET role = 'admin' WHERE email = 'darrel@missionmetrics.io';

-- Create trigger to ensure darrel is admin on signup
CREATE OR REPLACE FUNCTION public.set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'darrel@missionmetrics.io' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_set_admin ON public.profiles;
CREATE TRIGGER on_profile_before_insert_set_admin
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_role();

-- Update RLS Policies to allow Admin access

-- Pipelines
DROP POLICY IF EXISTS "Users can manage their own pipelines" ON public.pipelines;
CREATE POLICY "Users and Admins can manage pipelines" ON public.pipelines
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Stages
DROP POLICY IF EXISTS "Users can manage their own pipeline stages" ON public.stages;
CREATE POLICY "Users and Admins can manage pipeline stages" ON public.stages
    USING (
        EXISTS (SELECT 1 FROM public.pipelines WHERE id = pipeline_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Contacts
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
CREATE POLICY "Users and Admins can manage contacts" ON public.contacts
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Opportunities
DROP POLICY IF EXISTS "Users can manage their own opportunities" ON public.opportunities;
CREATE POLICY "Users and Admins can manage opportunities" ON public.opportunities
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notes
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
CREATE POLICY "Users and Admins can manage notes" ON public.notes
    USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));