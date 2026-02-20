create table if not exists public.question_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.research_questions (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  answer text not null,
  status text not null default 'editing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, user_id)
);

alter table public.question_answers enable row level security;

drop policy if exists "question_answers_select_own" on public.question_answers;
create policy "question_answers_select_own" on public.question_answers
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.research_questions rq
    join public.projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "question_answers_insert_own" on public.question_answers;
create policy "question_answers_insert_own" on public.question_answers
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.research_questions rq
    join public.projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "question_answers_update_own" on public.question_answers;
create policy "question_answers_update_own" on public.question_answers
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.research_questions rq
    join public.projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
      and p.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.research_questions rq
    join public.projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "question_answers_delete_own" on public.question_answers;
create policy "question_answers_delete_own" on public.question_answers
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.research_questions rq
    join public.projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
      and p.user_id = auth.uid()
  )
);
