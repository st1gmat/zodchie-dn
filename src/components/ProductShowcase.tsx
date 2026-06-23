"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { ProductCardView } from "@/lib/catalog";

const PER_PAGE = 8; // 4 columns × 2 rows
const MAX_PAGES = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

export function ProductShowcase({ products }: { products: ProductCardView[] }) {
  const pages = chunk(products.slice(0, PER_PAGE * MAX_PAGES), PER_PAGE);
  const [page, setPage] = useState(0);

  if (pages.length === 0) return null;

  const canPrev = page > 0;
  const canNext = page < pages.length - 1;

  return (
    <section className="border-b border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Товары
            </h2>
            <Link
              href="/catalog"
              className="mt-2 inline-block text-sm font-medium text-accent-soft hover:text-accent"
            >
              Весь каталог →
            </Link>
          </div>

          {pages.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                aria-label="Назад"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
              >
                <Chevron className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                disabled={!canNext}
                aria-label="Вперёд"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent-soft hover:text-accent-soft disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
              >
                <Chevron />
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((group, index) => (
              <div
                key={index}
                className="grid w-full shrink-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              >
                {group.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {pages.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {pages.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setPage(index)}
                aria-label={`Страница ${index + 1}`}
                aria-current={index === page}
                className={`h-2 rounded-full transition-all ${
                  index === page ? "w-6 bg-accent" : "w-2 bg-border hover:bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 4l5 5-5 5" />
    </svg>
  );
}
