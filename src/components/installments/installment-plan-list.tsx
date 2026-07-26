"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import {
  addInstallment,
  deleteInstallment,
  markInstallmentStatus,
  updateInstallment,
} from "@/actions/installments.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstallmentStatusBadge } from "@/components/installments/installment-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InstallmentRow } from "@/lib/queries/student-detail";

function EditInstallmentDialog({ installment }: { installment: InstallmentRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(installment.installmentName);
  const [amount, setAmount] = useState(String(installment.amount));
  const [dueDate, setDueDate] = useState(installment.dueDate);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateInstallment({
        installmentId: installment.id,
        installmentName: name,
        amount,
        dueDate,
      });
      if (!result.success) {
        toast.error(result.error ?? "Could not update installment");
        return;
      }
      toast.success("Installment updated");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit installment">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit installment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Amount (INR)</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddInstallmentDialog({ studentId, nextIndex }: { studentId: string; nextIndex: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`Month ${nextIndex}`);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addInstallment({ studentId, installmentName: name, amount, dueDate });
      if (!result.success) {
        toast.error(result.error ?? "Could not add installment");
        return;
      }
      toast.success("Installment added");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Add installment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add installment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Amount (INR)</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusMenu({ installment }: { installment: InstallmentRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(status: "paid" | "pending" | "overdue") {
    startTransition(async () => {
      const result = await markInstallmentStatus({ installmentId: installment.id, status });
      if (!result.success) {
        toast.error(result.error ?? "Could not update status");
        return;
      }
      toast.success("Status updated");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          Set status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setStatus("paid")}>Mark Paid</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setStatus("pending")}>Mark Pending</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setStatus("overdue")}>Mark Overdue</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeleteInstallmentButton({ installment }: { installment: InstallmentRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const disabled = installment.status === "paid" || installment.status === "pending_verification";

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInstallment(installment.id);
      if (!result.success) {
        toast.error(result.error ?? "Could not delete installment");
        return;
      }
      toast.success("Installment deleted");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Delete installment"
      onClick={handleDelete}
      disabled={disabled || isPending}
      title={disabled ? "Cannot delete a paid or awaiting-verification installment" : undefined}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function InstallmentPlanList({
  studentId,
  installments,
}: {
  studentId: string;
  installments: InstallmentRow[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {installments.map((installment) => (
        <div
          key={installment.id}
          className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{installment.installmentName}</span>
              <InstallmentStatusBadge status={installment.effectiveStatus} />
            </div>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(installment.amount)} · Due {formatDate(installment.dueDate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <StatusMenu installment={installment} />
            <EditInstallmentDialog installment={installment} />
            <DeleteInstallmentButton installment={installment} />
          </div>
        </div>
      ))}
      <AddInstallmentDialog studentId={studentId} nextIndex={installments.length + 1} />
    </div>
  );
}
