import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

// Server-side client that reads/writes the session via Next.js cookies. Used from Server
// Components, Server Actions, and Route Handlers. RLS applies based on the caller's own
// session -- this is the real security boundary, not a convenience wrapper around it.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no way to set cookies (e.g. a
            // page render, not a Server Action/Route Handler) -- middleware.ts
            // already refreshes the session on every request, so this is safe to ignore.
          }
        },
      },
    }
  );
}
