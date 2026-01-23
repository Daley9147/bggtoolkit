-- Force update admin role again to ensure RLS works
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'darrel@missionmetrics.io';
