-- Fix RLS policies: add WITH CHECK for INSERT operations
drop policy if exists "Users own ideas_raw" on public.ideas_raw;
drop policy if exists "Users own ideas_ai" on public.ideas_ai;
drop policy if exists "Users own idea_groups" on public.idea_groups;
drop policy if exists "Users own profile" on public.user_profile;

create policy "Users own ideas_raw" on public.ideas_raw
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own ideas_ai" on public.ideas_ai
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own idea_groups" on public.idea_groups
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own profile" on public.user_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);
