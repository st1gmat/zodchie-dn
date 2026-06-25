"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductAttributes } from "@/app/admin/actions";

type Row = { name: string; value: string };

const inputClass =
  "min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent-soft";

export function ProductAttributesEditor({
  productId,
  initial,
  template,
}: {
  productId: string;
  initial: Row[];
  template: string[];
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function update(index: number, key: keyof Row, value: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }

  function addFromTemplate() {
    const existing = new Set(rows.map((r) => r.name.trim().toLowerCase()));
    const additions = template
      .filter((name) => !existing.has(name.trim().toLowerCase()))
      .map((name) => ({ name, value: "" }));
    if (additions.length > 0) setRows((current) => [...current, ...additions]);
  }

  function save() {
    startTransition(async () => {
      await saveProductAttributes(productId, rows);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Характеристики</h2>
        {template.length > 0 && (
          <button
            type="button"
            onClick={addFromTemplate}
            className="text-sm font-medium text-accent-soft transition-colors hover:text-accent"
          >
            + Добавить из шаблона категории
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted">
            Характеристик пока нет. Добавьте вручную или из шаблона категории.
          </p>
        )}
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              value={row.name}
              onChange={(e) => update(index, "name", e.target.value)}
              placeholder="Название"
              className={inputClass}
            />
            <input
              value={row.value}
              onChange={(e) => update(index, "value", e.target.value)}
              placeholder="Значение"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setRows((c) => c.filter((_, i) => i !== index))}
              aria-label="Удалить характеристику"
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
          onClick={() => setRows((c) => [...c, { name: "", value: "" }])}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft"
        >
          + Добавить характеристику
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft disabled:opacity-50"
        >
          {pending ? "Сохранение…" : "Сохранить характеристики"}
        </button>
        {saved && <span className="text-sm text-accent-soft">Сохранено ✓</span>}
      </div>
    </section>
  );
}
