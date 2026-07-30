-- Labs intake submissions (native form → DB + Telegram)

create table public.labs_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  locale text not null check (locale in ('en', 'id')),
  name text not null,
  email text not null,
  phone text not null,
  audience text not null check (
    audience in ('daily', 'family', 'friends', 'business', 'school', 'mix')
  ),
  problem text not null,
  repeating_tasks text not null,
  time_spent text not null check (
    time_spent in ('under_2h', '2_5h', '5_10h', '10_plus')
  ),
  expectations text[] not null default '{}',
  notes text,
  ip_hash text,
  telegram_sent_at timestamptz,
  telegram_error text,
  constraint labs_submissions_name_len check (char_length(name) between 1 and 120),
  constraint labs_submissions_email_len check (char_length(email) between 3 and 254),
  constraint labs_submissions_phone_len check (char_length(phone) between 8 and 32),
  constraint labs_submissions_problem_len check (char_length(problem) between 1 and 5000),
  constraint labs_submissions_repeating_len check (char_length(repeating_tasks) between 1 and 5000),
  constraint labs_submissions_notes_len check (notes is null or char_length(notes) <= 5000),
  constraint labs_submissions_expectations_nonempty check (cardinality(expectations) >= 1)
);

create index labs_submissions_created_at_idx
  on public.labs_submissions (created_at desc);

create index labs_submissions_ip_hash_created_idx
  on public.labs_submissions (ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.labs_submissions enable row level security;
-- No policies for anon/authenticated: service role only (API + admin).
