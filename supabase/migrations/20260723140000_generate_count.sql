-- generate_count: track "Hasilkan Prompt" clicks
alter table public.prompts
  add column if not exists generate_count int not null default 0;

create or replace function public.increment_generate_count(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prompts
  set generate_count = generate_count + 1
  where id = p_id
    and public.is_effectively_public(is_public, public_until);
end;
$$;

grant execute on function public.increment_generate_count(uuid) to anon, authenticated;

-- Refresh PostgREST schema cache so rpc() finds the new function
notify pgrst, 'reload schema';
