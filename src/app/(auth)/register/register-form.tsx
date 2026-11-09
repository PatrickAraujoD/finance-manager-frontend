"use client";

import { Loader2, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/toast";
import { publicApi } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirm")) {
      setError("As senhas não são iguais.");
      return;
    }
    setPending(true);
    setError(null);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    try {
      await publicApi("/auth/register", { name: String(form.get("name")).trim(), email, password });
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("conflita")
          ? "Já existe uma conta com esse e-mail."
          : err instanceof Error
            ? err.message
            : "Não foi possível criar a conta.",
      );
      setPending(false);
      return;
    }

    // Conta criada: entra direto, sem pedir e-mail e senha de novo.
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.ok) {
      toast.success("Conta criada! Você já está logado.");
      router.replace("/");
      router.refresh();
      return;
    }
    router.replace("/login?registered=1");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-bold">Criar conta</h1>
        <p className="text-sm opacity-70">Comece a controlar seus gastos.</p>
      </div>

      {error && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          {error}
        </div>
      )}

      <label className="floating-label">
        <span>Nome</span>
        <input name="name" required maxLength={100} autoComplete="name" placeholder="Nome" className="input input-bordered w-full" />
      </label>
      <label className="floating-label">
        <span>E-mail</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="E-mail" className="input input-bordered w-full" />
      </label>
      <label className="floating-label">
        <span>Senha (12 a 128 caracteres)</span>
        <input
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Senha (12 a 128 caracteres)"
          className="input input-bordered w-full"
        />
      </label>
      <label className="floating-label">
        <span>Confirme a senha</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
          placeholder="Confirme a senha"
          className="input input-bordered w-full"
        />
      </label>

      <button type="submit" disabled={pending} className="btn btn-brand mt-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Criar conta
      </button>
      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="link link-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}
