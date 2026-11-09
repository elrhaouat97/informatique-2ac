-- One atomic, private update for an entire selection; no names or learning records change.
create function public.course_2ac_set_roster_active(p_ids uuid[],p_active boolean)
returns table(id uuid)
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  if p_ids is null or cardinality(p_ids) not between 1 and 1000
     or array_position(p_ids,null) is not null or p_active is null then
    raise exception 'Invalid roster selection' using errcode='22023';
  end if;
  return query update public.course_2ac_roster_students as r
    set active=p_active,updated_at=now()
    where r.id=any(p_ids)
    returning r.id;
end $$;
revoke all on function public.course_2ac_set_roster_active(uuid[],boolean) from public,anon,authenticated;
grant execute on function public.course_2ac_set_roster_active(uuid[],boolean) to service_role;
comment on function public.course_2ac_set_roster_active(uuid[],boolean) is 'Teacher API only. Reversible bulk archive/reactivation; retains learner identities, responses, scores and registration aliases.';
