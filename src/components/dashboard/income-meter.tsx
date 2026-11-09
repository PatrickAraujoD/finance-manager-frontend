import { Lightbulb } from "lucide-react";
import Link from "next/link";
import type { ReportIncomeVsSpent } from "@/lib/api-types";
import { currentMonth, daysInMonth, formatMoney } from "@/lib/format";

export function IncomeMeter({ month, summary }: { month: string; summary?: ReportIncomeVsSpent }) {
  if (!summary) return <div className="skeleton h-48 w-full" />;

  if (summary.incomeCents === null) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-3">
        <p className="text-sm opacity-70">Cadastre o salário deste mês para acompanhar quanto já foi gasto.</p>
        <Link href={`/income?month=${month}`} className="btn btn-brand btn-sm">
          Informar salário
        </Link>
      </div>
    );
  }

  const percent = summary.percentSpent ?? 0;
  const remaining = summary.remainingCents ?? 0;
  const isCurrent = month === currentMonth();
  const daysLeft = daysInMonth(month) - new Date().getUTCDate() + 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div
          className={`radial-progress ${percent > 100 ? "text-error" : "text-primary"}`}
          style={{ "--value": Math.min(percent, 100), "--size": "5.5rem", "--thickness": "0.6rem" } as React.CSSProperties}
          role="progressbar"
          aria-valuenow={Math.round(percent)}
        >
          <span className="text-lg font-extrabold text-base-content">{Math.round(percent)}%</span>
        </div>
        <div className="text-sm">
          <p className="opacity-70">{remaining >= 0 ? "Ainda disponível" : "Acima do salário em"}</p>
          <p className={`text-xl font-extrabold ${remaining < 0 ? "text-error" : ""}`}>{formatMoney(Math.abs(remaining))}</p>
        </div>
      </div>

      {isCurrent && remaining > 0 && daysLeft > 0 && (
        <p className="alert alert-success alert-soft text-sm">
          <Lightbulb className="size-4 shrink-0" />
          Faltam {daysLeft} dias: dá para gastar até {formatMoney(Math.floor(remaining / daysLeft))} por dia.
        </p>
      )}
      {remaining < 0 && (
        <p className="alert alert-error alert-soft text-sm">Os gastos já passaram do salário deste mês.</p>
      )}
    </div>
  );
}
