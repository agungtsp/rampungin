-- AI platform label + usage guide (bilingual)

alter table public.prompts
  add column if not exists ai_platform text not null default 'all',
  add column if not exists usage_guide text,
  add column if not exists usage_guide_en text;

alter table public.prompts
  drop constraint if exists prompts_ai_platform_check;

alter table public.prompts
  add constraint prompts_ai_platform_check
  check (ai_platform in ('chatgpt', 'gemini', 'all'));

comment on column public.prompts.ai_platform is 'Target AI: chatgpt | gemini | all';
comment on column public.prompts.usage_guide is 'How-to / tutorial text (ID); null = app default';
comment on column public.prompts.usage_guide_en is 'How-to / tutorial text (EN); null = app default';
