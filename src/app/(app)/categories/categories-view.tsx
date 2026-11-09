"use client";

import { Globe, Loader2, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { Category } from "@/lib/api-types";
import { useCategories } from "@/lib/hooks";

type Editing = { mode: "create" } | { mode: "rename"; category: Category };

export function CategoriesView() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "A";
  const { data: categories, isLoading, error } = useCategories();
  const { mutate } = useSWRConfig();
  const toast = useToast();

  const [editing, setEditing] = useState<Editing | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canManage = (category: Category) => !category.global || isAdmin;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    setPending(true);
    setFormError(null);
    try {
      if (editing.mode === "create") {
        await api("/categories", { method: "POST", body: { name, ...(form.get("global") ? { global: true } : {}) } });
        toast.success("Categoria criada.");
      } else {
        await api(`/categories/${editing.category.id}`, { method: "PATCH", body: { name } });
        toast.success("Categoria renomeada.");
      }
      await mutate("/categories");
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setPending(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setPending(true);
    try {
      await api(`/categories/${toDelete.id}`, { method: "DELETE" });
      await mutate("/categories");
      toast.success("Categoria excluída.");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes("conflita")
          ? "Esta categoria ainda tem gastos. Mude ou exclua os gastos antes."
          : err instanceof Error
            ? err.message
            : "Não foi possível excluir.",
      );
    } finally {
      setPending(false);
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Categorias</h1>
          <p className="text-sm opacity-70">Organize seus gastos. Até 100 categorias próprias.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => { setFormError(null); setEditing({ mode: "create" }); }}>
          <Plus className="size-4" /> Nova categoria
        </button>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar as categorias.</div>}

      <div className="card bg-base-100 shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : !categories?.length ? (
          <p className="p-8 text-center text-sm opacity-60">Nenhuma categoria ainda. Crie a primeira.</p>
        ) : (
          <ul className="list">
            {categories.map((category) => (
              <li key={category.id} className="list-row items-center">
                <span className="grid size-10 place-items-center rounded-xl bg-base-200">
                  {category.global ? <Globe className="size-4 text-info" /> : <Lock className="size-4 opacity-60" />}
                </span>
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs opacity-60">{category.global ? "Global, vale para todos" : "Só você vê"}</p>
                </div>
                {canManage(category) ? (
                  <div className="flex gap-1">
                    <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Renomear ${category.name}`} onClick={() => { setFormError(null); setEditing({ mode: "rename", category }); }}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm btn-square text-error" aria-label={`Excluir ${category.name}`} onClick={() => setToDelete(category)}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ) : (
                  <span className="badge badge-ghost">Somente leitura</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <dialog className={`modal ${editing ? "modal-open" : ""}`}>
        <form onSubmit={onSubmit} className="modal-box space-y-3" key={editing ? (editing.mode === "rename" ? editing.category.id : "new") : "closed"}>
          <h3 className="text-lg font-bold">{editing?.mode === "rename" ? "Renomear categoria" : "Nova categoria"}</h3>
          {formError && <div role="alert" className="alert alert-error alert-soft text-sm">{formError}</div>}
          <label className="floating-label">
            <span>Nome</span>
            <input
              name="name"
              required
              maxLength={60}
              autoFocus
              placeholder="Nome"
              defaultValue={editing?.mode === "rename" ? editing.category.name : ""}
              className="input input-bordered w-full"
            />
          </label>
          {editing?.mode === "create" && isAdmin && (
            <label className="label cursor-pointer justify-start gap-3">
              <input type="checkbox" name="global" className="toggle toggle-primary" />
              <span>Categoria global (visível para todos)</span>
            </label>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)} disabled={pending}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
        <div className="modal-backdrop" onClick={() => !pending && setEditing(null)} />
      </dialog>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir categoria?"
        message={`“${toDelete?.name}” será removida. Se houver gastos nela, a exclusão é recusada.`}
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
