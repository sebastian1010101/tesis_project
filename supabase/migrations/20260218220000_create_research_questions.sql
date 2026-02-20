create table if not exists public.research_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position int not null,
  question text not null,
  rationale text,
  status text not null default 'draft',
  source text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, position)
);

alter table public.research_questions enable row level security;

drop policy if exists "research_questions_select_own" on public.research_questions;
create policy "research_questions_select_own" on public.research_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = research_questions.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "research_questions_insert_own" on public.research_questions;
create policy "research_questions_insert_own" on public.research_questions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = research_questions.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "research_questions_update_own" on public.research_questions;
create policy "research_questions_update_own" on public.research_questions
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = research_questions.project_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = research_questions.project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "research_questions_delete_own" on public.research_questions;
create policy "research_questions_delete_own" on public.research_questions
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = research_questions.project_id
      and p.user_id = auth.uid()
  )
);
