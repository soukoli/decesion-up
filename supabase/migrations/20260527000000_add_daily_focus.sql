-- Add daily focus to user_profile
alter table public.user_profile add column if not exists daily_focus text;
alter table public.user_profile add column if not exists daily_focus_date date;
