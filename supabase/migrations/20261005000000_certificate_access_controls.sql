create extension if not exists pg_cron;

create table if not exists certificate_access_overrides (
  student_id uuid primary key references auth.users(id) on delete cascade,
  granted_by uuid not null references auth.users(id),
  granted_at timestamptz not null default now(),
  note text
);

update certificates c
set status = 'PENDING', issue_date = null
where c.status = 'ISSUED'
  and not exists (
    select 1 from certificate_access_overrides o where o.student_id = c.student_id
  )
  and not (
    c.enrollment_id is not null
    and exists (
      select 1 from payments py
      where py.student_id = c.student_id
        and py.purpose = 'Certificate fee'
        and py.provider = 'razorpay'
        and py.provider_payment_id is not null
        and py.status = 'Completed'
    )
    and not exists (
      select 1
      from student_tasks st
      join tasks t on t.id = st.task_id
      where st.enrollment_id = c.enrollment_id
        and t.is_required = true
        and st.status <> 'VERIFIED'
    )
  );

alter table certificate_access_overrides enable row level security;

drop policy if exists "admins read certificate access overrides" on certificate_access_overrides;
create policy "admins read certificate access overrides"
  on certificate_access_overrides for select using (is_admin());

drop policy if exists "students insert own certificate payments" on payments;
drop policy if exists "students insert own pending certificate payments" on payments;
create policy "students insert own pending certificate payments"
  on payments for insert with check (
    student_id = auth.uid()
    and amount = 199
    and currency = 'INR'
    and purpose = 'Certificate fee'
    and provider = 'razorpay'
    and status = 'Pending'
  );

create or replace function assert_certificate_payment_schema()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  return true;
end;
$$;

revoke execute on function assert_certificate_payment_schema() from public, anon;
grant execute on function assert_certificate_payment_schema() to authenticated;

