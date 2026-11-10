"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { PaymentMethodPicker } from "@/components/expenses/payment-method-picker";
import { useToast } from "@/components/toast";
import type { ExpensePaymentMethod } from "@/lib/api-types";
import { api } from "@/lib/api";
import { formatDate, formatMoney, parseMoneyToCents, todayIso } from "@/lib/format";
import { isLoansKey, useCategories, useExpenses } from "@/lib/hooks";

const MAX_CENTS = 1_000_000_000;
const EXPENSE_CHOICES = 200;

type Source = "expense" | "cash";

function maxDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function LoanForm() {
  const router = useRouter();
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const { data: categories } = useCategories();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses({ limit: EXPENSE_CHOICES });
  const names = new Map(categories?.map((c) => [c.id, c.name]));

  const [source, setSource] = useState<Source>("expense");
  const [borrowerName, setBorrowerName] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [expenseId, setExpenseId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | "">("");
  const [lentAt, setLentAt] = useState(todayIso());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const base = { borrowerName: borrowerName.trim(), dueDate };
    let body: Record<string, unknown>;
    if (source === "expense") {
      if (!expenseId) {
        setError("Escolha o gasto que virou empréstimo.");
        return;
      }
      body = { ...base, expenseId };
    } else {
      const cents = parseMoneyToCents(amount);
      if (cents === null || cents > MAX_CENTS) {
        setError("Informe um valor maior que zero, como 150,00.");
        return;
      }
      if (!paymentMethod) {
        setError("Escolha de onde saiu o dinheiro: crédito, débito, Pix ou dinheiro.");
        return;
      }
      body = { ...base, amountCents: cents, paymentMethod, lentAt };
    }

    setPending(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/loans", { method: "POST", body });
      await mutate(isLoansKey);
      toast.success("Empréstimo registrado.");
      router.push(`/loans/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

        <div role="tablist" className="tabs tabs-box w-fit">
          <button type="button" role="tab" className={`tab ${source === "expense" ? "tab-active" : ""}`} onClick={() => setSource("expense")}>
            De um gasto
          </button>
          <button type="button" role="tab" className={`tab ${source === "cash" ? "tab-active" : ""}`} onClick={() => setSource("cash")}>
            Dinheiro emprestado
          </button>
        </div>

        <label className="floating-label">
          <span>Nome da pessoa</span>
          <input required maxLength={100} placeholder="Nome da pessoa" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} className="input w-full" />
        </label>

        {source === "expense" ? (
          <label className="floating-label">
            <span>Gasto</span>
            <select required value={expenseId} onChange={(e) => setExpenseId(e.target.value)} className="select w-full" disabled={loadingExpenses}>
              <option value="" disabled>{loadingExpenses ? "Carregando gastos..." : "Gasto"}</option>
              {expenses?.items.filter((e) => !e.isCardPayment).map((e) => (
                <option key={e.id} value={e.id}>
                  {formatDate(e.spentAt)} · {formatMoney(e.amountCents)} · {e.description || names.get(e.categoryId) || "Sem descrição"}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="floating-label">
              <span>Valor emprestado (R$)</span>
              <input inputMode="decimal" required placeholder="Valor emprestado (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input w-full text-lg font-semibold" />
            </label>
            <div className="space-y-2">
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} label="De onde saiu o dinheiro" />
              <p className="text-xs opacity-60">
                {paymentMethod === "CREDIT"
                  ? "No crédito o valor soma no cartão, como uma compra."
                  : "Débito, Pix e dinheiro saem do salário do mês em que você emprestou."}
              </p>
            </div>
            <label className="floating-label">
              <span>Dia em que emprestou</span>
              <input type="date" required min="2000-01-01" max={maxDate()} value={lentAt} onChange={(e) => setLentAt(e.target.value)} className="input w-full" />
            </label>
          </>
        )}
        {source === "expense" && (
          <p className="text-xs opacity-60">O valor, a forma de pagamento e a data vêm do gasto. Cada gasto gera no máximo um empréstimo, e pagamentos de fatura não entram na lista.</p>
        )}

        <label className="floating-label">
          <span>Vencimento</span>
          <input type="date" required min="2000-01-01" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input w-full" />
        </label>

        <div className="card-actions justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => router.back()} disabled={pending}>Cancelar</button>
          <button type="submit" className="btn btn-brand" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar empréstimo
          </button>
        </div>
      </div>
    </form>
  );
}
