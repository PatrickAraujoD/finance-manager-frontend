import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[30rem] rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-extrabold">
          <Wallet className="size-7 text-primary" />
          <span className="text-gradient">Finanças</span>
        </div>
        <div className="card glass shadow-xl">
          <div className="card-body">{children}</div>
        </div>
      </div>
    </main>
  );
}
