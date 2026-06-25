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

  const meta = [
    { label: "Код товара", value: product.code },
    { label: "Бренд", value: product.brand },
    { label: "Артикул", value: product.article },
  ].filter((item) => item.value);

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

      {/* Top panel: gallery + key facts; CTA pinned to the bottom */}
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {product.title}
          </h1>

          {meta.length > 0 && (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {meta.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <dt className="text-muted">{item.label}:</dt>
                  <dd className="font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

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

          <div className="mt-auto pt-10">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft"
            >
              Заказать по телефону
            </a>
            <p className="mt-4 text-sm text-muted">
              Цена и наличие уточняются — позвоните {siteConfig.phone}, поможем
              с выбором и расскажем о сроках поставки.
            </p>
          </div>
        </div>
      </div>

      {/* Below the panel: technical characteristics (two columns when long) */}
      {product.attributes.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Характеристики
          </h2>
          <dl
            className={`mt-4 grid border-t border-border text-sm sm:gap-x-12 ${
              product.attributes.length > 6 ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {product.attributes.map((attribute) => (
              <div
                key={attribute.name}
                className="flex justify-between gap-4 border-b border-border py-3"
              >
                <dt className="text-muted">{attribute.name}</dt>
                <dd className="text-right font-medium text-foreground">
                  {attribute.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
