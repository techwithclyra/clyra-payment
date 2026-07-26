-- Corrective migration for projects that already applied 0007 with the trigger as AFTER
-- UPDATE: NEW.verified_at was silently never persisted (AFTER triggers can't mutate the row
-- being written). Re-creates it as BEFORE UPDATE, which 0007 now defines correctly for any
-- fresh install. Safe to run even if 0007 already created it correctly (drop if exists).
drop trigger if exists trg_payment_status_change on public.payments;

create trigger trg_payment_status_change
  before update of verification_status on public.payments
  for each row execute function public.handle_payment_status_change();
