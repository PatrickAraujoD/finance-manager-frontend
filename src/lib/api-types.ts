export type Role = "A" | "N";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ManagedUser extends Profile {
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  global: boolean;
}

export interface Income {
  month: string;
  amountCents: number;
}

export interface Expense {
  id: string;
  categoryId: string;
  receiptId: string | null;
  amountCents: number;
  paidAlone: boolean;
  spentAt: string;
  description: string | null;
  createdAt: string;
}

export interface ExpensePage {
  items: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReceiptUpload {
  receiptId: string;
  suggestedAmountCents: number | null;
}

export interface ReportByCategory {
  month: string;
  totalCents: number;
  items: {
    categoryId: string;
    categoryName: string;
    totalCents: number;
    percentage: number;
  }[];
}

export interface ReportByDay {
  month: string;
  days: { date: string; totalCents: number }[];
  topDay: { date: string; totalCents: number } | null;
}

export interface ReportMonthlyEvolution {
  from: string;
  to: string;
  months: { month: string; totalCents: number }[];
}

export interface ReportIncomeVsSpent {
  month: string;
  incomeCents: number | null;
  spentCents: number;
  remainingCents: number | null;
  percentSpent: number | null;
}
