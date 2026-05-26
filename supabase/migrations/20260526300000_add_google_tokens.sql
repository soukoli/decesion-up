-- Add google_token column to user_profile for Google Drive backup
alter table public.user_profile add column if not exists google_token text;
alter table public.user_profile add column if not exists google_refresh_token text;
