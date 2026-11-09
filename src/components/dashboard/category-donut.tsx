"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ReportByCategory } from "@/lib/api-types";
import { formatMoney } from "@/lib/format";
import { categoryColor } from "./palette";

export function CategoryDonut({ data }: { data?: ReportByCategory }) {
  if (!data) return <div className="skeleton h-56 w-full" />;
  if (data.items.length === 0) {
    return <p className="grid h-56 place-items-center text-sm opacity-60">Nenhum gasto neste mês.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.items} dataKey="totalCents" nameKey="categoryName" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none">
              {data.items.map((item) => (
                <Cell key={item.categoryId} fill={categoryColor(item.categoryId)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--color-base-100)", border: "1px solid var(--color-base-300)", borderRadius: 12 }}
              formatter={(value) => formatMoney(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs opacity-60">Total</p>
            <p className="text-sm font-bold">{formatMoney(data.totalCents)}</p>
          </div>
        </div>
      </div>

      <ul className="w-full space-y-2 text-sm">
        {data.items.slice(0, 6).map((item) => (
          <li key={item.categoryId} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: categoryColor(item.categoryId) }} />
            <span className="flex-1 truncate">{item.categoryName}</span>
            <span className="font-semibold">{item.percentage.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
