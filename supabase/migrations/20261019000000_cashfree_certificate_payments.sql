drop policy if exists "students insert own payments" on payments;
drop policy if exists "students insert own pending certificate payments" on payments;
drop policy if exists "students insert own certificate payments" on payments;

create unique index if not exists idx_payments_cashfree_order_id
  on payments(provider_order_id)
  where provider = 'cashfree' and provider_order_id is not null;

create or replace function certificate_payment_is_verified(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from payments py
    where py.student_id = p_student_id
      and py.purpose = 'Certificate fee'
      and py.provider in ('razorpay', 'cashfree')
      and py.provider_payment_id is not null
      and py.status = 'Completed'
  );
$$;

revoke all on function certificate_payment_is_verified(uuid) from public, anon, authenticated;

create or replace function prevent_unverified_certificate_payment_completion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.purpose = 'Certificate fee'
    and new.status = 'Completed'
    and coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' then
      raise exception 'Certificate payments can only be completed by the verified payment service';
    elsif old.status is distinct from 'Completed' then
      raise exception 'Certificate payments can only be completed by the verified payment service';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists payments_require_verified_certificate_completion on payments;
create trigger payments_require_verified_certificate_completion
  before insert or update on payments
  for each row execute function prevent_unverified_certificate_payment_completion();

revoke all on function prevent_unverified_certificate_payment_completion() from public, anon, authenticated;

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

  payment_completed := certificate_payment_is_verified(current_student);

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
      certificate_payment_is_verified(p.id) as payment_completed,
      case
        when certificate_payment_is_verified(p.id) then 'Paid'
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
            and certificate_payment_is_verified(p.id)
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
      select py.status, py.amount, py.provider, py.created_at, py.paid_at,
             py.provider_payment_id, py.provider_order_id
      from payments py
      where py.student_id = p.id and py.purpose = 'Certificate fee'
      order by (
        py.provider in ('razorpay', 'cashfree')
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
      payment_completed := certificate_payment_is_verified(p_student_id);

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

revoke execute on function complete_certificate_payment(text, text, text, text) from public, anon, authenticated;
drop function if exists complete_certificate_payment(text, text, text, text);

create or replace function complete_certificate_payment(p_order_id text, p_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_record payments%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Trusted payment service required';
  end if;
  if nullif(trim(p_order_id), '') is null or nullif(trim(p_payment_id), '') is null then
    raise exception 'Cashfree order and payment IDs are required';
  end if;

  select * into payment_record
  from payments
  where provider = 'cashfree'
    and provider_order_id = p_order_id
    and purpose = 'Certificate fee'
  for update;

  if not found then
    raise exception 'Cashfree certificate payment order not found';
  end if;

  if payment_record.amount <> 199 or payment_record.currency <> 'INR' then
    raise exception 'Certificate payment amount or currency is invalid';
  end if;

  if payment_record.status = 'Completed' then
    if payment_record.provider_payment_id = p_payment_id then
      return jsonb_build_object('success', true, 'already_completed', true);
    end if;
    raise exception 'Payment order is already linked to another payment';
  end if;

  if payment_record.status not in ('Pending', 'Failed') then
    raise exception 'Payment is not eligible for completion';
  end if;

  update payments
  set status = 'Completed',
      provider_payment_id = p_payment_id,
      paid_at = now()
  where id = payment_record.id;

  return jsonb_build_object('success', true, 'payment_id', payment_record.id);
end;
$$;

revoke all on function complete_certificate_payment(text, text) from public, anon, authenticated;
grant execute on function complete_certificate_payment(text, text) to service_role;

create or replace function mark_certificate_payment_failed(p_order_id text, p_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_record payments%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Trusted payment service required';
  end if;
  if nullif(trim(p_order_id), '') is null or nullif(trim(p_payment_id), '') is null then
    raise exception 'Cashfree order and payment IDs are required';
  end if;

  select * into payment_record
  from payments
  where provider = 'cashfree'
    and provider_order_id = p_order_id
    and purpose = 'Certificate fee'
  for update;

  if not found then
    raise exception 'Cashfree certificate payment order not found';
  end if;

  if payment_record.amount <> 199 or payment_record.currency <> 'INR' then
    raise exception 'Certificate payment amount or currency is invalid';
  end if;

  if payment_record.status = 'Completed' then
    return jsonb_build_object('success', true, 'already_completed', true);
  end if;

  if payment_record.status in ('Pending', 'Failed') then
    update payments
    set status = 'Failed', paid_at = null
    where id = payment_record.id;
  end if;

  return jsonb_build_object('success', true);
end;
$$;

revoke all on function mark_certificate_payment_failed(text, text) from public, anon, authenticated;
grant execute on function mark_certificate_payment_failed(text, text) to service_role;
