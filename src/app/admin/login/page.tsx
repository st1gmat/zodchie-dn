import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated, DEV_ADMIN_PASSWORD } from "@/lib/auth";
import { login } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Вход — Админка",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAuthenticated()) redirect("/admin");

  const { error } = await searchParams;

  // In dev with no hash configured, verifyPassword accepts a plaintext password —
  // surface it here so you don't have to remember it.
  const devPassword =
    process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD_HASH
      ? process.env.ADMIN_PASSWORD ?? DEV_ADMIN_PASSWORD
      : null;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Вход в админку
      </h1>
      <p className="mt-2 text-sm text-muted">Управление каталогом «Зодчие».</p>

      <form action={login} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Пароль</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent-soft"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">Неверный пароль, попробуйте снова.</p>
        )}

        {devPassword && (
          <p className="rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-xs text-muted">
            Dev-режим: пароль <code className="font-mono text-foreground">{devPassword}</code>
          </p>
        )}

        <button
          type="submit"
          className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
