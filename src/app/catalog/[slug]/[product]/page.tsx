import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[slug]/[product]">): Promise<Metadata> {
  const { slug, product: productSlug } = await params;
  const product = await getProductDetail(slug, productSlug);
  if (!product) return { title: "Товар не найден — Зодчие" };
  return {
    title: `${product.title} — Зодчие`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/catalog/[slug]/[product]">) {
  const { slug, product: productSlug } = await params;
  const product = await getProductDetail(slug, productSlug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: product.category.title, href: `/catalog/${product.category.slug}` },
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-10"
            priority
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {product.title}
          </h1>

          <p className="mt-6 text-3xl font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>

          <p className="mt-3 text-sm">
            {product.inStock ? (
              <span className="text-accent-soft">В наличии</span>
            ) : (
              <span className="text-muted">Под заказ</span>
            )}
          </p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-muted">{product.description}</p>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={siteConfig.phoneHref}
              className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
            >
              Заказать по телефону
            </a>
          </div>

          <p className="mt-6 text-sm text-muted">
            Цена и наличие уточняются — позвоните {siteConfig.phone}, поможем
            с выбором и расскажем о сроках поставки.
          </p>
        </div>
      </div>
    </div>
  );
}
