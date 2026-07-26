import type { PaymentProvider } from "@/lib/payment-provider/types";
import { upiPaymentProvider } from "@/lib/payment-provider/upi";

// Swap PAYMENT_PROVIDER (env) + add a new provider file + a case here to move from UPI to
// Razorpay/PhonePe later. Nothing else in the app -- student/installment/payment business
// logic -- needs to know or care which provider generated the pay link.
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "upi";
  switch (provider) {
    case "upi":
      return upiPaymentProvider;
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}
