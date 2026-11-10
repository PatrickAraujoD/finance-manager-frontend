import type { ExpensePaymentMethod } from "@/lib/api-types";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

interface Props {
  value: ExpensePaymentMethod | "";
  onChange: (method: ExpensePaymentMethod) => void;
  label?: string;
}

export function PaymentMethodPicker({ value, onChange, label = "Forma de pagamento" }: Props) {
  return (
    <fieldset className="space-y-2 pb-1">
      <legend className="mb-1 text-xs opacity-60">{label}</legend>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={value === m.value}
            className={`btn ${value === m.value ? "btn-primary" : ""}`}
            onClick={() => onChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
