"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/format";

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ month, onChange }: Props) {
  const isCurrent = month === currentMonth();

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-base-100 p-1 shadow-sm ring-1 ring-base-300">
      <button type="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Mês anterior" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft className="size-4" />
      </button>

      <span className="flex min-w-40 items-center justify-center gap-2 px-1 text-sm font-semibold" aria-live="polite">
        <CalendarDays className="size-4 text-primary" />
        <span className="inline-block first-letter:uppercase">{formatMonthLabel(month)}</span>
      </span>

      <button type="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Próximo mês" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight className="size-4" />
      </button>

      {!isCurrent && (
        <button type="button" className="btn btn-soft btn-primary btn-xs rounded-full" onClick={() => onChange(currentMonth())} title="Voltar para o mês atual">
          Hoje
        </button>
      )}
    </div>
  );
}
