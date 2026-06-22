import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductCardView } from "@/lib/catalog";

export function ProductCard({
  categorySlug,
  product,
}: {
  categorySlug: string;
  product: ProductCardView;
}) {
  return (
    <Link
      href={`/catalog/${categorySlug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-accent-strong"
    >
      <div className="relative aspect-square bg-surface">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-muted">
            Под заказ
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border p-5">
        <h3 className="text-sm font-medium leading-snug text-foreground">
          {product.title}
        </h3>
        <p className="mt-auto text-lg font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
