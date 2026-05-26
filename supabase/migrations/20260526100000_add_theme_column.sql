-- Add theme column to user_profile
alter table public.user_profile add column if not exists theme text not null default 'dark';
