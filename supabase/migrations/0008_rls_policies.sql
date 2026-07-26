-- Helper functions (stable + security definer so they're fast and bypass RLS
-- recursion issues when read from inside a policy on the same/related table).
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create function public.owns_student_row(p_student_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.students where id = p_student_id and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.installments enable row level security;
alter table public.payments enable row level security;

-- profiles: a user reads their own row; admins read/write every row.
create policy profiles_select_own on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- students: a student reads only their own row; only admins may create/update/delete.
create policy students_select_own_or_admin on public.students for select
  using (user_id = auth.uid() or public.is_admin());
create policy students_admin_insert on public.students for insert
  with check (public.is_admin());
create policy students_admin_update on public.students for update
  using (public.is_admin()) with check (public.is_admin());
create policy students_admin_delete on public.students for delete
  using (public.is_admin());

-- installments: a student reads only their own; only admins write (status/amount/date
-- changes are always admin-initiated, including the automatic unlock which runs as the
-- trigger's security definer role, not as the student).
create policy installments_select_own_or_admin on public.installments for select
  using (public.owns_student_row(student_id) or public.is_admin());
create policy installments_admin_insert on public.installments for insert
  with check (public.is_admin());
create policy installments_admin_update on public.installments for update
  using (public.is_admin()) with check (public.is_admin());
create policy installments_admin_delete on public.installments for delete
  using (public.is_admin());

-- payments: a student may read their own payment attempts and insert a new one, but can
-- never UPDATE a payment row directly (approve/reject/reupload is admin-only, and
-- resubmission after rejection is modeled as a brand new row -- full audit trail, no
-- student-facing UPDATE policy to reason about).
create policy payments_select_own_or_admin on public.payments for select
  using (public.owns_student_row(student_id) or public.is_admin());

create policy payments_student_insert on public.payments for insert
  with check (
    public.owns_student_row(student_id)
    and exists (
      select 1 from public.installments i
      where i.id = installment_id
        and i.student_id = payments.student_id
        and i.status in ('pending', 'rejected')
    )
  );

create policy payments_admin_update on public.payments for update
  using (public.is_admin()) with check (public.is_admin());
create policy payments_admin_delete on public.payments for delete
  using (public.is_admin());
