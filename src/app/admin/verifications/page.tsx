import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { getPendingVerifications } from "@/lib/queries/verifications";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function VerificationsPage() {
  const verifications = await getPendingVerifications();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Verifications</h1>
        <p className="text-sm text-muted-foreground">
          Review student-submitted payments awaiting approval.
        </p>
      </div>

      {verifications.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All caught up"
          description="No payments are waiting for verification right now."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {verifications.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {v.studentName} <span className="text-muted-foreground">({v.studentCode})</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {v.installmentName} · {formatCurrency(v.amount)} · Submitted {formatDateTime(v.createdAt)}
                  </span>
                  {v.transactionId && (
                    <span className="text-xs text-muted-foreground">Txn: {v.transactionId}</span>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/admin/verifications/${v.id}`}>Review</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
