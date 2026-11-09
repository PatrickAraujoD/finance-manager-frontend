"use client";

import { AlertTriangle, CalendarClock, ChevronLeft, ChevronRight, HandCoins, Plus, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Loan, LoanStatus } from "@/lib/api-types";
import { formatDate, formatMoney } from "@/lib/format";
import { isLoansKey, useLoans, useLoansSummary } from "@/lib/hooks";

const PAGE_SIZE = 50;
const STATUS_TABS: { value: LoanStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "OVERDUE", label: "Atrasados" },
  { value: "OPEN", label: "A vencer" },
  { value: "PAID", label: "Pagos" },
];

export function LoansView() {
  const [borrower, setBorrower] = useState("");
  const [status, setStatus] = useState<LoanStatus | "">("");
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<Loan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const people = useLoansSummary().data;
  const summary = useLoansSummary(borrower || undefined).data;
  const { data, isLoading, error } = useLoans({
    borrower: borrower || undefined,
    status: status || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const totals = summary?.totals;
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/loans/${toDelete.id}`, { method: "DELETE" });
      await mutate(isLoansKey);
      toast.success("Empréstimo excluído.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HandCoins}
        title="Empréstimos"
        description="Quem te deve, quanto falta e o que já venceu."
        actions={
          <Link href="/loans/new" className="btn btn-brand">
            <Plus className="size-4" /> Novo empréstimo
          </Link>
        }
      />

      <div className="stats stats-vertical w-full bg-base-100 shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-primary"><HandCoins className="size-7" /></div>
          <div className="stat-title">Te devem</div>
          <div className="stat-value text-2xl">{totals ? formatMoney(totals.owedCents) : "—"}</div>
          <div className="stat-desc">{totals ? `de ${formatMoney(totals.totalLentCents)} emprestados` : ""}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info"><CalendarClock className="size-7" /></div>
          <div className="stat-title">A vencer</div>
          <div className="stat-value text-2xl">{totals ? formatMoney(totals.upcomingCents) : "—"}</div>
          <div className="stat-desc">Dentro do prazo</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-error"><AlertTriangle className="size-7" /></div>
          <div className="stat-title">Atrasado</div>
          <div className="stat-value text-2xl text-error">{totals ? formatMoney(totals.overdueCents) : "—"}</div>
          <div className="stat-desc">{totals ? `${formatMoney(totals.paidCents)} já pagos` : ""}</div>
        </div>
      </div>

      {summary?.truncated && (
        <div role="alert" className="alert alert-warning alert-soft text-sm">
          Há muitas pessoas: a lista mostra só as que mais devem atrasado. Os totais acima incluem todas.
        </div>
      )}

      {!!people?.items.length && (
        <section aria-label="Resumo por pessoa" className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4" /> Por pessoa</h2>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {people.items.map((p) => {
              const selected = borrower.toLowerCase() === p.borrowerName.trim().toLowerCase();
              return (
                <li key={p.borrowerName}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => { setBorrower(selected ? "" : p.borrowerName); setPage(0); }}
                    className={`card w-full bg-base-100 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="card-body gap-1 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">{p.borrowerName}</p>
                        <span className="text-xs opacity-60">{p.loansCount} {p.loansCount === 1 ? "empréstimo" : "empréstimos"}</span>
                      </div>
                      <p className="text-xl font-extrabold tabular-nums">{formatMoney(p.owedCents)}</p>
                      <p className="flex flex-wrap gap-x-3 text-xs opacity-70">
                        {p.overdueCents > 0 && <span className="text-error">{formatMoney(p.overdueCents)} atrasado</span>}
                        {p.upcomingCents > 0 && <span>{formatMoney(p.upcomingCents)} a vencer</span>}
                        {p.owedCents === 0 && <span>Quitado</span>}
                      </p>
                      {p.nextDueDate && <p className="text-xs opacity-60">Próximo vencimento: {formatDate(p.nextDueDate)}</p>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="tabs tabs-box">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} type="button" role="tab" className={`tab ${status === tab.value ? "tab-active" : ""}`} onClick={() => { setStatus(tab.value); setPage(0); }}>
              {tab.label}
            </button>
          ))}
        </div>
        {borrower && (
          <button type="button" className="badge badge-primary badge-soft gap-1 py-3" onClick={() => { setBorrower(""); setPage(0); }}>
            {borrower} <X className="size-3" />
          </button>
        )}
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar os empréstimos.</div>}

      {isLoading ? (
        <div className="card bg-base-100 p-5 shadow-sm"><div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div></div>
      ) : !data?.items.length ? (
        <div className="card items-center gap-3 bg-base-100 p-12 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-base-200"><HandCoins className="size-7 opacity-60" /></span>
          <p className="font-semibold">Nenhum empréstimo por aqui</p>
          <p className="max-w-sm text-sm opacity-70">Registre um gasto que você pagou por outra pessoa, ou dinheiro que você emprestou.</p>
          <Link href="/loans/new" className="btn btn-brand btn-sm"><Plus className="size-4" /> Novo empréstimo</Link>
        </div>
      ) : (
        <section className="card overflow-hidden bg-base-100 shadow-sm">
          <ul className="divide-y divide-base-200">
            {data.items.map((loan) => (
              <li key={loan.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-base-200/50">
                <Link href={`/loans/${loan.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-base-200 text-sm font-bold">
                    {loan.borrowerName[0].toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{loan.borrowerName}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <LoanStatusBadge status={loan.status} />
                      <span className="opacity-60">vence em {formatDate(loan.dueDate)}</span>
                      {loan.expenseId && <span className="badge badge-ghost badge-sm">de um gasto</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{formatMoney(loan.remainingCents)}</p>
                    <p className="text-xs opacity-60">de {formatMoney(loan.amountCents)}</p>
                  </div>
                </Link>
                <button type="button" className="btn btn-ghost btn-sm btn-square text-error sm:opacity-0 sm:transition sm:focus:opacity-100 sm:group-hover:opacity-100" aria-label={`Excluir empréstimo de ${loan.borrowerName}`} onClick={() => setToDelete(loan)}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pages > 1 && (
        <div className="join mx-auto flex w-fit">
          <button type="button" className="btn btn-sm join-item" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Página anterior"><ChevronLeft className="size-4" /></button>
          <span className="btn btn-sm join-item pointer-events-none">{page + 1} de {pages}</span>
          <button type="button" className="btn btn-sm join-item" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight className="size-4" /></button>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir empréstimo?"
        message={toDelete ? `O empréstimo de ${formatMoney(toDelete.amountCents)} para ${toDelete.borrowerName} será removido. Se ele já tiver pagamentos, a exclusão é recusada.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
