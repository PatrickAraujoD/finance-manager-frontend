"use client";

import { Loader2, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { MonthPicker } from "@/components/month-picker";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Income } from "@/lib/api-types";
import { centsToInput, currentMonth, formatMoney, parseMoneyToCents } from "@/lib/format";
import { useIncome } from "@/lib/hooks";

const MAX_CENTS = 100_000_000_000;

export function IncomeView() {
  const initial = useSearchParams().get("month");
  const [month, setMonth] = useState(initial && /^\d{4}-(0[1-9]|1[0-2])$/.test(initial) ? initial : currentMonth());
  const { data: income, isLoading } = useIncome(month);
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

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Salário</h1>
          <p className="text-sm opacity-70">É a base para saber quanto do mês já foi gasto.</p>
        </div>
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      <div className="card bg-base-100 shadow-sm">
        <form onSubmit={onSubmit} key={`${month}-${income?.amountCents ?? "none"}`} className="card-body gap-4">
          {isLoading ? (
            <div className="skeleton h-12 w-full" />
          ) : (
            <p className="text-sm">
              {income ? (
                <>Salário atual deste mês: <b>{formatMoney(income.amountCents)}</b></>
              ) : (
                "Nenhum salário cadastrado para este mês."
              )}
            </p>
          )}
          {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}
          <label className="floating-label">
            <span>Valor em reais</span>
            <input
              name="amount"
              inputMode="decimal"
              required
              placeholder="Valor em reais"
              defaultValue={income ? centsToInput(income.amountCents) : ""}
              className="input input-bordered w-full text-lg"
            />
          </label>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar salário
          </button>
        </form>
      </div>
    </div>
  );
}
