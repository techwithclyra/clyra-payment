"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SCOPES = [
  { value: "students", label: "Students" },
  { value: "installments", label: "Installments" },
  { value: "payments", label: "Payments" },
];
const FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
];

export function ExportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {SCOPES.map((scope) => (
          <div key={scope.value}>
            <DropdownMenuLabel>{scope.label}</DropdownMenuLabel>
            {FORMATS.map((format) => (
              <DropdownMenuItem key={format.value} asChild>
                <a href={`/api/exports/${format.value}?scope=${scope.value}`} download>
                  {format.label}
                </a>
              </DropdownMenuItem>
            ))}
            {scope.value !== "payments" && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
