"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportMonthlyEvolution } from "@/lib/api-types";
import { formatMonthLabel, formatMoney } from "@/lib/format";

export function EvolutionChart({ data }: { data?: ReportMonthlyEvolution }) {
  const rows = (data?.months ?? []).map((m) => ({
    label: formatMonthLabel(m.month, "short"),
    total: m.totalCents / 100,
  }));

  return (
    <div className="h-64 w-full">
      {!data ? (
        <div className="skeleton h-full w-full" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="evolution-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-base-300)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }} />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 12, opacity: 0.6 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-base-300)" }}
              contentStyle={{
                background: "var(--color-base-100)",
                border: "1px solid var(--color-base-300)",
                borderRadius: 12,
              }}
              formatter={(value) => [formatMoney(Number(value) * 100), "Gasto"]}
            />
            <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#evolution-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
