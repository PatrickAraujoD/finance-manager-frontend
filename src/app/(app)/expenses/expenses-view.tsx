"use client";

import { ChevronLeft, ChevronRight, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MonthPicker } from "@/components/month-picker";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/api-types";
import { currentMonth, formatDate, formatMoney, monthRange } from "@/lib/format";
import { useCategories, useExpenses } from "@/lib/hooks";

const PAGE_SIZE = 20;

export function ExpensesView() {
  const [month, setMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const { data: categories } = useCategories();
  const names = new Map(categories?.map((c) => [c.id, c.name]));
  const { data, isLoading, error } = useExpenses({
    ...monthRange(month),
    categoryId: categoryId || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api(`/expenses/${toDelete.id}`, { method: "DELETE" });
      await mutate((key) => Array.isArray(key) && (String(key[0]).startsWith("/expenses") || String(key[0]).startsWith("/reports")));
      toast.success("Gasto excluído.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Gastos</h1>
          <p className="text-sm opacity-70">{data ? `${data.total} no período` : "Carregando..."}</p>
        </div>
        <Link href="/expenses/new" className="btn btn-primary btn-sm">
          <Plus className="size-4" /> Novo gasto
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthPicker month={month} onChange={(m) => { setMonth(m); setPage(0); }} />
        <select
          className="select select-sm select-bordered"
          aria-label="Filtrar por categoria"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
        >
          <option value="">Todas as categorias</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar os gastos.</div>}

      <div className="card bg-base-100 shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : !data?.items.length ? (
          <p className="p-10 text-center text-sm opacity-60">Nenhum gasto neste período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th className="text-right">Valor</th><th /></tr>
              </thead>
              <tbody>
                {data.items.map((expense) => (
                  <tr key={expense.id} className="hover:bg-base-200/60">
                    <td className="whitespace-nowrap">{formatDate(expense.spentAt)}</td>
                    <td className="max-w-64">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate">{expense.description || "—"}</span>
                        {expense.receiptId && <Paperclip className="size-3.5 shrink-0 opacity-60" aria-label="Com comprovante" />}
                        {!expense.paidAlone && <span className="badge badge-ghost badge-sm">dividido</span>}
                      </span>
                    </td>
                    <td><span className="badge badge-soft badge-primary">{names.get(expense.categoryId) ?? "—"}</span></td>
                    <td className="whitespace-nowrap text-right font-bold">{formatMoney(expense.amountCents)}</td>
                    <td className="whitespace-nowrap text-right">
                      <Link href={`/expenses/${expense.id}/edit`} className="btn btn-ghost btn-xs btn-square" aria-label="Editar gasto"><Pencil className="size-4" /></Link>
                      <button type="button" className="btn btn-ghost btn-xs btn-square text-error" aria-label="Excluir gasto" onClick={() => setToDelete(expense)}><Trash2 className="size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="join mx-auto flex w-fit">
          <button type="button" className="btn btn-sm join-item" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Página anterior"><ChevronLeft className="size-4" /></button>
          <span className="btn btn-sm join-item pointer-events-none">{page + 1} de {pages}</span>
          <button type="button" className="btn btn-sm join-item" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label="Próxima página"><ChevronRight className="size-4" /></button>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir gasto?"
        message={toDelete ? `O gasto de ${formatMoney(toDelete.amountCents)} em ${formatDate(toDelete.spentAt)} será removido. O comprovante continua guardado.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
