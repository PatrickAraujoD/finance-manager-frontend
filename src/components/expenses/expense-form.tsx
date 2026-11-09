"use client";

import { CalendarDays, Download, Loader2, Paperclip, Save, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { categoryColor, softStyle } from "@/components/dashboard/palette";
import { useToast } from "@/components/toast";
import { api, apiBlob } from "@/lib/api";
import type { Expense, ReceiptUpload } from "@/lib/api-types";
import { centsToInput, formatDate, formatMoney, parseMoneyToCents, todayIso } from "@/lib/format";
import { useCategories } from "@/lib/hooks";
import { ReceiptUploader } from "./receipt-uploader";

const MAX_CENTS = 1_000_000_000;

function maxDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function ExpenseForm({ expense }: { expense?: Expense }) {
  const router = useRouter();
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const { data: categories } = useCategories();

  const [paidAlone, setPaidAlone] = useState(expense?.paidAlone ?? true);
  const [receipt, setReceipt] = useState<(ReceiptUpload & { fileName: string }) | null>(null);
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [spentAt, setSpentAt] = useState(expense?.spentAt ?? todayIso());
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense ? centsToInput(expense.amountCents) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = categories?.find((c) => c.id === categoryId);
  const previewCents = parseMoneyToCents(amount);

  function onReceiptChange(next: typeof receipt) {
    setReceipt(next);
    if (next?.suggestedAmountCents != null) setAmount(centsToInput(next.suggestedAmountCents));
  }

  async function downloadReceipt() {
    if (!expense?.receiptId) return;
    try {
      const blob = await apiBlob(`/receipts/${expense.receiptId}/file`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível baixar o comprovante.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cents = parseMoneyToCents(amount);
    if (cents === null || cents > MAX_CENTS) {
      setError("Informe um valor maior que zero, como 59,90.");
      return;
    }
    const fields = {
      categoryId,
      amountCents: cents,
      paidAlone,
      spentAt,
      description: description.trim(),
    };

    setPending(true);
    setError(null);
    try {
      if (expense) {
        const changes: Record<string, unknown> = {};
        if (fields.categoryId !== expense.categoryId) changes.categoryId = fields.categoryId;
        if (fields.amountCents !== expense.amountCents) changes.amountCents = fields.amountCents;
        if (fields.paidAlone !== expense.paidAlone) changes.paidAlone = fields.paidAlone;
        if (fields.spentAt !== expense.spentAt) changes.spentAt = fields.spentAt;
        if (fields.description !== (expense.description ?? "")) changes.description = fields.description;
        if (Object.keys(changes).length > 0) {
          await api(`/expenses/${expense.id}`, { method: "PATCH", body: changes });
        }
        toast.success("Gasto atualizado.");
      } else {
        await api("/expenses", {
          method: "POST",
          body: {
            ...fields,
            description: fields.description || undefined,
            receiptId: receipt?.receiptId,
          },
        });
        toast.success("Gasto registrado.");
      }
      await mutate((key) => typeof key === "string" ? key.startsWith("/expenses") : Array.isArray(key) && (String(key[0]).startsWith("/expenses") || String(key[0]).startsWith("/reports")));
      router.push("/expenses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={paidAlone}
            disabled={receipt !== null}
            onChange={(e) => setPaidAlone(e.target.checked)}
          />
          <span>
            Paguei sozinho
            <span className="block text-xs opacity-60">
              {receipt ? "Remova o comprovante para mudar." : "Desligue se dividiu a conta: o valor do comprovante não é lido."}
            </span>
          </span>
        </label>

        {expense ? (
          expense.receiptId && (
            <button type="button" className="btn btn-outline btn-sm self-start" onClick={downloadReceipt}>
              <Download className="size-4" /> Baixar comprovante
            </button>
          )
        ) : (
          <ReceiptUploader paidAlone={paidAlone} receipt={receipt} onChange={onReceiptChange} />
        )}

        <label className="floating-label">
          <span>Valor que você pagou (R$)</span>
          <input
            inputMode="decimal"
            required
            placeholder="Valor que você pagou (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input w-full text-lg font-semibold"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="floating-label">
            <span>Categoria</span>
            <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="select w-full">
              <option value="" disabled>Categoria</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="floating-label">
            <span>Data</span>
            <input type="date" required min="1900-01-01" max={maxDate()} value={spentAt} onChange={(e) => setSpentAt(e.target.value)} className="input w-full" />
          </label>
        </div>

        <label className="floating-label">
          <span>Descrição (opcional)</span>
          <textarea maxLength={500} rows={3} placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} className="textarea w-full" />
        </label>

        <div className="card-actions justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => router.back()} disabled={pending}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar gasto
          </button>
        </div>
      </div>
      </div>

      <aside className="card bg-base-100 shadow-sm" aria-label="Resumo do gasto">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Resumo</h2>
          <div className="rounded-box bg-linear-to-br from-primary to-secondary p-4 text-primary-content">
            <p className="text-sm opacity-90">Você pagou</p>
            <p className="text-3xl font-extrabold tracking-tight">
              {previewCents !== null ? formatMoney(previewCents) : "R$ 0,00"}
            </p>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl text-sm font-bold" style={softStyle(category ? categoryColor(category.id) : "var(--color-neutral)")}>
                {category ? category.name[0].toUpperCase() : "?"}
              </span>
              <div>
                <dt className="text-xs opacity-60">Categoria</dt>
                <dd className="font-medium">{category?.name ?? "Escolha uma categoria"}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-base-200"><CalendarDays className="size-4" /></span>
              <div>
                <dt className="text-xs opacity-60">Data</dt>
                <dd className="font-medium">{spentAt ? formatDate(spentAt) : "—"}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-base-200"><Users className="size-4" /></span>
              <div>
                <dt className="text-xs opacity-60">Pagamento</dt>
                <dd className="font-medium">{paidAlone ? "Paguei sozinho" : "Conta dividida"}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-base-200"><Paperclip className="size-4" /></span>
              <div>
                <dt className="text-xs opacity-60">Comprovante</dt>
                <dd className="font-medium">{receipt || expense?.receiptId ? "Anexado" : "Sem comprovante"}</dd>
              </div>
            </div>
          </dl>
        </div>
      </aside>
    </form>
  );
}
