-- Update RLS for Pipelines and Stages to allow Admin access

-- 1. Pipelines
-- Clean up old strict policy if it exists
DROP POLICY IF EXISTS "Users can manage their own pipelines" ON public.pipelines;
-- Clean up the new policy if it already exists (prevents "already exists" error)
DROP POLICY IF EXISTS "Users and Admins can manage pipelines" ON public.pipelines;

CREATE POLICY "Users and Admins can manage pipelines" ON public.pipelines
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- 2. Stages
-- Clean up old strict policy if it exists
DROP POLICY IF EXISTS "Users can manage their own pipeline stages" ON public.stages;
-- Clean up the new policy if it already exists
DROP POLICY IF EXISTS "Users and Admins can manage stages" ON public.stages;

CREATE POLICY "Users and Admins can manage stages" ON public.stages
USING (
    EXISTS (
        SELECT 1 FROM public.pipelines 
        WHERE id = pipeline_id 
        AND (
            user_id = auth.uid()
            OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    )
);