"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { isDark, setPreference } = useTheme();

  return (
    <label className="toggle toggle-lg text-base-content [--toggle-p:0px]" title={isDark ? "Tema escuro" : "Tema claro"}>
      <input
        type="checkbox"
        checked={isDark}
        onChange={(event) => setPreference(event.target.checked ? "dark" : "light")}
        aria-label="Alternar entre tema claro e escuro"
      />
      <Sun aria-label="sol" />
      <Moon aria-label="lua" />
    </label>
  );
}
