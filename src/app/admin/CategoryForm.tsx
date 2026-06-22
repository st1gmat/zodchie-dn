import Link from "next/link";

const ICON_OPTIONS = [
  { value: "faucets", label: "Смесители" },
  { value: "toilets", label: "Унитазы" },
  { value: "baths", label: "Ванны" },
  { value: "sinks", label: "Раковины" },
  { value: "pipes", label: "Трубы" },
  { value: "heating", label: "Отопление" },
  { value: "furniture", label: "Мебель" },
  { value: "fittings", label: "Фурнитура" },
];

export type CategoryFormValues = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
};

const inputClass =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent-soft";

export function CategoryForm({
  action,
  category,
}: {
  action: (formData: FormData) => void;
  category?: CategoryFormValues;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      {category && <input type="hidden" name="id" value={category.id} />}

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Название</span>
        <input
          name="title"
          required
          defaultValue={category?.title}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Описание</span>
        <input
          name="description"
          defaultValue={category?.description ?? ""}
          className={inputClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Иконка</span>
          <select
            name="icon"
            defaultValue={category?.icon ?? ""}
            className={inputClass}
          >
            <option value="">— без иконки —</option>
            {ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Порядок</span>
          <input
            name="order"
            type="number"
            defaultValue={category?.order ?? 0}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Сохранить
        </button>
        <Link href="/admin/categories" className="text-sm text-muted hover:text-foreground">
          Отмена
        </Link>
      </div>
    </form>
  );
}
