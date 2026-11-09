import type { Metadata } from "next";
import { Suspense } from "react";
import { IncomeView } from "./income-view";

export const metadata: Metadata = { title: "Salário" };

export default function IncomePage() {
  return (
    <Suspense>
      <IncomeView />
    </Suspense>
  );
}
