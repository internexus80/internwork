create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  currency text default 'INR',
  purpose text not null default '',
  provider text default 'manual',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  status text default 'Pending' check (status in ('Pending', 'Completed', 'Failed', 'Refunded')),
  created_at timestamptz default now(),
  paid_at timestamptz
);

create index if not exists idx_payments_student_id on payments(student_id);
create index if not exists idx_payments_status on payments(status);

alter table payments enable row level security;

drop policy if exists "students read own payments" on payments;
create policy "students read own payments" on payments for select using (student_id = auth.uid());
drop policy if exists "students insert own payments" on payments;
create policy "students insert own payments" on payments for insert with check (student_id = auth.uid());
drop policy if exists "admin manages payments" on payments;
create policy "admin manages payments" on payments for all using (is_admin()) with check (is_admin());

create or replace function admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  return jsonb_build_object(
    'totalStudents', (select count(*) from profiles where role = 'student'),
    'activeInterns', (select count(*) from internship_enrollments where status = 'ACTIVE'),
    'completedInterns', (select count(*) from internship_enrollments where status = 'COMPLETED'),
    'pendingApplications', (select count(*) from student_tasks where status in ('VERIFICATION_PENDING', 'SUBMITTED')),
    'totalApplications', (select count(*) from student_tasks),
    'totalRevenue', (select coalesce(sum(amount), 0) from payments where status = 'Completed'),
    'pendingRevenue', (select coalesce(sum(amount), 0) from payments where status = 'Pending'),
    'completedPayments', (select count(*) from payments where status = 'Completed'),
    'pendingPayments', (select count(*) from payments where status = 'Pending'),
    'issuedCertificates', (select count(*) from certificates where status = 'ISSUED')
  );
end;
$$;

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

  select coalesce(jsonb_agg(row_to_jsonb(t)), '[]'::jsonb)
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

  select coalesce(jsonb_agg(row_to_jsonb(t)), '[]'::jsonb)
  into result
  from (
    select
      st.id,
      st.status,
      st.submitted_at,
      st.submission_url,
      st.submission_text,
      st.verification_reason,
      t.task_number,
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

  select coalesce(jsonb_agg(row_to_jsonb(t)), '[]'::jsonb)
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

create or replace function verify_certificate_by_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'valid', true,
    'certificate_id', c.certificate_id,
    'issue_date', c.issue_date,
    'student_name', p.full_name,
    'domain', d.name
  )
  into result
  from certificates c
  join profiles p on p.id = c.student_id
  join domains d on d.id = c.domain_id
  where c.certificate_id = p_code
    and c.status = 'ISSUED';

  if result is null then
    return jsonb_build_object('valid', false);
  end if;

  return result;
end;
$$;