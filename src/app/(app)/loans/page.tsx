import type { Metadata } from "next";
import { LoansView } from "./loans-view";

export const metadata: Metadata = { title: "Empréstimos" };

export default function LoansPage() {
  return <LoansView />;
}
