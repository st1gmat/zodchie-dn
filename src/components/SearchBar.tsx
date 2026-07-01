"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type ProductHit = {
  slug: string;
  title: string;
  price: number;
  categorySlug: string;
  imageUrl: string | null;
};
type CategoryHit = { slug: string; title: string; parentTitle: string | null };
type Results = { products: ProductHit[]; categories: CategoryHit[] };

const EMPTY: Results = { products: [], categories: [] };

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const trimmed = query.trim();

  // Debounced fetch — keeps suggestions snappy without a request per keystroke.
  // All state updates live inside the timer/async callbacks (never synchronously
  // in the effect body) to avoid cascading re-renders.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (trimmed.length < 2) {
        setResults(EMPTY);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        setResults(await res.json());
      } catch {
        /* aborted or failed — ignore */
      } finally {
        setLoading(false);
      }
    }, 130);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed]);

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const product = results.products[0];
    if (product) {
      goTo(`/catalog/${product.categorySlug}/${product.slug}`);
      return;
    }
    const category = results.categories[0];
    if (category) goTo(`/catalog/${category.slug}`);
  }

  const showDropdown = open && trimmed.length >= 2;
  const hasResults =
    results.products.length > 0 || results.categories.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={onSubmit}>
        <div className="group relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent-soft" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
            placeholder="Поиск товаров…"
            aria-label="Поиск товаров"
            className="w-full rounded-full border border-border bg-surface/60 py-2.5 pl-10 pr-9 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted focus:border-accent-soft focus:bg-background focus:shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Очистить"
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-foreground"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="animate-dropdown absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          {!hasResults && !loading && (
            <p className="px-4 py-6 text-center text-sm text-muted">
              Ничего не найдено по запросу «{trimmed}»
            </p>
          )}

          {results.categories.length > 0 && (
            <div className="border-b border-border py-2">
              <p className="px-4 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-muted">
                Категории
              </p>
              {results.categories.map((category, index) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => goTo(`/catalog/${category.slug}`)}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-result flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-soft hover:text-accent-soft"
                >
                  <span className="text-foreground">
                    <Highlight text={category.title} query={trimmed} />
                  </span>
                  {category.parentTitle && (
                    <span className="text-xs text-muted">· {category.parentTitle}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="py-2">
              <p className="px-4 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-muted">
                Товары
              </p>
              {results.products.map((product, index) => (
                <button
                  key={product.slug}
                  type="button"
                  onClick={() => goTo(`/catalog/${product.categorySlug}/${product.slug}`)}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="animate-result flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-soft"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-muted"
                        aria-hidden
                      >
                        <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2l1-2h9l1 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" />
                        <circle cx="12" cy="12.5" r="3.5" />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    <Highlight text={product.title} query={trimmed} />
                  </span>
                  <span className="shrink-0 text-sm font-medium text-foreground">
                    {formatPrice(product.price)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {loading && !hasResults && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted">
              <Spinner /> Ищем…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-semibold text-accent-soft">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="9" r="6" />
      <path d="M14 14l3.5 3.5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-accent-soft" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
