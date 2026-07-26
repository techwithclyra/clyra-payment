export interface PaymentRequest {
  amount: number; // INR, decimal rupees (not paise) -- matches the numeric(12,2) DB column
  studentId: string;
  installmentId: string;
  studentName: string;
  transactionNote?: string;
}

export interface PaymentLink {
  provider: "upi" | "razorpay" | "phonepe";
  url: string; // deep link or redirect URL to open
  reference?: string; // provider-side reference/order id, if any (none for plain UPI)
}

export interface PaymentProvider {
  readonly id: PaymentLink["provider"];
  generatePayLink(req: PaymentRequest): Promise<PaymentLink>;
  // Future gateways confirm payment via webhook/callback rather than student self-report;
  // declared now so callers can branch without a refactor once one is wired up.
  verifyPayment?(reference: string): Promise<{ verified: boolean; rawStatus: string }>;
}
