"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/** Reconsulta a sessao a cada 5 min: a rota do NextAuth renova o access token (vale 15 min). */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
}
