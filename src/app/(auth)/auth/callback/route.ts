import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase SSR flow requires exchanging the `code` query param for a session server-side
// (e.g. magic-link emails). The OTP-code flow used elsewhere in this app verifies inline via
// verifyOtp() and never hits this route, but it's still required for any Supabase-issued
// email link (password reset, email change confirmation, etc).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
