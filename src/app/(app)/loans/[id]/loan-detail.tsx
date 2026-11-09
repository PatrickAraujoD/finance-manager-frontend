"use client";

import { ArrowLeft, Banknote, Download, HandCoins, Loader2, Pencil, QrCode, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { PaymentForm } from "@/components/loans/payment-form";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { api, apiBlob, ApiError } from "@/lib/api";
import type { Loan } from "@/lib/api-types";
import { formatDate, formatMoney } from "@/lib/format";
import { isLoansKey, useLoan, useLoanPayments } from "@/lib/hooks";

function EditForm({ loan, onDone }: { loan: Loan; onDone: () => void }) {
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const [borrowerName, setBorrowerName] = useState(loan.borrowerName);
  const [dueDate, setDueDate] = useState(loan.dueDate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const changes: Record<string, string> = {};
    if (borrowerName.trim() !== loan.borrowerName) changes.borrowerName = borrowerName.trim();
    if (dueDate !== loan.dueDate) changes.dueDate = dueDate;
    if (!Object.keys(changes).length) return onDone();

    setPending(true);
    setError(null);
    try {
      await api(`/loans/${loan.id}`, { method: "PATCH", body: changes });
      await mutate(isLoansKey);
      toast.success("Empréstimo atualizado.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}
      <label className="floating-label">
        <span>Nome da pessoa</span>
        <input required maxLength={100} placeholder="Nome da pessoa" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} className="input w-full" />
      </label>
      <label className="floating-label">
        <span>Vencimento</span>
        <input type="date" required min="2000-01-01" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input w-full" />
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone} disabled={pending}><X className="size-4" /> Cancelar</button>
        <button type="submit" className="btn btn-brand btn-sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Salvar
        </button>
      </div>
    </form>
  );
}

export function LoanDetail({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const { data: loan, error, isLoading } = useLoan(id);
  const { data: payments } = useLoanPayments(id);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api(`/loans/${id}`, { method: "DELETE" });
      await mutate(isLoansKey);
      toast.success("Empréstimo excluído.");
      router.push("/loans");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  async function downloadReceipt(receiptId: string) {
    try {
      const blob = await apiBlob(`/receipts/${receiptId}/file`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível baixar o comprovante.");
    }
  }

  if (isLoading) return <div className="mx-auto max-w-3xl"><div className="skeleton h-64 w-full" /></div>;

  if (error || !loan) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div role="alert" className="alert alert-error alert-soft">
          {notFound ? "Empréstimo não encontrado." : "Não foi possível carregar o empréstimo."}
        </div>
        <Link href="/loans" className="btn btn-ghost btn-sm"><ArrowLeft className="size-4" /> Voltar</Link>
      </div>
    );
  }

  const progress = loan.amountCents ? Math.min(100, Math.round((loan.paidCents / loan.amountCents) * 100)) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={HandCoins}
        title={loan.borrowerName}
        description={`Vence em ${formatDate(loan.dueDate)}`}
        actions={
          <Link href="/loans" className="btn btn-ghost btn-sm"><ArrowLeft className="size-4" /> Empréstimos</Link>
        }
      />

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <LoanStatusBadge status={loan.status} />
            {!editing && (
              <div className="flex gap-1">
                <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Editar empréstimo" onClick={() => setEditing(true)}><Pencil className="size-4" /></button>
                <button type="button" className="btn btn-ghost btn-sm btn-square text-error" aria-label="Excluir empréstimo" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-4" /></button>
              </div>
            )}
          </div>

          {editing ? (
            <EditForm loan={loan} onDone={() => setEditing(false)} />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs opacity-60">Emprestado</p><p className="font-bold tabular-nums">{formatMoney(loan.amountCents)}</p></div>
                <div><p className="text-xs opacity-60">Pago</p><p className="font-bold tabular-nums text-success">{formatMoney(loan.paidCents)}</p></div>
                <div><p className="text-xs opacity-60">Falta</p><p className="font-bold tabular-nums">{formatMoney(loan.remainingCents)}</p></div>
              </div>
              <progress className="progress progress-primary w-full" value={progress} max={100} aria-label="Quanto já foi pago" />
              {loan.expenseId && <p className="text-xs opacity-60">Nasceu de um gasto registrado.</p>}
            </>
          )}
        </div>
      </section>

      {loan.status !== "PAID" && <PaymentForm key={loan.paidCents} loan={loan} />}

      <section className="card overflow-hidden bg-base-100 shadow-sm">
        <header className="bg-base-200/70 px-4 py-2.5 text-sm font-semibold">Pagamentos</header>
        {!payments?.length ? (
          <p className="p-6 text-center text-sm opacity-70">Nenhum pagamento registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-base-200">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-base-200">
                  {p.method === "PIX" ? <QrCode className="size-4" /> : <Banknote className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.method === "PIX" ? "Pix" : "Dinheiro"}</p>
                  <p className="text-xs opacity-60">{formatDate(p.paidAt)}</p>
                </div>
                {p.receiptId && (
                  <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Baixar comprovante" onClick={() => downloadReceipt(p.receiptId!)}>
                    <Download className="size-4" />
                  </button>
                )}
                <span className="w-28 text-right font-bold tabular-nums">{formatMoney(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir empréstimo?"
        message="O empréstimo será removido. Se ele já tiver pagamentos, a exclusão é recusada e o histórico fica."
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
