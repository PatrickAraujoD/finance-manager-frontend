"use client";

import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Users,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { initials } from "@/lib/format";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/expenses", label: "Gastos", icon: Receipt },
  { href: "/categories", label: "Categorias", icon: FolderTree },
  { href: "/income", label: "Salário", icon: WalletCards },
  { href: "/users", label: "Usuários", icon: Users, adminOnly: true },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = ITEMS.filter((item) => !item.adminOnly || session?.user.role === "A");

  return (
    <>
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
        <nav className="navbar glass mx-auto max-w-7xl rounded-box px-3 shadow-sm">
          <div className="navbar-start">
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
              <Wallet className="size-6 text-primary" />
              <span className="text-gradient">Finanças</span>
            </Link>
          </div>

          <ul className="menu menu-horizontal navbar-center hidden gap-1 lg:flex">
            {items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} className={isActive(pathname, href) ? "menu-active" : ""}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-end gap-2">
            <Link href="/expenses/new" className="btn btn-brand btn-sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo gasto</span>
            </Link>
            <ThemeToggle />
            <div className="dropdown dropdown-end">
              <button type="button" className="avatar avatar-placeholder cursor-pointer" aria-label="Menu da conta">
                <div className="w-9 rounded-full bg-primary text-primary-content">
                  <span className="text-sm font-bold">{initials(session?.user.name)}</span>
                </div>
              </button>
              <ul className="menu dropdown-content z-40 mt-3 w-60 rounded-box bg-base-100 p-2 shadow-lg">
                <li className="menu-title normal-case">
                  <span className="block truncate font-semibold text-base-content">{session?.user.name}</span>
                  <span className="block truncate text-xs font-normal">{session?.user.email}</span>
                  {session?.user.role === "A" && <span className="badge badge-primary badge-sm mt-1">Admin</span>}
                </li>
                <li>
                  <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <nav className="dock dock-sm z-30 lg:hidden" aria-label="Navegação principal">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(pathname, href) ? "dock-active" : ""}>
            <Icon className="size-5" />
            <span className="dock-label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
