"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { FeeStatusBreakdown } from "@/lib/queries/analytics";

const COLORS = {
  Completed: "#16a34a",
  Pending: "#f59e0b",
  Overdue: "#dc2626",
};

export function FeeStatusChart({ data }: { data: FeeStatusBreakdown }) {
  const chartData = [
    { name: "Completed", amount: data.completed },
    { name: "Pending", amount: data.pending },
    { name: "Overdue", amount: data.overdue },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] }} />
            {d.name}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} className="text-xs fill-muted-foreground" />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {chartData.map((d) => (
              <Cell key={d.name} fill={COLORS[d.name as keyof typeof COLORS]} />
            ))}
            <LabelList
              dataKey="amount"
              position="right"
              formatter={(v: React.ReactNode) => formatCurrency(Number(v))}
              className="fill-foreground text-xs"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
