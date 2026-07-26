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
import { formatCurrency, formatDate } from "@/lib/utils";

interface DueDateReminderEmailProps {
  studentName: string;
  installmentName: string;
  amount: number;
  dueDate: string;
  timing: "before" | "on" | "after";
}

const HEADLINE: Record<DueDateReminderEmailProps["timing"], string> = {
  before: "Upcoming fee due date",
  on: "Your fee is due today",
  after: "Your fee payment is overdue",
};

export function DueDateReminderEmail({
  studentName,
  installmentName,
  amount,
  dueDate,
  timing,
}: DueDateReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{HEADLINE[timing]}: {installmentName}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px" }}>
          <Heading style={{ fontSize: "20px" }}>{HEADLINE[timing]}</Heading>
          <Text>Hi {studentName},</Text>
          <Text>
            {timing === "after" ? "Your installment" : "Your upcoming installment"}{" "}
            <strong>{installmentName}</strong> of <strong>{formatCurrency(amount)}</strong> was
            due on <strong>{formatDate(dueDate)}</strong>. Please make your payment via the
            Clyra Fee Portal as soon as possible.
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
