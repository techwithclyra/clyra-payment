create table public.installments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  installment_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  sequence_no int not null,
  status public.installment_status not null default 'locked',
  current_payment_id uuid,                             -- fk added in 0005 after payments exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, sequence_no)
);

create index idx_installments_student_id on public.installments(student_id);
create index idx_installments_status on public.installments(status);
create index idx_installments_due_date on public.installments(due_date);

create trigger set_installments_updated_at
  before update on public.installments
  for each row execute function public.set_updated_at();
