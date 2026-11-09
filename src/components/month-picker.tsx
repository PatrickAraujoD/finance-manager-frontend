"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/format";

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ month, onChange }: Props) {
  const isCurrent = month === currentMonth();
  return (
    <div className="join">
      <button type="button" className="btn btn-sm join-item" aria-label="Mês anterior" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        className="btn btn-sm join-item min-w-36 capitalize"
        onClick={() => onChange(currentMonth())}
        disabled={isCurrent}
        title="Voltar para o mês atual"
      >
        {formatMonthLabel(month)}
      </button>
      <button type="button" className="btn btn-sm join-item" aria-label="Próximo mês" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
