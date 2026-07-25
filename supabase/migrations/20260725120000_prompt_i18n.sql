-- Bilingual prompt content (EN columns; existing title/body/tags = Indonesian)
alter table public.prompts
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists body_en text,
  add column if not exists tags_en text[] default '{}';

comment on column public.prompts.title is 'Indonesian title (primary)';
comment on column public.prompts.title_en is 'English title; required with body_en for EN availability';
comment on column public.prompts.body_en is 'English body; required with title_en for EN availability';
comment on column public.prompts.tags_en is 'English tags';
