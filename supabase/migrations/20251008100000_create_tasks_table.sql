-- Create the tasks table
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    due_date timestamptz,
    priority text DEFAULT 'Medium'::text,
    status text DEFAULT 'Todo'::text,
    ghl_opportunity_id text,
    ghl_contact_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX tasks_user_id_idx ON public.tasks USING btree (user_id);
CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);


-- Enable Row-Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow users to view their own tasks" ON public.tasks
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own tasks" ON public.tasks
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own tasks" ON public.tasks
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own tasks" ON public.tasks
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
