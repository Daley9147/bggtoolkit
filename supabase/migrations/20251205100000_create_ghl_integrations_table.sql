create table if not exists ghl_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  access_token text not null,
  refresh_token text not null,
  location_id text not null,
  label text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, label)
);

-- RLS Policies
alter table ghl_integrations enable row level security;

create policy "Users can view their own integrations"
  on ghl_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
  on ghl_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on ghl_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on ghl_integrations for delete
  using (auth.uid() = user_id);
