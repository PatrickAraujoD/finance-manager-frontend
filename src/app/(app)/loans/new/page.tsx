import type { Metadata } from "next";
import { HandCoins } from "lucide-react";
import { LoanForm } from "@/components/loans/loan-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Novo empréstimo" };

export default function NewLoanPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader icon={HandCoins} title="Novo empréstimo" description="Transforme um gasto em empréstimo ou registre dinheiro emprestado." />
      <LoanForm />
    </div>
  );
}
