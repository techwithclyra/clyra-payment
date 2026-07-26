import type { ExportTable } from "@/lib/queries/export-data";

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(table: ExportTable): string {
  const lines = [
    table.headers.map(escapeCsvCell).join(","),
    ...table.rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\r\n");
}
