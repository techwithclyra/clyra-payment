import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            C
          </span>
          Clyra
        </Link>
        <p className="text-sm text-muted-foreground">Fee Portal</p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
