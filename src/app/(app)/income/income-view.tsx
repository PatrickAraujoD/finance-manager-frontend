"use client";

import { Lightbulb, Loader2, Save, TrendingDown, WalletCards } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Income } from "@/lib/api-types";
import { centsToInput, currentMonth, formatMoney, parseMoneyToCents } from "@/lib/format";
import { useIncome, useIncomeVsSpent } from "@/lib/hooks";

const MAX_CENTS = 100_000_000_000;

export function IncomeView() {
  const initial = useSearchParams().get("month");
  const [month, setMonth] = useState(initial && /^\d{4}-(0[1-9]|1[0-2])$/.test(initial) ? initial : currentMonth());
  const { data: income, isLoading } = useIncome(month);
  const summary = useIncomeVsSpent(month).data;
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cents = parseMoneyToCents(String(new FormData(event.currentTarget).get("amount")));
    if (cents === null || cents > MAX_CENTS) {
      setError("Informe um valor maior que zero, como 5.000,00.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const saved = await api<Income>(`/income/${month}`, { method: "PUT", body: { amountCents: cents } });
      await mutate(`/income/${month}`, saved, { revalidate: false });
      await mutate((key) => Array.isArray(key) && key[0] === "/reports/income-vs-spent");
      toast.success("Salário salvo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  const percent = summary?.percentSpent ?? 0;
  const remaining = summary?.remainingCents ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={WalletCards}
        title="Salário"
        description="É a base para saber quanto do mês já foi gasto."
        actions={<MonthPicker month={month} onChange={setMonth} />}
      />

      <div className="card bg-linear-to-br from-primary to-secondary text-primary-content shadow-lg">
        <div className="card-body gap-1">
          <p className="text-sm opacity-90">Salário do mês</p>
          {isLoading ? (
            <div className="skeleton h-10 w-56 opacity-30" />
          ) : (
            <p className="text-4xl font-extrabold tracking-tight">{income ? formatMoney(income.amountCents) : "Não informado"}</p>
          )}
          <p className="text-sm opacity-90">{income ? "Você pode ajustar o valor quando quiser." : "Informe abaixo para liberar o saldo e o medidor."}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card bg-base-100 shadow-sm">
          <form onSubmit={onSubmit} key={`${month}-${income?.amountCents ?? "none"}`} className="card-body gap-4">
            <h2 className="card-title text-base">{income ? "Atualizar valor" : "Informar valor"}</h2>
            {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}
            <label className="input w-full">
              <span className="label">R$</span>
              <input
                name="amount"
                inputMode="decimal"
                required
                autoFocus
                placeholder="5.000,00"
                defaultValue={income ? centsToInput(income.amountCents) : ""}
                className="text-lg font-semibold"
              />
            </label>
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar salário
            </button>
          </form>
        </section>

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body gap-3">
            <h2 className="card-title text-base">Como está este mês</h2>
            {!summary ? (
              <div className="skeleton h-32 w-full" />
            ) : summary.incomeCents === null ? (
              <p className="text-sm opacity-70">Assim que você informar o salário, mostramos aqui quanto já foi gasto.</p>
            ) : (
              <>
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
                    <p className="opacity-70">Gasto até agora</p>
                    <p className="text-xl font-extrabold">{formatMoney(summary.spentCents)}</p>
                  </div>
                </div>
                {remaining >= 0 ? (
                  <p className="alert alert-success alert-soft text-sm"><Lightbulb className="size-4 shrink-0" /> Ainda sobram {formatMoney(remaining)} neste mês.</p>
                ) : (
                  <p className="alert alert-error alert-soft text-sm"><TrendingDown className="size-4 shrink-0" /> Os gastos passaram do salário em {formatMoney(-remaining)}.</p>
                )}
                <Link href="/expenses" className="btn btn-ghost btn-sm self-start">Ver gastos do mês</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
