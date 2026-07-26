import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

// Service-role client: bypasses RLS entirely. Only ever import this from Server Actions or
// Route Handlers that explicitly need elevated access (e.g. admin creating a student's
// auth.users account, or the cron job scanning across all students). The `server-only`
// import makes any accidental client-component import a build-time error, not a runtime leak.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
