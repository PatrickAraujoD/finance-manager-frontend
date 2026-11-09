/** Cores dos graficos: variaveis do tema, entao acompanham claro/escuro. */
export const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
];

export const colorAt = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

/** Cor estavel por categoria: a mesma em dashboard, gastos e categorias, em qualquer ordem. */
export function categoryColor(categoryId: string): string {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) hash = (hash * 31 + categoryId.charCodeAt(i)) >>> 0;
  return CHART_COLORS[hash % CHART_COLORS.length];
}

/** Fundo suave e texto na cor da categoria, para avatares e etiquetas. */
export function softStyle(color: string): React.CSSProperties {
  return { background: `color-mix(in oklab, ${color} 18%, transparent)`, color };
}
