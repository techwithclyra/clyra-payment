import Link from "next/link";
import { Plus } from "lucide-react";

import { getStudentList, type PaymentStatusFilter } from "@/lib/queries/students";
import { StudentFilters } from "@/components/students/student-filters";
import { StudentTable } from "@/components/students/student-table";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ q?: string; batch?: string; course?: string; status?: string; page?: string }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { students, total, batches, courses } = await getStudentList({
    search: params.q,
    batch: params.batch,
    course: params.course,
    paymentStatus: (params.status as PaymentStatusFilter) ?? "all",
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">Manage student records and fee plans.</p>
        </div>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="size-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <StudentFilters
        batches={batches}
        courses={courses}
        initialSearch={params.q ?? ""}
        initialBatch={params.batch ?? "all"}
        initialCourse={params.course ?? "all"}
        initialStatus={params.status ?? "all"}
      />

      <StudentTable students={students} />
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
