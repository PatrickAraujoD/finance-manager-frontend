import type { Metadata } from "next";
import { EditExpense } from "./edit-expense";

export const metadata: Metadata = { title: "Editar gasto" };

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditExpense id={id} />;
}
