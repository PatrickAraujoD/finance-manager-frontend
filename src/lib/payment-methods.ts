import type { ExpensePaymentMethod } from "./api-types";

export const PAYMENT_METHODS: { value: ExpensePaymentMethod; label: string }[] = [
  { value: "CREDIT", label: "Crédito" },
  { value: "DEBIT", label: "Débito" },
  { value: "PIX", label: "Pix" },
  { value: "CASH", label: "Dinheiro" },
];

export const paymentMethodLabel = (method: ExpensePaymentMethod) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
