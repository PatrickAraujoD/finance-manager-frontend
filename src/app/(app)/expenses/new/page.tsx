import type { Metadata } from "next";
import { ExpenseForm } from "@/components/expenses/expense-form";

export const metadata: Metadata = { title: "Novo gasto" };

export default function NewExpensePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Novo gasto</h1>
        <p className="text-sm opacity-70">Anexe o comprovante para sugerirmos o valor, ou digite você mesmo.</p>
      </div>
      <ExpenseForm />
    </div>
  );
}
