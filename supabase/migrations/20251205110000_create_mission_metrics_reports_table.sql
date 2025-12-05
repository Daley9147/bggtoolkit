create table if not exists mission_metrics_reports (
  id uuid default gen_random_uuid() primary key,
  contact_id text not null, -- GHL Contact ID
  user_id uuid references auth.users(id) on delete cascade not null,
  charity_number text,
  website_url text,
  specific_url text,
  report_json jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table mission_metrics_reports enable row level security;

create policy "Users can view their own mission metrics reports"
  on mission_metrics_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mission metrics reports"
  on mission_metrics_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mission metrics reports"
  on mission_metrics_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete their own mission metrics reports"
  on mission_metrics_reports for delete
  using (auth.uid() = user_id);

-- Create an index on contact_id for faster lookups
create index idx_mission_metrics_reports_contact_id on mission_metrics_reports(contact_id);
