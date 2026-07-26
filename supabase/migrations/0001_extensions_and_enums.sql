-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('admin', 'student');

create type public.installment_status as enum (
  'locked',                -- not yet payable, prior installment unpaid
  'pending',                -- payable now, no active payment attempt ("Pay Now" shown)
  'pending_verification',   -- student uploaded proof, awaiting admin review
  'paid',                   -- admin approved
  'overdue',                -- manual admin override only; overdue-for-display is computed at read time
  'rejected'                -- admin rejected; student may resubmit -> back to pending
);

create type public.payment_verification_status as enum (
  'pending',
  'approved',
  'rejected',
  'reupload_requested'
);

-- Shared helper: keep `updated_at` current on any table that has the column.
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
