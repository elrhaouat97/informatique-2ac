create policy "Deny direct access to course participants"
  on public.course_2ac_participants
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy "Deny direct access to course submissions"
  on public.course_2ac_submissions
  for all
  to anon, authenticated
  using (false)
  with check (false);

create policy "Deny direct access to teacher configuration"
  on public.course_2ac_teacher_config
  for all
  to anon, authenticated
  using (false)
  with check (false);
