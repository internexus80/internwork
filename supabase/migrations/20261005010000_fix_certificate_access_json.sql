do $$
declare
  function_definition text;
begin
  function_definition := pg_get_functiondef('public.admin_certificate_access_overview()'::regprocedure);

  if position('row_to_jsonb(t)' in function_definition) > 0 then
    execute replace(function_definition, 'row_to_jsonb(t)', 'to_jsonb(t)');
  end if;
end;
$$;

update student_tasks
set verification_due_at = coalesce(submitted_at, created_at) + interval '2 minutes'
where status in ('VERIFICATION_PENDING', 'SUBMITTED');

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
  where status in ('VERIFICATION_PENDING', 'SUBMITTED')
    and coalesce(verification_due_at, submitted_at + interval '2 minutes') <= now()
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