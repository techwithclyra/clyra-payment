"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { QrCode, Loader2 } from "lucide-react";

import { getPayLink } from "@/actions/payments.actions";
import { Button } from "@/components/ui/button";

export function PayNowButton({ installmentId }: { installmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [payUrl, setPayUrl] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const result = await getPayLink(installmentId);
      if (!result.success || !result.payUrl) {
        toast.error(result.error ?? "Could not generate payment link");
        return;
      }
      setPayUrl(result.payUrl);
      window.location.href = result.payUrl;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={isPending} className="w-fit">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
        Pay with Google Pay
      </Button>
      {payUrl && (
        <p className="text-xs text-muted-foreground">
          Didn&apos;t open automatically? On desktop, scan the UPI link with your phone&apos;s
          camera or copy it:{" "}
          <code className="rounded bg-muted px-1 py-0.5">{payUrl}</code>
        </p>
      )}
    </div>
  );
}
