-- Saved prompt folders + ratings

-- 1) Rating aggregates on prompts -------------------------------------------
alter table public.prompts
  add column if not exists rating_avg numeric(3,2) not null default 0,
  add column if not exists rating_count int not null default 0;

-- 2) Save folders -----------------------------------------------------------
create table if not exists public.save_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint save_folders_name_len check (char_length(trim(name)) between 1 and 80)
);

create unique index if not exists save_folders_user_name_uidx
  on public.save_folders (user_id, lower(trim(name)));

create unique index if not exists save_folders_user_default_uidx
  on public.save_folders (user_id)
  where is_default;

create index if not exists save_folders_user_id_idx on public.save_folders(user_id);

-- 3) Saved prompts (multi-folder) -------------------------------------------
create table if not exists public.saved_prompts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  folder_id uuid not null references public.save_folders(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id, folder_id)
);

create index if not exists saved_prompts_folder_id_idx on public.saved_prompts(folder_id);
create index if not exists saved_prompts_user_prompt_idx on public.saved_prompts(user_id, prompt_id);

-- 4) Ratings ----------------------------------------------------------------
create table if not exists public.prompt_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create index if not exists prompt_ratings_prompt_id_idx on public.prompt_ratings(prompt_id);

-- 5) Ensure default Uncategorized folder ------------------------------------
create or replace function public.ensure_default_save_folder()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select id into fid
  from public.save_folders
  where user_id = uid and is_default
  limit 1;

  if fid is null then
    insert into public.save_folders (user_id, name, is_default)
    values (uid, 'Uncategorized', true)
    returning id into fid;
  end if;
  return fid;
end;
$$;

grant execute on function public.ensure_default_save_folder() to authenticated;

-- 6) Recalc rating aggregates -----------------------------------------------
create or replace function public.refresh_prompt_rating(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prompts p
  set
    rating_count = coalesce((select count(*)::int from public.prompt_ratings r where r.prompt_id = p_id), 0),
    rating_avg = coalesce((select round(avg(r.stars)::numeric, 2) from public.prompt_ratings r where r.prompt_id = p_id), 0)
  where p.id = p_id;
end;
$$;

create or replace function public.upsert_prompt_rating(p_id uuid, p_stars int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_stars < 1 or p_stars > 5 then
    raise exception 'invalid stars';
  end if;
  if not exists (
    select 1 from public.prompts
    where id = p_id and public.is_effectively_public(is_public, public_until)
  ) then
    raise exception 'not found';
  end if;

  insert into public.prompt_ratings (user_id, prompt_id, stars, updated_at)
  values (auth.uid(), p_id, p_stars, now())
  on conflict (user_id, prompt_id) do update
    set stars = excluded.stars, updated_at = now();

  perform public.refresh_prompt_rating(p_id);
end;
$$;

create or replace function public.clear_prompt_rating(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from public.prompt_ratings
  where user_id = auth.uid() and prompt_id = p_id;
  perform public.refresh_prompt_rating(p_id);
end;
$$;

grant execute on function public.upsert_prompt_rating(uuid, int) to authenticated;
grant execute on function public.clear_prompt_rating(uuid) to authenticated;

-- Prevent deleting default folder
create or replace function public.prevent_default_folder_delete()
returns trigger
language plpgsql
as $$
begin
  if old.is_default then
    raise exception 'cannot delete default folder';
  end if;
  return old;
end;
$$;

drop trigger if exists save_folders_no_delete_default on public.save_folders;
create trigger save_folders_no_delete_default
  before delete on public.save_folders
  for each row execute function public.prevent_default_folder_delete();

-- When deleting a non-default folder, move saves to Uncategorized first is app responsibility;
-- ON DELETE CASCADE removes memberships. App should reassign before delete.

-- 7) RLS --------------------------------------------------------------------
alter table public.save_folders enable row level security;
alter table public.saved_prompts enable row level security;
alter table public.prompt_ratings enable row level security;

drop policy if exists save_folders_select on public.save_folders;
create policy save_folders_select on public.save_folders
  for select using (auth.uid() = user_id);

drop policy if exists save_folders_insert on public.save_folders;
create policy save_folders_insert on public.save_folders
  for insert with check (auth.uid() = user_id);

drop policy if exists save_folders_update on public.save_folders;
create policy save_folders_update on public.save_folders
  for update using (auth.uid() = user_id);

drop policy if exists save_folders_delete on public.save_folders;
create policy save_folders_delete on public.save_folders
  for delete using (auth.uid() = user_id and is_default = false);

drop policy if exists saved_prompts_select on public.saved_prompts;
create policy saved_prompts_select on public.saved_prompts
  for select using (auth.uid() = user_id);

drop policy if exists saved_prompts_insert on public.saved_prompts;
create policy saved_prompts_insert on public.saved_prompts
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.save_folders f
      where f.id = folder_id and f.user_id = auth.uid()
    )
    and exists (
      select 1 from public.prompts p
      where p.id = prompt_id
        and public.is_effectively_public(p.is_public, p.public_until)
    )
  );

drop policy if exists saved_prompts_delete on public.saved_prompts;
create policy saved_prompts_delete on public.saved_prompts
  for delete using (auth.uid() = user_id);

drop policy if exists prompt_ratings_select on public.prompt_ratings;
create policy prompt_ratings_select on public.prompt_ratings
  for select using (
    exists (
      select 1 from public.prompts p
      where p.id = prompt_id
        and (p.author_id = auth.uid() or public.is_effectively_public(p.is_public, p.public_until))
    )
  );

drop policy if exists prompt_ratings_insert on public.prompt_ratings;
create policy prompt_ratings_insert on public.prompt_ratings
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.prompts p
      where p.id = prompt_id and public.is_effectively_public(p.is_public, p.public_until)
    )
  );

drop policy if exists prompt_ratings_update on public.prompt_ratings;
create policy prompt_ratings_update on public.prompt_ratings
  for update using (auth.uid() = user_id);

drop policy if exists prompt_ratings_delete on public.prompt_ratings;
create policy prompt_ratings_delete on public.prompt_ratings
  for delete using (auth.uid() = user_id);
