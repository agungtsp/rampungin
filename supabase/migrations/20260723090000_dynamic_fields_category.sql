-- rampungin.com: add radio/checkbox field types + category index

alter table public.prompt_fields
  drop constraint if exists prompt_fields_field_type_check;

alter table public.prompt_fields
  add constraint prompt_fields_field_type_check
  check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox'));

create index if not exists prompts_category_idx on public.prompts(category);
