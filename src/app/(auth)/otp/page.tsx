"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { requestOtp, verifyOtp } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OtpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestOtp({ email });
      if (!result.success) {
        toast.error(result.error ?? "Could not send code");
        return;
      }
      toast.success("Code sent to your email");
      setStep("verify");
    });
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await verifyOtp({ email, token });
      if (!result.success) {
        toast.error(result.error ?? "Invalid or expired code");
        return;
      }
      toast.success("Welcome back");
      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Sign in with a one-time code</CardTitle>
          <CardDescription>
            {step === "request"
              ? "We'll email a 6-digit code to your registered address."
              : `Enter the code sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        {step === "request" ? (
          <form onSubmit={handleRequest}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-email">Email</Label>
                <Input
                  id="otp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Send code
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Prefer a password?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in instead
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-token">6-digit code</Label>
                <Input
                  id="otp-token"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Verify &amp; sign in
              </Button>
              <button
                type="button"
                className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setStep("request")}
              >
                Use a different email
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </motion.div>
  );
}
