import "server-only";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ReceiptData {
  studentName: string;
  studentCode: string;
  course: string;
  batch: string;
  installmentName: string;
  amount: number;
  paidAt: string;
  transactionId: string | null;
  receiptNo: string;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#18181b" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  brandSub: { fontSize: 9, color: "#71717a" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  label: { color: "#71717a" },
  value: { fontFamily: "Helvetica-Bold" },
  amountBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f4f4f5",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: { fontSize: 11, color: "#71717a" },
  amountValue: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 40, fontSize: 9, color: "#a1a1aa", textAlign: "center" },
});

function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>C</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Clyra</Text>
              <Text style={styles.brandSub}>Fee Portal</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.brandSub}>Receipt No.</Text>
            <Text style={styles.value}>{data.receiptNo}</Text>
          </View>
        </View>

        <Text style={styles.title}>Payment Receipt</Text>
        <Text style={styles.statusBadge}>PAID</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Student Name</Text>
          <Text style={styles.value}>{data.studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Student ID</Text>
          <Text style={styles.value}>{data.studentCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Course</Text>
          <Text style={styles.value}>{data.course}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Batch</Text>
          <Text style={styles.value}>{data.batch}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Installment</Text>
          <Text style={styles.value}>{data.installmentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date Paid</Text>
          <Text style={styles.value}>{formatDate(data.paidAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.value}>{data.transactionId ?? "—"}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount Paid</Text>
          <Text style={styles.amountValue}>{formatCurrency(data.amount)}</Text>
        </View>

        <Text style={styles.footer}>
          This is a system-generated receipt from the Clyra Fee Portal and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument data={data} />);
}
