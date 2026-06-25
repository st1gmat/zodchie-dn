"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCategoryTemplate } from "@/app/admin/actions";

const inputClass =
  "min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent-soft";

export function CategoryTemplateEditor({
  categoryId,
  initial,
}: {
  categoryId: string;
  initial: string[];
}) {
  const [names, setNames] = useState<string[]>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    startTransition(async () => {
      await saveCategoryTemplate(categoryId, names);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Шаблон характеристик
      </h2>
      <p className="mt-1 text-sm text-muted">
        Названия характеристик, которые подставятся при редактировании товаров
        этой категории (артикул, серия, цвет…).
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {names.length === 0 && (
          <p className="text-sm text-muted">Шаблон пуст.</p>
        )}
        {names.map((name, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={name}
              onChange={(e) =>
                setNames((c) => c.map((n, i) => (i === index ? e.target.value : n)))
              }
              placeholder="Название характеристики"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setNames((c) => c.filter((_, i) => i !== index))}
              aria-label="Удалить"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red-300 hover:text-red-600"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setNames((c) => [...c, ""])}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
        >
          + Добавить
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft disabled:opacity-50"
        >
          {pending ? "Сохранение…" : "Сохранить шаблон"}
        </button>
        {saved && <span className="text-sm text-accent-soft">Сохранено ✓</span>}
      </div>
    </section>
  );
}
