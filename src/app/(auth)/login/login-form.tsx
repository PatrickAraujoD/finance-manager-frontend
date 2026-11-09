"use client";

import { Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const ERRORS: Record<string, string> = {
  CredentialsSignin: "E-mail ou senha incorretos, ou a conta está bloqueada por alguns minutos.",
  RATE_LIMITED: "Muitas tentativas. Aguarde um pouco e tente de novo.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered") === "1";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    if (result?.ok) {
      const callback = params.get("callbackUrl");
      router.replace(callback?.startsWith("/") ? callback : "/");
      router.refresh();
      return;
    }
    setError(ERRORS[result?.error ?? ""] ?? "Não foi possível entrar. Tente novamente.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-bold">Bem-vindo de volta</h1>
        <p className="text-sm opacity-70">Entre para ver suas finanças.</p>
      </div>

      {registered && (
        <div role="status" className="alert alert-success alert-soft text-sm">
          Conta criada! Entre com seu e-mail e senha.
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          {error}
        </div>
      )}

      <label className="floating-label">
        <span>E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="E-mail"
          className="input input-bordered w-full"
        />
      </label>
      <label className="floating-label">
        <span>Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          maxLength={128}
          placeholder="Senha"
          className="input input-bordered w-full"
        />
      </label>

      <button type="submit" disabled={pending} className="btn btn-primary mt-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        Entrar
      </button>
      <p className="text-center text-sm">
        Não tem conta?{" "}
        <Link href="/register" className="link link-primary">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
