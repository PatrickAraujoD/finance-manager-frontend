"use client";

import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Dados inválidos. Confira os campos e tente de novo.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para isso.",
  404: "Não encontrado.",
  409: "Isso conflita com algo que já existe.",
  413: "O arquivo é grande demais (máximo de 5 MiB).",
  429: "Muitas tentativas. Aguarde um pouco e tente de novo.",
};

async function toError(res: Response): Promise<ApiError> {
  let detail: string | undefined;
  try {
    const body = await res.json();
    detail = Array.isArray(body.message) ? body.message.join(" ") : body.message;
  } catch {
    // corpo vazio ou nao JSON
  }
  // 400/409 trazem a regra violada; os demais usam o texto padrao.
  const useDetail = detail && (res.status === 400 || res.status === 409);
  return new ApiError(res.status, useDetail ? detail! : (STATUS_MESSAGES[res.status] ?? "Algo deu errado."));
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  query?: Record<string, string | number | undefined>;
}

async function authorizedFetch(path: string, opts: RequestOptions): Promise<Response> {
  // getSession passa pela rota do NextAuth, que renova o access token quando precisa.
  const session = await getSession();
  if (!session?.accessToken || session.error) {
    await signOut({ callbackUrl: "/login" });
    throw new ApiError(401, STATUS_MESSAGES[401]);
  }

  const url = new URL(path, API_URL);
  for (const [key, value] of Object.entries(opts.query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${session.accessToken}` };
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, { method: opts.method ?? "GET", headers, body, cache: "no-store" });
  if (res.status === 401) {
    await signOut({ callbackUrl: "/login" });
  }
  return res;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await authorizedFetch(path, opts);
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const res = await authorizedFetch(path, {});
  if (!res.ok) throw await toError(res);
  return res.blob();
}

/** Rotas publicas (cadastro): sem token. */
export async function publicApi<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(new URL(path, API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as T;
}

export const fetcher = <T>(key: string | [string, Record<string, string | number | undefined>]) =>
  Array.isArray(key) ? api<T>(key[0], { query: key[1] }) : api<T>(key);
