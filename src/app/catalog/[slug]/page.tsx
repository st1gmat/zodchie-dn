import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDetail } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

// Show at most this many brand chips before the list gets unwieldy.
const MAX_BRAND_CHIPS = 24;

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDetail(slug);
  if (!category) return { title: "Категория не найдена — Зодчие" };
  return {
    title: `${category.title} — Каталог — Зодчие`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;

  const brand = typeof sp.brand === "string" ? sp.brand : undefined;
  const inStockOnly = sp.stock === "1";
  const page =
    Number.parseInt(typeof sp.page === "string" ? sp.page : "", 10) || 1;

  const category = await getCategoryDetail(slug, { page, brand, inStockOnly });
  if (!category) notFound();

  // Build a URL for this category, keeping current filters unless overridden.
  // Pass `null` to clear a filter; omit to keep it.
  function hrefWith(overrides: {
    page?: number;
    brand?: string | null;
    stock?: boolean;
  }): string {
    const nextBrand = overrides.brand === undefined ? brand : overrides.brand;
    const nextStock = overrides.stock === undefined ? inStockOnly : overrides.stock;
    const nextPage = overrides.page ?? 1;

    const query = new URLSearchParams();
    if (nextBrand) query.set("brand", nextBrand);
    if (nextStock) query.set("stock", "1");
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/catalog/${slug}?${qs}` : `/catalog/${slug}`;
  }

  const crumbs: Crumb[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
  ];
  if (category.parent) {
    crumbs.push({ label: category.parent.title, href: `/catalog/${category.parent.slug}` });
  }
  crumbs.push({ label: category.title });

  const hasFilters = Boolean(brand) || inStockOnly;
  const chipBase =
    "rounded-full border px-3.5 py-1.5 text-sm transition-colors";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs items={crumbs} />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
        {category.title}
      </h1>
      {category.description && (
        <p className="mt-3 text-muted">{category.description}</p>
      )}

      {category.children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/catalog/${child.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent-soft hover:text-accent-soft"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}

      {/* Brand facet */}
      {category.brands.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Link
            href={hrefWith({ brand: null })}
            className={`${chipBase} ${
              brand
                ? "border-border text-muted hover:border-accent-soft hover:text-accent-soft"
                : "border-accent-strong bg-accent-strong text-white"
            }`}
          >
            Все бренды
          </Link>
          {category.brands.slice(0, MAX_BRAND_CHIPS).map((item) => {
            const active = item.name === brand;
            return (
              <Link
                key={item.name}
                href={hrefWith({ brand: active ? null : item.name })}
                className={`${chipBase} ${
                  active
                    ? "border-accent-strong bg-accent-strong text-white"
                    : "border-border text-foreground hover:border-accent-soft hover:text-accent-soft"
                }`}
              >
                {item.name}
                <span className={active ? "text-white/70" : "text-muted"}>
                  {" "}
                  {item.count}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Toolbar: result count + in-stock toggle + reset */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <p className="text-sm text-muted">
          Найдено: <span className="text-foreground">{category.total}</span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={hrefWith({ stock: !inStockOnly })}
            className={`${chipBase} ${
              inStockOnly
                ? "border-accent-strong bg-accent-strong text-white"
                : "border-border text-foreground hover:border-accent-soft hover:text-accent-soft"
            }`}
          >
            Только в наличии
          </Link>
          {hasFilters && (
            <Link
              href={`/catalog/${slug}`}
              className="text-sm text-muted underline-offset-4 hover:text-accent-soft hover:underline"
            >
              Сбросить
            </Link>
          )}
        </div>
      </div>

      {category.products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-border bg-surface/40 px-6 py-12 text-center text-muted">
          {hasFilters
            ? "По выбранным фильтрам ничего не найдено."
            : "Товары этой категории скоро появятся. Уточнить наличие можно по телефону."}
        </p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            page={category.page}
            pageCount={category.pageCount}
            hrefForPage={(p) => hrefWith({ page: p })}
          />
        </>
      )}
    </div>
  );
}
