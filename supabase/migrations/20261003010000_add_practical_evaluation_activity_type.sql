alter table public.course_2ac_submissions
  drop constraint if exists course_2ac_submissions_activity_type_check;

alter table public.course_2ac_submissions
  add constraint course_2ac_submissions_activity_type_check
  check (
    activity_type in (
      'unit1_exercise',
      'quiz',
      'practical_evaluation',
      'photo_challenge',
      'workshop',
      'session_completion'
    )
  );

comment on column public.course_2ac_submissions.activity_type is
  'Pedagogical activity category, including native practical evaluations.';
