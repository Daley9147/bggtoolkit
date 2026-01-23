-- Allow admins to view all profiles, users can view their own
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Admins view all, users view own" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to update all profiles, users can update their own
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Admins update all, users update own" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
