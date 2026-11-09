-- Names remain in the private database. Browser clients have no direct table/RPC access.
create table public.course_2ac_roster_students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  name_normalized text not null check (char_length(name_normalized) between 2 and 100),
  class_name text not null check (class_name ~ '^2/[1-9]$'),
  group_name text check (group_name in ('1','2')),
  massar_code text unique check (massar_code is null or massar_code ~ '^[A-Z0-9]{5,20}$'),
  registration_key text unique,
  source text not null default 'registration' check (source in ('registration','import','manual')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_2ac_roster_class_group_idx on public.course_2ac_roster_students(class_name,group_name) where active;
alter table public.course_2ac_roster_students enable row level security;
create policy course_2ac_roster_deny_browser on public.course_2ac_roster_students for all to anon,authenticated using(false) with check(false);
revoke all on public.course_2ac_roster_students from public,anon,authenticated;
grant select,insert,update,delete on public.course_2ac_roster_students to service_role;

alter table public.course_2ac_participants
  add column student_one_id uuid references public.course_2ac_roster_students(id) on delete set null,
  add column student_two_id uuid references public.course_2ac_roster_students(id) on delete set null,
  add column identity_key text unique;
create index course_2ac_participants_student_one_idx on public.course_2ac_participants(student_one_id);
create index course_2ac_participants_student_two_idx on public.course_2ac_participants(student_two_id);

-- Preserve every previous dossier and every response. Known registrations are not official lists.
with names as (
  select class_name,group_name,student_one as name from public.course_2ac_participants
  union all
  select class_name,group_name,student_two from public.course_2ac_participants where is_pair and student_two is not null
), prepared as (
  select class_name,group_name,regexp_replace(trim(name),'[[:space:]]+',' ','g') as full_name,
    lower(normalize(regexp_replace(trim(name),'[[:space:]]+',' ','g'),NFKC)) as normalized from names
)
insert into public.course_2ac_roster_students(full_name,name_normalized,class_name,group_name,registration_key,source)
select min(full_name),normalized,class_name,group_name,class_name||'|'||group_name||'|'||normalized,'registration'
from prepared group by class_name,group_name,normalized
on conflict(registration_key) do nothing;

update public.course_2ac_participants p set student_one_id=r.id
from public.course_2ac_roster_students r
where r.registration_key=p.class_name||'|'||p.group_name||'|'||lower(normalize(regexp_replace(trim(p.student_one),'[[:space:]]+',' ','g'),NFKC));
update public.course_2ac_participants p set student_two_id=r.id
from public.course_2ac_roster_students r
where p.is_pair and r.registration_key=p.class_name||'|'||p.group_name||'|'||lower(normalize(regexp_replace(trim(p.student_two),'[[:space:]]+',' ','g'),NFKC));

with counts as (select participant_id,count(*) as n from public.course_2ac_submissions group by participant_id),
identities as (
 select p.id,encode(extensions.digest(p.class_name||'|'||p.group_name||'|'||case when p.is_pair then 'pair' else 'solo' end||'|'||
 case when p.is_pair then least(p.student_one_id::text,p.student_two_id::text) else p.student_one_id::text end||'|'||
 case when p.is_pair then greatest(p.student_one_id::text,p.student_two_id::text) else '' end,'sha256'),'hex') as key,
 coalesce(c.n,0) as n,p.created_at from public.course_2ac_participants p left join counts c on c.participant_id=p.id
), ranked as (select id,key,row_number() over(partition by key order by n desc,created_at desc,id) as position from identities where key is not null)
update public.course_2ac_participants p set identity_key=r.key from ranked r where p.id=r.id and r.position=1;

create table public.course_2ac_learning_checkpoints (
 participant_id uuid not null references public.course_2ac_participants(id) on delete cascade,
 device_id uuid not null,
 session_id smallint not null check(session_id between 1 and 15),
 kind text not null check(kind in ('workshop','quiz','assessment','view','assembly','repair')),
 revision integer not null default 1 check(revision>0),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=262144),
 updated_at timestamptz not null default now(),
 primary key(participant_id,device_id,session_id,kind)
);
alter table public.course_2ac_learning_checkpoints enable row level security;
create policy course_2ac_checkpoints_deny_browser on public.course_2ac_learning_checkpoints for all to anon,authenticated using(false) with check(false);
revoke all on public.course_2ac_learning_checkpoints from public,anon,authenticated;
grant select,insert,update,delete on public.course_2ac_learning_checkpoints to service_role;

