CREATE TABLE "public"."workspaces" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "public"."profiles"("id") ON DELETE CASCADE NOT NULL,
    "title" TEXT,
    "data" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own workspaces"
ON "public"."workspaces"
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
