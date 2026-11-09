"use client";

import { ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api";
import type { ManagedUser, Role } from "@/lib/api-types";
import { formatDate } from "@/lib/format";
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Usuários</h1>
        <p className="text-sm opacity-70">Mude o papel ou desative contas. Desativar encerra as sessões na hora.</p>
      </div>

      {error && <div role="alert" className="alert alert-error alert-soft">Não foi possível carregar os usuários.</div>}

      <div className="card bg-base-100 shadow-sm">
        {isLoading || !users ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Ativo</th><th>Criado em</th></tr></thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === session?.user.id;
                  const busy = busyId === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="font-medium">{user.name}{isSelf && <span className="badge badge-ghost badge-sm ml-2">você</span>}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          className="select select-sm select-bordered"
                          aria-label={`Papel de ${user.name}`}
                          value={user.role}
                          disabled={isSelf || busy}
                          onChange={(e) => update(user, { role: e.target.value as Role })}
                        >
                          <option value="N">Normal</option>
                          <option value="A">Admin</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-success toggle-sm"
                          aria-label={`Conta de ${user.name} ativa`}
                          checked={user.active}
                          disabled={isSelf || busy}
                          onChange={(e) => update(user, { active: e.target.checked })}
                        />
                      </td>
                      <td className="whitespace-nowrap">{formatDate(user.createdAt.slice(0, 10))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
