"use client";

import { Pencil } from "lucide-react";
import useSWR from "swr";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { PageHeader } from "@/components/page-header";
import { fetcher } from "@/lib/api";
import type { Expense } from "@/lib/api-types";

export function EditExpense({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<Expense>(`/expenses/${id}`, fetcher, { shouldRetryOnError: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader icon={Pencil} title="Editar gasto" description="Corrija o que precisar. O comprovante não muda." />
      {isLoading && <div className="skeleton h-96 w-full" />}
      {error && <div role="alert" className="alert alert-error alert-soft">Gasto não encontrado.</div>}
      {data && <ExpenseForm expense={data} />}
    </div>
  );
}
