"use client";

import { ArrowRight, Paperclip } from "lucide-react";
import Link from "next/link";
import { useCategories, useExpenses } from "@/lib/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { categoryColor, softStyle } from "./palette";

export function RecentExpenses() {
  const { data, isLoading } = useExpenses({ limit: 5 });
  const { data: categories } = useCategories();
  const names = new Map(categories?.map((c) => [c.id, { name: c.name, color: categoryColor(c.id) }]));

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Últimos gastos</h2>
          <Link href="/expenses" className="btn btn-ghost btn-xs">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <p className="py-6 text-center text-sm opacity-60">Nenhum gasto ainda. Que tal lançar o primeiro?</p>
        ) : (
          <ul className="list">
            {data.items.map((expense) => {
              const category = names.get(expense.categoryId);
              return (
                <li key={expense.id} className="list-row items-center px-0">
                  <span
                    className="grid size-9 place-items-center rounded-xl text-sm font-bold"
                    style={softStyle(category?.color ?? "var(--color-neutral)")}
                  >
                    {(category?.name ?? "?")[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{expense.description || category?.name || "Gasto"}</p>
                    <p className="flex items-center gap-1 text-xs opacity-60">
                      {category?.name} · {formatDate(expense.spentAt)}
                      {expense.receiptId && <Paperclip className="size-3" aria-label="Com comprovante" />}
                    </p>
                  </div>
                  <span className="text-sm font-bold">{formatMoney(expense.amountCents)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
