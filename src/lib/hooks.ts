"use client";

import useSWR from "swr";
import { ApiError, fetcher } from "./api";
import type {
  Category,
  ExpensePage,
  ExpensePaymentMethod,
  Income,
  Loan,
  LoanPage,
  LoanPayment,
  LoansSummary,
  LoanStatus,
  ManagedUser,
  ReportByCategory,
  ReportCard,
  ReportIncomeVsSpent,
  ReportMonthlyEvolution,
} from "./api-types";
import { shiftMonth } from "./format";

const opts = { shouldRetryOnError: false, revalidateOnFocus: false } as const;

export const useCategories = () => useSWR<Category[]>("/categories", fetcher, opts);

export const useUsers = (enabled = true) => useSWR<ManagedUser[]>(enabled ? "/users" : null, fetcher, opts);

export const useIncome = (month: string) =>
  useSWR<Income | null>(
    `/income/${month}`,
    async (path: string) => {
      try {
        return await fetcher<Income>(path);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    opts,
  );

export const useByCategory = (month: string) =>
  useSWR<ReportByCategory>(["/reports/by-category", { month }], fetcher, opts);

export const useCard = (month: string) => useSWR<ReportCard>(["/reports/card", { month }], fetcher, opts);

export const useIncomeVsSpent = (month: string) =>
  useSWR<ReportIncomeVsSpent>(["/reports/income-vs-spent", { month }], fetcher, opts);

export const useEvolution = (month: string, months = 6) =>
  useSWR<ReportMonthlyEvolution>(
    ["/reports/monthly-evolution", { from: shiftMonth(month, -(months - 1)), to: month }],
    fetcher,
    opts,
  );

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  paymentMethod?: ExpensePaymentMethod;
  limit?: number;
  offset?: number;
}

export const useExpenses = (filters: ExpenseFilters) =>
  useSWR<ExpensePage>(["/expenses", { ...filters }], fetcher, { ...opts, keepPreviousData: true });

export interface LoanFilters {
  borrower?: string;
  status?: LoanStatus;
  limit?: number;
  offset?: number;
}

export const useLoans = (filters: LoanFilters) =>
  useSWR<LoanPage>(["/loans", { ...filters }], fetcher, { ...opts, keepPreviousData: true });

export const useLoansSummary = (borrower?: string) =>
  useSWR<LoansSummary>(["/loans/summary", { borrower }], fetcher, opts);

export const useLoan = (id: string) => useSWR<Loan>(`/loans/${id}`, fetcher, opts);

export const useLoanPayments = (id: string) => useSWR<LoanPayment[]>(`/loans/${id}/payments`, fetcher, opts);

export const isLoansKey = (key: unknown) =>
  typeof key === "string" ? key.startsWith("/loans") : Array.isArray(key) && String(key[0]).startsWith("/loans");
