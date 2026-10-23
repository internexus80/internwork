alter table certificates
  add column if not exists end_date date,
  add column if not exists verification_url text,
  add column if not exists student_name text,
  add column if not exists domain_name text;

create unique index if not exists idx_certificates_enrollment_unique
  on certificates(enrollment_id)
  where enrollment_id is not null;

create or replace function issue_certificate_for_current_student(p_verification_base_url text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_student uuid := auth.uid();
  enrollment_record record;
  existing_certificate record;
  certificate_code text;
  verification_link text;
begin
  if current_student is null then
    raise exception 'Authentication required';
  end if;

  select c.*
    into existing_certificate
  from certificates c
  where c.student_id = current_student
    and c.enrollment_id = (
      select ie.id
      from internship_enrollments ie
      where ie.student_id = current_student
      order by ie.created_at desc
      limit 1
    )
  limit 1;

  if found then
    return jsonb_build_object(
      'eligible', existing_certificate.status = 'ISSUED',
      'certificate', to_jsonb(existing_certificate)
    );
  end if;

  select ie.id, ie.domain_id, ie.start_date, ie.expected_end_date,
         d.name as domain_name, p.full_name as student_name
    into enrollment_record
  from internship_enrollments ie
  join domains d on d.id = ie.domain_id
  join profiles p on p.id = ie.student_id
  where ie.student_id = current_student
  order by ie.created_at desc
  limit 1;

  if enrollment_record.id is null then
    return jsonb_build_object('eligible', false, 'reason', 'enrollment_incomplete');
  end if;

  if not exists (
    select 1 from payments py
    where py.student_id = current_student
      and py.status = 'Completed'
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'payment_incomplete');
  end if;

  if not exists (
    select 1 from tasks t
    where t.domain_id = enrollment_record.domain_id
      and t.is_active = true
      and t.is_required = true
  ) or exists (
    select 1
    from tasks t
    where t.domain_id = enrollment_record.domain_id
      and t.is_active = true
      and t.is_required = true
      and not exists (
        select 1 from student_tasks st
        where st.enrollment_id = enrollment_record.id
          and st.task_id = t.id
          and st.status = 'VERIFIED'
      )
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'tasks_incomplete');
  end if;

  certificate_code := 'IJAS-' || extract(year from current_date)::text || '-'
    || upper(encode(gen_random_bytes(6), 'hex'));
  verification_link := rtrim(p_verification_base_url, '/') || '/' || certificate_code;

  insert into certificates (
    student_id, enrollment_id, domain_id, certificate_id, issue_date,
    end_date, verification_url, student_name, domain_name, status
  ) values (
    current_student, enrollment_record.id, enrollment_record.domain_id,
    certificate_code, current_date, enrollment_record.expected_end_date,
    verification_link, enrollment_record.student_name, enrollment_record.domain_name,
    'ISSUED'
  )
  returning * into existing_certificate;

  return jsonb_build_object('eligible', true, 'certificate', to_jsonb(existing_certificate));
exception
  when unique_violation then
    select c.* into existing_certificate
    from certificates c
    where c.enrollment_id = enrollment_record.id;
    return jsonb_build_object('eligible', existing_certificate.status = 'ISSUED', 'certificate', to_jsonb(existing_certificate));
end;
$$;

create or replace function unlock_next_task(target_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_student_task_id uuid;
begin
  select st.id
    into next_student_task_id
  from student_tasks st
  join tasks t on t.id = st.task_id
  where st.enrollment_id = target_enrollment_id
    and t.is_required = true
    and st.status not in ('VERIFIED', 'SUBMITTED', 'VERIFICATION_PENDING')
  order by t.display_order asc, t.task_number asc
  limit 1;

  if next_student_task_id is not null then
    update student_tasks
      set status = 'AVAILABLE'
    where id = next_student_task_id
      and status = 'IN_PROGRESS';
  end if;

  update internship_enrollments ie
    set status = 'COMPLETED'
  where ie.id = target_enrollment_id
    and not exists (
      select 1
      from student_tasks st
      join tasks t on t.id = st.task_id
      where st.enrollment_id = ie.id
        and t.is_required = true
        and st.status <> 'VERIFIED'
    );
end;
$$;

create or replace function submit_student_task(
  target_student_task_id uuid,
  p_submission_url text default null,
  p_submission_text text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_student uuid := auth.uid();
  target_record record;
begin
  if current_student is null then
    raise exception 'Authentication required';
  end if;

  select st.id, st.enrollment_id, st.task_id, st.status, t.domain_id,
         t.display_order, t.task_number
    into target_record
  from student_tasks st
  join tasks t on t.id = st.task_id
  where st.id = target_student_task_id
    and st.student_id = current_student;

  if not found then
    raise exception 'Task not found';
  end if;

  if target_record.status not in ('AVAILABLE', 'IN_PROGRESS', 'REJECTED') then
    raise exception 'This task cannot be submitted in its current state';
  end if;

  if exists (
    select 1
    from student_tasks previous_st
    join tasks previous_t on previous_t.id = previous_st.task_id
    where previous_st.enrollment_id = target_record.enrollment_id
      and previous_t.is_required = true
      and previous_t.display_order < target_record.display_order
      and previous_st.status not in ('VERIFIED', 'SUBMITTED', 'VERIFICATION_PENDING')
  ) then
    raise exception 'Complete or submit the previous required task before continuing';
  end if;

  update student_tasks
    set status = 'VERIFICATION_PENDING',
        submission_url = nullif(trim(p_submission_url), ''),
        submission_text = nullif(trim(p_submission_text), ''),
        submitted_at = now(),
        verification_due_at = now() + interval '3 hours',
        attempt_number = attempt_number + 1
  where id = target_student_task_id;

  update student_tasks next_st
    set status = 'AVAILABLE'
  from tasks next_t
  where next_st.task_id = next_t.id
    and next_st.enrollment_id = target_record.enrollment_id
    and next_t.is_required = true
    and next_st.status = 'IN_PROGRESS'
    and next_t.display_order > target_record.display_order
    and not exists (
      select 1
      from student_tasks blocking_st
      join tasks blocking_t on blocking_t.id = blocking_st.task_id
      where blocking_st.enrollment_id = target_record.enrollment_id
        and blocking_t.is_required = true
        and blocking_t.display_order < next_t.display_order
        and blocking_st.status not in ('VERIFIED', 'SUBMITTED', 'VERIFICATION_PENDING')
    );
end;
$$;

create or replace function verify_certificate_by_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  certificate_record record;
begin
  select c.certificate_id, c.issue_date, c.end_date, c.status,
         coalesce(c.student_name, p.full_name) as student_name,
         coalesce(c.domain_name, d.name) as domain_name
    into certificate_record
  from certificates c
  left join profiles p on p.id = c.student_id
  left join domains d on d.id = c.domain_id
  where upper(c.certificate_id) = upper(trim(p_code));

  if certificate_record.certificate_id is null then
    return jsonb_build_object('valid', false, 'status', 'not_found');
  end if;

  if certificate_record.status = 'REVOKED' then
    return jsonb_build_object('valid', false, 'status', 'revoked', 'certificate_id', certificate_record.certificate_id);
  end if;

  return jsonb_build_object(
    'valid', true,
    'status', 'valid',
    'certificate_id', certificate_record.certificate_id,
    'issue_date', certificate_record.issue_date,
    'start_date', (select start_date from internship_enrollments where id = (select enrollment_id from certificates where certificate_id = certificate_record.certificate_id)),
    'end_date', certificate_record.end_date,
    'student_name', certificate_record.student_name,
    'domain', certificate_record.domain_name,
    'organization', 'InternJourneys AI Solutions',
    'mode', 'Virtual / Online'
  );
end;
$$;