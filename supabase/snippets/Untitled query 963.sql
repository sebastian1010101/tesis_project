create policy "Users can view answers from their projects"
on question_answers for select
using (
  exists (
    select 1
    from research_questions rq
    join projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
    and p.user_id = auth.uid()
  )
);

create policy "Users can insert answers into their questions"
on question_answers for insert
with check (
  exists (
    select 1
    from research_questions rq
    join projects p on p.id = rq.project_id
    where rq.id = question_answers.question_id
    and p.user_id = auth.uid()
  )
);
