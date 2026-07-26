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

interface PaymentApprovedEmailProps {
  studentName: string;
  installmentName: string;
  amount: number;
}

export function PaymentApprovedEmail({ studentName, installmentName, amount }: PaymentApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your payment for {installmentName} has been approved</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px" }}>
          <Heading style={{ fontSize: "20px" }}>Payment approved</Heading>
          <Text>Hi {studentName},</Text>
          <Text>
            Your payment of <strong>{formatCurrency(amount)}</strong> for{" "}
            <strong>{installmentName}</strong> has been verified and approved. Your next
            installment (if any) is now unlocked in your Clyra Fee Portal.
          </Text>
          <Section>
            <Text style={{ color: "#71717a", fontSize: "12px" }}>
              — Clyra Fee Portal
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
