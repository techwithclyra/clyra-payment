import "server-only";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ExportTable } from "@/lib/queries/export-data";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Helvetica" },
  title: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e4e4e7" },
  headerRow: { backgroundColor: "#f4f4f5" },
  cell: { flex: 1, padding: 4 },
  headerCell: { fontFamily: "Helvetica-Bold" },
});

function ExportDocument({ table }: { table: ExportTable }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Clyra Fee Portal — {table.title}</Text>
        <View style={[styles.row, styles.headerRow]}>
          {table.headers.map((h) => (
            <Text key={h} style={[styles.cell, styles.headerCell]}>
              {h}
            </Text>
          ))}
        </View>
        {table.rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <Text key={j} style={styles.cell}>
                {String(cell)}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function buildPdfTable(table: ExportTable): Promise<Buffer> {
  return renderToBuffer(<ExportDocument table={table} />);
}
