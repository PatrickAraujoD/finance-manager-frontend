import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { ToastProvider } from "@/components/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[radial-gradient(60rem_24rem_at_85%_-10%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]">
        <AppNav />
        <main className="mx-auto max-w-7xl px-3 pb-28 pt-5 sm:px-6 lg:pb-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
