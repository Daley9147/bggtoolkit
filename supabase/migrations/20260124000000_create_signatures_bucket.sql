-- Create a storage bucket for signatures if it doesn't exist
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

-- Set up security policies for the signatures bucket

-- Allow public read access (for viewing signatures in emails)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'signatures' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'signatures'
    and auth.role() = 'authenticated'
  );

-- Allow users to update their own images
create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'signatures'
    and auth.uid() = owner
  );

-- Allow users to delete their own images
create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'signatures'
    and auth.uid() = owner
  );
