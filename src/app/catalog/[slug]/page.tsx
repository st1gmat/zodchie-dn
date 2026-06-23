import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDetail } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";

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
}: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryDetail(slug);

  if (!category) notFound();

  const crumbs: Crumb[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/catalog" },
  ];
  if (category.parent) {
    crumbs.push({ label: category.parent.title, href: `/catalog/${category.parent.slug}` });
  }
  crumbs.push({ label: category.title });

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

      {category.products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-border bg-surface/40 px-6 py-12 text-center text-muted">
          Товары этой категории скоро появятся. Уточнить наличие можно по телефону.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
