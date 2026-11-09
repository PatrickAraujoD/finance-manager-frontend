import { PieChart, ScanText, Wallet, WalletCards, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ScanText, title: "Comprovante vira sugestão", text: "Envie o PDF ou a foto e o valor aparece para você confirmar." },
  { icon: PieChart, title: "Veja para onde o dinheiro vai", text: "Gastos por categoria, por dia e mês a mês, em gráficos." },
  { icon: WalletCards, title: "Saiba quanto do salário sobrou", text: "Acompanhe o saldo do mês e quanto dá para gastar por dia." },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      <div className="pointer-events-none absolute -top-40 left-1/4 size-[44rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[30rem] rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <Wallet className="size-7 text-primary" />
          <span className="text-gradient">Finanças</span>
        </div>

        <div className="max-w-md space-y-8">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">Seu dinheiro, com os números à vista.</h2>
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/25">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm opacity-70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm opacity-60">Os valores lidos dos comprovantes são só sugestões: quem confirma é você.</p>
      </section>

      <section className="relative grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-extrabold lg:hidden">
            <Wallet className="size-7 text-primary" />
            <span className="text-gradient">Finanças</span>
          </div>
          <div className="card glass shadow-xl">
            <div className="card-body">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
