import { requireRole } from "@/lib/auth/roles";
import { getExportTable, type ExportScope } from "@/lib/queries/export-data";
import { buildCsv } from "@/lib/export/csv";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireRole("admin");
  const scope = (new URL(request.url).searchParams.get("scope") ?? "students") as ExportScope;

  const table = await getExportTable(scope);
  const csv = buildCsv(table);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clyra-${scope}.csv"`,
    },
  });
}
