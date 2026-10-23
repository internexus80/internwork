create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  initials text,
  role text not null default 'student' check (role in ('student', 'admin')),
  phone text,
  college text,
  graduation_year text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null,
  description text not null,
  level text not null,
  duration_weeks integer not null,
  duration_label text,
  icon text,
  color text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists domain_skills (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains(id) on delete cascade,
  skill_name text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains(id) on delete cascade,
  title text not null,
  slug text not null,
  task_number integer not null,
  short_description text not null,
  description text not null,
  learning_objective text,
  prerequisites text,
  guide jsonb not null default '{}'::jsonb,
  tools jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  evaluation_criteria jsonb default '[]'::jsonb,
  allowed_submission_types jsonb default '["github_url","live_url","text"]'::jsonb,
  difficulty text default 'Beginner',
  estimated_hours integer,
  due_days integer,
  is_active boolean default true,
  is_required boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(domain_id, slug)
);

create table if not exists internship_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  domain_id uuid references domains(id),
  status text default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  start_date date not null default current_date,
  expected_end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists student_tasks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references internship_enrollments(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text default 'AVAILABLE' check (status in ('AVAILABLE','IN_PROGRESS','SUBMITTED','VERIFICATION_PENDING','VERIFIED','REJECTED')),
  submission_url text,
  submission_text text,
  submission_file_path text,
  submitted_at timestamptz,
  verification_due_at timestamptz,
  verified_at timestamptz,
  verification_reason text,
  attempt_number integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(enrollment_id, task_id)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  enrollment_id uuid references internship_enrollments(id) on delete set null,
  domain_id uuid references domains(id) on delete set null,
  certificate_id text unique not null,
  issue_date date,
  status text not null default 'PENDING',
  file_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_domains_slug on domains(slug);
create index if not exists idx_domains_is_active on domains(is_active);
create index if not exists idx_domains_display_order on domains(display_order);
create index if not exists idx_domain_skills_domain_id on domain_skills(domain_id);
create index if not exists idx_tasks_domain_id on tasks(domain_id);
create index if not exists idx_tasks_is_active on tasks(is_active);
create index if not exists idx_tasks_display_order on tasks(display_order);
create index if not exists idx_student_tasks_student_id on student_tasks(student_id);
create index if not exists idx_student_tasks_enrollment_id on student_tasks(enrollment_id);
create index if not exists idx_student_tasks_status on student_tasks(status);
create index if not exists idx_student_tasks_verification_due_at on student_tasks(verification_due_at);
create index if not exists idx_certificates_certificate_id on certificates(certificate_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();
drop trigger if exists domains_set_updated_at on domains;
create trigger domains_set_updated_at before update on domains for each row execute function set_updated_at();
drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at before update on tasks for each row execute function set_updated_at();
drop trigger if exists internship_enrollments_set_updated_at on internship_enrollments;
create trigger internship_enrollments_set_updated_at before update on internship_enrollments for each row execute function set_updated_at();
drop trigger if exists student_tasks_set_updated_at on student_tasks;
create trigger student_tasks_set_updated_at before update on student_tasks for each row execute function set_updated_at();
drop trigger if exists certificates_set_updated_at on certificates;
create trigger certificates_set_updated_at before update on certificates for each row execute function set_updated_at();

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
  );
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
    and st.status not in ('VERIFIED')
  order by t.display_order asc, t.task_number asc
  limit 1;

  if next_student_task_id is not null then
    update student_tasks
      set status = 'AVAILABLE'
    where id = next_student_task_id
      and status not in ('AVAILABLE','IN_PROGRESS','SUBMITTED','VERIFICATION_PENDING','VERIFIED');
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
    select 1 from internship_enrollments ie
    where ie.student_id = current_user_id
      and ie.status = 'ACTIVE'
  ) then
    raise exception 'You already have an active internship';
  end if;

  insert into internship_enrollments (student_id, domain_id, expected_end_date)
  select current_user_id, requested_domain_id, current_date + (duration_weeks * 7)
  from domains d
  where d.id = requested_domain_id
  returning id into new_enrollment_id;

  insert into student_tasks (enrollment_id, task_id, student_id, status)
  select new_enrollment_id, id, current_user_id, 'IN_PROGRESS'
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

  update student_tasks
    set status = 'AVAILABLE'
  where id = first_student_task_id;

  return query
    select new_enrollment_id, requested_domain_id, 'ACTIVE'::text;
