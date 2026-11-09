"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Hash, Paperclip, Pencil, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { softStyle } from "@/components/dashboard/palette";
import { MonthPicker } from "@/components/month-picker";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Expense } from "@/lib/api-types";
import { currentMonth, dayLabel, formatDate, formatDayShort, formatMoney, monthRange } from "@/lib/format";
import { useCategoryColor } from "@/lib/use-category-color";
import { useByCategory, useByDay, useCategories, useExpenses } from "@/lib/hooks";

const PAGE_SIZE = 100;

function groupByDay(items: Expense[]) {
  const groups = new Map<string, Expense[]>();
  for (const item of items) groups.set(item.spentAt, [...(groups.get(item.spentAt) ?? []), item]);
  return [...groups.entries()];
}

export function ExpensesView() {
  const [month, setMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const { data: categories } = useCategories();
  const colorOf = useCategoryColor();
  const names = new Map(categories?.map((c) => [c.id, c.name]));
  const { data, isLoading, error } = useExpenses({
    ...monthRange(month),
    categoryId: categoryId || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const monthTotal = useByCategory(month).data;
  const byDay = useByDay(month).data;

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const groups = data ? groupByDay(data.items) : [];

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
    <div className="space-y-6">
      <PageHeader
        icon={Receipt}
        title="Gastos"
        description="Tudo o que você lançou, dia a dia."
        actions={
          <Link href="/expenses/new" className="btn btn-primary btn-sm">
            <Plus className="size-4" /> Novo gasto
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <MonthPicker month={month} onChange={(m) => { setMonth(m); setPage(0); }} />
        <select
          className="select select-sm"
          aria-label="Filtrar por categoria"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
        >
          <option value="">Todas as categorias</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="stats stats-vertical w-full bg-base-100 shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-primary"><Wallet className="size-7" /></div>
          <div className="stat-title">Total do mês</div>
          <div className="stat-value text-2xl">{monthTotal ? formatMoney(monthTotal.totalCents) : "—"}</div>
          <div className="stat-desc">Todas as categorias</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary"><Hash className="size-7" /></div>
          <div className="stat-title">Lançamentos</div>
          <div className="stat-value text-2xl">{data ? data.total : "—"}</div>
          <div className="stat-desc">{categoryId ? "Na categoria escolhida" : "No período"}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-accent"><CalendarDays className="size-7" /></div>
          <div className="stat-title">Dia de maior gasto</div>
          <div className="stat-value text-2xl">{byDay?.topDay ? formatDayShort(byDay.topDay.date) : "—"}</div>
          <div className="stat-desc">{byDay?.topDay ? formatMoney(byDay.topDay.totalCents) : "Sem gastos no mês"}</div>
        </div>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar os gastos.</div>}

      {isLoading ? (
        <div className="card bg-base-100 p-5 shadow-sm"><div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div></div>
      ) : !groups.length ? (
        <div className="card items-center gap-3 bg-base-100 p-12 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-base-200"><Receipt className="size-7 opacity-60" /></span>
          <p className="font-semibold">Nenhum gasto neste período</p>
          <p className="max-w-sm text-sm opacity-70">Lance um gasto e, se tiver o comprovante, anexe para o valor ser sugerido.</p>
          <Link href="/expenses/new" className="btn btn-primary btn-sm"><Plus className="size-4" /> Registrar gasto</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([date, items]) => (
            <section key={date} className="card overflow-hidden bg-base-100 shadow-sm">
              <header className="flex items-center justify-between bg-base-200/70 px-4 py-2.5 text-sm">
                <span className="font-semibold capitalize">{dayLabel(date)}</span>
                <span className="opacity-70">{formatMoney(items.reduce((sum, e) => sum + e.amountCents, 0))}</span>
              </header>
              <ul className="divide-y divide-base-200">
                {items.map((expense) => {
                  const name = names.get(expense.categoryId) ?? "Sem categoria";
                  const color = colorOf(expense.categoryId);
                  return (
                    <li key={expense.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-base-200/50">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold" style={softStyle(color)}>
                        {name[0].toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{expense.description || name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="badge badge-sm border-0" style={softStyle(color)}>{name}</span>
                          {!expense.paidAlone && <span className="badge badge-ghost badge-sm">dividido</span>}
                          {expense.receiptId && <span className="flex items-center gap-1 opacity-60"><Paperclip className="size-3" /> comprovante</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:opacity-0 sm:transition sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                        <Link href={`/expenses/${expense.id}/edit`} className="btn btn-ghost btn-sm btn-square" aria-label="Editar gasto"><Pencil className="size-4" /></Link>
                        <button type="button" className="btn btn-ghost btn-sm btn-square text-error" aria-label="Excluir gasto" onClick={() => setToDelete(expense)}><Trash2 className="size-4" /></button>
                      </div>
                      <span className="w-28 text-right font-bold tabular-nums">{formatMoney(expense.amountCents)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
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
        title="Excluir gasto?"
        message={toDelete ? `O gasto de ${formatMoney(toDelete.amountCents)} em ${formatDate(toDelete.spentAt)} será removido. O comprovante continua guardado.` : ""}
        pending={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
