"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { isDark, setPreference } = useTheme();

  return (
    <label
      className="toggle border-0 bg-warning/40! text-base-content has-checked:bg-primary! has-checked:text-primary-content!"
      title={isDark ? "Tema escuro" : "Tema claro"}
    >
      <input
        type="checkbox"
        checked={isDark}
        onChange={(event) => setPreference(event.target.checked ? "dark" : "light")}
        aria-label="Alternar entre tema claro e escuro"
      />
      <Sun aria-label="sol" className="size-3.5" />
      <Moon aria-label="lua" className="size-3.5" />
    </label>
  );
}