end;
$$;

create or replace function verify_student_task(target_student_task_id uuid, approved boolean, reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_enrollment_id uuid;
begin
  if not is_admin() then
    raise exception 'Admin access required';
  end if;

  update student_tasks
    set status = case when approved then 'VERIFIED' else 'REJECTED' end,
        verified_at = case when approved then now() else null end,
        verification_reason = reason
  where id = target_student_task_id
  returning enrollment_id into target_enrollment_id;

  if approved and target_enrollment_id is not null then
    perform unlock_next_task(target_enrollment_id);
  end if;
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

alter table profiles enable row level security;
alter table domains enable row level security;
alter table domain_skills enable row level security;
alter table tasks enable row level security;
alter table internship_enrollments enable row level security;
alter table student_tasks enable row level security;
alter table certificates enable row level security;

drop policy if exists "profiles read own or admin" on profiles;
create policy "profiles read own or admin" on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists "profiles update own or admin" on profiles;
create policy "profiles update own or admin" on profiles for update using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());
drop policy if exists "profiles insert own" on profiles;
create policy "profiles insert own" on profiles for insert with check (id = auth.uid());

drop policy if exists "public reads active domains" on domains;
create policy "public reads active domains" on domains for select using (is_active = true or is_admin());
drop policy if exists "admin manages domains" on domains;
create policy "admin manages domains" on domains for all using (is_admin()) with check (is_admin());

drop policy if exists "public reads active domain skills" on domain_skills;
create policy "public reads active domain skills" on domain_skills for select using (
  exists (select 1 from domains d where d.id = domain_id and d.is_active = true) or is_admin()
);
drop policy if exists "admin manages domain skills" on domain_skills;
create policy "admin manages domain skills" on domain_skills for all using (is_admin()) with check (is_admin());

drop policy if exists "public reads active task roadmap" on tasks;
create policy "public reads active task roadmap" on tasks for select using (
  is_active = true and exists (select 1 from domains d where d.id = domain_id and d.is_active = true) or is_admin()
);
drop policy if exists "admin manages tasks" on tasks;
create policy "admin manages tasks" on tasks for all using (is_admin()) with check (is_admin());

drop policy if exists "students read own enrollments" on internship_enrollments;
create policy "students read own enrollments" on internship_enrollments for select using (student_id = auth.uid() or is_admin());
drop policy if exists "students insert own enrollments" on internship_enrollments;
create policy "students insert own enrollments" on internship_enrollments for insert with check (student_id = auth.uid());
drop policy if exists "admin manages enrollments" on internship_enrollments;
create policy "admin manages enrollments" on internship_enrollments for all using (is_admin()) with check (is_admin());

drop policy if exists "students read own tasks" on student_tasks;
create policy "students read own tasks" on student_tasks for select using (student_id = auth.uid() or is_admin());
drop policy if exists "students submit own available tasks" on student_tasks;
create policy "students submit own available tasks" on student_tasks for update using (
  student_id = auth.uid()
  and status in ('AVAILABLE','IN_PROGRESS','REJECTED')
) with check (
  student_id = auth.uid()
  and status = 'VERIFICATION_PENDING'
);
drop policy if exists "admin manages student tasks" on student_tasks;
create policy "admin manages student tasks" on student_tasks for all using (is_admin()) with check (is_admin());

drop policy if exists "public reads issued certificate verification" on certificates;
create policy "public reads issued certificate verification" on certificates for select using (status = 'ISSUED' or student_id = auth.uid() or is_admin());
drop policy if exists "admin manages certificates" on certificates;
create policy "admin manages certificates" on certificates for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public)
values
  ('offer-letters', 'offer-letters', false),
  ('id-cards', 'id-cards', false),
  ('certificates', 'certificates', false),
  ('student-submissions', 'student-submissions', false)
on conflict (id) do nothing;
