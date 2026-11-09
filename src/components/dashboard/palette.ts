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

export function colorForIndex(index: number): string {
  if (index < CHART_COLORS.length) return CHART_COLORS[index];
  return `oklch(72% 0.15 ${Math.round(((index - CHART_COLORS.length + 1) * 137.508) % 360)})`;
}

export function softStyle(color: string): React.CSSProperties {
  return { background: `color-mix(in oklab, ${color} 18%, transparent)`, color };
}
