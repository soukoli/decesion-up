-- Decision App New - Supabase Schema
-- Migration 001: Initial tables

-- Enable UUID extension

-- User profile (extends Supabase auth.users)
create table if not exists public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  language text default 'cs',
  theme text default 'dark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ideas raw (user input - single stream)
create table if not exists public.ideas_raw (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  source text default 'text',
  voice_transcript text,
  podcast_id text,
  podcast_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Idea groups (AI-generated dynamic categories) - MUST be before ideas_ai
create table if not exists public.idea_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'blue',
  ai_generated boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI analyzed ideas (after OpenAI processing)
create table if not exists public.ideas_ai (
  id uuid primary key default gen_random_uuid(),
  raw_id uuid not null references public.ideas_raw(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  context text,
  priority text not null default 'blue',
  status text not null default 'active',
  group_id uuid references public.idea_groups(id) on delete set null,
  ai_label text,
  ai_reason text,
  done_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Links between related ideas
create table if not exists public.idea_links (
  id uuid primary key default gen_random_uuid(),
  idea_a uuid not null references public.ideas_ai(id) on delete cascade,
  idea_b uuid not null references public.ideas_ai(id) on delete cascade,
  relationship text,
  created_at timestamptz default now()
);

-- Archive
create table if not exists public.archive (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid not null references public.ideas_ai(id) on delete cascade,
  archived_at timestamptz default now(),
  reason text
);

-- Podcast notes
create table if not exists public.podcast_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  podcast_id text not null,
  podcast_name text not null,
  episode_title text,
  note text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean default false,
  idea_id uuid references public.ideas_ai(id) on delete set null,
  created_at timestamptz default now()
);

-- School items
create table if not exists public.school_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz,
  source text,
  created_at timestamptz default now()
);

-- Sync state
create table if not exists public.sync_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  last_sync timestamptz default now(),
  device_id text,
  sync_version integer default 1
);

-- Indexes
create index if not exists idx_ideas_raw_user on public.ideas_raw(user_id);
create index if not exists idx_ideas_ai_user on public.ideas_ai(user_id);
create index if not exists idx_ideas_ai_status on public.ideas_ai(status);
create index if not exists idx_ideas_ai_priority on public.ideas_ai(priority);
create index if not exists idx_ideas_ai_group on public.ideas_ai(group_id);
create index if not exists idx_idea_groups_user on public.idea_groups(user_id);
create index if not exists idx_archive_user on public.archive(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read = false;

-- Row Level Security
alter table public.user_profile enable row level security;
alter table public.ideas_raw enable row level security;
alter table public.ideas_ai enable row level security;
alter table public.idea_groups enable row level security;
alter table public.idea_links enable row level security;
alter table public.archive enable row level security;
alter table public.podcast_notes enable row level security;
alter table public.notifications enable row level security;
alter table public.school_items enable row level security;
alter table public.sync_state enable row level security;

-- RLS Policies
do $$ begin
  -- Drop existing policies if they exist (idempotent)
  drop policy if exists "Users can view own profile" on public.user_profile;
  drop policy if exists "Users can update own profile" on public.user_profile;
  drop policy if exists "Users can insert own profile" on public.user_profile;
  drop policy if exists "Users own ideas_raw" on public.ideas_raw;
  drop policy if exists "Users own ideas_ai" on public.ideas_ai;
  drop policy if exists "Users own idea_groups" on public.idea_groups;
  drop policy if exists "Users own idea_links" on public.idea_links;
  drop policy if exists "Users own archive" on public.archive;
  drop policy if exists "Users own podcast_notes" on public.podcast_notes;
  drop policy if exists "Users own notifications" on public.notifications;
  drop policy if exists "Users own school_items" on public.school_items;
  drop policy if exists "Users own sync_state" on public.sync_state;
end $$;

create policy "Users can view own profile" on public.user_profile for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profile for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profile for insert with check (auth.uid() = id);
create policy "Users own ideas_raw" on public.ideas_raw for all using (auth.uid() = user_id);
create policy "Users own ideas_ai" on public.ideas_ai for all using (auth.uid() = user_id);
create policy "Users own idea_groups" on public.idea_groups for all using (auth.uid() = user_id);
create policy "Users own idea_links" on public.idea_links for all using (
  auth.uid() = (select user_id from public.ideas_ai where id = idea_a)
);
create policy "Users own archive" on public.archive for all using (auth.uid() = user_id);
create policy "Users own podcast_notes" on public.podcast_notes for all using (auth.uid() = user_id);
create policy "Users own notifications" on public.notifications for all using (auth.uid() = user_id);
create policy "Users own school_items" on public.school_items for all using (auth.uid() = user_id);
create policy "Users own sync_state" on public.sync_state for all using (auth.uid() = user_id);

-- Updated_at triggers
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_user_profile_updated_at on public.user_profile;
drop trigger if exists update_ideas_raw_updated_at on public.ideas_raw;
drop trigger if exists update_ideas_ai_updated_at on public.ideas_ai;
drop trigger if exists update_idea_groups_updated_at on public.idea_groups;
drop trigger if exists update_podcast_notes_updated_at on public.podcast_notes;

create trigger update_user_profile_updated_at before update on public.user_profile for each row execute function public.update_updated_at();
create trigger update_ideas_raw_updated_at before update on public.ideas_raw for each row execute function public.update_updated_at();
create trigger update_ideas_ai_updated_at before update on public.ideas_ai for each row execute function public.update_updated_at();
create trigger update_idea_groups_updated_at before update on public.idea_groups for each row execute function public.update_updated_at();
create trigger update_podcast_notes_updated_at before update on public.podcast_notes for each row execute function public.update_updated_at();
