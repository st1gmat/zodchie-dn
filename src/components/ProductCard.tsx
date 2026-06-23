"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductCardView } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductCardView }) {
  const [active, setActive] = useState(0);
  const images = product.images;
  const hasMany = images.length > 1;

  return (
    <Link
      href={`/catalog/${product.categorySlug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-accent-strong"
    >
      <div
        className="relative aspect-square bg-card"
        onMouseLeave={() => setActive(0)}
      >
        {images.map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-6 transition-all duration-300 group-hover:scale-105 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {!product.inStock && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-muted">
            Под заказ
          </span>
        )}

        {hasMany && (
          <>
            {/* Hover zones — moving across the image flips to that photo. */}
            <div className="absolute inset-0 flex">
              {images.map((_, index) => (
                <span
                  key={index}
                  className="h-full flex-1"
                  onMouseEnter={() => setActive(index)}
                />
              ))}
            </div>

            {/* Position indicator */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex gap-1">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index === active ? "bg-foreground/70" : "bg-foreground/15"
                  }`}
                />
              ))}
            </div>
          </>
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
