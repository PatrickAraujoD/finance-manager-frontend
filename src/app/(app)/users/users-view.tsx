"use client";

import { ShieldAlert, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { ManagedUser, Role } from "@/lib/api-types";
import { formatDate, initials } from "@/lib/format";
import { useUsers } from "@/lib/hooks";

export function UsersView() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user.role === "A";
  const { data: users, isLoading, error } = useUsers(isAdmin);
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function update(user: ManagedUser, changes: { role?: Role; active?: boolean }) {
    setBusyId(user.id);
    try {
      await api(`/users/${user.id}`, { method: "PATCH", body: changes });
      await mutate("/users");
      toast.success("Usuário atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  if (status !== "loading" && !isAdmin) {
    return (
      <div role="alert" className="alert alert-warning alert-soft mx-auto max-w-lg">
        <ShieldAlert className="size-5" /> Só administradores gerenciam usuários.
      </div>
    );
  }

  const admins = users?.filter((u) => u.role === "A" && u.active).length ?? 0;
  const active = users?.filter((u) => u.active).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Usuários" description="Mude o papel ou desative contas. Desativar encerra as sessões na hora." />

      <div className="stats stats-vertical w-full bg-base-100 shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-figure text-primary"><Users className="size-7" /></div>
          <div className="stat-title">Contas</div>
          <div className="stat-value text-2xl">{users ? users.length : "—"}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success"><UserCheck className="size-7" /></div>
          <div className="stat-title">Ativas</div>
          <div className="stat-value text-2xl">{users ? active : "—"}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary"><ShieldCheck className="size-7" /></div>
          <div className="stat-title">Admins ativos</div>
          <div className="stat-value text-2xl">{users ? admins : "—"}</div>
        </div>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar os usuários.</div>}

      <div className="card bg-base-100 shadow-sm">
        {isLoading || !users ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
        ) : (
          <ul className="list">
            {users.map((user) => {
              const isSelf = user.id === session?.user.id;
              const busy = busyId === user.id;
              return (
                <li key={user.id} className={`list-row items-center ${user.active ? "" : "opacity-60"}`}>
                  <div className="avatar avatar-placeholder">
                    <span className={`w-11 rounded-2xl text-sm font-bold ${user.role === "A" ? "bg-primary text-primary-content" : "bg-base-300"}`}>
                      {initials(user.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <span className="truncate">{user.name}</span>
                      {isSelf && <span className="badge badge-ghost badge-sm">você</span>}
                      {!user.active && <span className="badge badge-error badge-soft badge-sm">inativa</span>}
                    </p>
                    <p className="truncate text-xs opacity-60">{user.email} · desde {formatDate(user.createdAt.slice(0, 10))}</p>
                  </div>
                  <select
                    className="select select-sm w-28"
                    aria-label={`Papel de ${user.name}`}
                    value={user.role}
                    disabled={isSelf || busy}
                    onChange={(e) => update(user, { role: e.target.value as Role })}
                  >
                    <option value="N">Normal</option>
                    <option value="A">Admin</option>
                  </select>
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    aria-label={`Conta de ${user.name} ativa`}
                    checked={user.active}
                    disabled={isSelf || busy}
                    onChange={(e) => update(user, { active: e.target.checked })}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
