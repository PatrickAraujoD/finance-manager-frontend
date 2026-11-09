import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/25">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm opacity-70">{description}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
