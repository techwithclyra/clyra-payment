import { requireRole } from "@/lib/auth/roles";
import { getExportTable, type ExportScope } from "@/lib/queries/export-data";
import { buildPdfTable } from "@/lib/export/pdf-table";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireRole("admin");
  const scope = (new URL(request.url).searchParams.get("scope") ?? "students") as ExportScope;

  const table = await getExportTable(scope);
  const buffer = await buildPdfTable(table);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="clyra-${scope}.pdf"`,
    },
  });
}
