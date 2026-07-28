-- Soft delete + owner short links (/p/{slug})

alter table public.prompts
  add column if not exists deleted_at timestamptz,
  add column if not exists short_slug text;

alter table public.prompts
  drop constraint if exists prompts_short_slug_format;

alter table public.prompts
  add constraint prompts_short_slug_format
  check (
    short_slug is null
    or short_slug ~ '^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])?$'
  );

create unique index if not exists prompts_short_slug_uidx
  on public.prompts (short_slug)
  where short_slug is not null;

create index if not exists prompts_deleted_at_idx
  on public.prompts (deleted_at)
  where deleted_at is not null;

-- Hide soft-deleted prompts from all selects (including owner lists).
drop policy if exists prompts_select on public.prompts;
create policy prompts_select on public.prompts for select using (
  deleted_at is null
  and (
    author_id = auth.uid()
    or public.is_effectively_public(is_public, public_until)
  )
);

-- Related policies: treat deleted parents as invisible.
drop policy if exists prompt_fields_select on public.prompt_fields;
create policy prompt_fields_select on public.prompt_fields for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and p.deleted_at is null
      and (
        p.author_id = auth.uid()
        or public.is_effectively_public(p.is_public, p.public_until)
      )
  )
);

drop policy if exists likes_select on public.likes;
create policy likes_select on public.likes for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and p.deleted_at is null
      and (
        p.author_id = auth.uid()
        or public.is_effectively_public(p.is_public, p.public_until)
      )
  )
);

drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select using (
  exists (
    select 1 from public.prompts p
    where p.id = prompt_id
      and p.deleted_at is null
      and (
        p.author_id = auth.uid()
        or public.is_effectively_public(p.is_public, p.public_until)
      )
  )
);
