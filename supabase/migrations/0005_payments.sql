create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  installment_id uuid not null references public.installments(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  screenshot_path text,                                 -- storage object path in 'payment-proofs' bucket
  transaction_id text,
  note text,
  verification_status public.payment_verification_status not null default 'pending',
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  remarks text,                                         -- admin remarks on reject/reupload
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_student_id on public.payments(student_id);
create index idx_payments_installment_id on public.payments(installment_id);
create index idx_payments_status on public.payments(verification_status);

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.installments
  add constraint fk_installments_current_payment
  foreign key (current_payment_id) references public.payments(id) on delete set null;
