-- Create the logged_actions table
DROP TABLE IF EXISTS public.logged_actions;
CREATE TABLE public.logged_actions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action text NOT NULL,
    details jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT logged_actions_pkey PRIMARY KEY (id),
    CONSTRAINT logged_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX logged_actions_user_id_idx ON public.logged_actions USING btree (user_id);
CREATE INDEX logged_actions_action_idx ON public.logged_actions USING btree (action);


-- Enable Row-Level Security
ALTER TABLE public.logged_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view their own logged actions" ON public.logged_actions
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own logged actions" ON public.logged_actions
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
