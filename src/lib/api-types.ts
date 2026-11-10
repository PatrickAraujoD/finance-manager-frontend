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

export type ExpensePaymentMethod = "CREDIT" | "DEBIT" | "PIX" | "CASH";

export interface Expense {
  id: string;
  categoryId: string;
  receiptId: string | null;
  amountCents: number;
  paidAlone: boolean;
  paymentMethod: ExpensePaymentMethod;
  isCardPayment: boolean;
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

export interface ReportMonthlyEvolution {
  from: string;
  to: string;
  months: { month: string; totalCents: number }[];
}

export interface ReportIncomeVsSpent {
  month: string;
  incomeCents: number | null;
  spentCents: number;
  receivedCents: number;
  creditSpentCents: number;
  remainingCents: number | null;
  percentSpent: number | null;
}

export type LoanStatus = "OPEN" | "PAID" | "OVERDUE";
export type PaymentMethod = "CASH" | "PIX";

export interface Loan {
  id: string;
  borrowerName: string;
  amountCents: number;
  dueDate: string;
  expenseId: string | null;
  paymentMethod: ExpensePaymentMethod | null;
  lentAt: string | null;
  paidCents: number;
  remainingCents: number;
  status: LoanStatus;
  createdAt: string;
}

export interface LoanPage {
  items: Loan[];
  total: number;
  limit: number;
  offset: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amountCents: number;
  method: PaymentMethod;
  receiptId: string | null;
  paidAt: string;
  createdAt: string;
}

export interface LoanTotals {
  totalLentCents: number;
  paidCents: number;
  owedCents: number;
  upcomingCents: number;
  overdueCents: number;
}

export interface BorrowerSummary extends LoanTotals {
  borrowerName: string;
  loansCount: number;
  overdueLoansCount: number;
  nextDueDate: string | null;
}

export interface LoansSummary {
  items: BorrowerSummary[];
  totals: LoanTotals;
  truncated: boolean;
}

export interface ReportCard {
  month: string;
  openingCents: number;
  chargedCents: number;
  paidCents: number;
  balanceCents: number;
}
