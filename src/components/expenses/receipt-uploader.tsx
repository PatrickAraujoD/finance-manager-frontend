"use client";

import { FileText, Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import type { ReceiptUpload } from "@/lib/api-types";
import { formatMoney } from "@/lib/format";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];

interface Props {
  paidAlone: boolean;
  receipt: (ReceiptUpload & { fileName: string }) | null;
  onChange: (receipt: (ReceiptUpload & { fileName: string }) | null) => void;
}

export function ReceiptUploader({ paidAlone, receipt, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Envie um PDF, PNG ou JPEG.");
      return;
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      setError(file.size === 0 ? "O arquivo está vazio." : "O arquivo passa de 5 MiB.");
      return;
    }

    const form = new FormData();
    form.append("paidAlone", String(paidAlone));
    form.append("file", file);
    setPending(true);
    try {
      const uploaded = await api<ReceiptUpload>("/receipts", { method: "POST", form });
      onChange({ ...uploaded, fileName: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o comprovante.");
    } finally {
      setPending(false);
      if (input.current) input.current.value = "";
    }
  }

  if (receipt) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3">
          <FileText className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{receipt.fileName}</span>
          <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label="Remover comprovante" onClick={() => onChange(null)}>
            <X className="size-4" />
          </button>
        </div>
        {receipt.suggestedAmountCents !== null ? (
          <p className="alert alert-info alert-soft text-sm">
            <Sparkles className="size-4 shrink-0" />
            Valor sugerido pelo comprovante: <b>{formatMoney(receipt.suggestedAmountCents)}</b>. Confira antes de salvar.
          </p>
        ) : (
          <p className="alert alert-warning alert-soft text-sm">
            {paidAlone
              ? "Não foi possível ler o valor com segurança. Digite o valor que você pagou."
              : "Gasto dividido: informe o valor que você pagou."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className={`flex cursor-pointer flex-col items-center gap-1 rounded-box border-2 border-dashed border-base-300 p-5 text-center text-sm transition hover:border-primary hover:bg-base-200 ${pending ? "pointer-events-none opacity-60" : ""}`}>
        {pending ? <Loader2 className="size-6 animate-spin text-primary" /> : <Paperclip className="size-6 text-primary" />}
        <span className="font-medium">{pending ? "Enviando e lendo o comprovante..." : "Anexar comprovante (opcional)"}</span>
        <span className="text-xs opacity-60">PDF, PNG ou JPEG de até 5 MiB</span>
        <input ref={input} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
    </div>
  );
}
