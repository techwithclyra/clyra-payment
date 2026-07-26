"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ListPlus } from "lucide-react";

import { createInstallmentPlan } from "@/actions/installments.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";

interface Row {
  installmentName: string;
  amount: string;
  dueDate: string;
}

function makeRow(index: number): Row {
  return { installmentName: `Month ${index}`, amount: "", dueDate: "" };
}

export function NewPlanBuilder({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([makeRow(1)]);
  const [building, setBuilding] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow(prev.length + 1)]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createInstallmentPlan({
        studentId,
        installments: rows.map((r) => ({
          installmentName: r.installmentName,
          amount: r.amount,
          dueDate: r.dueDate,
        })),
      });
      if (!result.success) {
        toast.error(result.error ?? "Could not save plan");
        return;
      }
      toast.success("Installment plan created");
      router.refresh();
    });
  }

  if (!building) {
    return (
      <EmptyState
        icon={ListPlus}
        title="No installment plan yet"
        description="Build a custom installment plan for this student — any number of installments, any names, amounts, and due dates."
        action={<Button onClick={() => setBuilding(true)}>Build installment plan</Button>}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build installment plan</CardTitle>
        <CardDescription>The first installment becomes payable immediately; the rest unlock in order as each is approved.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  value={row.installmentName}
                  onChange={(e) => updateRow(index, { installmentName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Amount (INR)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.amount}
                  onChange={(e) => updateRow(index, { amount: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Due date</Label>
                <Input
                  type="date"
                  value={row.dueDate}
                  onChange={(e) => updateRow(index, { dueDate: e.target.value })}
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
                aria-label="Remove installment"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addRow} className="w-fit">
            <Plus className="size-4" />
            Add installment
          </Button>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setBuilding(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save plan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
