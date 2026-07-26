import "server-only";
import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  attachments?: { filename: string; content: Buffer }[];
}

// Treated as best-effort everywhere it's called: a missing key or a provider failure never
// blocks the underlying DB mutation (e.g. approving a payment still succeeds even if the
// notification email doesn't go out).
export async function sendEmail(opts: SendEmailOptions) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set - skipping "${opts.subject}" to ${opts.to}`);
    return { skipped: true as const };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Clyra <no-reply@clyra.app>",
      to: opts.to,
      subject: opts.subject,
      react: opts.react,
      attachments: opts.attachments,
    });
    return { skipped: false as const, result };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { skipped: false as const, error: err };
  }
}
