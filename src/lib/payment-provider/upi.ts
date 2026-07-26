import type { PaymentProvider } from "@/lib/payment-provider/types";

const UPI_PAYEE_VPA = process.env.UPI_PAYEE_VPA ?? "divyavt202006@okicici";
const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME ?? "Clyra";

export const upiPaymentProvider: PaymentProvider = {
  id: "upi",
  async generatePayLink({ amount, installmentId, transactionNote }) {
    const params = new URLSearchParams({
      pa: UPI_PAYEE_VPA,
      pn: UPI_PAYEE_NAME,
      am: amount.toFixed(2),
      cu: "INR",
      tn: transactionNote ?? `Installment ${installmentId}`,
    });
    return { provider: "upi", url: `upi://pay?${params.toString()}` };
  },
};
