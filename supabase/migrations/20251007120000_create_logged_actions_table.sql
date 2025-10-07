CREATE TABLE "public"."logged_actions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "contact_id" TEXT,
    "action_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE "public"."logged_actions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own logged actions"
ON "public"."logged_actions"
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own logged actions"
ON "public"."logged_actions"
FOR INSERT
WITH CHECK (auth.uid() = user_id);
