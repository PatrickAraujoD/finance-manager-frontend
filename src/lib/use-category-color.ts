"use client";

import { useMemo } from "react";
import { colorForIndex } from "@/components/dashboard/palette";
import { useCategories } from "./hooks";

/**
 * Devolve a cor de cada categoria. A cor vem da posicao da categoria na lista ordenada por id,
 * entao duas categorias nunca repetem cor e ela e a mesma em todas as telas.
 */
export function useCategoryColor() {
  const { data } = useCategories();
  const colors = useMemo(() => {
    const ids = (data ?? []).map((c) => c.id).sort();
    return new Map(ids.map((id, index) => [id, colorForIndex(index)]));
  }, [data]);

  return (categoryId: string) => colors.get(categoryId) ?? "var(--color-neutral)";
}
