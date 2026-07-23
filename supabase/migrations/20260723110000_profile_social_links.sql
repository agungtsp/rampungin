-- Add social media links to profiles
alter table public.profiles
  add column if not exists threads_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists linkedin_url text;
