-- rampungin.com initial schema
create or replace function public.is_effectively_public(p_is_public boolean, p_public_until timestamptz)
returns boolean
language sql
stable
as $$
  select p_is_public and (p_public_until is null or p_public_until > now());
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  mode text not null check (mode in ('template', 'static')),
  body text not null,
  category text,
  tags text[] default '{}',
  image_path text,
  video_url text,
  is_public boolean not null default true,
  public_until timestamptz,
  copy_count int not null default 0,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompts_author_id_idx on public.prompts(author_id);
create index prompts_public_idx on public.prompts(is_public, public_until);

create table public.prompt_fields (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'select')),
  required boolean not null default false,
  options jsonb,
  sort_order int not null default 0,
  placeholder text,
  unique (prompt_id, field_key)
);

create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(split_part(coalesce(new.email, new.id::text), '@', 1), '[^a-z0-9_]', '', 'g'));
  if length(base) < 3 then
    base := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  base := substr(base, 1, 24);
  candidate := base;
  while exists(select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'full_name', candidate),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_fields enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

create policy profiles_select on public.profiles for select using (true);
create policy profiles_update on public.profiles for update using (auth.uid() = id);

create policy prompts_select on public.prompts for select using (
  author_id = auth.uid()
  or public.is_effectively_public(is_public, public_until)
);
create policy prompts_insert on public.prompts for insert with check (auth.uid() = author_id);
create policy prompts_update on public.prompts for update using (auth.uid() = author_id);
create policy prompts_delete on public.prompts for delete using (auth.uid() = author_id);

create policy prompt_fields_select on public.prompt_fields for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and (p.author_id = auth.uid() or public.is_effectively_public(p.is_public, p.public_until))
  )
);
create policy prompt_fields_write on public.prompt_fields for all using (
  exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid())
) with check (
  exists (select 1 from public.prompts p where p.id = prompt_id and p.author_id = auth.uid())
);

create policy likes_select on public.likes for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and (p.author_id = auth.uid() or public.is_effectively_public(p.is_public, p.public_until))
  )
);
create policy likes_insert on public.likes for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.prompts p
    where p.id = prompt_id and public.is_effectively_public(p.is_public, p.public_until)
  )
);
create policy likes_delete on public.likes for delete using (auth.uid() = user_id);

create policy comments_select on public.comments for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and (p.author_id = auth.uid() or public.is_effectively_public(p.is_public, p.public_until))
  )
);
create policy comments_insert on public.comments for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.prompts p
    where p.id = prompt_id and public.is_effectively_public(p.is_public, p.public_until)
  )
);
create policy comments_delete on public.comments for delete using (auth.uid() = user_id);

create policy follows_select on public.follows for select using (true);
create policy follows_insert on public.follows for insert with check (auth.uid() = follower_id);
create policy follows_delete on public.follows for delete using (auth.uid() = follower_id);

create or replace function public.increment_copy_count(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prompts
  set copy_count = copy_count + 1
  where id = p_id
    and public.is_effectively_public(is_public, public_until);
end;
$$;

create or replace function public.toggle_like(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  liked boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if not exists (
    select 1 from public.prompts
    where id = p_id and public.is_effectively_public(is_public, public_until)
  ) then
    raise exception 'not found';
  end if;

  if exists (select 1 from public.likes where user_id = auth.uid() and prompt_id = p_id) then
    delete from public.likes where user_id = auth.uid() and prompt_id = p_id;
    update public.prompts set like_count = greatest(like_count - 1, 0) where id = p_id;
    liked := false;
  else
    insert into public.likes (user_id, prompt_id) values (auth.uid(), p_id);
    update public.prompts set like_count = like_count + 1 where id = p_id;
    liked := true;
  end if;
  return liked;
end;
$$;

grant execute on function public.increment_copy_count(uuid) to anon, authenticated;
grant execute on function public.toggle_like(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true)
on conflict (id) do nothing;

create policy prompt_images_read on storage.objects for select
  using (bucket_id = 'prompt-images');

create policy prompt_images_insert on storage.objects for insert
  with check (
    bucket_id = 'prompt-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy prompt_images_delete on storage.objects for delete
  using (
    bucket_id = 'prompt-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
