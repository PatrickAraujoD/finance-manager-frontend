"use client";

import { Loader2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { ReceiptUploader } from "@/components/expenses/receipt-uploader";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Loan, PaymentMethod, ReceiptUpload } from "@/lib/api-types";
import { centsToInput, formatMoney, parseMoneyToCents, todayIso } from "@/lib/format";
import { isLoansKey } from "@/lib/hooks";

function maxDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function PaymentForm({ loan }: { loan: Loan }) {
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [receipt, setReceipt] = useState<(ReceiptUpload & { fileName: string }) | null>(null);
  const [amount, setAmount] = useState(centsToInput(loan.remainingCents));
  const [paidAt, setPaidAt] = useState(todayIso());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onReceiptChange(next: typeof receipt) {
    setReceipt(next);
    const suggested = next?.suggestedAmountCents;
    if (suggested != null && suggested <= loan.remainingCents) setAmount(centsToInput(suggested));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cents = parseMoneyToCents(amount);
    if (cents === null) {
      setError("Informe um valor maior que zero, como 50,00.");
      return;
    }
    if (cents > loan.remainingCents) {
      setError(`O pagamento não pode passar do saldo de ${formatMoney(loan.remainingCents)}.`);
      return;
    }
    if (method === "PIX" && !receipt) {
      setError("Anexe o comprovante do Pix.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      await api(`/loans/${loan.id}/payments`, {
        method: "POST",
        body: { amountCents: cents, method, paidAt, receiptId: method === "PIX" ? receipt?.receiptId : undefined },
      });
      await mutate(isLoansKey);
      toast.success("Pagamento registrado.");
      setReceipt(null);
      setMethod("CASH");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar o pagamento.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <h2 className="card-title text-base">Registrar pagamento</h2>
        {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

        <div role="tablist" className="tabs tabs-box w-fit">
          <button type="button" role="tab" className={`tab ${method === "CASH" ? "tab-active" : ""}`} onClick={() => { setMethod("CASH"); setReceipt(null); }}>
            Dinheiro
          </button>
          <button type="button" role="tab" className={`tab ${method === "PIX" ? "tab-active" : ""}`} onClick={() => setMethod("PIX")}>
            Pix
          </button>
        </div>

        {method === "PIX" && <ReceiptUploader paidAlone receipt={receipt} onChange={onReceiptChange} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="floating-label">
            <span>Valor pago (R$)</span>
            <input inputMode="decimal" required placeholder="Valor pago (R$)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input w-full font-semibold" />
          </label>
          <label className="floating-label">
            <span>Data</span>
            <input type="date" required min="2000-01-01" max={maxDate()} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="input w-full" />
          </label>
        </div>

        <div className="card-actions justify-end">
          <button type="submit" className="btn btn-brand" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Registrar pagamento
          </button>
        </div>
      </div>
    </form>
  );
}
