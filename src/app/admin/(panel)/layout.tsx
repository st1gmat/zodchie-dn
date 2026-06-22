import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Админка — Зодчие",
  robots: { index: false },
};

const navLinks = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/products", label: "Товары" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
              Зодчие · Админ
            </span>
            <nav className="flex items-center gap-5 text-sm text-muted">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted transition-colors hover:text-foreground">
              На сайт
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
