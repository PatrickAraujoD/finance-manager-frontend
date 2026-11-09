import type { LoanStatus } from "@/lib/api-types";

const STATUS: Record<LoanStatus, { label: string; className: string }> = {
  OPEN: { label: "A vencer", className: "badge-info" },
  OVERDUE: { label: "Atrasado", className: "badge-error" },
  PAID: { label: "Pago", className: "badge-success" },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const { label, className } = STATUS[status];
  return <span className={`badge badge-soft badge-sm ${className}`}>{label}</span>;
}
