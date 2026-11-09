create table public.course_2ac_session_access (
  session_id smallint primary key,
  is_unlocked boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint course_2ac_session_access_id_check check (session_id between 1 and 15)
);

insert into public.course_2ac_session_access (session_id, is_unlocked)
select session_id, true
from generate_series(1, 15) as session_id;

alter table public.course_2ac_session_access enable row level security;

revoke all on table public.course_2ac_session_access from public, anon, authenticated;
grant select, insert, update, delete on table public.course_2ac_session_access to service_role;

create policy "Deny direct access to course session controls"
  on public.course_2ac_session_access
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.course_2ac_session_access is
  'Controls which LAB 2AC sessions students may open and submit.';
