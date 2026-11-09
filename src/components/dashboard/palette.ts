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