create or replace function complete_certificate_payment(
  p_order_id text,
  p_payment_id text,
  p_signature text,
  p_key_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_record payments%rowtype;
  expected_signature text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into payment_record
  from payments
  where student_id = auth.uid()
    and provider = 'razorpay'
    and provider_order_id = p_order_id
  for update;

  if not found then
    raise exception 'Payment order not found';
  end if;

  if payment_record.status = 'Completed'
    and payment_record.provider_payment_id = p_payment_id then
    return jsonb_build_object('success', true, 'payment_id', payment_record.id);
  end if;

  if payment_record.status <> 'Pending'
    or payment_record.amount <> 199
    or payment_record.currency <> 'INR'
    or payment_record.purpose <> 'Certificate fee'
    or coalesce(p_key_secret, '') = '' then
    raise exception 'Payment is not eligible for verification';
  end if;

  expected_signature := encode(
    hmac(
      convert_to(p_order_id || '|' || p_payment_id, 'UTF8'),
      convert_to(p_key_secret, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  if lower(coalesce(p_signature, '')) <> expected_signature then
    raise exception 'Payment signature verification failed';
  end if;

  update payments
  set status = 'Completed',
      provider_payment_id = p_payment_id,
      provider_signature = p_signature,
      paid_at = now()
  where id = payment_record.id;

  return jsonb_build_object('success', true, 'payment_id', payment_record.id);
end;
$$;

create or replace function get_student_certificate_access(p_verification_base_url text)
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
  is_overridden boolean := false;
  payment_completed boolean := false;
  latest_payment_status text;
  required_task_count integer := 0;
  verified_task_count integer := 0;
  tasks_complete boolean := false;
  access_reason text;
begin
  if current_student is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtext(current_student::text));

  select ie.id, ie.domain_id, ie.expected_end_date,
         coalesce(d.name, 'Internship') as domain_name,
         coalesce(p.full_name, 'Student') as student_name
    into enrollment_record
  from profiles p
  left join lateral (
    select ie.id, ie.domain_id, ie.expected_end_date
    from internship_enrollments ie
    where ie.student_id = current_student
    order by ie.created_at desc
    limit 1
  ) ie on true
  left join domains d on d.id = ie.domain_id
  where p.id = current_student;

  select exists (
    select 1 from certificate_access_overrides o
    where o.student_id = current_student
  ) into is_overridden;

  select exists (
    select 1 from payments py
    where py.student_id = current_student
      and py.purpose = 'Certificate fee'
      and py.provider = 'razorpay'
      and py.provider_payment_id is not null
      and py.status = 'Completed'
  ) into payment_completed;

  select py.status into latest_payment_status
  from payments py
  where py.student_id = current_student
    and py.purpose = 'Certificate fee'
  order by py.created_at desc
  limit 1;

  if enrollment_record.id is not null then
    select
      count(*) filter (where t.is_required)::integer,
      count(*) filter (where t.is_required and st.status = 'VERIFIED')::integer
      into required_task_count, verified_task_count
    from student_tasks st
    join tasks t on t.id = st.task_id
    where st.enrollment_id = enrollment_record.id;
    tasks_complete := required_task_count = verified_task_count;
  end if;

  select c.* into existing_certificate
  from certificates c
  where c.student_id = current_student
    and c.enrollment_id is not distinct from enrollment_record.id
  order by c.created_at desc
  limit 1;

  if found and existing_certificate.status = 'REVOKED' then
    return jsonb_build_object(
      'eligible', false,
      'reason', 'certificate_revoked',
      'payment_completed', payment_completed,
      'payment_status', coalesce(latest_payment_status, 'Not paid'),
      'required_task_count', required_task_count,
      'verified_task_count', verified_task_count,
      'tasks_complete', tasks_complete
    );
  end if;

  if is_overridden then
    access_reason := null;
  elsif enrollment_record.id is null then
    access_reason := 'enrollment_required';
  elsif not payment_completed then
    access_reason := 'payment_required';
  elsif not tasks_complete then
    access_reason := 'tasks_incomplete';
  end if;

  if access_reason is not null then
    if existing_certificate.id is not null and existing_certificate.status = 'ISSUED' then
      update certificates
      set status = 'PENDING', issue_date = null
      where id = existing_certificate.id;
    end if;

    return jsonb_build_object(
      'eligible', false,
      'reason', access_reason,
      'payment_completed', payment_completed,
      'payment_status', coalesce(latest_payment_status, 'Not paid'),
      'required_task_count', required_task_count,
      'verified_task_count', verified_task_count,
      'tasks_complete', tasks_complete
    );
  end if;

  verification_link := rtrim(p_verification_base_url, '/') || '/';

  if existing_certificate.id is not null then
    update certificates
    set status = 'ISSUED',
        issue_date = coalesce(issue_date, current_date),
        student_name = coalesce(student_name, enrollment_record.student_name),
        domain_name = coalesce(domain_name, enrollment_record.domain_name),
        verification_url = coalesce(verification_url, verification_link || certificate_id)
    where id = existing_certificate.id
    returning * into existing_certificate;
  else
    certificate_code := 'IJAS-' || extract(year from current_date)::text || '-'
      || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    insert into certificates (
      student_id, enrollment_id, domain_id, certificate_id, issue_date,
      end_date, verification_url, student_name, domain_name, status
    ) values (
      current_student, enrollment_record.id, enrollment_record.domain_id,
      certificate_code, current_date, enrollment_record.expected_end_date,
      verification_link || certificate_code, enrollment_record.student_name,
      enrollment_record.domain_name, 'ISSUED'
    ) returning * into existing_certificate;
  end if;

  return jsonb_build_object(
    'eligible', true,
    'payment_completed', payment_completed,
    'payment_status', coalesce(latest_payment_status, 'Not paid'),
    'required_task_count', required_task_count,
    'verified_task_count', verified_task_count,
    'tasks_complete', tasks_complete,
    'certificate', to_jsonb(existing_certificate)
  );
end;
$$;

create or replace function issue_certificate_for_current_student(p_verification_base_url text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select get_student_certificate_access(p_verification_base_url);
$$;

create or replace function admin_certificate_access_overview()
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

  select coalesce(jsonb_agg(row_to_jsonb(t)), '[]'::jsonb)
    into result
  from (
    select
      p.id as student_id,
      p.full_name as student_name,
      u.email,
      coalesce(d.name, 'Not enrolled') as domain_name,
      ie.id as enrollment_id,
      ie.status as enrollment_status,
      coalesce(progress.required_task_count, 0) as required_task_count,
      coalesce(progress.verified_task_count, 0) as verified_task_count,
      coalesce(progress.required_task_count, 0) = coalesce(progress.verified_task_count, 0)
        and ie.id is not null as tasks_complete,
      coalesce(payment_summary.payment_completed, false) as payment_completed,
      case
        when payment_summary.payment_completed then 'Paid'
        when latest_payment.status = 'Completed' then 'Completed manually'
        else coalesce(latest_payment.status, 'Not paid')
      end as payment_status,
      latest_payment.amount as payment_amount,
      latest_payment.provider as payment_provider,
      latest_payment.created_at as payment_created_at,
      latest_payment.paid_at,
      latest_payment.provider_payment_id,
      latest_payment.provider_order_id,
      (override.student_id is not null) as admin_override,
      override.granted_at as override_granted_at,
      override.granted_by as override_granted_by,
      override.note as override_note,
      certificate.status as certificate_status,
      (
        coalesce(certificate.status, 'PENDING') <> 'REVOKED'
        and (
          override.student_id is not null
          or (
            ie.id is not null
            and coalesce(payment_summary.payment_completed, false)
            and coalesce(progress.required_task_count, 0) = coalesce(progress.verified_task_count, 0)
          )
        )
      ) as access_unlocked
    from profiles p
    join auth.users u on u.id = p.id
    left join lateral (
      select ie.id, ie.domain_id, ie.status
      from internship_enrollments ie
      where ie.student_id = p.id
      order by ie.created_at desc
      limit 1
    ) ie on true
    left join domains d on d.id = ie.domain_id
    left join lateral (
      select
        count(*) filter (where t.is_required)::integer as required_task_count,
        count(*) filter (where t.is_required and st.status = 'VERIFIED')::integer as verified_task_count
      from student_tasks st
      join tasks t on t.id = st.task_id
      where st.enrollment_id = ie.id
    ) progress on true
    left join lateral (
      select exists (
        select 1 from payments py
        where py.student_id = p.id
          and py.purpose = 'Certificate fee'
          and py.provider = 'razorpay'
          and py.provider_payment_id is not null
          and py.status = 'Completed'
      ) as payment_completed
    ) payment_summary on true
    left join lateral (
      select py.status, py.amount, py.provider, py.created_at, py.paid_at,
             py.provider_payment_id, py.provider_order_id
      from payments py
      where py.student_id = p.id and py.purpose = 'Certificate fee'
      order by (
        py.provider = 'razorpay'
        and py.status = 'Completed'
        and py.provider_payment_id is not null
      ) desc, py.created_at desc
      limit 1
    ) latest_payment on true
    left join certificate_access_overrides override on override.student_id = p.id
    left join lateral (
      select c.status
      from certificates c
      where c.student_id = p.id
        and c.enrollment_id is not distinct from ie.id
      order by c.created_at desc
      limit 1
    ) certificate on true
    where p.role = 'student'
    order by p.created_at desc
  ) t;

  return result;
end;
$$;

create or replace function set_certificate_access_override(
  p_student_id uuid,
  p_enabled boolean,
  p_note text,
  p_verification_base_url text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  student_record record;
  certificate_record record;
  payment_completed boolean := false;
  tasks_complete boolean := false;
  required_task_count integer := 0;
  verified_task_count integer := 0;
  certificate_code text;
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  select p.id, p.full_name, ie.id as enrollment_id, ie.domain_id,
         ie.expected_end_date, coalesce(d.name, 'Internship') as domain_name
    into student_record
  from profiles p
  left join lateral (
    select ie.id, ie.domain_id, ie.expected_end_date
    from internship_enrollments ie
    where ie.student_id = p.id
    order by ie.created_at desc
    limit 1
  ) ie on true
  left join domains d on d.id = ie.domain_id
  where p.id = p_student_id and p.role = 'student'
  for update of p;

  if not found then
    raise exception 'Student not found';
  end if;

  select c.* into certificate_record
  from certificates c
  where c.student_id = p_student_id
    and c.enrollment_id is not distinct from student_record.enrollment_id
  order by c.created_at desc
  limit 1;

  if p_enabled then
    if found and certificate_record.status = 'REVOKED' then
      raise exception 'A revoked certificate cannot be unlocked';
    end if;

    insert into certificate_access_overrides (student_id, granted_by, granted_at, note)
    values (p_student_id, auth.uid(), now(), nullif(trim(p_note), ''))
    on conflict (student_id) do update
      set granted_by = excluded.granted_by,
          granted_at = excluded.granted_at,
          note = excluded.note;

    if certificate_record.id is not null then
      update certificates
      set status = 'ISSUED',
          issue_date = coalesce(issue_date, current_date),
          student_name = coalesce(student_name, student_record.full_name),
          domain_name = coalesce(domain_name, student_record.domain_name),
          verification_url = coalesce(
            verification_url,
            rtrim(p_verification_base_url, '/') || '/' || certificate_id
          )
      where id = certificate_record.id;
    else
      certificate_code := 'IJAS-' || extract(year from current_date)::text || '-'
        || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
      insert into certificates (
        student_id, enrollment_id, domain_id, certificate_id, issue_date,
        end_date, verification_url, student_name, domain_name, status
      ) values (
        p_student_id, student_record.enrollment_id, student_record.domain_id,
        certificate_code, current_date, student_record.expected_end_date,
        rtrim(p_verification_base_url, '/') || '/' || certificate_code,
        student_record.full_name, student_record.domain_name, 'ISSUED'
      );
    end if;
  else
    delete from certificate_access_overrides where student_id = p_student_id;

    if certificate_record.id is not null and certificate_record.status <> 'REVOKED' then
      select exists (
        select 1 from payments py
        where py.student_id = p_student_id
          and py.purpose = 'Certificate fee'
          and py.provider = 'razorpay'
          and py.provider_payment_id is not null
          and py.status = 'Completed'
      ) into payment_completed;

      if student_record.enrollment_id is not null then
        select
          count(*) filter (where t.is_required)::integer,
          count(*) filter (where t.is_required and st.status = 'VERIFIED')::integer
          into required_task_count, verified_task_count
        from student_tasks st
        join tasks t on t.id = st.task_id
        where st.enrollment_id = student_record.enrollment_id;
        tasks_complete := required_task_count = verified_task_count;
      end if;

      update certificates
      set status = case
            when payment_completed and tasks_complete then 'ISSUED'
            else 'PENDING'
          end,
          issue_date = case
            when payment_completed and tasks_complete then coalesce(issue_date, current_date)
            else null
          end
      where id = certificate_record.id;
    end if;
  end if;

  return jsonb_build_object('success', true, 'enabled', p_enabled);
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
  where upper(c.certificate_id) = upper(trim(p_code))
    and c.status = 'ISSUED';

  if certificate_record.certificate_id is null then
    return jsonb_build_object('valid', false, 'status', 'not_found');
  end if;

  return jsonb_build_object(
    'valid', true,
    'status', 'valid',
    'certificate_id', certificate_record.certificate_id,
    'issue_date', certificate_record.issue_date,
    'end_date', certificate_record.end_date,
    'student_name', certificate_record.student_name,
    'domain', certificate_record.domain_name,
    'organization', 'InternJourneys AI Solutions',
    'mode', 'Virtual / Online'
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

  select st.id, st.enrollment_id, st.task_id, st.status,
         t.display_order
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
      verification_due_at = now() + interval '2 minutes',
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

create or replace function process_due_verifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update student_tasks
  set status = 'VERIFIED',
      verified_at = now(),
      verification_reason = 'Automatically verified after basic submission checks.'
  where status = 'VERIFICATION_PENDING'
    and verification_due_at <= now()
    and (
      nullif(trim(coalesce(submission_url, '')), '') is not null
      or nullif(trim(coalesce(submission_text, '')), '') is not null
      or submission_file_path is not null
    );

  get diagnostics updated_count = row_count;

  perform unlock_next_task(distinct_enrollment.enrollment_id)
  from (
    select distinct enrollment_id
    from student_tasks
    where verified_at >= now() - interval '5 minutes'
  ) distinct_enrollment;

  return updated_count;
end;
$$;

revoke execute on function process_due_verifications() from public, anon, authenticated;
grant execute on function process_due_verifications() to postgres;

do $$
begin
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'process-due-task-verifications';

  perform cron.schedule(
    'process-due-task-verifications',
    '* * * * *',
    'select public.process_due_verifications();'
  );
end;
$$;