import { CreditCard, Gauge, TrendingUp, Wallet } from "lucide-react";
import type { ReportCard, ReportIncomeVsSpent } from "@/lib/api-types";
import { currentMonth, daysInMonth, formatMoney } from "@/lib/format";

interface Props {
  month: string;
  summary?: ReportIncomeVsSpent;
  card?: ReportCard;
  loading: boolean;
}

function Skeleton() {
  return <div className="skeleton h-24 w-full" />;
}

export function KpiCards({ month, summary, card, loading }: Props) {
  if (loading || !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card bg-base-100 p-5 shadow-sm">
            <Skeleton />
          </div>
        ))}
      </div>
    );
  }

  const isCurrent = month === currentMonth();
  const total = daysInMonth(month);
  const elapsed = isCurrent ? new Date().getUTCDate() : total;
  const average = Math.round(summary.spentCents / elapsed);
  const projection = average * total;
  const hasIncome = summary.incomeCents !== null;
  const overspent = hasIncome && (summary.remainingCents ?? 0) < 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body justify-start gap-1 p-5">
          <p className="flex items-center justify-between text-sm opacity-70">
            Saldo do mês <Wallet className="size-4" />
          </p>
          <p className={`text-2xl font-extrabold tracking-tight ${overspent ? "text-error" : ""}`}>
            {hasIncome ? formatMoney(summary.remainingCents!) : "—"}
          </p>
          <p className="text-sm opacity-70">
            {hasIncome ? `de ${formatMoney(summary.incomeCents!)} de salário` : "Informe o salário para ver o saldo"}
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body justify-start gap-1 p-5">
          <p className="flex items-center justify-between text-sm opacity-70">
            Gasto no mês <TrendingUp className="size-4" />
          </p>
          <p className="text-2xl font-extrabold tracking-tight">{formatMoney(summary.spentCents)}</p>
          {hasIncome ? (
            <>
              <progress
                className={`progress h-2 ${overspent ? "progress-error" : "progress-secondary"}`}
                value={Math.min(summary.percentSpent ?? 0, 100)}
                max={100}
              />
              <p className="text-sm opacity-70">{summary.percentSpent}% do salário</p>
            </>
          ) : (
            <p className="text-sm opacity-70">Sem salário cadastrado</p>
          )}
          {summary.receivedCents > 0 && (
            <p className="text-sm text-success">+ {formatMoney(summary.receivedCents)} recebidos de empréstimos</p>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body justify-start gap-1 p-5">
          <p className="flex items-center justify-between text-sm opacity-70">
            Cartão de crédito <CreditCard className="size-4" />
          </p>
          <p className={`text-2xl font-extrabold tracking-tight ${card && card.balanceCents < 0 ? "text-success" : ""}`}>
            {card ? formatMoney(card.balanceCents) : "—"}
          </p>
          <p className="text-sm opacity-70">
            {!card
              ? "Carregando o cartão"
              : card.balanceCents < 0
                ? "Você pagou a mais que o devido"
                : `${formatMoney(card.chargedCents)} em compras, ${formatMoney(card.paidCents)} pagos no mês`}
          </p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body justify-start gap-1 p-5">
          <p className="flex items-center justify-between text-sm opacity-70">
            Média por dia <Gauge className="size-4" />
          </p>
          <p className="text-2xl font-extrabold tracking-tight">{formatMoney(average)}</p>
          <p className="text-sm text-success">
            {isCurrent ? `Projeção: ${formatMoney(projection)} no mês` : "Média do mês inteiro"}
          </p>
        </div>
      </div>
    </div>
  );
}
