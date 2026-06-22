import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDetail } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: category.title },
        ]}
      />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
        {category.title}
      </h1>
      {category.description && (
        <p className="mt-3 text-muted">{category.description}</p>
      )}

      {category.products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-border bg-surface/40 px-6 py-12 text-center text-muted">
          Товары этой категории скоро появятся. Уточнить наличие можно по телефону.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              categorySlug={category.slug}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}
