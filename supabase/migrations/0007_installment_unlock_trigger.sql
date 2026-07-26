-- Business invariant lives in the database, not application code: "approved payment
-- implies its installment is paid implies the next installment unlocks." This must hold
-- no matter which code path changes verification_status (Server Action today, a future
-- bulk-approve tool, a support script), so it belongs here rather than scattered across
-- every call site. security definer is required because students have no direct UPDATE
-- grant on installments -- only this trigger, acting with elevated rights, can flip it.

create function public.handle_payment_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_student_id uuid;
  v_seq int;
begin
  if new.verification_status = 'approved' and old.verification_status is distinct from 'approved' then
    update public.installments
      set status = 'paid', current_payment_id = new.id, updated_at = now()
      where id = new.installment_id
      returning student_id, sequence_no into v_student_id, v_seq;

    new.verified_at := coalesce(new.verified_at, now());

    update public.installments
      set status = 'pending', updated_at = now()
      where student_id = v_student_id
        and sequence_no = v_seq + 1
        and status = 'locked';

  elsif new.verification_status = 'rejected' and old.verification_status is distinct from 'rejected' then
    update public.installments
      set status = 'rejected', updated_at = now()
      where id = new.installment_id;

  elsif new.verification_status = 'reupload_requested' and old.verification_status is distinct from 'reupload_requested' then
    -- payable again; student re-submits a brand new payment row (audit trail preserved)
    update public.installments
      set status = 'pending', updated_at = now()
      where id = new.installment_id;
  end if;

  return new;
end;
$$;

-- Must be BEFORE, not AFTER: this function assigns new.verified_at, and a row mutation via
-- NEW only persists from a BEFORE trigger -- in an AFTER trigger the row is already written,
-- so that assignment would silently be discarded.
create trigger trg_payment_status_change
  before update of verification_status on public.payments
  for each row execute function public.handle_payment_status_change();

-- Handles the initial INSERT path: student submits proof -> a new 'pending' payment row
-- is created directly -> the installment should immediately show pending_verification.
create function public.handle_payment_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.installments
    set status = 'pending_verification', current_payment_id = new.id, updated_at = now()
    where id = new.installment_id;
  return new;
end;
$$;

create trigger trg_payment_insert
  after insert on public.payments
  for each row execute function public.handle_payment_insert();
