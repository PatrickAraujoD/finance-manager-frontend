"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ReportByDay } from "@/lib/api-types";
import { formatDayShort, formatMoney } from "@/lib/format";

export function DayBars({ data }: { data?: ReportByDay }) {
  if (!data) return <div className="skeleton h-44 w-full" />;
  if (data.days.length === 0) {
    return <p className="grid h-44 place-items-center text-sm opacity-60">Nenhum gasto neste mês.</p>;
  }

  const rows = data.days.map((d) => ({ date: d.date, label: formatDayShort(d.date), total: d.totalCents }));

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} interval="preserveStartEnd" />
          <Tooltip
            cursor={{ fill: "var(--color-base-200)" }}
            contentStyle={{ background: "var(--color-base-100)", border: "1px solid var(--color-base-300)", borderRadius: 12 }}
            formatter={(value) => [formatMoney(Number(value)), "Gasto"]}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {rows.map((row) => (
              <Cell
                key={row.date}
                fill={row.date === data.topDay?.date ? "var(--color-secondary)" : "var(--color-primary)"}
                fillOpacity={row.date === data.topDay?.date ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
