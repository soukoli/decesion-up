-- Decision App New — Clean Schema (4 tables)
-- Created: May 2026

-- User profile (settings, extends auth.users)
create table public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  font_size text not null default 'md',
  language text not null default 'cs',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Idea groups (dynamic projects/life areas, max 15 per user)
create table public.idea_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'blue',
  ai_generated boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Raw ideas (user input stream)
create table public.ideas_raw (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  source text not null default 'text',
  podcast_name text,
  created_at timestamptz default now()
);

-- AI-processed ideas (categorized, prioritized)
create table public.ideas_ai (
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

-- Indexes
create index idx_ideas_raw_user on public.ideas_raw(user_id);
create index idx_ideas_ai_user on public.ideas_ai(user_id);
create index idx_ideas_ai_status on public.ideas_ai(status);
create index idx_ideas_ai_priority on public.ideas_ai(priority);
create index idx_ideas_ai_group on public.ideas_ai(group_id);
create index idx_idea_groups_user on public.idea_groups(user_id);

-- Row Level Security
alter table public.user_profile enable row level security;
alter table public.ideas_raw enable row level security;
alter table public.ideas_ai enable row level security;
alter table public.idea_groups enable row level security;

create policy "Users own profile" on public.user_profile for all using (auth.uid() = id);
create policy "Users own ideas_raw" on public.ideas_raw for all using (auth.uid() = user_id);
create policy "Users own ideas_ai" on public.ideas_ai for all using (auth.uid() = user_id);
create policy "Users own idea_groups" on public.idea_groups for all using (auth.uid() = user_id);

-- Auto-update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_user_profile_updated before update on public.user_profile for each row execute function public.update_updated_at();
create trigger tr_ideas_ai_updated before update on public.ideas_ai for each row execute function public.update_updated_at();
create trigger tr_idea_groups_updated before update on public.idea_groups for each row execute function public.update_updated_at();
