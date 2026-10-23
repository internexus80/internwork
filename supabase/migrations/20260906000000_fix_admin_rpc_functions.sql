create or replace function admin_student_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
  into result
  from (
    select
      p.id,
      p.full_name,
      p.initials,
      u.email,
      p.phone,
      p.college,
      p.graduation_year,
      p.created_at,
      (select ie.status from internship_enrollments ie
        where ie.student_id = p.id order by ie.created_at desc limit 1) as enrollment_status,
      (select d.name from internship_enrollments ie join domains d on d.id = ie.domain_id
        where ie.student_id = p.id order by ie.created_at desc limit 1) as domain,
      (select ie.start_date from internship_enrollments ie
        where ie.student_id = p.id order by ie.created_at desc limit 1) as start_date
    from profiles p
    join auth.users u on u.id = p.id
    where p.role = 'student'
    order by p.created_at desc
  ) t;

  return result;
end;
$$;

create or replace function admin_submission_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
  into result
  from (
    select
      st.id,
      st.status,
      st.submitted_at,
      st.submission_url,
      st.submission_text,
      st.verification_reason,
      ts.task_number,
      ts.title as task_title,
      p.full_name as student_name,
      u.email,
      d.name as domain_name
    from student_tasks st
    join tasks ts on ts.id = st.task_id
    join internship_enrollments ie on ie.id = st.enrollment_id
    join domains d on d.id = ie.domain_id
    join profiles p on p.id = st.student_id
    join auth.users u on u.id = st.student_id
    where st.status in ('VERIFICATION_PENDING', 'SUBMITTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED')
    order by st.submitted_at desc nulls last
  ) t;

  return result;
end;
$$;

create or replace function admin_payment_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
  into result
  from (
    select
      py.id,
      py.amount,
      py.currency,
      py.purpose,
      py.status,
      py.created_at,
      py.provider_order_id,
      py.provider_payment_id,
      p.full_name as student_name,
      u.email
    from payments py
    join profiles p on p.id = py.student_id
    join auth.users u on u.id = py.student_id
    order by py.created_at desc
  ) t;

  return result;
end;
$$;
