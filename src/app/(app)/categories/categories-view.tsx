"use client";

import { FolderTree, Globe, Loader2, Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { categoryColor, softStyle } from "@/components/dashboard/palette";
import { PageHeader } from "@/components/page-header";
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
  const globals = categories?.filter((c) => c.global) ?? [];
  const own = categories?.filter((c) => !c.global) ?? [];
  const openCreate = () => { setFormError(null); setEditing({ mode: "create" }); };

  const renderCard = (category: Category) => (
    <li key={category.id} className="card bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="card-body flex-row items-center gap-3 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl text-base font-bold" style={softStyle(categoryColor(category.id))}>
          {category.name[0].toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{category.name}</p>
          <p className="flex items-center gap-1 text-xs opacity-60">
            {category.global ? <><Globe className="size-3" /> Vale para todos</> : <><Lock className="size-3" /> Só você vê</>}
          </p>
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
          <span className="badge badge-ghost badge-sm">Somente leitura</span>
        )}
      </div>
    </li>
  );

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
    <div className="space-y-6">
      <PageHeader
        icon={FolderTree}
        title="Categorias"
        description="Organize seus gastos do seu jeito."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus className="size-4" /> Nova categoria
          </button>
        }
      />

      <div className="stats stats-vertical w-full bg-base-100 shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-info"><Globe className="size-7" /></div>
          <div className="stat-title">Globais</div>
          <div className="stat-value text-2xl">{isLoading ? "—" : globals.length}</div>
          <div className="stat-desc">Criadas pelo admin</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary"><Tag className="size-7" /></div>
          <div className="stat-title">Suas categorias</div>
          <div className="stat-value text-2xl">{isLoading ? "—" : `${own.length} / 100`}</div>
          <div className="stat-desc"><progress className="progress progress-primary w-28" value={own.length} max={100} /></div>
        </div>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar as categorias.</div>}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Suas categorias</h2>
            {own.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{own.map(renderCard)}</ul>
            ) : (
              <div className="card items-center gap-2 border-2 border-dashed border-base-300 p-8 text-center">
                <p className="font-semibold">Você ainda não criou categorias</p>
                <p className="text-sm opacity-70">Crie as suas, como Mercado, Transporte ou Lazer.</p>
                <button type="button" className="btn btn-primary btn-sm mt-1" onClick={openCreate}><Plus className="size-4" /> Criar categoria</button>
              </div>
            )}
          </section>

          {globals.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Globais</h2>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{globals.map(renderCard)}</ul>
            </section>
          )}
        </>
      )}

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
