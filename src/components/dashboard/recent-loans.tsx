"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLoans } from "@/lib/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { LoanStatusBadge } from "@/components/loans/loan-status-badge";

const RECENT_COUNT = 5;

export function RecentLoans() {
  const { data, isLoading } = useLoans({ limit: 200 });
  const recent = data?.items
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_COUNT);

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Últimos empréstimos</h2>
          <Link href="/loans" className="btn btn-ghost btn-xs">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-11 w-full" />
            ))}
          </div>
        ) : !recent?.length ? (
          <p className="py-6 text-center text-sm opacity-60">Nenhum empréstimo ainda.</p>
        ) : (
          <ul className="list">
            {recent.map((loan) => (
              <li key={loan.id} className="list-row items-center px-0">
                <Link href={`/loans/${loan.id}`} className="contents">
                  <span className="grid size-9 place-items-center rounded-xl bg-base-200 text-sm font-bold">
                    {loan.borrowerName[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{loan.borrowerName}</p>
                    <p className="flex items-center gap-1.5 text-xs opacity-70">
                      <LoanStatusBadge status={loan.status} />
                      {formatDate(loan.dueDate)}
                    </p>
                  </div>
                  <span className="text-sm font-bold">{formatMoney(loan.remainingCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
