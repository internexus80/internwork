create or replace function create_internship_enrollment(requested_domain_id uuid)
returns table(enrollment_id uuid, domain_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_enrollment_id uuid;
  first_student_task_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (select 1 from domains d where d.id = requested_domain_id and d.is_active = true) then
    raise exception 'Domain is not available';
  end if;

  if exists (
    select 1
    from internship_enrollments ie
    where ie.student_id = current_user_id
      and ie.status = 'ACTIVE'
  ) then
    raise exception 'You already have an active internship';
  end if;

  insert into internship_enrollments (student_id, domain_id, expected_end_date)
  select current_user_id, requested_domain_id, current_date + (d.duration_weeks * 7)
  from domains d
  where d.id = requested_domain_id
  returning id into new_enrollment_id;

  insert into student_tasks (enrollment_id, task_id, student_id, status)
  select new_enrollment_id, t.id, current_user_id, 'IN_PROGRESS'
  from tasks t
  where t.domain_id = requested_domain_id
    and t.is_active = true
  order by t.display_order asc, t.task_number asc;

  select st.id
    into first_student_task_id
  from student_tasks st
  join tasks t on t.id = st.task_id
  where st.enrollment_id = new_enrollment_id
    and t.is_required = true
  order by t.display_order asc, t.task_number asc
  limit 1;

  update student_tasks st
    set status = 'AVAILABLE'
  where st.id = first_student_task_id;

  return query
    select new_enrollment_id, requested_domain_id, 'ACTIVE'::text;
end;
$$;
