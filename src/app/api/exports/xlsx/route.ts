import { requireRole } from "@/lib/auth/roles";
import { getExportTable, type ExportScope } from "@/lib/queries/export-data";
import { buildXlsx } from "@/lib/export/xlsx";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireRole("admin");
  const scope = (new URL(request.url).searchParams.get("scope") ?? "students") as ExportScope;

  const table = await getExportTable(scope);
  const buffer = await buildXlsx(table);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="clyra-${scope}.xlsx"`,
    },
  });
}
