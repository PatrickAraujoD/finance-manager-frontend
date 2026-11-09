"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "./theme-provider";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Tema claro", icon: Sun },
  { value: "system", label: "Seguir o sistema", icon: Monitor },
  { value: "dark", label: "Tema escuro", icon: Moon },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="join" role="radiogroup" aria-label="Tema">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          aria-label={label}
          title={label}
          onClick={() => setPreference(value)}
          className={`btn btn-sm btn-square join-item ${preference === value ? "btn-primary" : "btn-ghost"}`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
