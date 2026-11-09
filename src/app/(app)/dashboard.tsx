"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { IncomeMeter } from "@/components/dashboard/income-meter";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { RecentLoans } from "@/components/dashboard/recent-loans";
import { MonthPicker } from "@/components/month-picker";
import { currentMonth } from "@/lib/format";
import { useByCategory, useByDay, useEvolution, useIncomeVsSpent } from "@/lib/hooks";

function Panel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`card bg-base-100 shadow-sm ${className}`}>
      <div className="card-body gap-3 p-5">
        <h2 className="card-title text-base">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function Dashboard() {
  const { data: session } = useSession();
  const [month, setMonth] = useState(currentMonth);

  const summary = useIncomeVsSpent(month);
  const byDay = useByDay(month);
  const byCategory = useByCategory(month);
  const evolution = useEvolution(month);

  const firstName = session?.user.name?.split(" ")[0];
  const failed = summary.error || byDay.error || byCategory.error || evolution.error;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Olá{firstName ? `, ${firstName}` : ""} 👋</h1>
          <p className="text-sm opacity-70">Veja como estão suas finanças.</p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      {failed && (
        <div role="alert" className="alert alert-error alert-soft">
          Não foi possível carregar alguns dados. Confira se a API está no ar e tente de novo.
        </div>
      )}

      <KpiCards month={month} summary={summary.data} byDay={byDay.data} loading={summary.isLoading} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Evolução mensal" className="lg:col-span-2">
          <EvolutionChart data={evolution.data} />
        </Panel>
        <Panel title="Por categoria">
          <CategoryDonut data={byCategory.data} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentLoans />
        <RecentExpenses />
        <Panel title="Salário x gasto">
          <IncomeMeter month={month} summary={summary.data} />
        </Panel>
      </div>
    </div>
  );
}
