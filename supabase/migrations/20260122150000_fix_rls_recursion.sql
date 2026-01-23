-- Fix Infinite Recursion in RLS

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Admins view all, users view own" ON public.profiles;

-- 3. Re-create policy using the function
CREATE POLICY "Admins view all, users view own" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

-- Fix Update Policy too
DROP POLICY IF EXISTS "Admins update all, users update own" ON public.profiles;
CREATE POLICY "Admins update all, users update own" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);
