# Clyra Fee Portal

A mobile-first fee management platform for Clyra: admin-managed students and custom
installment plans, UPI-based student payments with admin verification, receipts, analytics,
and email notifications.

**Stack:** Next.js (App Router) + Tailwind CSS · Supabase (Postgres, Auth, Storage) · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project details
npm run dev
```

See [docs/SETUP.md](docs/SETUP.md) for the full setup walkthrough: creating the Supabase
project, running the database migrations, creating the first admin account, configuring
Resend for email, and deploying to Vercel.

## Project structure

- `supabase/migrations/` — SQL schema, RLS policies, triggers (run in order)
- `src/app/` — routes: `(auth)` public, `admin/` admin panel, `(student)` student portal, `api/` route handlers
- `src/actions/` — Server Actions (all mutations)
- `src/lib/` — Supabase clients, payment provider abstraction, email, PDF, export, validation
- `src/components/` — UI components grouped by domain

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `node scripts/create-admin.mjs <email> <password> [name]` — create the first admin account
"# clyra-payment" 
