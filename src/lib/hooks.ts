"use client";

import useSWR from "swr";
import { ApiError, fetcher } from "./api";
import type {
  Category,
  ExpensePage,
  Income,
  ManagedUser,
  ReportByCategory,
  ReportByDay,
  ReportIncomeVsSpent,
  ReportMonthlyEvolution,
} from "./api-types";
import { shiftMonth } from "./format";

const opts = { shouldRetryOnError: false, revalidateOnFocus: false } as const;

export const useCategories = () => useSWR<Category[]>("/categories", fetcher, opts);

export const useUsers = () => useSWR<ManagedUser[]>("/users", fetcher, opts);

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

export const useByDay = (month: string) => useSWR<ReportByDay>(["/reports/by-day", { month }], fetcher, opts);

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
  limit?: number;
  offset?: number;
}

export const useExpenses = (filters: ExpenseFilters) =>
  useSWR<ExpensePage>(["/expenses", { ...filters }], fetcher, { ...opts, keepPreviousData: true });
