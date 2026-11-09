import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Novo gasto" };

export default function NewExpensePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader icon={Plus} title="Novo gasto" description="Anexe o comprovante para sugerirmos o valor, ou digite você mesmo." />
      <ExpenseForm />
    </div>
  );
}
