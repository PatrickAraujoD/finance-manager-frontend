import type { Metadata } from "next";
import { LoanDetail } from "./loan-detail";

export const metadata: Metadata = { title: "Empréstimo" };

export default async function LoanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LoanDetail id={id} />;
}
