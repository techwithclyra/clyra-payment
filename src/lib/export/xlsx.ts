import ExcelJS from "exceljs";
import type { ExportTable } from "@/lib/queries/export-data";

export async function buildXlsx(table: ExportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(table.title);

  sheet.addRow(table.headers);
  sheet.getRow(1).font = { bold: true };
  table.rows.forEach((row) => sheet.addRow(row));

  sheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const length = String(cell.value ?? "").length;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(40, maxLength + 2);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
