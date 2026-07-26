-- Overdue is computed at read time rather than written by a daily cron job, so dashboards
-- and badges are never up to a day stale. An admin can still manually set status='overdue'
-- as an explicit override (per spec); this view layers the same "is it late" computation on
-- top of whatever status is actually stored, without mutating the row.
create function public.is_installment_overdue(p_status public.installment_status, p_due_date date)
returns boolean
language sql immutable as $$
  select p_status in ('pending', 'pending_verification') and p_due_date < current_date;
$$;

create view public.installments_with_effective_status as
select
  i.*,
  case
    when i.status = 'overdue' then true
    else public.is_installment_overdue(i.status, i.due_date)
  end as is_overdue,
  case
    when i.status not in ('paid', 'rejected') and public.is_installment_overdue(i.status, i.due_date) then 'overdue'::public.installment_status
    else i.status
  end as effective_status
from public.installments i;

alter view public.installments_with_effective_status set (security_invoker = on);
