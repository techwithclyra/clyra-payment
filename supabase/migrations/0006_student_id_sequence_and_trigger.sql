-- Auto-generated, human-friendly student codes: CLY-<year created>-<0001, 0002, ...>
-- Implemented as a DB trigger (not application code) so the code is guaranteed unique
-- and correct regardless of which code path inserts a student (Server Action today,
-- a future bulk-import script, or a manual Supabase Studio insert).
create sequence if not exists public.student_code_seq;

create function public.generate_student_code() returns trigger
language plpgsql as $$
declare
  yr text := to_char(current_date, 'YYYY');
  next_val bigint;
begin
  if new.student_code is null then
    next_val := nextval('public.student_code_seq');
    new.student_code := 'CLY-' || yr || '-' || lpad(next_val::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger trg_generate_student_code
  before insert on public.students
  for each row execute function public.generate_student_code();
