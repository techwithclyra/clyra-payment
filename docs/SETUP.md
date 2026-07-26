# Clyra Fee Portal — Setup Guide

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard → New project.
2. Once created, grab from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the browser)
3. Copy `.env.example` to `.env.local` and fill these in.

## 2. Run the database migrations

Using the Supabase CLI (recommended):

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This runs every file in `supabase/migrations/` in order, creating the schema, triggers, RLS
policies, and the `payment-proofs` storage bucket.

Alternatively, paste each file in `supabase/migrations/` (in numeric order, 0001 → 0010) into
the Supabase Dashboard's SQL Editor and run them one at a time.

## 3. Generate TypeScript types (optional but recommended)

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/db/types.ts
```

Re-run this any time the schema changes.

## 4. Create the first admin account

There is no public admin sign-up route by design. Create the first admin with the included
script (uses the service-role key, never the browser):

```bash
node --env-file=.env.local scripts/create-admin.mjs "admin@clyra.app" "SomeStrongPassword123!" "Admin Name"
```

The `on_auth_user_created` trigger automatically creates a matching `profiles` row with
`role = 'admin'`. Log in at `/login` with that email/password.

Students are only ever created by an admin from **Admin → Students → Add Student** — there is
no student self-signup route.

## 5. Auth configuration

- **Email/password + Email OTP** are both handled by Supabase Auth natively — no extra setup
  beyond the project existing.
- In **Authentication → URL Configuration**, set:
  - Site URL: your production URL (or `http://localhost:3000` in dev)
  - Redirect URLs: add `<site-url>/auth/callback`
- In **Authentication → Providers → Email**, "Confirm email" can stay on for production;
  it's disabled in `supabase/config.toml` for local dev convenience only.

## 6. Storage

The `payment-proofs` bucket and its RLS policies are created by migration `0009`. Nothing
further to configure — it's private, and access is scoped per-student via RLS.

## 7. Resend (transactional email)

1. Create a free account at https://resend.com (no credit card; free tier is 3,000
   emails/month, 100/day).
2. Create an API key (Dashboard → API Keys) and set `RESEND_API_KEY` in `.env.local` / Vercel.
3. **Without a verified domain**, Resend restricts you to sending *from*
   `onboarding@resend.dev` and *to only the email address you signed up with*. That's enough
   to get `ADMIN_NOTIFICATION_EMAIL` working immediately (admin notification emails from
   yourself, to yourself), but student-facing emails (approval, receipts, reminders) will
   silently fail until a domain is verified.
4. To send to students' real addresses: Dashboard → Domains → Add Domain, add the DNS
   records it gives you at your domain registrar, wait for verification, then set
   `RESEND_FROM_EMAIL="Clyra <no-reply@yourdomain.com>"`.
5. `ADMIN_NOTIFICATION_EMAIL` (default `techwithclyra@gmail.com`) receives an email every
   time a student submits a payment for verification.
6. Until `RESEND_API_KEY` is set, the app runs fine — email sends are logged and skipped,
   nothing else is blocked.

## 8. Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket, then **Import Project** in Vercel.
2. Add all variables from `.env.example` to the Vercel project's Environment Variables.
3. Generate a `CRON_SECRET` (e.g. `openssl rand -hex 32`) and set it in Vercel too.
4. Vercel will pick up `vercel.json`'s cron schedule automatically — no extra dashboard step
   needed, but confirm under **Project → Cron Jobs** that it's listed and enabled.

## 9. Payment gateway upgrade path

Today, "Pay Now" opens a `upi://pay?...` deep link built from `UPI_PAYEE_VPA`. To add
Razorpay/PhonePe later:

1. Implement `src/lib/payment-provider/razorpay.ts` against the `PaymentProvider` interface
   in `src/lib/payment-provider/types.ts`.
2. Add a `case 'razorpay':` branch in `src/lib/payment-provider/index.ts`.
3. Set `PAYMENT_PROVIDER=razorpay` (plus that provider's own API keys).

No changes needed anywhere else — student/installment/payment business logic doesn't know or
care which provider generated the pay link.
