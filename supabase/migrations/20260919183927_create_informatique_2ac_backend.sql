create extension if not exists pgcrypto with schema extensions;

create table public.course_2ac_participants (
  id uuid primary key default gen_random_uuid(),
  student_one text not null,
  student_two text,
  class_name text not null,
  group_name text not null,
  is_pair boolean not null default false,
  created_at timestamptz not null default now(),
  constraint course_2ac_participants_student_one_check
    check (char_length(student_one) between 2 and 100),
  constraint course_2ac_participants_student_two_check
    check (
      (is_pair and student_two is not null and char_length(student_two) between 2 and 100)
      or (not is_pair and student_two is null)
    ),
  constraint course_2ac_participants_class_check
    check (class_name ~ '^2/[1-9]$'),
  constraint course_2ac_participants_group_check
    check (group_name in ('1', '2'))
);

create index course_2ac_participants_class_group_idx
  on public.course_2ac_participants (class_name, group_name);

create table public.course_2ac_submissions (
  id text primary key,
  participant_id uuid not null references public.course_2ac_participants(id) on delete cascade,
  session_id smallint not null,
  activity_type text not null,
  activity_id text not null,
  response jsonb not null,
  is_correct boolean,
  score smallint,
  max_score smallint,
  created_at timestamptz not null default now(),
  constraint course_2ac_submissions_id_check
    check (char_length(id) between 8 and 100),
  constraint course_2ac_submissions_session_check
    check (session_id between 1 and 15),
  constraint course_2ac_submissions_activity_type_check
    check (activity_type in ('unit1_exercise', 'quiz', 'photo_challenge', 'workshop', 'session_completion')),
  constraint course_2ac_submissions_activity_id_check
    check (char_length(activity_id) between 1 and 120),
  constraint course_2ac_submissions_response_size_check
    check (octet_length(response::text) <= 12000),
  constraint course_2ac_submissions_score_check
    check (
      (score is null and max_score is null)
      or (
        score between 0 and 1000
        and max_score between 1 and 1000
        and score <= max_score
      )
    )
);

create index course_2ac_submissions_participant_created_idx
  on public.course_2ac_submissions (participant_id, created_at desc);

create index course_2ac_submissions_session_activity_idx
  on public.course_2ac_submissions (session_id, activity_type, activity_id);

create table public.course_2ac_teacher_config (
  config_key text primary key,
  password_hash text not null,
  session_secret text not null default encode(extensions.gen_random_bytes(32), 'base64'),
  updated_at timestamptz not null default now(),
  constraint course_2ac_teacher_config_key_check check (config_key = 'default'),
  constraint course_2ac_teacher_config_password_hash_check check (char_length(password_hash) = 64),
  constraint course_2ac_teacher_config_session_secret_check check (char_length(session_secret) >= 40)
);

insert into public.course_2ac_teacher_config (config_key, password_hash)
values ('default', '617b8692806aeae35115610d8cc929284e567d2e798210169878049234d7b2f4');

alter table public.course_2ac_participants enable row level security;
alter table public.course_2ac_submissions enable row level security;
alter table public.course_2ac_teacher_config enable row level security;

revoke all on table public.course_2ac_participants from public, anon, authenticated;
revoke all on table public.course_2ac_submissions from public, anon, authenticated;
revoke all on table public.course_2ac_teacher_config from public, anon, authenticated;

grant select, insert, update, delete on table public.course_2ac_participants to service_role;
grant select, insert, update, delete on table public.course_2ac_submissions to service_role;
grant select on table public.course_2ac_teacher_config to service_role;

comment on table public.course_2ac_participants is
  'Identités des élèves ou binômes inscrits au parcours LAB 2AC.';
comment on table public.course_2ac_submissions is
  'Tentatives horodatées des exercices, ateliers, défis et évaluations LAB 2AC.';
