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

/** Cor da categoria na posicao `index`: 7 do tema e, alem delas, tons distribuidos pelo circulo cromatico. */
export function colorForIndex(index: number): string {
  if (index < CHART_COLORS.length) return CHART_COLORS[index];
  return `oklch(72% 0.15 ${Math.round(((index - CHART_COLORS.length + 1) * 137.508) % 360)})`;
}

/** Fundo suave e texto na cor da categoria, para avatares e etiquetas. */
export function softStyle(color: string): React.CSSProperties {
  return { background: `color-mix(in oklab, ${color} 18%, transparent)`, color };
}
