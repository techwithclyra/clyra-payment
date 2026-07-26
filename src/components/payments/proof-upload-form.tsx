"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { submitPaymentProof } from "@/actions/payments.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ProofUploadForm({ installmentId }: { installmentId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("installmentId", installmentId);

    startTransition(async () => {
      const result = await submitPaymentProof(formData);
      if (!result.success) {
        toast.error(result.error ?? "Could not submit payment");
        return;
      }
      toast.success("Payment submitted for verification");
      formRef.current?.reset();
      setFileName(null);
      router.push("/installments");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit payment proof</CardTitle>
        <CardDescription>
          After paying, upload your screenshot and UPI transaction ID for admin verification.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="transactionId">UPI Transaction ID</Label>
            <Input id="transactionId" name="transactionId" required placeholder="e.g. 123456789012" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="screenshot">Payment screenshot</Label>
            <label
              htmlFor="screenshot"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
            >
              <Upload className="size-5" />
              {fileName ?? "Click to choose an image (PNG, JPEG, WEBP — max 5MB)"}
            </label>
            <input
              id="screenshot"
              name="screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              required
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Textarea id="note" name="note" placeholder="Anything the admin should know" rows={3} />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Submit for verification
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