create function public.course_2ac_store_checkpoint(p_participant_id uuid,p_device_id uuid,p_session_id smallint,p_kind text,p_expected_revision integer,p_snapshot jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare saved public.course_2ac_learning_checkpoints;
begin
 if p_expected_revision=0 then
  insert into public.course_2ac_learning_checkpoints(participant_id,device_id,session_id,kind,snapshot)
  values(p_participant_id,p_device_id,p_session_id,p_kind,p_snapshot)
  on conflict do nothing returning * into saved;
 else
  update public.course_2ac_learning_checkpoints set snapshot=p_snapshot,revision=revision+1,updated_at=now()
  where participant_id=p_participant_id and device_id=p_device_id and session_id=p_session_id and kind=p_kind and revision=p_expected_revision
  returning * into saved;
 end if;
 if found then return jsonb_build_object('saved',true,'checkpoint',to_jsonb(saved)); end if;
 select * into saved from public.course_2ac_learning_checkpoints where participant_id=p_participant_id and device_id=p_device_id and session_id=p_session_id and kind=p_kind;
 return jsonb_build_object('saved',false,'checkpoint',to_jsonb(saved));
end $$;
revoke all on function public.course_2ac_store_checkpoint(uuid,uuid,smallint,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.course_2ac_store_checkpoint(uuid,uuid,smallint,text,integer,jsonb) to service_role;

create function public.course_2ac_import_roster(p_rows jsonb) returns integer
language plpgsql security invoker set search_path=public,pg_temp as $$
declare affected integer;
begin
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>1000 then raise exception 'Invalid roster'; end if;
 insert into public.course_2ac_roster_students(id,full_name,name_normalized,class_name,group_name,massar_code,registration_key,source,active)
 select id,full_name,name_normalized,class_name,group_name,massar_code,registration_key,source,active
 from jsonb_to_recordset(p_rows) as r(id uuid,full_name text,name_normalized text,class_name text,group_name text,massar_code text,registration_key text,source text,active boolean)
 on conflict(id) do update set full_name=excluded.full_name,name_normalized=excluded.name_normalized,class_name=excluded.class_name,group_name=excluded.group_name,massar_code=excluded.massar_code,registration_key=excluded.registration_key,source=excluded.source,active=excluded.active,updated_at=now();
 get diagnostics affected=row_count;
 return affected;
end $$;
revoke all on function public.course_2ac_import_roster(jsonb) from public,anon,authenticated;
grant execute on function public.course_2ac_import_roster(jsonb) to service_role;

create index course_2ac_submissions_learning_idx on public.course_2ac_submissions(participant_id,session_id,activity_id,created_at desc);
create view public.course_2ac_activity_progress with(security_invoker=true) as
with totals as (
 select participant_id,session_id,activity_type,activity_id,count(*)::integer as attempts,
 count(is_correct)::integer as graded,count(*) filter(where is_correct)::integer as correct,
 coalesce(bool_or(is_correct),false) as successful,min(created_at) filter(where is_correct) as first_success_at,max(created_at) as last_at
 from public.course_2ac_submissions group by participant_id,session_id,activity_type,activity_id
), best as (
 select distinct on(participant_id,session_id,activity_type,activity_id) participant_id,session_id,activity_type,activity_id,score,max_score,
 case when activity_id='session-3-bilan-situations-v5' then response->'sections' else null end as sections
 from public.course_2ac_submissions order by participant_id,session_id,activity_type,activity_id,(score::numeric/nullif(max_score,0)) desc nulls last,is_correct desc nulls last,created_at desc
)
select t.*,b.score as best_score,b.max_score,b.sections from totals t join best b using(participant_id,session_id,activity_type,activity_id);
revoke all on public.course_2ac_activity_progress from public,anon,authenticated;
grant select on public.course_2ac_activity_progress to service_role;

create function public.course_2ac_learning_overview() returns jsonb
language sql stable security invoker set search_path=public,pg_temp as $$
 select jsonb_build_object(
 'students',coalesce((select jsonb_agg(r order by class_name,full_name) from (select * from public.course_2ac_roster_students order by class_name,full_name limit 5001) r),'[]'::jsonb),
 'participants',coalesce((select jsonb_agg(p) from (select id,student_one,student_two,student_one_id,student_two_id,class_name,group_name,is_pair,created_at from public.course_2ac_participants order by created_at desc limit 10001) p),'[]'::jsonb),
 'activities',coalesce((select jsonb_agg(a) from (select * from public.course_2ac_activity_progress order by last_at desc limit 50001) a),'[]'::jsonb),
 'sessionAccess',coalesce((select jsonb_agg(s) from public.course_2ac_session_access s),'[]'::jsonb),
 'generatedAt',now());
$$;
revoke all on function public.course_2ac_learning_overview() from public,anon,authenticated;
grant execute on function public.course_2ac_learning_overview() to service_role;

comment on table public.course_2ac_roster_students is 'Private class rosters. registration means an existing, unverified name; import/manual are teacher managed. Massar is never returned by public suggestions.';
comment on table public.course_2ac_learning_checkpoints is 'Per-device student drafts. Server tokens bind participant and device. CAS revisions prevent an older tab from erasing a newer save.';
