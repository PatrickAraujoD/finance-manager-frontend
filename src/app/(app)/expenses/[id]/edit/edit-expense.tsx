"use client";

import useSWR from "swr";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { fetcher } from "@/lib/api";
import type { Expense } from "@/lib/api-types";

export function EditExpense({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<Expense>(`/expenses/${id}`, fetcher, { shouldRetryOnError: false });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Editar gasto</h1>
      {isLoading && <div className="skeleton h-96 w-full" />}
      {error && <div role="alert" className="alert alert-error alert-soft">Gasto não encontrado.</div>}
      {data && <ExpenseForm expense={data} />}
    </div>
  );
}
