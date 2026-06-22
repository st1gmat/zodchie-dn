import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";

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
        <ProductGallery images={product.images} title={product.title} />

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

          {product.attributes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                Характеристики
              </h2>
              <dl className="mt-4 divide-y divide-border border-t border-border text-sm">
                {product.attributes.map((attribute) => (
                  <div
                    key={attribute.name}
                    className="flex justify-between gap-4 py-3"
                  >
                    <dt className="text-muted">{attribute.name}</dt>
                    <dd className="text-right font-medium text-foreground">
                      {attribute.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
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
