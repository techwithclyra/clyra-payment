-- Private bucket for student-uploaded payment proof screenshots.
-- Path convention (enforced by application code, not the DB): {auth.uid()}/{installmentId}/{paymentId}.{ext}
-- Using auth.uid() as the top-level folder lets the storage policy check ownership with a
-- simple string comparison instead of a subquery through students/installments.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "students read own payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "students upload own payment proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "admins manage payment proofs"
  on storage.objects for all
  using (bucket_id = 'payment-proofs' and public.is_admin())
  with check (bucket_id = 'payment-proofs' and public.is_admin());
