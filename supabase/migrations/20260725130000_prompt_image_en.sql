-- Separate cover image per language (EN never falls back to ID cover)
alter table public.prompts
  add column if not exists image_path_en text;

comment on column public.prompts.image_path is 'Indonesian cover image path in prompt-images bucket';
comment on column public.prompts.image_path_en is 'English cover image path; no fallback to image_path';
