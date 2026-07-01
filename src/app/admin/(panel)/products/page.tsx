import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ConfirmSubmit } from "@/app/admin/ConfirmSubmit";
import { deleteProduct } from "@/app/admin/actions";
import { Pagination } from "@/components/Pagination";

const PER_PAGE = 50;

type View = "list" | "categories" | "brands";

export default async function ProductsAdmin({
  searchParams,
}: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const view: View =
    sp.view === "categories" || sp.view === "brands" ? sp.view : "list";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categorySlug = typeof sp.category === "string" ? sp.category : "";
  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const stock = sp.stock === "in" || sp.stock === "out" ? sp.stock : "";
  const page = Number.parseInt(typeof sp.page === "string" ? sp.page : "", 10) || 1;

  // Category dropdown options (always shown in the list toolbar).
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, title: true },
  });

  const tabs: { key: View; label: string }[] = [
    { key: "list", label: "Списком" },
    { key: "categories", label: "По категориям" },
    { key: "brands", label: "По брендам" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Товары
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Добавить товар
        </Link>
      </div>

      {/* View mode tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "list" ? "/admin/products" : `/admin/products?view=${tab.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              view === tab.key
                ? "border-accent-strong bg-accent-strong text-white"
                : "border-border text-foreground hover:border-accent-soft hover:text-accent-soft"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {view === "categories" && <CategoriesOverview />}
      {view === "brands" && <BrandsOverview />}
      {view === "list" && (
        <ListView
          q={q}
          categorySlug={categorySlug}
          brand={brand}
          stock={stock}
          page={page}
          categories={categories}
        />
      )}
    </div>
  );
}

/** Grouped overview: every category with its product count → drills into list. */
async function CategoriesOverview() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, title: true, _count: { select: { products: true } } },
  });

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/admin/products?category=${category.slug}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border px-5 py-4 transition-colors hover:border-accent-strong"
        >
          <span className="text-foreground">{category.title}</span>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-sm text-muted">
            {category._count.products}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Grouped overview: every brand with its product count → drills into list. */
async function BrandsOverview() {
  const groups = await prisma.product.groupBy({
    by: ["brand"],
    _count: { brand: true },
    orderBy: { _count: { brand: "desc" } },
  });
  const brands = groups.filter((g) => g.brand);
  const noBrand = groups.find((g) => !g.brand)?._count.brand ?? 0;

  return (
    <div className="mt-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((group) => (
          <Link
            key={group.brand}
            href={`/admin/products?brand=${encodeURIComponent(group.brand as string)}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 text-sm transition-colors hover:border-accent-strong"
          >
            <span className="truncate text-foreground">{group.brand}</span>
            <span className="shrink-0 text-muted">{group._count.brand}</span>
          </Link>
        ))}
      </div>
      {noBrand > 0 && (
        <p className="mt-4 text-sm text-muted">
          Без бренда: <span className="text-foreground">{noBrand}</span>
        </p>
      )}
    </div>
  );
}

/** Flat, filterable, paginated product table. */
async function ListView({
  q,
  categorySlug,
  brand,
  stock,
  page,
  categories,
}: {
  q: string;
  categorySlug: string;
  brand: string;
  stock: string;
  page: number;
  categories: { slug: string; title: string }[];
}) {
  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { article: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(brand ? { brand } : {}),
    ...(stock === "in" ? { inStock: true } : stock === "out" ? { inStock: false } : {}),
  };

  const total = await prisma.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, page), pageCount);

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    skip: (current - 1) * PER_PAGE,
    take: PER_PAGE,
    select: {
      id: true,
      title: true,
      price: true,
      inStock: true,
      brand: true,
      category: { select: { title: true } },
    },
  });

  const selectClass =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent-soft";

  const hasFilters = Boolean(q || categorySlug || brand || stock);

  // Preserve filters across pagination (page is overridden by the control).
  function hrefForPage(p: number): string {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categorySlug) query.set("category", categorySlug);
    if (brand) query.set("brand", brand);
    if (stock) query.set("stock", stock);
    if (p > 1) query.set("page", String(p));
    const qs = query.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  }

  return (
    <>
      {/* Filter form (GET, no client JS). Submitting resets to page 1. */}
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="view" value="list" />
        <label className="flex flex-col gap-1 text-xs text-muted">
          Поиск (название, артикул)
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Например, смеситель или F72"
            className="w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent-soft"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Категория
          <select name="category" defaultValue={categorySlug} className={selectClass}>
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Наличие
          <select name="stock" defaultValue={stock} className={selectClass}>
            <option value="">Любое</option>
            <option value="in">В наличии</option>
            <option value="out">Под заказ</option>
          </select>
        </label>
        {/* Keep an active brand filter (set from the "По брендам" overview). */}
        {brand && <input type="hidden" name="brand" value={brand} />}
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Применить
        </button>
        {hasFilters && (
          <Link
            href="/admin/products"
            className="px-2 py-2 text-sm text-muted underline-offset-4 hover:text-accent-soft hover:underline"
          >
            Сбросить
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>
          Найдено: <span className="text-foreground">{total}</span>
        </span>
        {brand && (
          <span className="rounded-full bg-surface px-2.5 py-0.5">
            Бренд: {brand}
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Бренд</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Наличие</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-foreground">{product.title}</td>
                <td className="px-4 py-3 text-muted">{product.category.title}</td>
                <td className="px-4 py-3 text-muted">{product.brand ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-muted">
                  {product.inStock ? "В наличии" : "Под заказ"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-accent-soft hover:text-accent"
                    >
                      Изменить
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <ConfirmSubmit
                        message={`Удалить товар «${product.title}»?`}
                        className="text-muted hover:text-red-600"
                      >
                        Удалить
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          {hasFilters ? "По фильтрам ничего не найдено." : "Товаров пока нет."}
        </p>
      )}

      <Pagination page={current} pageCount={pageCount} hrefForPage={hrefForPage} />
    </>
  );
}
