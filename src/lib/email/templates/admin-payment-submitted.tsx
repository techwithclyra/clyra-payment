import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { formatCurrency } from "@/lib/utils";

interface AdminPaymentSubmittedEmailProps {
  studentName: string;
  studentCode: string;
  installmentName: string;
  amount: number;
  transactionId: string;
}

export function AdminPaymentSubmittedEmail({
  studentName,
  studentCode,
  installmentName,
  amount,
  transactionId,
}: AdminPaymentSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {studentName} submitted a payment for {installmentName} - review in the admin panel
      </Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px" }}>
          <Heading style={{ fontSize: "20px" }}>New payment to verify</Heading>
          <Text>
            <strong>{studentName}</strong> ({studentCode}) submitted a payment of{" "}
            <strong>{formatCurrency(amount)}</strong> for <strong>{installmentName}</strong>.
          </Text>
          <Text style={{ color: "#71717a" }}>UPI transaction ID: {transactionId}</Text>
          <Text>
            Open the Clyra Fee Portal admin panel → Verifications to review the screenshot and
            approve, reject, or request a re-upload.
          </Text>
          <Section>
            <Text style={{ color: "#71717a", fontSize: "12px" }}>— Clyra Fee Portal</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
