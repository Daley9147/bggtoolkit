-- Update all policies to use the safe public.is_admin() function

-- Pipelines
DROP POLICY IF EXISTS "Users and Admins can manage pipelines" ON public.pipelines;
CREATE POLICY "Users and Admins can manage pipelines" ON public.pipelines
    USING (auth.uid() = user_id OR public.is_admin());

-- Stages
DROP POLICY IF EXISTS "Users and Admins can manage pipeline stages" ON public.stages;
CREATE POLICY "Users and Admins can manage pipeline stages" ON public.stages
    USING (
        EXISTS (SELECT 1 FROM public.pipelines WHERE id = pipeline_id AND user_id = auth.uid())
        OR public.is_admin()
    );

-- Contacts
DROP POLICY IF EXISTS "Users and Admins can manage contacts" ON public.contacts;
CREATE POLICY "Users and Admins can manage contacts" ON public.contacts
    USING (auth.uid() = user_id OR public.is_admin());

-- Opportunities
DROP POLICY IF EXISTS "Users and Admins can manage opportunities" ON public.opportunities;
CREATE POLICY "Users and Admins can manage opportunities" ON public.opportunities
    USING (auth.uid() = user_id OR public.is_admin());

-- Notes
DROP POLICY IF EXISTS "Users and Admins can manage notes" ON public.notes;
CREATE POLICY "Users and Admins can manage notes" ON public.notes
    USING (auth.uid() = user_id OR public.is_admin());
