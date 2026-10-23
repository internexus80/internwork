create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, initials, role, phone, college, graduation_year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'initials', coalesce(left(new.raw_user_meta_data ->> 'full_name', 2), '')),
    'student',
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'college', ''),
    nullif(new.raw_user_meta_data ->> 'graduation_year', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
