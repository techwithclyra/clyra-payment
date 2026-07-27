"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";

import { getPayLink } from "@/actions/payments.actions";
import { Button } from "@/components/ui/button";

export function PayNowButton({ installmentId }: { installmentId: string }) {
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getPayLink(installmentId).then(async (result) => {
      if (cancelled) return;
      if (!result.success || !result.payUrl) {
        toast.error(result.error ?? "Could not generate payment link");
        setLoading(false);
        return;
      }
      setPayUrl(result.payUrl);
      const qr = await QRCode.toDataURL(result.payUrl, {
        width: 220,
        margin: 1,
        color: { dark: "#18181b", light: "#ffffff" },
      });
      if (!cancelled) {
        setQrDataUrl(qr);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [installmentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Generating payment QR code...
      </div>
    );
  }

  if (!payUrl || !qrDataUrl) {
    return <p className="text-sm text-destructive">Could not generate a payment link. Please refresh and try again.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div className="rounded-xl border bg-white p-3">
        <Image src={qrDataUrl} alt="UPI payment QR code" width={220} height={220} unoptimized />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Scan this QR code with Google Pay, PhonePe, Paytm, or any UPI app to pay directly.
        </p>
        <Button asChild className="w-fit">
          <a href={payUrl}>
            <ExternalLink className="size-4" />
            Open in UPI app
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          On mobile, the button above opens your UPI app directly. On desktop, scan the QR
          code with your phone&apos;s camera.
        </p>
      </div>
    </div>
  );
}
