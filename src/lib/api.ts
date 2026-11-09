"use client";

import { getSession, signOut } from "next-auth/react";

const API_BASE = "/backend";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_ERROR = "Não foi possível falar com a API. Confira se ela está no ar.";

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_BASE}${path}${qs ? `?${qs}` : ""}`;
}

async function request(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, cache: "no-store" });
  } catch {
    throw new ApiError(0, NETWORK_ERROR);
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

async function readJson<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(502, "A API respondeu algo inesperado. Confira o API_URL do frontend.");
  }
}

async function toError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  const message = body?.message;
  const detail: string | undefined = Array.isArray(message) ? message.join(" ") : message;
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
  const session = await getSession();
  if (!session?.accessToken || session.error) {
    await signOut({ callbackUrl: "/login" });
    throw new ApiError(401, STATUS_MESSAGES[401]);
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${session.accessToken}` };
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await request(buildUrl(path, opts.query), { method: opts.method ?? "GET", headers, body });
  if (res.status === 401) {
    await signOut({ callbackUrl: "/login" });
  }
  return res;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await authorizedFetch(path, opts);
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return readJson<T>(res);
}

export async function apiBlob(path: string): Promise<Blob> {
  const res = await authorizedFetch(path, {});
  if (!res.ok) throw await toError(res);
  return res.blob();
}

export async function publicApi<T>(path: string, body: unknown): Promise<T> {
  const res = await request(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  return readJson<T>(res);
}

export const fetcher = <T>(key: string | [string, Record<string, string | number | undefined>]) =>
  Array.isArray(key) ? api<T>(key[0], { query: key[1] }) : api<T>(key);
