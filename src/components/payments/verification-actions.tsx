"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { approvePayment, rejectPayment, requestReupload } from "@/actions/payments.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function RemarksDialog({
  triggerLabel,
  title,
  onConfirm,
}: {
  triggerLabel: string;
  title: string;
  onConfirm: (remarks: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="remarks">Remarks for the student</Label>
          <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(remarks);
              setOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VerificationActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approvePayment(paymentId);
      if (!result.success) {
        toast.error(result.error ?? "Could not approve payment");
        return;
      }
      toast.success("Payment approved — next installment unlocked");
      router.push("/admin/verifications");
      router.refresh();
    });
  }

  function handleReject(remarks: string) {
    startTransition(async () => {
      const result = await rejectPayment(paymentId, remarks);
      if (!result.success) {
        toast.error(result.error ?? "Could not reject payment");
        return;
      }
      toast.success("Payment rejected");
      router.push("/admin/verifications");
      router.refresh();
    });
  }

  function handleReupload(remarks: string) {
    startTransition(async () => {
      const result = await requestReupload(paymentId, remarks);
      if (!result.success) {
        toast.error(result.error ?? "Could not request re-upload");
        return;
      }
      toast.success("Re-upload requested");
      router.push("/admin/verifications");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleApprove} disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Approve
      </Button>
      <RemarksDialog triggerLabel="Request Re-upload" title="Request re-upload" onConfirm={handleReupload} />
      <RemarksDialog triggerLabel="Reject" title="Reject payment" onConfirm={handleReject} />
    </div>
  );
}
