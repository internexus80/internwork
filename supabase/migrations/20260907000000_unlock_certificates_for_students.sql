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

  perform pg_advisory_xact_lock(hashtext(current_student::text));

  select ie.id, ie.domain_id, ie.start_date, ie.expected_end_date,
         coalesce(d.name, 'Internship') as domain_name,
         coalesce(p.full_name, 'Student') as student_name
    into enrollment_record
  from (select current_student as student_id) student
  left join lateral (
    select ie.id, ie.domain_id, ie.start_date, ie.expected_end_date
    from internship_enrollments ie
    where ie.student_id = student.student_id
    order by ie.created_at desc
    limit 1
  ) ie on true
  left join domains d on d.id = ie.domain_id
  left join profiles p on p.id = student.student_id;

  select c.*
    into existing_certificate
  from certificates c
  where c.student_id = current_student
    and (
      c.enrollment_id = enrollment_record.id
      or (enrollment_record.id is null and c.enrollment_id is null)
    )
  limit 1;

  if found then
    if existing_certificate.status = 'REVOKED' then
      return jsonb_build_object(
        'eligible', false,
        'reason', 'certificate_revoked',
        'certificate', to_jsonb(existing_certificate)
      );
    end if;

    update certificates
    set status = 'ISSUED',
        issue_date = coalesce(issue_date, current_date),
        student_name = coalesce(student_name, enrollment_record.student_name),
        domain_name = coalesce(domain_name, enrollment_record.domain_name),
        verification_url = coalesce(
          verification_url,
          rtrim(p_verification_base_url, '/') || '/' || certificate_id
        )
    where id = existing_certificate.id
    returning * into existing_certificate;

    return jsonb_build_object('eligible', true, 'certificate', to_jsonb(existing_certificate));
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
    where c.student_id = current_student
      and (
        c.enrollment_id = enrollment_record.id
        or (enrollment_record.id is null and c.enrollment_id is null)
      )
    order by c.created_at desc
    limit 1;
    return jsonb_build_object(
      'eligible', existing_certificate.status = 'ISSUED',
      'certificate', to_jsonb(existing_certificate)
    );
end;
$$;