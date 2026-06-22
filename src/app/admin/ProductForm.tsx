import Link from "next/link";

export type ProductFormValues = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  inStock: boolean;
  order: number;
  categoryId: string;
};

export type CategoryOption = { id: string; title: string };

const inputClass =
  "rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent-soft";

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  product?: ProductFormValues;
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Название</span>
        <input
          name="title"
          required
          defaultValue={product?.title}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Категория</span>
        <select
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            — выберите категорию —
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted">Описание</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className={inputClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Цена, ₽</span>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price ?? 0}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted">Порядок</span>
          <input
            name="order"
            type="number"
            defaultValue={product?.order ?? 0}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          name="inStock"
          type="checkbox"
          defaultChecked={product ? product.inStock : true}
          className="h-4 w-4"
        />
        <span className="text-foreground">В наличии</span>
      </label>

      <div className="mt-2 flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Сохранить
        </button>
        <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">
          Отмена
        </Link>
      </div>
    </form>
  );
}
