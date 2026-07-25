-- Admin role + curated pins (global / category) + author editor-picks

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.prompts
  add column if not exists admin_pin_global boolean not null default false,
  add column if not exists admin_pin_category boolean not null default false,
  add column if not exists admin_pinned_at timestamptz,
  add column if not exists owner_pinned_at timestamptz;

create index if not exists prompts_admin_pin_global_idx
  on public.prompts (admin_pinned_at desc nulls last)
  where admin_pin_global = true;

create index if not exists prompts_admin_pin_category_idx
  on public.prompts (category, admin_pinned_at desc nulls last)
  where admin_pin_category = true;

create index if not exists prompts_owner_pinned_idx
  on public.prompts (owner_pinned_at desc nulls last)
  where owner_pinned_at is not null;

-- Prevent non-admins from flipping admin pin columns via client updates.
-- Service role (auth.uid() null) and admins may change them.
create or replace function public.protect_prompt_pin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE' then
    if (
      new.admin_pin_global is distinct from old.admin_pin_global
      or new.admin_pin_category is distinct from old.admin_pin_category
      or new.admin_pinned_at is distinct from old.admin_pinned_at
    ) then
      if auth.uid() is not null
         and not exists (
           select 1 from public.profiles p
           where p.id = auth.uid() and p.is_admin = true
         ) then
        raise exception 'Only admins can change admin pin columns';
      end if;
    end if;

    if new.owner_pinned_at is distinct from old.owner_pinned_at then
      if auth.uid() is not null and auth.uid() is distinct from old.author_id then
        raise exception 'Only the prompt author can change owner pin';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prompts_protect_pin_columns on public.prompts;
create trigger prompts_protect_pin_columns
  before update on public.prompts
  for each row
  execute function public.protect_prompt_pin_columns();
