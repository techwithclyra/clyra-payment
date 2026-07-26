// One-off setup script: creates the first (or an additional) admin account.
// There is no public admin-signup route by design -- this is the only way to mint an
// admin, and it must be run with the service-role key, never exposed to the browser.
//
// Usage:
//   node scripts/create-admin.mjs "admin@clyra.app" "TemporaryPassword123!" "Admin Name"
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
// (e.g. `cp .env.local` values into your shell, or run via `node --env-file=.env.local`).

import { createClient } from "@supabase/supabase-js";

const [, , email, password, fullName] = process.argv;

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs <email> <password> [full name]"
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: "admin", full_name: fullName ?? null },
});

if (error) {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
}

console.log("Admin created:", data.user.id, data.user.email);
console.log(
  "The on_auth_user_created trigger will have created a matching profiles row with role='admin'."
);
